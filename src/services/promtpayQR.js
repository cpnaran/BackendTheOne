
import axios from 'axios';
import generatePayload from 'promptpay-qr';
import qrcode from 'qrcode';
import { config } from 'dotenv';

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
    const webpBase64 = webpBuffer.toString('base64');
    // แยก metadata และ base64 string

    const formData = new FormData();
    formData.append('image', webpBase64);
    // ส่ง POST request ไปยัง file.io
    const response = await axios.post(`https://api.imgbb.com/1/upload?expiration=${expiration}&key=${process.env.API_KEY_IMG_BB}`, formData);

    return response.data.data.url
  } catch (err) {
    console.error('Error creating QR Code:', err);
  }
};
