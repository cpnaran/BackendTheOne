
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
    const url = await qrcode.toDataURL(payload)

    // แยก metadata และ base64 string
    const [metadata, base64String] = url.split(',');

    const formData = new FormData();
    formData.append('image', base64String);
    // ส่ง POST request ไปยัง file.io
    const response = await axios.post(`https://api.imgbb.com/1/upload?expiration=${expiration}&key=${process.env.API_KEY_IMG_BB}`, formData);

    return response.data.data.url
  } catch (err) {
    console.error('Error creating QR Code:', err);
  }
};
