import express from 'express'
import axios from 'axios';
import { config } from 'dotenv';

config()
const lineEndPoint = process.env.BASE_URL
const channelAccessToken = process.env.ACCESS_TOKEN
export async function replyUser({ userId, method, imgUrl = undefined, packageData = undefined, license = undefined }) {
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
                to: userId,
                messages: [
                    {
                        type: "flex",
                        altText: "QR Promptpay",
                        contents: {
                            type: "bubble",
                            body: {
                                type: "box",
                                layout: "vertical",
                                spacing: "md",
                                contents: [
                                    {
                                        type: "text",
                                        text: "QR Promptpay",
                                        wrap: true,
                                        weight: "bold",
                                        gravity: "center",
                                        size: "xl"
                                    },
                                    {
                                        type: "box",
                                        layout: "vertical",
                                        margin: "lg",
                                        spacing: "sm",
                                        contents: [
                                            {
                                                type: "box",
                                                layout: "baseline",
                                                spacing: "sm",
                                                contents: [
                                                    {
                                                        type: "text",
                                                        text: "ทะเบียน",
                                                        color: "#aaaaaa",
                                                        size: "sm",
                                                        flex: 1
                                                    },
                                                    {
                                                        type: "text",
                                                        text: license, // Corrected string interpolation
                                                        wrap: true,
                                                        size: "sm",
                                                        color: "#666666",
                                                        flex: 4
                                                    }
                                                ]
                                            },
                                            {
                                                type: "box",
                                                layout: "baseline",
                                                spacing: "sm",
                                                contents: [
                                                    {
                                                        type: "text",
                                                        text: "แพ็คเก็จ",
                                                        color: "#aaaaaa",
                                                        size: "sm",
                                                        flex: 1
                                                    },
                                                    {
                                                        type: "text",
                                                        text: packageData.package, // Corrected string interpolation
                                                        wrap: true,
                                                        color: "#666666",
                                                        size: "sm",
                                                        flex: 4
                                                    }
                                                ]
                                            },
                                            {
                                                type: "box",
                                                layout: "baseline",
                                                spacing: "sm",
                                                contents: [
                                                    {
                                                        type: "text",
                                                        text: "ราคา",
                                                        color: "#aaaaaa",
                                                        size: "sm",
                                                        flex: 1
                                                    },
                                                    {
                                                        type: "text",
                                                        text: packageData.amount.toString(), // Ensure it's a string
                                                        wrap: true,
                                                        color: "#50C878",
                                                        size: "sm",
                                                        flex: 4,
                                                        weight: "bold"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        type: "box",
                                        layout: "vertical",
                                        margin: "xxl",
                                        contents: [
                                            {
                                                type: "image",
                                                url: imgUrl, // Ensure this is a valid URL
                                                size: "xxl",
                                                margin: "md",
                                                aspectMode: "fit",
                                                aspectRatio: "1:1"
                                            },
                                            {
                                                type: "text",
                                                text: "เมื่อชำระแล้วกรุณาอัพโหลดสลิปในแชท",
                                                color: "#FF0000",
                                                wrap: true,
                                                margin: "xxl",
                                                size: "sm",
                                                align: "center",
                                                weight: "bold",
                                                style: "normal"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }, {
                        type: 'text',
                        text: 'เมื่อชำระเงินผ่าน QRCode แล้วอัพโหลดสลิปได้เลย 😊'
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