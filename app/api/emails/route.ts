/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

// Rate limiter kurulumu
const rateLimiter = new RateLimiterMemory({
  points: 3, // 3 istek hakkı
  duration: 60, // 60 saniye içinde
  blockDuration: 3600, // 1 saat blok süresi
});

// Form veri tipini tanımla
interface FormData {
  name: string;
  surname: string;
  phone: string;
  email: string;
  position: string;
  message: string;
  cv: string;
  fileType: string;
  reCaptchaToken: string;
  systemInfo?: {
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    device: string;
    userAgent: string;
    referrer: string;
    screenResolution: string;
    language: string;
    ipAddress?: string;
    currentUrl?: string;
    isp?: string;
    asn?: string;
    localDateTime: string;
    timeZone: string;
    timeZoneOffset: string;
  };
}

// ReCAPTCHA doğrulama fonksiyonu
async function verifyRecaptcha(token: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    throw new Error("ReCAPTCHA secret key is not configured");
  }
  
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  try {
    const response = await fetch(verificationUrl, { method: "POST" });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("ReCAPTCHA doğrulama hatası:", error);
    return false;
  }
}

// IP bilgilerini getir
const getIpInfo = async (ip: string) => {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    return {
      isp: data.isp || 'Bilinmiyor',
      asn: data.as || 'Bilinmiyor',
    };
  } catch (error) {
    console.error('IP bilgisi alınamadı:', error);
    return {
      isp: 'Bilinmiyor',
      asn: 'Bilinmiyor',
    };
  }
};

// Sistem bilgilerini topla
const getSystemInfo = async () => {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "Unknown";
  const ip = headersList.get("x-forwarded-for") || 
             headersList.get("x-real-ip") || 
             "Unknown";
  const referer = headersList.get("referer") || "Doğrudan Erişim";
  const acceptLanguage = headersList.get("accept-language")?.split(',')[0] || "Unknown";
  
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  const ipInfo = await getIpInfo(ip);
  
  const now = new Date();
  
  return {
    browser: browser.name || "Unknown",
    browserVersion: browser.version || "Unknown",
    os: os.name || "Unknown",
    osVersion: os.version || "Unknown",
    device: device.type || "desktop",
    userAgent,
    referrer: referer,
    screenResolution: "N/A", // Client-side'dan gelmeli
    language: acceptLanguage,
    ipAddress: ip,
    isp: ipInfo.isp,
    asn: ipInfo.asn,
    localDateTime: now.toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timeZoneOffset: now.getTimezoneOffset().toString(),
    currentUrl: referer
  };
};

// Logger fonksiyonu
const logSubmission = async (formData: FormData, status: "success" | "error", error?: string) => {
  const logEntry = {
    ...formData.systemInfo,
    formData: {
      name: formData.name,
      surname: formData.surname,
      email: formData.email,
      position: formData.position,
    },
    status,
    error,
    timestamp: new Date().toISOString()
  };
  
  console.log(JSON.stringify(logEntry));
  return logEntry;
};

// E-posta gönderme işlemi
const sendEmail = async (formData: FormData) => {
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

  try {
    await transporter.verify();
  } catch (error: any) {
    console.error("SMTP bağlantı hatası:", error);
    throw new Error(`SMTP bağlantı hatası: ${error.message}`);
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "info@kipras.com.tr",
    subject: `${formData.position} - ${formData.name} ${formData.surname}`,
    html: `
      <h2>Form Bilgileri</h2>
      <p><strong>Ad:</strong> ${formData.name}</p>
      <p><strong>Soyad:</strong> ${formData.surname}</p>
      <p><strong>Telefon:</strong> ${formData.phone}</p>
      <p><strong>E-posta:</strong> ${formData.email}</p>
      <p><strong>Pozisyon:</strong> ${formData.position}</p>
      <p><strong>Mesaj:</strong> ${formData.message}</p>
      <br>
      <h3>Sistem Log Bilgileri</h3>
      <p><strong>Tarayıcı:</strong> ${formData.systemInfo?.browser} ${formData.systemInfo?.browserVersion}</p>
      <p><strong>İşletim Sistemi:</strong> ${formData.systemInfo?.os} ${formData.systemInfo?.osVersion}</p>
      <p><strong>Cihaz:</strong> ${formData.systemInfo?.device}</p>
      <p><strong>Ekran Çözünürlüğü:</strong> ${formData.systemInfo?.screenResolution}</p>
      <p><strong>Dil:</strong> ${formData.systemInfo?.language}</p>
      <p><strong>IP Adresi:</strong> ${formData.systemInfo?.ipAddress || 'Bilinmiyor'}</p>
      <p><strong>ISP:</strong> ${formData.systemInfo?.isp || 'Bilinmiyor'}</p>
      <p><strong>ASN:</strong> ${formData.systemInfo?.asn || 'Bilinmiyor'}</p>
      <p><strong>Zaman Dilimi:</strong> ${formData.systemInfo?.timeZone}</p>
      <p><strong>Yerel Tarih/Saat:</strong> ${formData.systemInfo?.localDateTime}</p>
      <p><strong>Referrer:</strong> ${formData.systemInfo?.referrer || 'Doğrudan Erişim'}</p>
      <p><strong>Mevcut URL:</strong> ${formData.systemInfo?.currentUrl || 'Bilinmiyor'}</p>
    `,
    attachments: [
      {
        filename: `CV_${formData.name}_${formData.surname}.${formData.fileType}`,
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
    // Rate limiting kontrolü
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || 
               headersList.get("x-real-ip") || 
               "Unknown";
               
    try {
      await rateLimiter.consume(ip);
    } catch {
      return NextResponse.json(
        { error: "Çok fazla deneme yaptınız. Lütfen bir süre bekleyin." },
        { status: 429 }
      );
    }

    const formData: FormData = await request.json();
    
    // reCAPTCHA doğrulama
    if (!formData.reCaptchaToken) {
      return NextResponse.json(
        { error: "reCAPTCHA doğrulaması gerekli" },
        { status: 400 }
      );
    }

    const isRecaptchaValid = await verifyRecaptcha(formData.reCaptchaToken);
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { error: "reCAPTCHA doğrulaması başarısız" },
        { status: 400 }
      );
    }

    // Sistem bilgilerini topla
    formData.systemInfo = await getSystemInfo();
    
    // Form verilerinin kontrolü
    if (!formData.email || !formData.name || !formData.surname || !formData.position) {
      await logSubmission(formData, "error", "Missing required fields");
      return NextResponse.json(
        { error: "Gerekli form alanları eksik" },
        { status: 400 }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      await logSubmission(formData, "error", "Invalid email format");
      return NextResponse.json(
        { error: "Geçersiz email formatı" },
        { status: 400 }
      );
    }

    // İzin verilen dosya türleri
    const allowedFileTypes = ['pdf', 'doc', 'docx', 'txt'];
    const fileType = formData.fileType.toLowerCase();
    
    if (!allowedFileTypes.includes(fileType)) {
      await logSubmission(formData, "error", "Invalid file type");
      return NextResponse.json(
        { error: "Sadece PDF, DOC, DOCX ve TXT dosyalarına izin verilmektedir" },
        { status: 400 }
      );
    }

    // CV kontrolü
    if (!formData.cv || !formData.cv.includes('base64')) {
      await logSubmission(formData, "error", "Invalid CV file");
      return NextResponse.json(
        { error: "CV dosyası geçerli değil" },
        { status: 400 }
      );
    }

    await sendEmail(formData);
    await logSubmission(formData, "success");

    return NextResponse.json({ message: "Form başarıyla gönderildi" });

  } catch (error: any) {
    console.error("Form gönderme hatası:", error.message);
    
    const emptyFormData: FormData = {
      name: "",
      surname: "",
      email: "",
      position: "",
      phone: "",
      message: "",
      cv: "",
      fileType: "",
      reCaptchaToken: "",
      systemInfo: await getSystemInfo()
    };
    
    await logSubmission(emptyFormData, "error", error.message);
    
    return NextResponse.json(
      { error: "Form gönderilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
