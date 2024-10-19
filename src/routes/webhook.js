import express from 'express';
import { config } from 'dotenv';
import License from '../models/License.js';
import axios from 'axios';
import jsQR from "jsqr";
import { Jimp } from 'jimp';
import Transaction from '../models/Transaction.js';
import Package from '../models/Package.js';
const router = express.Router();
config()



router.post('/', async (req, res) => {
    const replyToken = req.body.events[0].replyToken;
    const userId = req.body.events[0].source.userId;
    const channelAccessToken = process.env.ACCESS_TOKEN
    try {
        const intentName = req.body.events[0]?.message?.text || undefined;
        console.log('Intent ที่ถูกเรียกใช้งาน:', intentName);
        let response
        switch (intentName) {
            case 'สมัครสมาชิก/จัดการ':
                response = {
                    replyToken,
                    messages: [
                        {
                            type: 'template',
                            altText: 'กรุณาเลือกฟอร์ม',
                            template: {
                                type: 'carousel',
                                columns: [
                                    {
                                        thumbnailImageUrl: 'https://drive.google.com/uc?id=1PAkZ5ReDHXVidiT1-aGdfpBhEY53kzbq',
                                        title: 'สมัครสมาชิก',
                                        text: 'กรอกฟอร์มเพื่อสมัครสมาชิก',
                                        actions: [
                                            {
                                                type: 'uri',
                                                label: 'สมัครสมาชิก',
                                                uri: `${process.env.FRONT_END_BASE_URL}/signup?userId=${userId}&token=${replyToken}`,
                                            },
                                        ],
                                    },
                                    {
                                        thumbnailImageUrl: 'https://drive.google.com/uc?id=1sqXZceNP9Cmr65rABk1AtIB9P22RM8k5',
                                        title: 'แก้ไขข้อมูล',
                                        text: 'แก้ไขข้อมูลส่วนตัว',
                                        actions: [
                                            {
                                                type: 'uri',
                                                label: 'แก้ไขข้อมูล',
                                                uri: `${process.env.FRONT_END_BASE_URL}/edit?userId=${userId}&token=${replyToken}`,
                                            },
                                        ],
                                    },
                                    {
                                        thumbnailImageUrl: 'https://drive.google.com/uc?id=1pgGqrDG5MxV72dw2NdilSlQZ0SZbBLC-',
                                        title: 'ต่ออายุแพ็คเกจ',
                                        text: 'ต่ออายุแพ็คเกจ (สำหรับผู้ที่มีเลขทะเบียนอยู่ในระบบแล้ว)',
                                        actions: [
                                            {
                                                type: 'uri',
                                                label: 'ต่ออายุแพ็คเกจ',
                                                uri: `${process.env.FRONT_END_BASE_URL}/renew?userId=${userId}&token=${replyToken}`,
                                            },
                                        ],
                                    },
                                    // {
                                    //     thumbnailImageUrl: 'https://drive.google.com/uc?id=1vlr92XLjxD708UUMsXKNcJAUpoAhP--q',
                                    //     title: 'เปลี่ยนทะเบียน',
                                    //     text: 'เปลี่ยนทะเบียน',
                                    //     actions: [
                                    //         {
                                    //             type: 'uri',
                                    //             label: 'เปลี่ยนทะเบียน',
                                    //             uri: `${process.env.FRONT_END_BASE_URL}/changePlate?userId=${userId}&token=${replyToken}`,
                                    //         },
                                    //     ],
                                    // },
                                ],
                            },
                        }
                    ]
                }

                await axios.post('https://api.line.me/v2/bot/message/reply', response, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${channelAccessToken}`,
                    },
                });
                break;
            case 'วันหมดอายุ':
                const license = await License.findAll({
                    where: {
                        userId,
                    },
                    attributes: ['license', 'expiredAt'],
                });
                if (!license) {
                    res.json({ fulfillmentText: 'ขอโทษค่ะ ไม่พบหมายเลขทะเบียนของผู้ใช้งานในระบบ' })
                }
                // เตรียมข้อมูลภายใน body ของ Flex Message
                const bodyContents = license.map(item => ({
                    type: 'box',
                    layout: 'vertical',
                    margin: 'md',
                    spacing: 'sm',
                    contents: [
                        {
                            type: 'text',
                            text: `หมายเลขทะเบียน: ${item.license}`,
                            size: 'md',
                            color: '#333333',
                            weight: 'bold',
                        },
                        {
                            type: 'text',
                            text: `วันหมดอายุ: ${new Date(item.expiredAt).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}`,
                            size: 'md',
                            color: '#FF5551',
                            weight: 'bold',
                        },
                        {
                            type: 'separator',
                            margin: 'sm',
                        },
                    ],
                }));

                // สร้าง response ที่เป็น Flex Message
                response = {
                    replyToken,
                    messages: [
                        {
                            type: 'flex',
                            altText: 'แจ้งเตือนวันหมดอายุ',
                            contents: {
                                type: 'bubble',
                                header: {
                                    type: 'box',
                                    layout: 'vertical',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: 'วันหมดอายุ',
                                            size: 'lg',
                                            color: '#1DB446',
                                            weight: 'bold',
                                        },
                                    ],
                                },
                                body: {
                                    type: 'box',
                                    layout: 'vertical',
                                    contents: bodyContents,
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
                                                type: 'uri',
                                                label: 'ต่ออายุ',
                                                uri: `${process.env.FRONT_END_BASE_URL}/renew?userId=${userId}`,
                                            },
                                        },
                                    ],
                                },
                            },
                        }
                    ],
                };

                await axios.post('https://api.line.me/v2/bot/message/reply', response, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${channelAccessToken}`,
                    },
                });
                break;
            case 'ตรวจสอบที่ว่าง':
                let occupiedSlots = await License.count({
                    where: { status: true }
                });
                if (occupiedSlots > 86) {
                    occupiedSlots = 86
                }
                const availableSlots = 86 - occupiedSlots;


                response = {
                    replyToken,
                    messages: [
                        {
                            type: 'flex',
                            altText: 'แจ้งเตือนจำนวนช่องจอด',
                            contents: {
                                type: 'bubble',
                                header: {
                                    type: 'box',
                                    layout: 'vertical',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: 'สถานะช่องจอด',
                                            size: 'lg',
                                            color: '#1DB446',
                                            weight: 'bold',
                                        },
                                    ],
                                },
                                body: {
                                    type: 'box',
                                    layout: 'vertical',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: 'จำนวนช่องจอดทั้งหมด: 86',
                                            size: 'md',
                                            color: '#333333',
                                        },
                                        {
                                            type: 'text',
                                            text: `จำนวนที่จอดแล้ว: ${occupiedSlots}`,
                                            size: 'md',
                                            color: '#333333',
                                        },
                                        {
                                            type: 'text',
                                            text: `จำนวนที่ว่าง: ${availableSlots}`,
                                            size: 'lg',
                                            weight: 'bold',
                                            color: availableSlots > 0 ? '#1DB446' : '#FF5551',
                                        },
                                    ],
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
                                                type: 'uri',
                                                label: 'สมัครสมาชิก',
                                                uri: `${process.env.FRONT_END_BASE_URL}/signup?userId=${userId}`,
                                            },
                                        },
                                    ],
                                },
                            },
                        }
                    ],

                };
                await axios.post('https://api.line.me/v2/bot/message/reply', response, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${channelAccessToken}`,
                    },
                });
                break;
            default:
                if (req.body.events[0].message.type === 'image') {
                    const userId = req.body.events[0].source.userId;
                    const messageId = req.body.events[0].message.id;
                    const responseImg = await axios.get(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
                        headers: { 'Authorization': `Bearer ${channelAccessToken}` }
                    })
                    const imageBuffer = Buffer.from(responseImg.data);
                    // ใช้ Jimp เพื่อแปลง Buffer เป็นข้อมูลภาพ
                    const image = await Jimp.read(imageBuffer);
                    const { data, width, height } = image.bitmap;

                    // อ่าน QR code ด้วย jsQR
                    const qrCode = jsQR(data, width, height);

                    const getTrans = await Transaction.findOne({
                        where: {
                            userId
                        }
                    })
                    const { amount } = await Package.findOne({
                        where: {
                            id: getTrans.packageId
                        }
                    })
                    if (qrCode) {
                        console.log('QR Code Content:', qrCode);
                        const transaction = await sequelize.transaction()
                        // const res = await axios.post(`${process.env.URL_SLIP_OK}`, {
                        //     data: qrCode, amount
                        // }, {
                        //     headers: { 'Authorization': `${process.env.API_KEY_SLIP_OK}` }
                        // })

                        //เช็ค response QR 
                        const isValid = res.data.success
                        //ตอบกลับ user
                        if (isValid) {
                            const data = {
                                replyToken,
                                messages: [
                                    {
                                        type: 'text',
                                        text: 'ชำระเงินสำเร็จแล้ว ขอบคุณที่ใช้บริการของเราค่ะ 😊'
                                    },
                                ]
                            }
                            const latestTransaction = await Transaction.findOne({
                                where: { userId },
                                order: [['createdAt', 'DESC']],
                            });

                            await latestTransaction.update({
                                paymentState: 'SUCCESS'
                            }, { transaction })

                            const packageData = await Package.findOne({
                                where: latestTransaction.packageId
                            })

                            const dateNow = new Date()
                            dateNow.setDate(packageData.days)
                            dateNow.setHours(0, 0, 0, 0);
                            const expiredAt = dateNow.toISOString()
                            const [license, created] = await License.findOrCreate({
                                where: { license: latestTransaction.license },
                                defaults: {
                                    userId,
                                    license: latestTransaction.license,
                                    status: false,
                                    expiredAt: expiredAt,
                                },
                                transaction,
                            });
                            if (!created) {
                                const date = new Date()
                                date.setHours(0, 0, 0, 0);
                                const licenseExpiredAt = new Date(license.expiredAt);
                                let expDate
                                if (date > licenseExpiredAt) {
                                    expDate = expiredAt;
                                } else {
                                    expDate = licenseExpiredAt.setDate(packageData.days); // ใช้วันหมดอายุเดิม
                                    expDate = new Date(expDate)
                                    expDate.setHours(0, 0, 0, 0);
                                    expDate = expDate.toISOString()
                                }
                                await license.update(
                                    {
                                        userId,
                                        status: false,
                                        expiredAt: expDate,
                                    },
                                    { transaction }
                                );
                                console.log('License updated successfully!');
                            }
                            await axios.post('https://api.line.me/v2/bot/message/reply', data, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${channelAccessToken}`,
                                },
                            });
                            await transaction.commit();
                        } else {
                            const data = {
                                replyToken,
                                messages: [
                                    {
                                        type: 'text',
                                        text: 'สลิปชำระเงินไม่ถูกต้อง กรูณาตรวจสอบสลิปและส่งใหม่ค่ะ'
                                    },
                                ]
                            }
                            await axios.post('https://api.line.me/v2/bot/message/reply', data, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${channelAccessToken}`,
                                },
                            });
                        }
                    } else {
                        const data = {
                            replyToken,
                            messages: [
                                {
                                    type: 'text',
                                    text: 'สลิปชำระเงินไม่ถูกต้อง กรูณาตรวจสอบสลิปและส่งใหม่ค่ะ'
                                },
                            ]
                        }
                        await axios.post('https://api.line.me/v2/bot/message/reply', data, {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${channelAccessToken}`,
                            },
                        });
                        console.log('No QR Code found');
                    }
                } else {
                    const data = {
                        replyToken,
                        messages: [
                            {
                                type: 'text',
                                text: 'ขอโทษค่ะ ไม่สามารถประมวลผลได้ในขณะนี้'
                            },
                        ]
                    }
                    await axios.post('https://api.line.me/v2/bot/message/reply', data, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${channelAccessToken}`,
                        },
                    });
                }
        }
        res.json('SUCCESS');
    } catch (error) {
        console.error('Error processing the webhook:', error);
        const data = {
            replyToken,
            messages: [
                {
                    type: 'text',
                    text: 'ขอโทษค่ะ ไม่พบหมายเลขทะเบียนของผู้ใช้งานในระบบ'
                },
            ]
        }
        await axios.post('https://api.line.me/v2/bot/message/reply', data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${channelAccessToken}`,
            },
        });
        res.json({ message: error });
    }

});


export default router;
