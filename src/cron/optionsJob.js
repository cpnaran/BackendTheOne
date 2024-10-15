import cron from 'node-cron'
import { Op, where } from 'sequelize';
import Package from '../models/Package.js';

// สร้าง Cron Job ที่รันทุกนาที
// cron.schedule('0 0 * * *', () => {
const scheduleOptionsTask = () => {
    cron.schedule('16 0 * * *', async () => {
        console.log('Running Options job every day at midnight:', new Date());
        try {
            await Package.update({
                isActive: false
            }, {
                where: {
                    expiredAt: {
                        [Op.lt]: new Date()
                    }
                }
            }
            )
        } catch (error) {

        }
    });

    console.log('Options job started.');
}


export default scheduleOptionsTask