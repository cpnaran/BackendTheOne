import sequelize from '../../database.js';
import License from '../models/License.js';
import Package from "../models/Package.js"
import User from "../models/User.js"

export async function createUser(req) {
    const transaction = await sequelize.transaction()
    try {
        const { userId, fullName, telNo, packageName, license } = req
        const createdUser = await User.create({
            userId,
            fullName,
            telNo,
        }, { transaction })

        // package มาปรับวันที่
        const getPackage = await Package.findOne({
            where: {
                package: packageName
            }
        })
        const dateNow = new Date()
        dateNow.setDate(getPackage.days)
        const expiredAt = dateNow.toISOString()
        const str = license.replace(/\s+/g, '')
        const createdLicense = await License.create({
            userId,
            license: str,
            status: false,
            expiredAt
        }, { transaction })
        await transaction.commit();
        return 'success'
    } catch (e) {
        await transaction.rollback();
        throw e;
    }
}