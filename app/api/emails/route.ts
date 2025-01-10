/* eslint-disable @typescript-eslint/no-explicit-any */
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
  // Environment variables kontrolü
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("E-posta kimlik bilgileri eksik");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Transporter bağlantı testi
  try {
    await transporter.verify();
  } catch (error: any) {
    console.error("SMTP bağlantı hatası:", error);
    throw new Error(`SMTP bağlantı hatası: ${error.message}`);
  }

  const mailOptions = {
    from: process.env.EMAIL_USER, // Gönderen adresi EMAIL_USER olarak değiştirildi
    to: "info@kipras.com.tr",
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
        content: formData.cv.split(",")[1],
        encoding: "base64",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error("Mail gönderme hatası:", error);
    throw new Error(`Mail gönderme hatası: ${error.message}`);
  }
};

// POST isteğini işlemek için named export
export async function POST(request: Request) {
  try {
    const formData: FormData = await request.json();
    
    // Form verilerinin kontrolü
    if (!formData.email || !formData.name || !formData.surname || !formData.position) {
      return NextResponse.json(
        { error: "Gerekli form alanları eksik" },
        { status: 400 }
      );
    }

    // CV kontrolü
    if (!formData.cv || !formData.cv.includes('base64')) {
      return NextResponse.json(
        { error: "CV dosyası geçerli değil" },
        { status: 400 }
      );
    }

    await sendEmail(formData);
    return NextResponse.json(
      { message: "Form başarıyla gönderildi!" },
      { status: 200 }
    );
  } catch (error: any) {
    // Daha detaylı hata mesajı
    console.error("Form gönderme hatası:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        error: "Bir hata oluştu", 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
