import type React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Inter } from "next/font/google"

import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "BioLinkStore — Deja de perder pedidos en los DMs",
  description: "Crea tu tienda online en minutos. Tus clientes exploran tu catálogo y te hacen pedidos directo por WhatsApp. Sin comisiones.",
  generator: "v0.app",
  metadataBase: new URL("https://biolinkstore.com"),
  openGraph: {
    type: "website",
    siteName: "BioLinkStore",
    title: "BioLinkStore — Deja de perder pedidos en los DMs",
    description: "Crea tu tienda online en minutos. Tus clientes exploran tu catálogo y te hacen pedidos directo por WhatsApp. Sin comisiones.",
    url: "https://biolinkstore.com",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "BioLinkStore" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BioLinkStore — Deja de perder pedidos en los DMs",
    description: "Crea tu tienda online en minutos. Tus clientes exploran tu catálogo y te hacen pedidos directo por WhatsApp.",
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
  themeColor: "#ffffff",
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
    <html lang="es">
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #E5E7EB',
              color: '#1F2937',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
