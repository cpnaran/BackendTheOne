import express from 'express'
import License from '../models/License.js'
import Package from '../models/Package.js'
import services from '../services/index.js'
import feature from './index.js'
import { differenceInDays } from 'date-fns'
import Transaction from '../models/Transaction.js'
import sequelize from '../../database.js';
import { Op } from 'sequelize'

export async function renewLicense(userId, packageId, license) {
    const transaction = await sequelize.transaction()
    try {
        let message = ``
        const str = license.replace(/\s+/g, '')
        let dateTime = new Date()
        dateTime.setHours(0, 0, 0, 0)
        const getLicense = await License.findOne({
            where: {
                license: str
            }
        })
        if (getLicense.expiredAt < dateTime) {
            if (getLicense.status === true) {
                //แพ็คเก็จหมดแต่ยังไม่ได้เอารถออก
                const licenseExpired = getLicense.expiredAt
                const amount = (differenceInDays(dateTime, licenseExpired)) * 100

                await Transaction.create({
                    userId,
                    packageId: '30d27f15-0ace-4263-b789-1c851d20ac6c',
                    paymentState: 'PENDING',
                    license,
                    amount
                })
                const packageData = {
                    amount,
                    package: `ชำระค่าปรับ ${differenceInDays(dateTime, licenseExpired)} วัน`
                }
                const urlQrPayment = await services.promtpayQR.generatePromptPayQR({ amount })
                await feature.webhook.replyUser({ userId, method: 'สมัครสมาชิก', imgUrl: urlQrPayment, packageData, license })
                await transaction.commit()
                return message = `ขอโทษค่ะ ไม่สามารถต่อแพ็คเก็จได้เนื่องมีค่าปรับค้างชำระ กรุณาสแกน qr promptpay ในไลน์เพื่อชำระค่าปรับก่อนค่ะ`
            }
        }
        const packageData = await Package.findOne({
            where: { id: packageId }
        })
        if (packageData.packageType === 'PROMOTION') {
            const isUsed = await Transaction.findOne({
                where: {
                    userId,
                    packageId: packageId,
                    paymentState: 'SUCCESS'
                }
            })
            if (isUsed) {
                throw new Error("ขอโทษค่ะ ผู้ใช้งานเคยสมัครแพ็คเกจโปรโมชั่นนี้ไปแล้ว")
            }
        }
        const createTransaction = await Transaction.create({
            userId,
            packageId,
            paymentState: 'PENDING',
            license: str,
        }, { transaction })

        const urlQrPayment = await services.promtpayQR.generatePromptPayQR({ amount: packageData.amount })
        await feature.webhook.replyUser({ userId, method: 'สมัครสมาชิก', imgUrl: urlQrPayment, packageData, license })
        console.log('Reply message to user')
        await transaction.commit();
        return message
    } catch (e) {
        await transaction.rollback();
        throw e;
    }
}

export async function finePayment(userId, license) {
    const transaction = await sequelize.transaction()
    const str = license.replace(/\s+/g, '')
    const dateNow = new Date()
    dateNow.setHours(0, 0, 0, 0)
    const licenseData = await License.findOne({
        where: {
            userId,
            license: str,
            expiredAt: {
                [Op.lt]: dateNow
            }
        }
    })
    if (!licenseData) {
        throw new Error(`ทะเบียนรถคันนี้ยังไม่มีค่าปรับที่ต้องชำระค่ะ`)
    }
    const overDays = differenceInDays(dateNow, new Date(licenseData.expiredAt))
    const amount = overDays * 100
    const createdTransaction = await Transaction.create({
        userId,
        license: str,
        amount,
        packageId: `30d27f15-0ace-4263-b789-1c851d20ac6c`,
        paymentState: `PENDING`
    }, { transaction })
    const packageData = {
        amount: (overDays * 100),
        package: `จ่ายค่าปรับ ${overDays} วัน`
    }
    const urlQrPayment = await services.promtpayQR.generatePromptPayQR({ amount })
    await feature.webhook.replyUser({ userId, method: 'สมัครสมาชิก', imgUrl: urlQrPayment, packageData, license })
    console.log('Reply message to user')
    await transaction.commit();
    return createdTransaction
}

export async function changePlateLicense(userId, oldLicense, newLicense) {
    const transaction = await sequelize.transaction()
    const strNewLicense = newLicense.replace(/\s+/g, '')
    const strOldLicense = oldLicense.replace(/\s+/g, '')
    const licenseData = await License.findOne({
        where: {
            userId,
            license: strOldLicense,
        }
    })
    if (licenseData && licenseData.status === false) {
        const updatedLicense = await licenseData.update({
            license: strNewLicense
        }, transaction)

        await transaction.commit()
        return updatedLicense
    } else if (licenseData.status === true) {
        await transaction.rollback()
        throw new Error('กรุณานำรถออกจากลานจอดก่อน ขอบคุณค่ะ')
    } else {
        await transaction.rollback()
        throw new Error('ไม่พบเลขทะเบียน')
    }
}