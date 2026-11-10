import type { Metadata } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { template: '%s | Humu Kabba Variety Vault', default: 'Humu Kabba Variety Vault — Fashion, Beauty & Lifestyle' },
  description: 'Shop the latest fashion, beauty, shoes, bags, accessories and more. Fast delivery across Sierra Leone. Order via WhatsApp or online.',
  keywords: ['Humu Kabba', 'Variety Vault', 'Sierra Leone shopping', 'Freetown fashion', 'online store SL'],
  authors: [{ name: 'Humu Kabba Variety Vault' }],
  openGraph: {
    type: 'website',
    locale: 'en_SL',
    url: 'https://humu-kabba-vault.vercel.app',
    siteName: 'Humu Kabba Variety Vault',
    title: 'Humu Kabba Variety Vault — Fashion, Beauty & Lifestyle',
    description: 'Sierra Leone\'s premier online boutique. Shop dresses, bags, shoes, beauty, accessories & more.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Humu Kabba Variety Vault' }],
  },
  twitter: { card: 'summary_large_image', title: 'Humu Kabba Variety Vault', description: 'Fashion, Beauty & Lifestyle — Sierra Leone' },
  manifest: '/manifest.webmanifest',
  themeColor: '#0a0a0c',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="bg-vault-bg text-vault-text font-body antialiased">
        {children}
      </body>
    </html>
  )
}
