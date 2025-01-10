import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Form veri tipini tanımla
interface FormData {
  name: string;
  surname: string;
  phone: string;
  email: string;
  position: string;
  message: string;
  cv: string; // Base64 formatındaki CV
}

// E-posta gönderme işlemi
const sendEmail = async (formData: FormData) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Gmail servisi
    auth: {
      user: process.env.EMAIL_USER, // Gmail hesabınız
      pass: process.env.EMAIL_PASS, // Gmail şifreniz veya App Password
    },
    tls: {
      rejectUnauthorized: false, // Bu satır bazı güvenlik hatalarını engelleyebilir
    },
  });

  const mailOptions = {
    from: `${formData.email}`,
    to: "info@kipras.com.tr", // E-posta gönderilecek adres
    subject: `${formData.position} - ${formData.name} ${formData.surname}`,
    text: `
      Ad: ${formData.name}
      Soyad: ${formData.surname}
      Telefon: ${formData.phone}
      E-posta: ${formData.email}
      Pozisyon: ${formData.position}
      Mesaj: ${formData.message}
    `,
    attachments: [
      {
        filename: "CV.pdf",
        content: formData.cv.split(",")[1], // Base64 verisinin sadece dosya kısmı
        encoding: "base64",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Mail gönderilemedi:", error);
    throw new Error("Mail gönderilemedi");
  }
};

// POST isteğini işlemek için named export
export async function POST(request: Request) {
  try {
    const formData: FormData = await request.json();
    await sendEmail(formData);
    return NextResponse.json(
      { message: "Form başarıyla gönderildi!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
