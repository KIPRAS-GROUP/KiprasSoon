export interface SystemInfo {
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  device: string
  userAgent: string
  referrer: string
  screenResolution: string
  language: string
  ipAddress?: string
  currentUrl?: string
  isp?: string
  asn?: string
  localDateTime: string
  timeZone: string
  timeZoneOffset: string
}

export interface FormSubmission {
  name: string
  surname: string
  email: string
  phone: string
  position: string
  message: string
  cv: string[] // Base64 string array olarak değiştirildi
  systemInfo?: SystemInfo
}

export type FormStatus = "idle" | "submitting" | "success" | "error"

declare global {
  interface Window {
    grecaptcha: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
} 