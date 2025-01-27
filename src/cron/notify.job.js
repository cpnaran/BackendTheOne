import cron from 'node-cron'
import { Op, where } from 'sequelize';
import License from '../models/License.js';
import { config } from 'dotenv';
import axios from 'axios';
import { differenceInDays } from 'date-fns'

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
            messages: [message]
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${channelAccessToken}`,
            },
        }
    );
}

const scheduleNotifyTask = () => {
    cron.schedule('0 10 * * *', async () => {
        console.log('Running Notify job every day at 10 AM:', new Date());
        try {
            const license = await License.findAll()
            const dateNow = new Date()
            dateNow.setHours(0, 0, 0, 0)
            if (license) {
                license.forEach(async (license) => {
                    const expirationDate = new Date(license.expiredAt);
                    expirationDate.setHours(0, 0, 0, 0)
                    const daysRemaining = differenceInDays(expirationDate, dateNow);
                    if (daysRemaining < 0 && license.status === true) {
                        const msg = {
                            type: 'flex',
                            altText: 'แจ้งเตือนชำระค่าปรับ',
                            contents: {
                                type: 'bubble',
                                header: {
                                    type: 'box',
                                    layout: 'vertical',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: 'แพ็คเก็จหมดอายุ',
                                            size: 'lg',
                                            color: '#1DB446',
                                            weight: 'bold',
                                        },
                                    ],
                                },
                                body: {
                                    type: 'box',
                                    layout: 'vertical',
                                    contents: [{
                                        type: 'box',
                                        layout: 'vertical',
                                        spacing: 'sm',
                                        contents: [
                                            {
                                                type: 'text',
                                                text: `หมายเลขทะเบียน: ${license.license}`,
                                                size: 'md',
                                                color: '#333333',
                                                weight: 'bold',
                                            },
                                            {
                                                type: 'text',
                                                text: `รถของท่านได้ใช้บริการเกินแพ็คเก็จแล้ว ท่านจะต้องชำระค่าส่วนเกิน ก่อนนำรถของท่านออก`,
                                                size: 'sm',
                                                wrap: true,
                                                color: '#000000',
                                                weight: 'regular',
                                            },
                                            {
                                                type: 'text',
                                                text: `กรุณาชำระค่าปรับก่อนนำรถออก`,
                                                size: 'md',
                                                color: '#FF5551',
                                                weight: 'bold',
                                            },
                                            {
                                                type: 'separator',
                                                margin: 'sm',
                                            },
                                        ],
                                    }],
                                },
                                footer: {
                                    type: 'box',
                                    layout: 'vertical',
                                    contents: [
                                        {
                                            type: 'button',
                                            style: 'primary',
                                            color: '#1DB446',
                                            action: {
                                                type: 'message',
                                                label: 'ชำระค่าปรับ',
                                                text: `ชำระค่าปรับ ${license.license}`
                                            },
                                        },
                                    ],
                                },
                            },
                        }

                        await sendLineAction(msg, license.userId);
                    }
                    if (daysRemaining === 1) {
                        const message = `🔔นี่คือข้อความจากระบบอัตโนมัติ ทะเบียน ${license.license} กำลังจะหมดอายุในอีก ${daysRemaining} วัน! กรุณานำรถออกก่อนหรือ ต่ออายุก่อนวันหมดอายุ คุณลูกค้าอย่าลืมต่ออายุก่อนวันหมดอายุ เพื่อหลีกเลี่ยงค่าปรับ วันล่ะ 100฿ นะคะ`;
                        await sendLine(message, license.userId);
                    } else if (daysRemaining === 3) {
                        const message = `🔔นี่คือข้อความจากระบบอัตโนมัติ ทะเบียน ${license.license} กำลังจะหมดอายุในอีก ${daysRemaining} วัน! กรุณานำรถออกก่อนหรือ ต่ออายุก่อนวันหมดอายุ คุณลูกค้าอย่าลืมต่ออายุก่อนวันหมดอายุ เพื่อหลีกเลี่ยงค่าปรับ วันล่ะ 100฿ นะคะ`;
                        await sendLine(message, license.userId);
                    }
                    else if (daysRemaining === 7) {
                        const message = `🔔นี่คือข้อความจากระบบอัตโนมัติ ทะเบียน ${license.license} กำลังจะหมดอายุในอีก ${daysRemaining} วัน! กรุณานำรถออกก่อนหรือ ต่ออายุก่อนวันหมดอายุ คุณลูกค้าอย่าลืมต่ออายุก่อนวันหมดอายุ เพื่อหลีกเลี่ยงค่าปรับ วันล่ะ 100฿ นะคะ`;
                        await sendLine(message, license.userId);
                    }
                    else if (daysRemaining === 0) {
                        const message = `🔔นี่คือข้อความจากระบบอัตโนมัติ ทะเบียน ${license.license} กำลังจะหมดอายุภายในวันนี้ กรุณานำรถออกก่อนหรือ ต่ออายุก่อนวันหมดอายุ คุณลูกค้าอย่าลืมต่ออายุก่อนวันหมดอายุ เพื่อหลีกเลี่ยงค่าปรับ วันล่ะ 100฿ นะคะ`;
                        await sendLine(message, license.userId);
                    }
                });
            }
            return
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