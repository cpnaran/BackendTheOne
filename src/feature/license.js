import express from 'express'
import License from '../models/License.js'
import services from '../services/index.js'


export async function renewLicense(userId, packageId, license) {
    const transaction = await sequelize.transaction()
    try {
        const str = license.replace(/\s+/g, '')
        const createTransaction = await Transaction.create({
            userId,
            packageId,
            paymentState: 'PENDING',
            license: str,
        }, { transaction })
        const packageData = await Package.findOne({
            where: { id: packageId }
        })
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