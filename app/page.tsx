import { CareerForm } from "@/components/forms/career-form"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1A1A1A]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 py-32 text-center">
          <Image
            src="/logo.png"
            alt="Kipras Logo"
            width={200}
            height={80}
            className="mx-auto mb-8"
          />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary mb-6">
            KİPRAS GROUP
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Mimarlık ve Tasarımda 22 Yıllık Mükemmellik ile Hayaller Kuruyor ve Geleceği Şekillendiriyoruz
          </p>
          <CareerForm />
        </div>
      </section>
    </main>
  )
}
