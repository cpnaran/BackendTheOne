import express from "express";
import { config } from "dotenv";
import License from "../models/License.js";
import axios from "axios";
import { Jimp } from "jimp";
import Transaction from "../models/Transaction.js";
import Package from "../models/Package.js";
import sequelize from "../../database.js";
import { add, differenceInDays } from "date-fns";
import User from "../models/User.js";
import services from "../services/index.js";
import feature from "../feature/index.js";
import LogData from "../models/LogData.js";
import { Op } from "sequelize";
import { Client } from '@line/bot-sdk';
import FormData from 'form-data';
import fs from 'fs'
import { minutesInHour } from "date-fns/constants";
const router = express.Router();
config();

router.post("/", async (req, res) => {
    const replyToken = req.body.events[0].replyToken;
    const userId = req.body.events[0].source.userId;
    const channelAccessToken = process.env.ACCESS_TOKEN;
    const channelSecret = process.env.CHANNEL_SECRET;
    const transaction = await sequelize.transaction();
    const client = new Client({
        channelAccessToken: channelAccessToken,
        channelSecret: channelSecret,
    });
    try {
        let intentName = req.body.events[0]?.message?.text || undefined;
        const method = intentName ? intentName.split(" ") : [];
        console.log("Intent ที่ถูกเรียกใช้งาน:", intentName);
        let response;
        const dateTime = new Date()
        dateTime.setHours(0, 0, 0, 0)

        switch (method[0]) {
            case "สมัครสมาชิก/จัดการ":
                response = {
                    replyToken,
                    messages: [
                        {
                            type: "template",
                            altText: "กรุณาเลือกฟอร์ม",
                            template: {
                                type: "carousel",
                                columns: [
                                    {
                                        thumbnailImageUrl:
                                            "https://drive.google.com/uc?id=1PAkZ5ReDHXVidiT1-aGdfpBhEY53kzbq",
                                        title: "สมัครสมาชิก",
                                        text: "กรอกฟอร์มเพื่อสมัครสมาชิก",
                                        actions: [
                                            {
                                                type: "uri",
                                                label: "สมัครสมาชิก",
                                                uri: `${process.env.FRONT_END_BASE_URL}/signup?userId=${userId}&token=${replyToken}`,
                                            },
                                        ],
                                    },
                                    {
                                        thumbnailImageUrl:
                                            "https://drive.google.com/uc?id=1sqXZceNP9Cmr65rABk1AtIB9P22RM8k5",
                                        title: "แก้ไขข้อมูล",
                                        text: "แก้ไขข้อมูลส่วนตัว",
                                        actions: [
                                            {
                                                type: "uri",
                                                label: "แก้ไขข้อมูล",
                                                uri: `${process.env.FRONT_END_BASE_URL}/edit?userId=${userId}&token=${replyToken}`,
                                            },
                                        ],
                                    },
                                    {
                                        thumbnailImageUrl:
                                            "https://drive.google.com/uc?id=1pgGqrDG5MxV72dw2NdilSlQZ0SZbBLC-",
                                        title: "ต่ออายุแพ็คเกจ",
                                        text: "ต่ออายุแพ็คเกจ (สำหรับผู้ที่มีเลขทะเบียนอยู่ในระบบแล้ว)",
                                        actions: [
                                            {
                                                type: "uri",
                                                label: "ต่ออายุแพ็คเกจ",
                                                uri: `${process.env.FRONT_END_BASE_URL}/renew?userId=${userId}&token=${replyToken}`,
                                            },
                                        ],
                                    },
                                    {
                                        thumbnailImageUrl: 'https://drive.google.com/uc?id=1vlr92XLjxD708UUMsXKNcJAUpoAhP--q',
                                        title: 'ชำระค่าปรับ',
                                        text: 'ชำระค่าปรับ',
                                        actions: [
                                            {
                                                type: 'uri',
                                                label: 'ชำระค่าปรับ',
                                                uri: `${process.env.FRONT_END_BASE_URL}/pay?userId=${userId}&token=${replyToken}`,
                                            },
                                        ],
                                    },
                                    {
                                        thumbnailImageUrl: 'https://drive.google.com/uc?id=182ryX68DCHJUhO6f2eB_ZMrV7Lpe_dAp',
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
                    ],
                };

                await axios.post("https://api.line.me/v2/bot/message/reply", response, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${channelAccessToken}`,
                    },
                });
                break;
            case "วันหมดอายุ":
                const license = await License.findAll({
                    where: {
                        userId,
                    },
                    attributes: ["license", "expiredAt"],
                });
                if (!license) {
                    const txt = {
                        replyToken,
                        messages: [
                            {
                                type: "text",
                                text: "ไม่พบข้อมูลทะเบียนรถของผู้ใช้งานค่ะ 😊",
                            },
                        ],
                    };
                    await axios.post("https://api.line.me/v2/bot/message/reply", txt, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${channelAccessToken}`,
                        },
                    });
                    return `license not found`;
                }
                // เตรียมข้อมูลภายใน body ของ Flex Message
                const bodyContents = license.map((item) => ({
                    type: "box",
                    layout: "vertical",
                    margin: "md",
                    spacing: "sm",
                    contents: [
                        {
                            type: "text",
                            text: `หมายเลขทะเบียน: ${item.license}`,
                            size: "md",
                            color: "#333333",
                            weight: "bold",
                        },
                        {
                            type: "text",
                            text: `วันหมดอายุ: ${new Date(item.expiredAt).toLocaleDateString(
                                "th-TH",
                                {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                }
                            )}`,
                            size: "md",
                            color: "#FF5551",
                            weight: "bold",
                        },
                        {
                            type: "separator",
                            margin: "sm",
                        },
                    ],
                }));

                // สร้าง response ที่เป็น Flex Message
                response = {
                    replyToken,
                    messages: [
                        {
                            type: "flex",
                            altText: "แจ้งเตือนวันหมดอายุ",
                            contents: {
                                type: "bubble",
                                header: {
                                    type: "box",
                                    layout: "vertical",
                                    contents: [
                                        {
                                            type: "text",
                                            text: "วันหมดอายุ",
                                            size: "lg",
                                            color: "#1DB446",
                                            weight: "bold",
                                        },
                                    ],
                                },
                                body: {
                                    type: "box",
                                    layout: "vertical",
                                    contents: bodyContents,
                                },
                                footer: {
                                    type: "box",
                                    layout: "vertical",
                                    contents: [
                                        {
                                            type: "button",
                                            style: "primary",
                                            color: "#1DB446",
                                            action: {
                                                type: "uri",
                                                label: "ต่ออายุ",
                                                uri: `${process.env.FRONT_END_BASE_URL}/renew?userId=${userId}`,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                };

                await axios.post("https://api.line.me/v2/bot/message/reply", response, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${channelAccessToken}`,
                    },
                });
                break;
            case "ตรวจสอบที่ว่าง":
                const now = new Date()
                now.setHours(0, 0, 0, 0)
                let occupiedSlots = await License.count({
                    where: {
                        expiredAt: {
                            [Op.gte]: now
                        }
                    },
                });
                const maximumCar = 89
                if (occupiedSlots > maximumCar) {
                    occupiedSlots = maximumCar;
                }
                const availableSlots = maximumCar - occupiedSlots;

                response = {
                    replyToken,
                    messages: [
                        {
                            type: "flex",
                            altText: "แจ้งเตือนจำนวนช่องจอด",
                            contents: {
                                type: "bubble",
                                header: {
                                    type: "box",
                                    layout: "vertical",
                                    contents: [
                                        {
                                            type: "text",
                                            text: "สถานะช่องจอด",
                                            size: "lg",
                                            color: "#1DB446",
                                            weight: "bold",
                                        },
                                    ],
                                },
                                body: {
                                    type: "box",
                                    layout: "vertical",
                                    contents: [
                                        {
                                            type: "text",
                                            text: `จำนวนช่องจอดทั้งหมด: ${maximumCar}`,
                                            size: "md",
                                            color: "#333333",
                                        },
                                        {
                                            type: "text",
                                            text: `จำนวนรถที่ลงทะเบียนตอนนี้: ${occupiedSlots}`,
                                            size: "md",
                                            color: "#333333",
                                        },
                                        {
                                            type: "text",
                                            text: `จำนวนที่ว่าง: ${availableSlots}`,
                                            size: "lg",
                                            weight: "bold",
                                            color: availableSlots > 0 ? "#1DB446" : "#FF5551",
                                        },
                                    ],
                                },
                                footer: {
                                    type: "box",
                                    layout: "vertical",
                                    contents: [
                                        {
                                            type: "button",
                                            style: "primary",
                                            color: "#1DB446",
                                            action: {
                                                type: "uri",
                                                label: "สมัครสมาชิก",
                                                uri: `${process.env.FRONT_END_BASE_URL}/signup?userId=${userId}`,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                };
                await axios.post("https://api.line.me/v2/bot/message/reply", response, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${channelAccessToken}`,
                    },
                });
                break;
            case "ชำระค่าปรับ":
                const user = await User.findOne({
                    where: {
                        userId,
                    },
                });

                if (!user) {
                    const txt = {
                        replyToken,
                        messages: [
                            {
                                type: "text",
                                text: "ไม่พบข้อมูลของผู้ใช้งานค่ะ 😊",
                            },
                        ],
                    };
                    await axios.post("https://api.line.me/v2/bot/message/reply", txt, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${channelAccessToken}`,
                        },
                    });
                    return `UserId not found`;
                } else {
                    const licenseData = await License.findOne({
                        where: {
                            license: method[1],
                        },
                    });
                    const nowDate = new Date();
                    nowDate.setHours(0, 0, 0, 0);
                    const overDays = differenceInDays(
                        nowDate,
                        new Date(licenseData.expiredAt)
                    );
                    if (overDays <= 0) {
                        const txt = {
                            replyToken,
                            messages: [
                                {
                                    type: "text",
                                    text: "ผู้ใช้งานยังไม่มีค่าปรับต้องชำระค่ะ 😊",
                                },
                            ],
                        };
                        await axios.post("https://api.line.me/v2/bot/message/reply", txt, {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${channelAccessToken}`,
                            },
                        });
                    }
                    await Transaction.create(
                        {
                            userId,
                            packageId: `30d27f15-0ace-4263-b789-1c851d20ac6c`,
                            amount: overDays * 100,
                            paymentState: `PENDING`,
                            license: licenseData.license,
                        },
                        { transaction }
                    );
                    const packageData = {
                        amount: overDays * 100,
                        package: `จ่ายค่าปรับ ${overDays} วัน`,
                    };
                    const urlQrPayment = await services.promtpayQR.generatePromptPayQR({
                        amount: overDays * 100,
                    });
                    await feature.webhook.replyUser({
                        userId,
                        method: `สมัครสมาชิก`,
                        imgUrl: urlQrPayment,
                        packageData,
                        license: licenseData.license,
                    });
                    //await transaction.commit();
                }
                break;
            // case "ยืนยันหมายเลขทะเบียน":
            //     console.log(`webhook.js:395 ยืนยันหมายเลขทะเบียน`)
            //     const licenseData = await License.findOne({
            //         where: {
            //             license: method[1],
            //             expiredAt: {
            //                 [Op.gt]: dateTime
            //             }
            //         }
            //     })
            //     console.log(`webhook.js:404 ${license}`)
            //     if (licenseData) {
            //         await licenseData.update({
            //             status: false
            //         }, { transaction })
            //         const latestLog = await LogData.findOne({
            //             where: { license: method[1] },
            //             order: [['createdAt', 'DESC']], // เรียงลำดับจากวันที่ล่าสุด
            //         });
            //         await latestLog.update({
            //             checkOutAt: new Date()
            //         }, { transaction })

            //         await feature.logData.openGate()
            //         console.log('webhook.js:418 open gate')
            //     }
            // await transaction.commit()
            default:
                console.log("🚀 ~ file: webhook.js:556 ~ default:");
                if (req.body.events[0]?.message?.type === "image") {
                    console.log(
                        "******* inside  if (req.body.events[0].message.type === 'image') "
                    );
                    const userId = req.body.events[0].source.userId;
                    const messageId = req.body.events[0].message.id;
                    const image = await axios.get(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
                        headers: { 'Authorization': `Bearer ${channelAccessToken}` },
                        responseType: 'arraybuffer'
                    })
                    console.log("🚀 image", image.data);
                    const buffer = Buffer.from(image.data);
                    console.log("🚀 buffer", buffer);
                    // const imageBuffer = Buffer.from(responseImg.data);
                    // // ใช้ Jimp เพื่อแปลง Buffer เป็นข้อมูลภาพ
                    // let image = await Jimp.read(imageBuffer);
                    // image.contrast(0.5);
                    // const data = image.bitmap;

                    // อ่าน QR code ด้วย jsQR
                    // let qrCode = await jsQR(data.data, data.width, data.height);
                    // if (!qrCode) {
                    //     console.log('ส่ง QRCode ไปใหม่')
                    //     const { data, width, height } = image.bitmap;
                    //     qrCode = await jsQR(data, width, height);
                    // }
                    const getTrans = await Transaction.findOne({
                        where: {
                            userId,
                            paymentState: "PENDING",
                        },
                        order: [["createdAt", "DESC"]],
                    });
                    console.log("🚀 ~ file: webhook.js:557 ~ getTrans:", getTrans);
                    const getPackage = await Package.findOne({
                        where: {
                            id: getTrans.packageId,
                        },
                    });
                    console.log("🚀 ~ file: webhook.js:557 ~ getPackage:", getPackage);
                    // if (qrCode) {
                    let response
                    if (getTrans.packageId === `30d27f15-0ace-4263-b789-1c851d20ac6c`) {
                        const a = new Date()
                        a.setHours(0, 0, 0, 0)
                        const license = await License.findOne({
                            where: {
                                license: getTrans.license
                            }, attributes: [`expiredAt`]
                        })
                        const overDays = differenceInDays(a, license.expiredAt)
                        const amount = overDays * 100
                        response = await postSlipOk(buffer, amount)
                    } else {
                        response = await postSlipOk(buffer, getTrans.amount)
                    }
                    // //เช็ค response QR
                    const isValid = response.status == 200 ? true : false;
                    //ตอบกลับ user
                    if (isValid) {
                        const data = {
                            replyToken,
                            messages: [
                                {
                                    type: "text",
                                    text: "ชำระเงินสำเร็จแล้ว ขอบพระคุณที่ใช้บริการของลานจอดรถ THE ONe ค่ะ  🙏🏻🥰 ทั้งนี้…คุณลูกค้ากดเช็ควันหมดอายุเพื่ออัพเดทวันหมดอายุด้วยนะคะ ❤️",
                                },
                            ],
                        };
                        await getTrans.update(
                            {
                                paymentState: "SUCCESS",
                            },
                            { transaction }
                        );

                        //กรณีของการสมัครสมาชิกครั้งแรก
                        let dateNow = new Date();
                        dateNow = add(dateNow, { days: getPackage.days });
                        dateNow.setHours(0, 0, 0, 0);
                        const [license, created] = await License.findOrCreate({
                            where: { license: getTrans.license },
                            defaults: {
                                userId,
                                license: getTrans.license,
                                status: false,
                                expiredAt: dateNow,
                            },
                            transaction,
                        });
                        console.log(
                            "%%%%%%%%%%%%  const [license, created] = await License.findOrCreate"
                        );
                        //กรณีที่มีทะเบียนอยู่แล้ว
                        if (!created) {
                            console.log("%%%%%%%%%%%% if (!created)");
                            let getDate = new Date();
                            getDate.setHours(0, 0, 0, 0);
                            if (license.expiredAt < getDate && license.status === true) {
                                console.log("แพ็คเก็จหมดอายุ และรถจอดอยู่ (จ่ายค่าปรับ)");
                                //กรณีแพ็คเก็จหมดอายุ และรถจอดอยู่ในที่จอด (จ่ายค่าปรับ)
                                let expired = new Date();
                                expired.setHours(0, 0, 0, 0);
                                await license.update(
                                    {
                                        expiredAt: expired,
                                    },
                                    { transaction }
                                );
                                console.log(getTrans);
                                await getTrans.update(
                                    {
                                        paymentState: `SUCCESS`,
                                    },
                                    { transaction }
                                );
                                const reply = {
                                    replyToken,
                                    messages: [
                                        {
                                            type: "text",
                                            text: "ชำระค่าปรับเรียบร้อยแล้ว กรุณานำรถออกภายในวันนี้นี้ก่อนเวลาเที่ยงคืนค่ะ 😊",
                                        },
                                    ],
                                };

                                await axios.post(
                                    "https://api.line.me/v2/bot/message/reply",
                                    reply,
                                    {
                                        headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${channelAccessToken}`,
                                        },
                                    }
                                );
                                await transaction.commit();
                                return res.json("SUCCESS");
                            } else if (license.expiredAt >= getDate) {
                                console.log("แพ็คเก็จไม่หมด ต่อทะเบียน");
                                //กรณีแพ็คเกจยังไม่หมดและต่อทะเบียน
                                let expired = add(new Date(license.expiredAt), {
                                    days: getPackage.days,
                                });
                                expired.setHours(0, 0, 0, 0);
                                await license.update(
                                    {
                                        expiredAt: expired,
                                    },
                                    { transaction }
                                );
                            } else {
                                console.log("แพ็คเก็จหมดอายุ รถไม่ได้จอด");
                                //กรณีแพ็คเกจหมดอายุ แต่รถไม่ได้ใช้บริการอยู่
                                let expired = add(new Date(getDate), {
                                    days: getPackage.days,
                                });
                                expired.setHours(0, 0, 0, 0);
                                await license.update(
                                    {
                                        expiredAt: expired,
                                    },
                                    { transaction }
                                );
                            }
                        }

                        await axios.post(
                            "https://api.line.me/v2/bot/message/reply",
                            data,
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${channelAccessToken}`,
                                },
                            }
                        );
                    } else {
                        const data = {
                            replyToken,
                            messages: [
                                {
                                    type: "text",
                                    text: "สลิปชำระเงินไม่ถูกต้องหรือเป็นสลิปเก่า กรุณาตรวจสอบสลิปและส่งใหม่ค่ะ",
                                },
                            ],
                        };
                        await axios.post(
                            "https://api.line.me/v2/bot/message/reply",
                            data,
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${channelAccessToken}`,
                                },
                            }
                        );
                    }
                    // } else {
                    //     const data = {
                    //         replyToken,
                    //         messages: [
                    //             {
                    //                 type: "text",
                    //                 text: "สลิปชำระเงินไม่ถูกต้องหรือเป็นสลิปเก่า กรุณาตรวจสอบสลิปและส่งใหม่ค่ะ",
                    //             },
                    //         ],
                    //     };
                    //     await axios.post("https://api.line.me/v2/bot/message/reply", data, {
                    //         headers: {
                    //             "Content-Type": "application/json",
                    //             Authorization: `Bearer ${channelAccessToken}`,
                    //         },
                    //     });
                    //     console.log("No QR Code found");
                    // }
                }
                else {
                    // events.forEach(async event => {
                    const event = req.body.events[0] //add
                    if (event?.type === 'postback') {
                        // ส่งข้อความใหม่ทับข้อความเดิม
                        console.log('webhook.js 670 ', event.postback.data)
                        const [textLicense, time] = event.postback.data.split("-");
                        const currentTime = new Date();
                        const postbackTime = new Date(time);
                        const timeDifference = (currentTime - postbackTime) / (1000 * 60 * 60); // difference in hours
                        if (timeDifference > 2) {
                            // await client.replyMessage(event.replyToken, {
                            //     type: 'text',
                            //     text: 'คำขอหมดอายุ กรุณาลองใหม่อีกครั้ง',
                            // });
                            return;
                        }
                        const licenseData = await License.findOne({
                            where: {
                                license: textLicense,
                                status: true,
                                expiredAt: {
                                    [Op.gte]: dateTime
                                }
                            }
                        })
                        console.log('webhook.js 681 ', licenseData)
                        if (licenseData) {
                            const tx = await sequelize.transaction() //add
                            await License.update({
                                status: false
                            }, {
                                where: {
                                    license: licenseData.license
                                },
                                transaction: tx
                            }) //add
                            console.log(`webhook.js :693 `)
                            const latestLog = await LogData.findOne({
                                where: { license: licenseData.license },
                                order: [['createdAt', 'DESC']], // เรียงลำดับจากวันที่ล่าสุด
                            });
                            console.log(`latestLog`, latestLog)
                            if (latestLog) {
                                await LogData.update({
                                    checkOutAt: new Date()
                                }, {
                                    where: {
                                        id: latestLog.id
                                    },
                                    transaction: tx
                                })
                            }
                            console.log('อัพเดททะเบียน ขาออก ')
                            await feature.logData.openGate()
                            await client.replyMessage(event.replyToken, {
                                type: 'text',
                                text: 'ยืนยันการออกสำเร็จ',
                            });
                            await tx.commit() //add
                        } else {
                            await client.replyMessage(event.replyToken, {
                                type: 'text',
                                text: 'ได้มีการยืนยันการออกแล้ว หากมีข้อสงสัยหรือปัญหากรุณาติดต่อแอดมิน',
                            });
                        }
                    }
                    // });
                }
        }
        await transaction.commit()
        res.json("SUCCESS");
    } catch (error) {
        console.log("webhook.js error >>>>>>>>>>>>>>>", error);
        await transaction.rollback();
        const data = {
            replyToken,
            messages: [
                {
                    type: 'text',
                    text: 'สลิปชำระเงินไม่ถูกต้องหรือเป็นสลิปเก่า กรุณาตรวจสอบสลิปและส่งใหม่ค่ะ'
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
        // }
    }
});


async function postSlipOk(image, amount) {
    const data = new FormData();
    data.append('files', image, { filename: 'image.jpg', contentType: 'image/jpeg' });
    data.append('log', 'true');
    data.append('amount', amount);
    const response = await axios.post(`${process.env.URL_SLIP_OK}`, data, {
        headers: {
            'x-authorization': `${process.env.API_KEY_SLIP_OK}`,
            ...data.getHeaders()
        }
    })
    return response
}
export default router;
