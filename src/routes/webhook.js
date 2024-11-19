import express from "express";
import { config } from "dotenv";
import License from "../models/License.js";
import axios from "axios";
import jsQR from "jsqr";
import { Jimp } from "jimp";
import Transaction from "../models/Transaction.js";
import Package from "../models/Package.js";
import sequelize from "../../database.js";
import { add, differenceInDays, interval } from "date-fns";
import User from "../models/User.js";
import services from "../services/index.js";
import feature from "../feature/index.js";
import LogData from "../models/LogData.js";
import { where } from "sequelize";
const router = express.Router();
config();

router.post("/", async (req, res) => {
    const replyToken = req.body.events[0].replyToken;
    const userId = req.body.events[0].source.userId;
    const channelAccessToken = process.env.ACCESS_TOKEN;
    const transaction = await sequelize.transaction();
    try {
        let intentName = req.body.events[0]?.message?.text || undefined;
        const method = intentName ? intentName.split(" ") : [];
        console.log("Intent ที่ถูกเรียกใช้งาน:", intentName);
        let response;
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
                let occupiedSlots = await License.count({
                    where: { status: true },
                });
                if (occupiedSlots > 86) {
                    occupiedSlots = 86;
                }
                const availableSlots = 86 - occupiedSlots;

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
                                            text: "จำนวนช่องจอดทั้งหมด: 86",
                                            size: "md",
                                            color: "#333333",
                                        },
                                        {
                                            type: "text",
                                            text: `จำนวนที่จอดแล้ว: ${occupiedSlots}`,
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
                    transaction.commit();
                }
                break;
            case "ยืนยันหมายเลขทะเบียน":
                //TODO: ยิง API เปิดไม้กั้น
                const transaction = await sequelize.transaction()
                const licenseData = await License.findOne({
                    where: {
                        license: method[1],
                        expiredAt: {
                            [Op.gt]: dateTime
                        }
                    }
                })
                if (licenseData) {
                    await licenseData.update({
                        status: false
                    }, { transaction })
                    const latestLog = await LogData.findOne({
                        where: { license: method[1] },
                        order: [['createdAt', 'DESC']], // เรียงลำดับจากวันที่ล่าสุด
                    });
                    await latestLog.update({
                        checkOutAt: new Date()
                    }, { transaction })
                    // TODO: ยิง API เปิดไม้กั้น
                    // await axios.post(`${urlCamera}/LAPI/V1.0/ParkingLots/Entrances/Lanes/0/GateControl`, { Command: 0 })
                }
                await transaction.commit()
            default:
                console.log("🚀 ~ file: webhook.js:556 ~ default:");
                if (req.body.events[0].message.type === "image") {
                    console.log(
                        "******* inside  if (req.body.events[0].message.type === 'image') "
                    );
                    const userId = req.body.events[0].source.userId;
                    const messageId = req.body.events[0].message.id;
                    const responseImg = await axios.get(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
                        headers: { 'Authorization': `Bearer ${channelAccessToken}` },
                        responseType: 'arraybuffer'
                    })
                    const imageBuffer = Buffer.from(responseImg.data);
                    // ใช้ Jimp เพื่อแปลง Buffer เป็นข้อมูลภาพ
                    const image = await Jimp.read(imageBuffer);
                    const { data, width, height } = image.bitmap;

                    // อ่าน QR code ด้วย jsQR
                    const qrCode = jsQR(data, width, height);

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
                    if (qrCode) {
                        let res
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
                            res = await axios.post(`${process.env.URL_SLIP_OK}`, {
                                data: qrCode.data, amount
                            }, {
                                headers: { 'x-authorization': `${process.env.API_KEY_SLIP_OK}` }
                            })
                        } else {
                            res = await axios.post(`${process.env.URL_SLIP_OK}`, {
                                data: qrCode.data, amount: getTrans.amount
                            }, {
                                headers: { 'x-authorization': `${process.env.API_KEY_SLIP_OK}` }
                            })
                        }
                        //เช็ค response QR
                        const isValid = res.data.success
                        //ตอบกลับ user
                        if (isValid) {
                            const data = {
                                replyToken,
                                messages: [
                                    {
                                        type: "text",
                                        text: "ชำระเงินสำเร็จแล้ว ขอบคุณที่ใช้บริการของเราค่ะ 😊",
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
                                                text: "ชำระค่าปรับเรียบร้อยแล้ว กรุณานำรถออกภายในนี้ก่อนเวลาเที่ยงคืนค่ะ 😊",
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
                                    transaction.commit();
                                    return `SUCCESS`;
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
                            await transaction.commit();
                        } else {
                            // const data = {
                            //     replyToken,
                            //     messages: [
                            //         {
                            //             type: "text",
                            //             text: "สลิปชำระเงินไม่ถูกต้อง กรุณาตรวจสอบสลิปและส่งใหม่ค่ะ",
                            //         },
                            //     ],
                            // };
                            const data = {
                                replyToken,
                                messages: [
                                    {
                                        type: "text",
                                        text: "กรุณารอสักครู่นะคะ แอดมินจะรีบตอบกลับค่ะ",
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
                    } else {
                        const data = {
                            replyToken,
                            messages: [
                                {
                                    type: "text",
                                    text: "สลิปชำระเงินไม่ถูกต้อง กรุณาตรวจสอบสลิปและส่งใหม่ค่ะ",
                                },
                            ],
                        };
                        await axios.post("https://api.line.me/v2/bot/message/reply", data, {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${channelAccessToken}`,
                            },
                        });
                        console.log("No QR Code found");
                    }
                } else {
                    const data = {
                        replyToken,
                        messages: [
                            {
                                type: "text",
                                text: "กรุณารอสักครู่นะคะ แอดมินจะรีบตอบกลับค่ะ",
                            },
                        ],
                    };
                    await axios.post("https://api.line.me/v2/bot/message/reply", data, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${channelAccessToken}`,
                        },
                    });
                }
        }
        res.json("SUCCESS");
    } catch (error) {
        console.log(">>>>>>>>>>>>>>>", error);
        transaction.rollback();
        if (error.response.status === 400) {
            const data = {
                replyToken,
                messages: [
                    {
                        type: 'text',
                        text: 'สลิปชำระเงินไม่ถูกต้อง กรุณาตรวจสอบสลิปและส่งใหม่ค่ะ'
                    },
                ]
            }
            await axios.post('https://api.line.me/v2/bot/message/reply', data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${channelAccessToken}`,
                },
            });
        } else {
            console.error("Error processing the webhook:", error);
            const data = {
                replyToken,
                messages: [
                    {
                        type: "text",
                        text: "กรุณารอสักครู่นะคะ แอดมินจะรีบตอบกลับค่ะ",
                    },
                ],
            };
            await axios.post("https://api.line.me/v2/bot/message/reply", data, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${channelAccessToken}`,
                },
            });
            res.json({ message: error });
        }
    }
});

export default router;
