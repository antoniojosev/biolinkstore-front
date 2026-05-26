import type React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"

import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/auth-context"
import { IconSprite } from "@/components/bylink/icon-sprite"
import "./globals.css"
import { Plus_Jakarta_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "bylink — Tu tienda de Instagram en un link",
  description: "Crea tu catálogo digital en minutos. Tus clientes exploran productos y cotizan directo por WhatsApp. Sin comisiones.",
  generator: "bylink",
  metadataBase: new URL("https://bylink.app"),
  openGraph: {
    type: "website",
    siteName: "bylink",
    title: "bylink — Tu tienda de Instagram, en un solo link",
    description: "Crea tu catálogo digital en minutos. Tus clientes exploran productos y cotizan directo por WhatsApp. Sin comisiones.",
    url: "https://bylink.app",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "bylink" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "bylink — Tu tienda de Instagram, en un solo link",
    description: "Crea tu catálogo digital en minutos. Tus clientes exploran productos y cotizan directo por WhatsApp.",
    images: ["/og-default.png"],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#1E3A8A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${jakarta.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-F4T3MGMXZS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-F4T3MGMXZS');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased">
        <IconSprite />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0d1218',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
