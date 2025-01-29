import * as z from "zod"

export const careerFormSchema = z.object({
  name: z.string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Ad sadece harflerden oluşmalıdır"),
  
  surname: z.string()
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(50, "Soyad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Soyad sadece harflerden oluşmalıdır"),
  
  email: z.string()
    .email("Geçerli bir e-posta adresi giriniz")
    .min(5, "E-posta adresi çok kısa")
    .max(100, "E-posta adresi çok uzun"),
  
  phone: z.string()
    .min(1, "Telefon numarası gereklidir")
    .transform((val) => val.replace(/\D/g, '')),
  
  position: z.string({
    required_error: "Lütfen bir pozisyon seçiniz",
  }),
  
  message: z.string()
    .min(30, "Mesajınız en az 30 karakter olmalıdır")
    .max(1000, "Mesajınız en fazla 1000 karakter olabilir"),
  
  cv: z.array(z.string()).min(1, {
    message: "Gerekli",
  }),
  systemInfo: z.object({
    browser: z.string().optional(),
    browserVersion: z.string().optional(),
    os: z.string().optional(),
    osVersion: z.string().optional(),
    device: z.string().optional(),
    userAgent: z.string().optional(),
    referrer: z.string().optional(),
    screenResolution: z.string().optional(),
    language: z.string().optional(),
    ipAddress: z.string().optional(),
    currentUrl: z.string().optional(),
    isp: z.string().optional(),
    asn: z.string().optional(),
    localDateTime: z.string().optional(),
    timeZone: z.string().optional(),
    timeZoneOffset: z.string().optional(),
  }).optional(),
})

export type CareerFormValues = z.infer<typeof careerFormSchema> 