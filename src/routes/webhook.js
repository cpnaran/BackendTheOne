import express from 'express';
import { config } from 'dotenv';
import License from '../models/License.js';
const router = express.Router();
config()



router.post('/', async (req, res) => {
    try {
        const intentName = req.body.queryResult.intent.displayName;
        console.log('Intent ที่ถูกเรียกใช้งาน:', intentName);
        console.log(req.body.originalDetectIntentRequest.payload)

        const replyToken = req.body.originalDetectIntentRequest.payload.data.replyToken;
        const userId = req.body.originalDetectIntentRequest.payload.data.source.userId;
        let response
        switch (intentName) {
            case 'สมัครสมาชิก/จัดการ':
                response = {
                    fulfillmentMessages: [
                        {
                            platform: 'LINE', // ระบุว่าเป็นแพลตฟอร์ม LINE
                            payload: {
                                line: {
                                    type: 'template',
                                    altText: 'กรุณาเลือกฟอร์ม', // ข้อความสำหรับอุปกรณ์ที่ไม่รองรับ template
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
                                                text: 'ต่ออายุแพ็คเกจ (สำหรับผู้ที่เคยสมัครแล้ว)',
                                                actions: [
                                                    {
                                                        type: 'uri',
                                                        label: 'ต่ออายุแพ็คเกจ',
                                                        uri: `${process.env.FRONT_END_BASE_URL}/renew?userId=${userId}&token=${replyToken}`,
                                                    },
                                                ],
                                            },
                                            {
                                                thumbnailImageUrl: 'https://drive.google.com/uc?id=1vlr92XLjxD708UUMsXKNcJAUpoAhP--q',
                                                title: 'เปลี่ยนทะเบียน',
                                                text: 'เปลี่ยนทะเบียน',
                                                actions: [
                                                    {
                                                        type: 'uri',
                                                        label: 'เปลี่ยนทะเบียน',
                                                        uri: `${process.env.FRONT_END_BASE_URL}/changePlate?userId=${userId}&token=${replyToken}`,
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    ],
                };
                break;
            case 'วันหมดอายุ':
                const expiredAt = await License.findAll({
                    where: {
                        userId,
                        paymentState: 'SUCCESS',
                    },
                    attributes: ['license', 'expiredAt'],
                });
                if (!expiredAt) {
                    res.json({ fulfillmentText: 'ขอโทษค่ะ ไม่พบหมายเลขทะเบียนของผู้ใช้งานในระบบ' })
                }
                // เตรียมข้อมูลภายใน body ของ Flex Message
                const bodyContents = expiredAt.map(item => ({
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
                    fulfillmentMessages: [
                        {
                            platform: 'LINE',
                            payload: {
                                line: {
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
                                },
                            },
                        },
                    ],
                };
                break;
            case 'ตรวจสอบที่ว่าง':
                const occupiedSlots = await License.count({
                    where: { status: true }
                });
                const availableSlots = 86 - occupiedSlots;

                response = {
                    fulfillmentMessages: [
                        {
                            platform: 'LINE',
                            payload: {
                                line: {
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
                                                        uri: `${process.env.FRONT_END_BASE_URL}/parking-status?userId=${userId}`,
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    ],
                };
                break;
            default:
                if (req.body)
                    response = { fulfillmentText: 'ขอโทษค่ะ ไม่สามารถประมวลผลได้ในขณะนี้' }
        }
        res.json(response);
    } catch (error) {
        console.error('Error processing the webhook:', error);
        res.json({ fulfillmentText: 'ขอโทษค่ะ ไม่พบหมายเลขทะเบียนของผู้ใช้งานในระบบ' });
    }

});


export default router;
