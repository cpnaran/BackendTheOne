import AxiosDigestAuth from "@mhoc/axios-digest-auth";
import express from "express";
import { config } from "dotenv";
import axios from "axios";
import License from "../models/License.js";
import { Op } from "sequelize";
import fs from "fs";
import { Jimp } from "jimp";
import jsQR from "jsqr";
import sharp from "sharp";
import { differenceInDays } from "date-fns";
import feature from "../feature/index.js";
import Transaction from "../models/Transaction.js";
import {
  BarcodeFormat,
  BinaryBitmap,
  BrowserMultiFormatReader,
  BrowserQRCodeReader,
  DecodeHintType,
  HybridBinarizer,
  MultiFormatReader,
  RGBLuminanceSource,
} from "@zxing/library";
import FormData from "form-data";
import qrcode from "qrcode";
import generatePayload from "promptpay-qr";
import services from "../services/index.js";
import { uploadFile } from "../middleware/drive.js";

config();
const channelAccessToken = process.env.ACCESS_TOKEN;
const router = express.Router();
router.post("/", async (req, res) => {
  //   const phoneNumber = process.env.PHONE_NUMBER; // หมายเลข PromptPay
  //   const amount = 100;
  //   const payload = generatePayload(phoneNumber, { amount });
  //   await qrcode.toFile("promptpay_qr.png", payload);
  //   // สร้าง QR Code และบันทึกเป็นไฟล์ PNG
  //   const url = await qrcode.toDataURL(payload);
  //   const base64Data = url.replace(/^data:image\/png;base64,/, "");
  //   const buffer = Buffer.from(base64Data, "base64");
  //   const webpBuffer = await sharp(buffer).webp().toBuffer();
  //   const webpBase64 = webpBuffer.toString("base64");
  //   const webpUrl = `data:image/webp;base64,${webpBase64}`;

  const img = await uploadFile("D:/work/js/google_api/qr.png");
  res.json(img);

  // const expiration = 600;
  // const formData = new FormData();
  // formData.append('image', base64String);
  // ส่ง POST request ไปยัง file.io
  // const response = await axios.post(`https://api.imgbb.com/1/upload?expiration=${expiration}&key=${process.env.API_KEY_IMG_BB}`, formData);

  // let image = await Jimp.read('SCBQR.png');
  // const buffer = fs.readFileSync('SCBQR.png');
  // const buffer = fs.readFileSync('realtest.jpg');
  // console.log('buffer:', buffer);

  // const data = new FormData();
  // data.append('files', fs.createReadStream('SCBQR.png'));
  // data.append('log', 'true');
  // data.append('amount', '2000');

  // const response = await axios.post(`${process.env.URL_SLIP_OK}`, data, {
  //     headers: {
  //         'x-authorization': `${process.env.API_KEY_SLIP_OK}`,
  //         ...data.getHeaders()
  //     }
  // })
  // console.log(response)
  // res.json(response)

  // qr test
  // const image = await Jimp.read('promptpay_qr.png');
  // // console.log('image:', image);

  // let qrCode
  // console.log('ลองใช้ qr-reader ในการอ่าน QR code');
  // let qrScanner = new QrCodeReader();
  // qrCode = await qrScanner.decode(image.bitmap)
  // console.log('qrCode qr-reader:', qrCode);

  // console.log('ลองใช้ jsQR ในการอ่าน QR code');
  // qrCode = await jsQR(image.bitmap.data, image.bitmap.width, image.bitmap.height);
  // console.log('qrCode jsQR:', qrCode.data);

  // console.log('ลองใช้ zxing-js/library ในการอ่าน QR code');
  // const hints = new Map();
  // const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX/*, ...*/];

  // hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  // hints.set(DecodeHintType.TRY_HARDER, true);

  // const codeReader = new MultiFormatReader();

  // codeReader.setHints(hints);
  // const len = image.bitmap.width * image.bitmap.height;

  // const luminancesUint8Array = new Uint8Array(len);

  // for (let i = 0; i < len; i++) {
  //     luminancesUint8Array[i] = ((image.bitmap.data[i * 4] + image.bitmap.data[i * 4 + 1] * 2 + image.bitmap.data[i * 4 + 2]) / 4) & 0xFF;
  // }
  // const luminanceSource = new RGBLuminanceSource(luminancesUint8Array, image.bitmap.width, image.bitmap.height);
  // const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
  // const decoded = await codeReader.decode(binaryBitmap);
  // qrCode = decoded.getText();
  // console.log('qrCode zxing-js:', qrCode);
  // res.json(qrCode.data)
});
// router.post("/", async (req, res) => {
//     const replyToken = req.body.events[0].replyToken;
//     const userId = req.body.events[0].source.userId;
//     const channelAccessToken = process.env.ACCESS_TOKEN;
//     const transaction = await sequelize.transaction();
// })
export default router;
