import express from 'express'
import License from '../models/License.js'


export async function renewLicense(userId, days, license) {
    const transaction = await sequelize.transaction()
    try {
        const update = await License.update({
            days,
            paymentState: 'PENDING'
        }, {
            where: {
                userId,
                license
            }
        })
    } catch (e) {
        await transaction.rollback();
        throw e;
    }


    return update
}