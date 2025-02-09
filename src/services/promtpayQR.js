
import axios from 'axios';
import sharp from 'sharp'
import generatePayload from 'promptpay-qr';
import qrcode from 'qrcode';
import { config } from 'dotenv';
import { uploadFile } from "../middleware/drive.js";

config()
// ฟังก์ชันสำหรับสร้าง QR Code ของ PromptPay
export async function generatePromptPayQR({ expiration = 600, amount = 100 }) {
  const phoneNumber = process.env.PHONE_NUMBER; // หมายเลข PromptPay
  // const amount = 100.50; // จำนวนเงิน (ถ้าต้องการ)

  const payload = generatePayload(phoneNumber, { amount });
  // await qrcode.toFile('promptpay_qr.png', payload);
  // // สร้าง QR Code และบันทึกเป็นไฟล์ PNG
  try {
    const url = await qrcode.toDataURL(payload);
    const base64Data = url.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const webpBuffer = await sharp(buffer).webp({ quality: 50 }).toBuffer(); // ลดคุณภาพของภาพเพื่อให้ไฟล์เล็กลง
    const img = await uploadFile(webpBuffer);
    console.log(img.publicUrl, 'Link for qrCode')
    return img.publicUrl
  } catch (err) {
    console.error('Error creating QR Code:', err);
  }
};
