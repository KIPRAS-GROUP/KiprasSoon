import { NextResponse } from "next/server"
import { RateLimiterMemory } from "rate-limiter-flexible"
import { headers } from "next/headers"
import { UAParser } from "ua-parser-js"
import { careerFormSchema } from "@/lib/validations"
import { type FormSubmission } from "@/types"
import { sendEmail } from "@/lib/email"
import { verifyRecaptcha } from "@/lib/recaptcha"

// Rate limiter kurulumu
const rateLimiter = new RateLimiterMemory({
  points: 3, // 3 istek
  duration: 60, // 60 saniye içinde
  blockDuration: 3600, // 1 saat blok
})

// IP bilgilerini getir
const getIpInfo = async (ip: string) => {
  if (ip === "::1" || ip === "127.0.0.1") {
    return {
      isp: "Localhost",
      asn: "Localhost",
    }
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,isp,as,org`)
    const data = await response.json()
    
    if (data.status === "success") {
      return {
        isp: data.isp || data.org || "Bilinmiyor",
        asn: data.as?.split(" ")[0] || "Bilinmiyor",
      }
    }
    
    return {
      isp: "Bilinmiyor",
      asn: "Bilinmiyor",
    }
  } catch (error) {
    console.error('IP bilgisi alınamadı:', error)
    return {
      isp: "Bilinmiyor",
      asn: "Bilinmiyor",
    }
  }
}

// Sistem bilgilerini topla
const getSystemInfo = async (userAgent: string, ip: string, referer: string) => {
  const parser = new UAParser(userAgent)
  const browser = parser.getBrowser()
  const os = parser.getOS()
  const device = parser.getDevice()
  const ipInfo = await getIpInfo(ip)

  return {
    browser: browser.name || "Unknown",
    browserVersion: browser.version || "Unknown",
    os: os.name || "Unknown",
    osVersion: os.version || "Unknown",
    device: device.type || "desktop",
    userAgent,
    ipAddress: ip,
    referrer: referer,
    isp: ipInfo.isp,
    asn: ipInfo.asn,
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const ip = (await headersList.get("x-forwarded-for"))?.split(',')[0] || 
               await headersList.get("x-real-ip") || 
               "Unknown"
    const userAgent = await headersList.get("user-agent") || "Unknown"
    const referer = await headersList.get("referer") || "Direct"
               
    try {
      await rateLimiter.consume(ip)
    } catch {
      return NextResponse.json(
        { error: "Çok fazla deneme yaptınız. Lütfen bir süre bekleyin." },
        { status: 429 }
      )
    }

    const body = await request.json()

    // reCAPTCHA doğrula
    const isValid = await verifyRecaptcha(body.recaptchaToken)
    if (!isValid) {
      return NextResponse.json(
        { error: "reCAPTCHA doğrulaması başarısız" },
        { status: 400 }
      )
    }

    // Form verilerini doğrula
    const formData: FormSubmission = {
      ...body,
      systemInfo: {
        ...await getSystemInfo(userAgent, ip, referer),
        ...body.systemInfo,
      }
    }

    try {
      careerFormSchema.parse(formData)
    } catch (error) {
      console.error("Validation error:", error)
      return NextResponse.json(
        { error: "Form verileri geçersiz" },
        { status: 400 }
      )
    }

    // E-posta gönder
    await sendEmail(formData)

    return NextResponse.json({ 
      message: "Form başarıyla gönderildi",
      success: true
    })
  } catch (error) {
    console.error("Form submission error:", error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Form gönderilirken bir hata oluştu" },
      { status: 500 }
    )
  }
} 