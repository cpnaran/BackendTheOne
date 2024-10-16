import express from 'express'
import axios from 'axios';
import { config } from 'dotenv';

config()
const lineEndPoint = process.env.BASE_URL
const channelAccessToken = process.env.ACCESS_TOKEN
export async function replyUser(userId, method, imgUrl = undefined, packageData = undefined) {
    switch (method) {
        case 'แก้ไขข้อมูล':
            await axios.post(
                'https://api.line.me/v2/bot/message/push',
                {
                    to: 'U96b9e6e3c26bed9a42ef7ef4cd03e397',
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
            break;
        case 'สมัครสมาชิก':
            await axios.post('https://api.line.me/v2/bot/message/push', {
                to: 'U96b9e6e3c26bed9a42ef7ef4cd03e397',
                "messages": [
                    {
                        "type": "flex",
                        "altText": "QR Promptpay",
                        "contents": {
                            "type": "bubble",
                            "hero": {
                                "type": "image",
                                "url": imgUrl,
                                "size": "full",
                                "aspectRatio": "1:1",
                                "aspectMode": "cover"
                            },
                            "body": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": packageData.package,
                                        "weight": "bold",
                                        "size": "lg"
                                    },
                                    {
                                        "type": "text",
                                        "text": `จำนวนเงินที่ต้องชำระ: `,
                                        "weight": "bold",
                                        "size": "lg"
                                    },
                                    {
                                        "type": "text",
                                        "text": `${packageData.amount}`,
                                        "weight": "bold",
                                        "size": "xl"
                                        "color": "#1DB446"
                                    },
                                    {
                                        "type": "text",
                                        "text": `ชำระแล้ว กรุณาอัพโหลดรูปส่งมาในแชท`,
                                        "weight": "bold",
                                        "size": "lg",
                                        "color": "#FF0000"
                                    }
                                ]
                            }
                        }
                    }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${channelAccessToken}`,
                },
            });
            break;

        case 'ต่ออายุแพ็คเก็จ':
            await axios.post(lineEndPoint, {
                replyToken: token,
                messages: [
                    {
                        type: 'image',
                        originalContentUrl: `${process.env.PAYMENT_QR_URL}`, // URL ของ QR Code
                        previewImageUrl: `${process.env.PAYMENT_QR_URL}`, // รูปตัวอย่าง (สามารถใช้ URL เดียวกัน)
                    },
                ],
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${channelAccessToken}`,
                },
            });
            break;
        case 'เปลี่ยนทะเบียน':
            await axios.post(lineEndPoint, {
                replyToken: token,
                messages: [
                    {
                        type: 'image',
                        originalContentUrl: `${process.env.PAYMENT_QR_URL}`, // URL ของ QR Code
                        previewImageUrl: `${process.env.PAYMENT_QR_URL}`, // รูปตัวอย่าง (สามารถใช้ URL เดียวกัน)
                    },
                ],
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${channelAccessToken}`,
                },
            });
            break;

        default:
            console.log('Error sending message:', 'ไม่พบ Method นี้');
    }

}

// export async function sendPushMessage(userId) {
//     const response = await axios.post(
//         'https://api.line.me/v2/bot/message/push',
//         {
//             to: userId,  // userId ของผู้ใช้ที่สมัครเสร็จ
//             messages: [
//                 {
//                     type: 'text',
//                     text: 'สมัครสมาชิกเสร็จเรียบร้อยแล้ว! ขอบคุณที่สมัคร 😊'
//                 },
//             ],
//         },
//         {
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
//             },
//         }
//     );
// }