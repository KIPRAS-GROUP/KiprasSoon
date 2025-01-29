"use client"

import { type Control } from "react-hook-form"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { type CareerFormValues } from "@/lib/validations"

interface StepProps {
  currentStep: number
  control: Control<CareerFormValues>
}

export function FormSteps({ currentStep }: { currentStep: number }) {
  const steps = [
    { title: "Kişisel Bilgiler", description: "Ad ve soyad bilgileri" },
    { title: "İletişim Bilgileri", description: "E-posta ve telefon" },
    { title: "Başvuru Detayları", description: "Pozisyon, mesaj ve CV" },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="space-y-4 pb-4">
      <Progress value={progress} className="h-1" />
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={cn(
              "space-y-1",
              index <= currentStep
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            <p className="font-medium">{step.title}</p>
            <p className="text-xs">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 