import { Providers } from "@/components/shared/providers"
import { GeistSans } from "geist/font/sans"
import { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "KİPRAS GROUP",
  description: "Mimarlık ve Tasarımda 22 Yıllık Mükemmellik ile Hayaller Kuruyor ve Geleceği Şekillendiriyoruz",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link 
          rel="icon" 
          href="/favicon.ico" 
          sizes="any"
        />
        <script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          async
          defer
        />
      </head>
      <body className={GeistSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
