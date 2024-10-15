import { Op } from "sequelize"
import Package from "../models/Package.js"

export async function getOption() {
    const data = await Package.findAll({
        where: {
            isActive: true
        }
    })
    const res = data.map((item) => ({
        id: item.id,
        package: item.package,
        amount: item.amount,
        days: item.days,
    }))
    res.sort()
    return res
}