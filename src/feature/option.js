import { Op } from "sequelize"
import Package from "../models/Package.js"
import License from "../models/License.js"

export async function getOptionPackage(userId) {
    const user = await License.findOne({
        where: {
            userId
        }
    })

    const data = await Package.findAll({
        where: {
            isActive: true,
            packageType: {
                [Op.in]: [
                    'STANDARD', 'PROMOTION'
                ]
            }
        }
    })
    const days = new Date()
    if (!user.JsonData === null && user.JsonData?.special_package[0]?.expiredAt > days) {
        const packages = await Package.findOne({
            where: {
                id: user.JsonData?.special_package[0].id,
                isActive: true
            }
        })
        if (packages !== null || packages !== undefined) {
            data.push(packages)
        }
    }
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