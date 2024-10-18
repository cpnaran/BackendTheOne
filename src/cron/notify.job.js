import cron from 'node-cron'
import { Op, where } from 'sequelize';
import License from '../models/License.js';
import { config } from 'dotenv';

const sendLine = async (message, userId) => {
    config()
    const channelAccessToken = process.env.ACCESS_TOKEN
    await axios.post(
        'https://api.line.me/v2/bot/message/push',
        {
            to: userId,
            messages: [
                {
                    type: 'text',
                    text: 'แก้ไขข้อมูลเรียบร้อยแล้ว 😊'
                },
            ],
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${channelAccessToken}`,
            },
        }
    );
}

// สร้าง Cron Job ที่รันทุกนาที
const scheduleNotifyTask = () => {
    cron.schedule('0 11 * * *', async () => {
        console.log('Running Notify job every day at 11 AM:', new Date());
        try {
            const license = await License.findAll()
            const dateNow = new Date()
            dateNow.setHours(0, 0, 0, 0)
            if (license) {
                license.forEach(async (license) => {
                    const expirationDate = new Date(license.expiredAt);
                    const daysRemaining = Math.ceil(
                        (expirationDate.getTime() - dateNow.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    // แจ้งเตือนถ้าทะเบียนเหลือไม่เกิน 7 วัน
                    if (daysRemaining <= 3) {
                        const message = `🔔 ทะเบียน ${license.name} กำลังจะหมดอายุในอีก ${daysRemaining} วัน! กรุณานำรถออกก่อนหรือ ต่ออายุก่อนวันหมดอายุ`;
                        await sendLine(message, license.userId);
                    }
                });
            }
        } catch (error) {
            console.log(error)
        }
    });

    console.log('Notify job started.');
}




export default scheduleNotifyTask