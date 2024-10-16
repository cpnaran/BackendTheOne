import { Op } from "sequelize"
import Package from "../models/Package.js"
import License from "../models/License.js"

export async function getOptionPackage() {
    const data = await Package.findAll({})
    const res = data.sort((a, b) => a.days - b.days)
    return res
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