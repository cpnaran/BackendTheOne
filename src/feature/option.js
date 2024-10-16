import { Op } from "sequelize"
import Package from "../models/Package.js"
import License from "../models/License.js"

export async function getOptionPackage() {
    const data = await Package.findAll({
        where: {
            isActive: true
        }, attributes: ['id', 'package', 'amount', 'days']
    })
    data.sort()
    return data
}

export async function getOptionLicense(userId) {
    const data = await License.findAll({
        where: {
            userId
        },
        attributes: ['id', 'userId', 'license', 'paymentState']
    })

    return data
}