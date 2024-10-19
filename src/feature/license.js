import express from 'express'
import License from '../models/License.js'
import services from '../services/index.js'


export async function renewLicense(userId, packageId, license) {
    const transaction = await sequelize.transaction()
    try {
        const str = license.replace(/\s+/g, '')
        let dateTime = new Date()
        dateTime.setHours(0, 0, 0, 0)
        const getLicense = await License.findOne({
            where: {
                license: str
            }
        })
        if (getLicense.expiredAt < dateTime) {
            throw new Error('ไม่สามารถต่ออายุทะเบียนได้ เนื่องจากยังไม่ได้ชำระค่าปรับ')
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
    } catch (e) {
        await transaction.rollback();
        throw e;
    }


    return 'SUCCESS'
}