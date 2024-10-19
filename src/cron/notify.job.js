import cron from 'node-cron'
import { Op, where } from 'sequelize';
import License from '../models/License.js';
import { config } from 'dotenv';
import axios from 'axios';

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
                    const daysRemaining = Math.ceil(
                        (expirationDate.getTime() - dateNow.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    if (daysRemaining <= 0) {
                        const message = `🔔 ทะเบียน ${license.license} หมดอายุแล้ว ถ้าต้องการนำรถออกจะต้องชำระค่าปรับวันละ 100 บาท`;
                        // const msg = {
                        //     type: "flex",
                        //     altText: "แจ้งเตือนหมดอายุ กรุณาชำระค่าปรับ",
                        //     contents: {
                        //         type: "bubble",
                        //         body: {
                        //             type: "box",
                        //             layout: "vertical",
                        //             contents: [
                        //                 {
                        //                     type: "text",
                        //                     text: "คุณต้องการทำอะไร?",
                        //                     weight: "bold",
                        //                     size: "lg",
                        //                     margin: "md"
                        //                 },
                        //                 {
                        //                     type: "button",
                        //                     style: "primary",
                        //                     action: {
                        //                         type: "message", // ปุ่มนี้จะส่งข้อความกลับในแชท
                        //                         label: "ส่งข้อความ 1",
                        //                         text: "คุณกดปุ่ม 1"
                        //                     }
                        //                 },
                        //                 {
                        //                     type: "button",
                        //                     style: "secondary",
                        //                     action: {
                        //                         type: "message",
                        //                         label: "ส่งข้อความ 2",
                        //                         text: "คุณกดปุ่ม 2"
                        //                     },
                        //                     margin: "sm"
                        //                 }
                        //             ]
                        //         }
                        //     }
                        // };
                        await sendLine(message, license.userId);
                    }
                    else if (daysRemaining <= 3 && daysRemaining != 1) {
                        const message = `🔔 ทะเบียน ${license.license} กำลังจะหมดอายุในอีก ${daysRemaining} วัน! กรุณานำรถออกก่อนหรือ ต่ออายุก่อนวันหมดอายุ`;
                        await sendLine(message, license.userId);
                    } else if (daysRemaining === 1) {
                        const message = `🔔 ทะเบียน ${license.license} กำลังจะหมดอายุภายในวันนี้ กรุณานำรถออกก่อนหรือ ต่ออายุก่อนวันหมดอายุ`;
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