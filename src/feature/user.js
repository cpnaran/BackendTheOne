import sequelize from '../../database.js';
import License from '../models/License.js';
import Package from "../models/Package.js"
import Transaction from '../models/Transaction.js';
import User from "../models/User.js"
import services from '../services/index.js';
import feature from './index.js';

export async function createUser(req) {
    const transaction = await sequelize.transaction()
    try {
        const { userId, fullName, telNo, packageId, license, token } = req
        const createdUser = await User.findOrCreate({
            where: { userId },
            defaults: {
                fullName,
                telNo,
            },
            transaction,
        });

        const str = license.replace(/\s+/g, '')

        const createTransaction = await Transaction.create({
            userId,
            packageId,
            paymentState: 'PENDING',
            license: str,
        }, { transaction })
        await transaction.commit();
        const packageData = await Package.findOne({
            where: packageId
        })
        //GEN QR PAYMENT ส่ง LINE
        const urlQrPayment = await services.promtpayQR.generatePromptPayQR({ amount: packageData.amount })
        await feature.webhook.replyUser({ userId, method: 'สมัครสมาชิก', imgUrl: urlQrPayment, packageData, license })
        console.log('Reply message to user')
        return 'success'
    } catch (e) {
        await transaction.rollback();
        throw e;
    }
}

export async function editUserProfile({ userId, fullName, telNo, token }) {
    const transaction = await sequelize.transaction()
    try {
        await User.update(
            {
                fullName,
                telNo
            },
            {
                where: {
                    userId,
                },
                transaction
            }
        );
        await transaction.commit();

        return 'SUCCESS'

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}