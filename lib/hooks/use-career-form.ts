"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { careerFormSchema, type CareerFormValues } from "@/lib/validations"
import { type FormStatus } from "@/types"
import { delay } from "@/lib/utils"

export function useCareerForm() {
  const [status, setStatus] = useState<FormStatus>("idle")
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  const form = useForm<CareerFormValues>({
    resolver: zodResolver(careerFormSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phone: "",
      position: "",
      message: "",
    },
  })

  const onSubmit = async (data: CareerFormValues) => {
    try {
      setStatus("submitting")
      
      // Sistem bilgilerini topla
      const systemInfo = {
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        localDateTime: new Date().toLocaleString('tr-TR'),
        timeZoneOffset: new Date().getTimezoneOffset().toString(),
        currentUrl: window.location.href,
        language: navigator.language,
      }

      // Rate limiting için kısa bir gecikme ekleyelim
      await delay(1000)

      // reCAPTCHA token al
      const token = await (window as any).grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, {
        action: 'submit'
      })

      const response = await fetch("/api/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          systemInfo,
          recaptchaToken: token,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error)
      }

      setStatus("success")
      toast.success("Başvurunuz başarıyla gönderildi")
      form.reset()
      setOpen(false)
      setStep(0)
    } catch (error: Error | unknown) {
      setStatus("error")
      if (error instanceof Error) {
        if (error.message.includes("rate limit")) {
          toast.error("Çok fazla deneme yaptınız. Lütfen bir süre bekleyin.")
        } else if (error.message.includes("file size")) {
          toast.error("Dosya boyutu çok büyük")
        } else {
          toast.error(error.message)
        }
      } else {
        toast.error("Bir hata oluştu")
      }
    } finally {
      setStatus("idle")
    }
  }

  return {
    form,
    status,
    open,
    setOpen,
    onSubmit: form.handleSubmit(onSubmit),
  }
} 