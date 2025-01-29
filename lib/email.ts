import nodemailer from "nodemailer"
import { type FormSubmission } from "@/types"

export async function sendEmail(data: FormSubmission) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("E-posta kimlik bilgileri eksik")
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
  })

  const getPositionLabel = (value: string) => {
    const positions = {
      "mimar": "Mimar",
      "ic-mimar": "İç Mimar", 
      "insaat-muhendisi": "İnşaat Mühendisi",
      "elektrik-muhendisi": "Elektrik Mühendisi",
      "makine-muhendisi": "Makine Mühendisi",
      "peyzaj-mimari": "Peyzaj Mimarı",
      "tasarimci": "Tasarımcı",
      "tekniker": "Tekniker",
      "teknisyen": "Teknisyen",
      "diger": "Diğer"
    }
    return positions[value as keyof typeof positions] || value
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "info@kipras.com.tr",
    subject: `🎓 Yeni başvuru ${getPositionLabel(data.position)} - ${data.name} ${data.surname}`,
    html: `
      <h2>Form Bilgileri</h2>
      <p><strong>Ad:</strong> ${data.name}</p>
      <p><strong>Soyad:</strong> ${data.surname}</p>
      <p><strong>Telefon:</strong> ${data.phone}</p>
      <p><strong>E-posta:</strong> ${data.email}</p>
      <p><strong>Pozisyon:</strong> ${getPositionLabel(data.position)}</p>
      <p><strong>Mesaj:</strong> ${data.message}</p>
      <br>
      <h3>Sistem Log Bilgileri</h3>
      <p><strong>Tarayıcı:</strong> ${data.systemInfo?.browser} ${data.systemInfo?.browserVersion}</p>
      <p><strong>İşletim Sistemi:</strong> ${data.systemInfo?.os} ${data.systemInfo?.osVersion}</p>
      <p><strong>Cihaz:</strong> ${data.systemInfo?.device}</p>
      <p><strong>Ekran Çözünürlüğü:</strong> ${data.systemInfo?.screenResolution}</p>
      <p><strong>Dil:</strong> ${data.systemInfo?.language}</p>
      <p><strong>IP Adresi:</strong> ${data.systemInfo?.ipAddress}</p>
      <p><strong>ISP:</strong> ${data.systemInfo?.isp}</p>
      <p><strong>ASN:</strong> ${data.systemInfo?.asn}</p>
      <p><strong>Zaman Dilimi:</strong> ${data.systemInfo?.timeZone}</p>
      <p><strong>Yerel Tarih/Saat:</strong> ${data.systemInfo?.localDateTime}</p>
      <p><strong>Referrer:</strong> ${data.systemInfo?.referrer}</p>
      <p><strong>Mevcut URL:</strong> ${data.systemInfo?.currentUrl}</p>
    `,
    attachments: [
      ...(data.cv as string[]).map((file, index) => ({
        filename: `CV_${data.name}_${data.surname}_${index + 1}.pdf`,
        content: file.split(',')[1],
        encoding: 'base64',
      })),
    ],
  }

  try {
    await transporter.verify()
    await transporter.sendMail(mailOptions)
  } catch (error: Error | unknown) {
    console.error("Mail gönderme hatası:", error)
    if (error instanceof Error) {
      throw new Error(`Mail gönderme hatası: ${error.message}`)
    } else {
      throw new Error("Mail gönderme hatası")
    }
  }
} 