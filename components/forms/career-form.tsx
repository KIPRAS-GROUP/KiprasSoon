"use client"

import { useState } from "react"
import { useCareerForm } from "@/lib/hooks/use-career-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormSteps } from "@/components/forms/career-form-steps"
import { AnimatePresence } from "@/components/ui/motion"
import { cn } from "@/lib/utils"

const positions = [
  { value: "mimar", label: "Mimar" },
  { value: "ic-mimar", label: "İç Mimar" },
  { value: "insaat-muhendisi", label: "İnşaat Mühendisi" },
  { value: "elektrik-muhendisi", label: "Elektrik Mühendisi" },
  { value: "makine-muhendisi", label: "Makine Mühendisi" },
  { value: "peyzaj-mimari", label: "Peyzaj Mimarı" },
  { value: "tasarimci", label: "Tasarımcı" },
  { value: "tekniker", label: "Tekniker" },
  { value: "teknisyen", label: "Teknisyen" },
  { value: "diger", label: "Diğer" },
]

// Input kısıtlamaları için yardımcı fonksiyonlar
const onlyLetters = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const regex = /[a-zA-ZğüşıöçĞÜŞİÖÇ\s]/
  if (!regex.test(e.key) && e.key !== "Backspace" && e.key !== "Delete") {
    e.preventDefault()
  }
}

const onlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete") {
    e.preventDefault()
  }
}

const formatPhoneNumber = (value: string) => {
  return value.replace(/\D/g, '')
}

export function CareerForm() {
  const { form, status, open, setOpen, onSubmit } = useCareerForm()
  const [step, setStep] = useState(0)
  const isSubmitting = status === "submitting"

  const canGoNext = () => {
    if (step === 0) {
      return !form.formState.errors.name && !form.formState.errors.surname &&
             form.getValues('name') && form.getValues('surname')
    }
    if (step === 1) {
      return !form.formState.errors.email && !form.formState.errors.phone &&
             form.getValues('email') && form.getValues('phone')
    }
    return true
  }

  const nextStep = () => {
    if (canGoNext()) {
      setStep((prev) => Math.min(prev + 1, 2))
    }
  }
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          Kariyer Fırsatları
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>İş Başvuru Formu</DialogTitle>
          <DialogDescription>
            Lütfen aşağıdaki formu doldurarak başvurunuzu tamamlayın.
          </DialogDescription>
        </DialogHeader>
        <FormSteps currentStep={step} />
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <AnimatePresence>
              {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ad</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Adınız" 
                            onKeyDown={onlyLetters}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="surname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soyad</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Soyadınız" 
                            onKeyDown={onlyLetters}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </AnimatePresence>
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="ornek@mail.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="5XX XXX XX XX"
                          onKeyDown={onlyNumbers}
                          onChange={(e) => {
                            const formattedValue = formatPhoneNumber(e.target.value)
                            if (formattedValue !== e.target.value) {
                              e.target.value = formattedValue
                            }
                            field.onChange(formattedValue)
                          }}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pozisyon</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Başvurmak istediğiniz pozisyonu seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position.value} value={position.value}>
                              {position.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mesaj</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Kendinizi kısaca tanıtın..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        * Minimum 30 karakter yazmanız gerekmektedir
                      </p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cv"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>CV</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          required
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            Promise.all(
                              files.map((file) => {
                                return new Promise((resolve) => {
                                  const reader = new FileReader()
                                  reader.onload = (e) => resolve(e.target?.result)
                                  reader.readAsDataURL(file)
                                })
                              })
                            ).then((base64Files) => {
                              onChange(base64Files)
                            })
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.cv && "Gerekli"}
                      </FormMessage>
                      <p className="text-xs text-muted-foreground mt-1">
                        * Birden fazla dosya seçebilirsiniz
                      </p>
                    </FormItem>
                  )}
                />
              </>
            )}
            <div className="flex gap-2 justify-end">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Geri
                </Button>
              )}
              {step < 2 ? (
                <Button 
                  type="button" 
                  disabled={!canGoNext()}
                  onClick={nextStep}
                >
                  İleri
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !form.getValues('position')}
                >
                  {isSubmitting ? "Gönderiliyor..." : "Gönder"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 