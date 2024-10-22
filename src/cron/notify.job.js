import cron from 'node-cron'
import { Op, where } from 'sequelize';
import License from '../models/License.js';
import { config } from 'dotenv';
import axios from 'axios';
import { subDays } from 'date-fns'

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
                    text: message
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

const sendLineAction = async (message, userId) => {
    config()
    const channelAccessToken = process.env.ACCESS_TOKEN
    await axios.post(
        'https://api.line.me/v2/bot/message/push',
        {
            to: userId,
            messages: message
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
                    expirationDate.setHours(0, 0, 0, 0)
                    const daysRemaining = subDays(expirationDate, dateNow)
                    if (daysRemaining <= 0 && license.status === true) {
                        const message = `🔔 ทะเบียน ${license.license} หมดอายุแล้ว ถ้าต้องการนำรถออกจะต้องชำระค่าปรับวันละ 100 บาท หรือต่ออายุแพ็คเก็จ`;
                        await sendLine(message, license.userId);
                    }
                    if (daysRemaining <= 3 && daysRemaining != 1 && license.status === true) {
                        const message = `🔔 ทะเบียน ${license.license} กำลังจะหมดอายุในอีก ${daysRemaining} วัน! กรุณานำรถออกก่อนหรือ ต่ออายุก่อนวันหมดอายุ`;
                        await sendLine(message, license.userId);
                    } else if (daysRemaining === 1 && license.status === true) {
                        const message = `🔔 ทะเบียน ${license.license} กำลังจะหมดอายุภายในวันนี้ กรุณานำรถออกก่อนหรือ ต่ออายุก่อนวันหมดอายุ`;
                        await sendLine(message, license.userId);
                    }
                });
            }
        } catch (error) {
            console.log(error)
        }
    });
    /* const scheduleNotifyExpired = () => {
         cron.schedule('0 0 0 0 0', async () => {
             console.log('Running Notify Expired job every day at midnight:', new Date())
             try {
                 const license = await License.findAll()
                 const dateNow = new Date()
                 dateNow.setHours(0, 0, 0, 0)
                 if (license) {
                     license.forEach(async (license) => {
                         const expirationDate = new Date(license.expiredAt);
                         expirationDate.setHours(0, 0, 0, 0)
                         const daysRemaining = dateFns.subDays(expirationDate, dateNow)
                         if (daysRemaining <= 0 && license.status === true) {
                             const message = {
                                 type: `flex`,
                                 altText: ``
                             }
                             await sendLineAction(message, license.userId);
                         }
                     });
                 }
             } catch (error) {
                 console.log(error)
             }
 
         })
     } */

    console.log('Notify job started.');
}




export default scheduleNotifyTask