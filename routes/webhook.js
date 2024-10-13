const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    try {
        const intentName = req.body.queryResult.intent.displayName;
        console.log('Intent ที่ถูกเรียกใช้งาน:', intentName);

        const linePayload = req.body.originalDetectIntentRequest.payload;
        const userId = linePayload.events[0].source.userId;
        let carouselResponse
        switch (intentName) {
            case 'สมัครสมาชิก/จัดการ':
                carouselResponse = {
                    fulfillmentMessages: [
                        {
                            platform: 'LINE',
                            line: {
                                altText: 'กรุณาเลือกฟอร์ม',
                                type: 'template',
                                template: {
                                    type: 'carousel',
                                    columns: [
                                        {
                                            thumbnailImageUrl: 'https://your-image-link.com/image1.jpg',
                                            title: 'สมัครสมาชิก',
                                            text: 'กรอกฟอร์มเพื่อสมัครสมาชิก',
                                            actions: [
                                                {
                                                    type: 'uri',
                                                    label: 'สมัครสมาชิก',
                                                    uri: `${process.env.FRONT_END_BASE_URL}:${process.env.FRONT_END_PORT}/signup?userId=${userId}`, // URL สมัครสมาชิก
                                                },
                                            ],
                                        },
                                        {
                                            thumbnailImageUrl: 'https://your-image-link.com/image2.jpg',
                                            title: 'แก้ไขข้อมูล',
                                            text: 'แก้ไขข้อมูลส่วนตัว',
                                            actions: [
                                                {
                                                    type: 'uri',
                                                    label: 'แก้ไขข้อมูล',
                                                    uri: `${process.env.FRONT_END_BASE_URL}:${process.env.FRONT_END_PORT}/edit?userId=${userId}`, // URL แก้ไขข้อมูล
                                                },
                                            ],
                                        },
                                        {
                                            thumbnailImageUrl: 'https://your-image-link.com/image3.jpg',
                                            title: 'ยกเลิกสมาชิก',
                                            text: 'กรอกฟอร์มเพื่อยกเลิก',
                                            actions: [
                                                {
                                                    type: 'uri',
                                                    label: 'ยกเลิกสมาชิก',
                                                    uri: `${process.env.FRONT_END_BASE_URL}:${process.env.FRONT_END_PORT}/cancel?userId=${userId}`, // URL ยกเลิกสมาชิก
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                };
                break;
            default:
                carouselResponse =
                    { fulfillmentText: 'ขอโทษค่ะ ไม่สามารถประมวลผลได้ในขณะนี้' }

        }
        res.json(carouselResponse);
    } catch (error) {
        console.error('Error processing the webhook:', error);
        res.json({ fulfillmentText: 'ขอโทษค่ะ ไม่สามารถประมวลผลได้ในขณะนี้' });
    }

});


module.exports = router;
