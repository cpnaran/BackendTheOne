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
                [Op.gt]: dateTime
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
                await LogData.Create({
                    license: strLicense,
                    checkIn: new Date(params.picTime),
                    vehicleType: type,
                    vehicleColor: color
                    // where: {
                    //     license: strLicense
                    // }
                    // defaults: {
                    //     license: strLicense,
                    //     checkInAt: new Date(params.picTime),
                    //     vehicleType: type,
                    //     vehicleColor: color
                    // }
                }, { transaction })
                await checkLicense.update({
                    status: true
                }, { transaction })

                await openGate()
            } else {
                // const message = {
                //     type: 'flex',
                //     altText: 'ยืนยันการนำรถออก',
                //     contents: {
                //         "type": "bubble",
                //         "body": {
                //             "type": "box",
                //             "layout": "vertical",
                //             "contents": [
                //                 {
                //                     "type": "text",
                //                     "text": "ยืนยันการนำรถออก",
                //                     "weight": "bold",
                //                     "size": "xl"
                //                 },
                //                 {
                //                     "type": "box",
                //                     "layout": "vertical",
                //                     "margin": "lg",
                //                     "spacing": "sm",
                //                     "contents": [
                //                         {
                //                             "type": "box",
                //                             "layout": "baseline",
                //                             "spacing": "sm",
                //                             "contents": [
                //                                 {
                //                                     "type": "text",
                //                                     "text": "หมายเลขทะเบียน",
                //                                     "wrap": true,
                //                                     "color": "#666666",
                //                                     "size": "md",
                //                                     "flex": 5,
                //                                     "align": "center"
                //                                 }
                //                             ]
                //                         },
                //                         {
                //                             "type": "box",
                //                             "layout": "baseline",
                //                             "spacing": "sm",
                //                             "contents": [
                //                                 {
                //                                     "type": "text",
                //                                     "text": `${strLicense}`,
                //                                     "wrap": true,
                //                                     "color": "#00b900",
                //                                     "size": "xl",
                //                                     "flex": 5,
                //                                     "weight": "bold",
                //                                     "style": "normal",
                //                                     "decoration": "none",
                //                                     "align": "center"
                //                                 }
                //                             ]
                //                         }
                //                     ]
                //                 }
                //             ]
                //         },
                //         "footer": {
                //             "type": "box",
                //             "layout": "vertical",
                //             "spacing": "sm",
                //             "contents": [
                //                 {
                //                     "type": "button",
                //                     "style": "link",
                //                     "height": "sm",
                //                     "action": {
                //                         "type": "message",
                //                         "label": "ยืนยัน",
                //                         "text": `ยืนยันหมายเลขทะเบียน ${strLicense}`
                //                     },
                //                     "color": "#000000"
                //                 }
                //             ],
                //             "flex": 0
                //         }
                //     },
                // }
                // console.log(`LogData.js:187 Checkout`)
                // if (checkLicense.status) {
                //     await replyToUser(checkLicense.userId, message)
                //     console.log(`LogData.js:190 ส่งยืนยัน`)
                // }
                await LogData.update({ checkOutAt: new Date(params.picTime) }, {
                    where: {
                        license: strLicense
                    }, transaction
                })
                await License.update({ status: false }, { where: { license: strLicense }, transaction })
                await openGate()

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
                await replyToUser(checkLicense.userId, message)
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
                    {
                        type: 'text',
                        text: message,
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
        console.log('Message sent successfully:', response.data);
        return response
    } catch (error) {
        console.error('Error sending message:', error.response?.data || error.message);
    }
};

export async function openGate() {
    const requestBody = JSON.stringify({
        Username: process.env.IP_USERNAME,
        Password: process.env.IP_PASSWORD
    });

    const hash = crypto.createHash('md5');
    hash.update(requestBody);
    const digest = hash.digest('hex');
    axios.post(`${process.env.URL_CAMERA}/LAPI/V1.0/ParkingLots/Entrances/Lanes/0/GateControl`, { Command: 0 }, {
        headers: {
            'Content-Type': 'application/json',
            'Digest': `MD5=78459e357376100de3d76ce25c8d6901`,
        }
    })
}