import express from 'express'
import LogData from '../models/LogData.js'
import License from '../models/License.js';
import sequelize from '../../database.js';
import { Op, where } from 'sequelize';
import axios from 'axios';
import { config } from 'dotenv';
import crypto from 'crypto';
import feature from './index.js';
import { features } from 'process';
import AxiosDigestAuth from '@mhoc/axios-digest-auth';
import DigestFetch from 'digest-fetch';


config()
const channelAccessToken = process.env.ACCESS_TOKEN

export async function createLogData(deviceId, params) {
    const vehicleTypeMap = {
        0: '3-wheel vehicle',
        1: 'Large bus',
        2: 'Midsize vehicle',
        3: 'Small vehicle',
        4: 'Large vehicle',
        5: '2-wheel vehicle',
        6: 'Motorcycle',
        7: 'Tractor',
        8: 'Farm Truck',
        9: 'Sedan',
        10: 'SUV',
        11: 'Minibus',
        12: 'Minivan',
        13: 'Midsize bus',
        14: 'Large bus',
        15: 'Large truck',
        16: 'Pickup',
        17: 'MPV',
        18: 'Roadster',
        19: 'Mini car',
        20: 'Two-box sedan',
        21: 'Three-box sedan',
        22: 'Light bus',
        23: 'Medium duty truck',
        24: 'Trailer',
        25: 'Tanker',
        26: 'Street sprinkler',
        998: 'Other',
        999: 'Unknown',
    };

    const vehicleColorMap = {
        0: 'Black',
        1: 'White',
        2: 'Gray',
        3: 'Red',
        4: 'Blue',
        5: 'Yellow',
        6: 'Orange',
        7: 'Brown',
        8: 'Green',
        9: 'Purple',
        10: 'Cyan',
        11: 'Pink',
        12: 'Transparent',
        13: 'Silver',
        14: 'Dark',
        15: 'Light color',
        16: 'No color',
        17: 'Yellow & green',
        18: 'Gradient green',
        99: 'Other',
        100: 'Unknown',
    };
    console.log(params)
    const strLicense = params.plateNo.replace(/\s+/g, '')
    const dateTime = new Date()
    dateTime.setHours(0, 0, 0, 0)
    const checkLicense = await License.findOne({
        where: {
            license: strLicense,
            expiredAt: {
                [Op.gte]: dateTime
            }
        }
    })
    const type = vehicleTypeMap[params.vehicleType]
    const color = vehicleColorMap[params.vehicleColor]
    const transaction = await sequelize.transaction()
    try {
        if (checkLicense) {
            if (deviceId === 'HC121-01') {
                console.log(`logData.js:87 checkIn ${checkLicense}`)
                await LogData.create({
                    license: strLicense,
                    checkInAt: new Date(params.picTime),
                    vehicleType: type,
                    vehicleColor: color
                }, { transaction })
                await checkLicense.update({
                    status: true
                }, { transaction })

                await openGate()
            } else {
                const message = {
                    to: checkLicense.userId,
                    messages: [
                        {
                            type: 'flex',
                            altText: 'ยืนยันการนำรถออก',
                            contents: {
                                "type": "bubble",
                                "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "ยืนยันการนำรถออก",
                                            "weight": "bold",
                                            "size": "xl",
                                            "align": "center"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "margin": "lg",
                                            "spacing": "sm",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "baseline",
                                                    "spacing": "sm",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "หมายเลขทะเบียน",
                                                            "wrap": true,
                                                            "color": "#666666",
                                                            "size": "md",
                                                            "flex": 5,
                                                            "align": "center"
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "baseline",
                                                    "spacing": "sm",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": `${strLicense}`,
                                                            "wrap": true,
                                                            "color": "#00b900",
                                                            "size": "xl",
                                                            "flex": 5,
                                                            "weight": "bold",
                                                            "style": "normal",
                                                            "decoration": "none",
                                                            "align": "center"
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "baseline",
                                                    "spacing": "sm",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "เพื่อความปลอดภัยสำหรับลูกค้ากรุณากดยืนยันก่อนที่จะนำรถออก",
                                                            "wrap": true,
                                                            "color": "#FF0000",
                                                            "size": "xs",
                                                            "flex": 5,
                                                            "align": "center"
                                                        }
                                                    ]
                                                },
                                            ]
                                        }
                                    ]
                                },
                                "footer": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "button",
                                            "style": "primary",
                                            "height": "md",
                                            "action": {
                                                "type": "postback",
                                                "label": "ยืนยัน",
                                                // "text": `ยืนยันหมายเลขทะเบียน ${strLicense}`
                                                "data": `${strLicense}`
                                            },
                                            "color": "#1DB446"
                                        }
                                    ],
                                    "flex": 0
                                }
                            },
                        }]
                }
                await axios.post('https://api.line.me/v2/bot/message/push', message,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${channelAccessToken}`,
                        },
                    });
                // await License.update({ status: false }, { where: { license: strLicense }, transaction })
                // const latestLog = await LogData.findOne({
                //     where: { license: checkLicense.license },
                //     order: [['createdAt', 'DESC']], // เรียงลำดับจากวันที่ล่าสุด
                // });
                // if (latestLog) {
                //     await LogData.update({
                //         checkOutAt: new Date()
                //     }, {
                //         where: {
                //             id: latestLog.id
                //         },
                //         transaction
                //     })
                // }
                // await openGate()

            }
        } else {
            const licenseData = await License.findOne({
                where: {
                    license: strLicense
                }
            })
            if (licenseData) {
                const message = {
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
                                        text: `หมายเลขทะเบียน: ${licenseData.license}`,
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
                                        text: `ชำระค่าปรับ ${licenseData.license}`
                                    },
                                },
                            ],
                        },
                    },
                }
                await replyToUser(licenseData.userId, message)
                console.log(`logData.js:274 ส่งแจ้งค่าปรับ`)
            }

        }
        await transaction.commit()
    } catch (e) {
        await transaction.rollback()
        throw new Error(e.message)
    }


}

export async function replyToUser(userId, message) {
    try {
        const response = await axios.post(
            'https://api.line.me/v2/bot/message/push',
            {
                to: userId,
                messages: [
                    message
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${channelAccessToken}`,
                },
            }
        );
        console.log('Message sent successfully:', response.data);
        return response
    } catch (error) {
        console.error('Error sending message:', error.response?.data || error.message);
    }
};

export async function openGate() {
    const username = process.env.IP_USERNAME;
    const password = process.env.IP_PASSWORD;

    // Create a DigestFetch client
    const client = new DigestFetch(username, password, { algorithm: 'MD5' });
    const url = `${process.env.URL_CAMERA}/LAPI/V1.0/ParkingLots/Entrances/Lanes/0/GateControl`;
    const options = {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: JSON.stringify({ Command: 0 }),
    };
    await client.fetch(url, options);
}