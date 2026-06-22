import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Nexova — AI Business Platform',
  description: 'AI platform for small businesses. Write emails, contracts, quotes, proposals, captions and more — in seconds.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/og-image.png',
  },
  openGraph: {
    title: 'Nexova — AI Business Platform',
    description: 'AI platform for small businesses. Write emails, contracts, quotes, proposals, captions and more — in seconds.',
    url: 'https://nexova-platform.netlify.app',
    siteName: 'Nexova',
    images: [
      {
        url: 'https://nexova-platform.netlify.app/og-image.png',
        width: 1376,
        height: 768,
        alt: 'Nexova — AI Business Platform',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexova — AI Business Platform',
    description: 'AI platform for small businesses. Write emails, contracts, quotes, proposals, captions and more — in seconds.',
    images: ['https://nexova-platform.netlify.app/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <style>{`
          .goog-te-banner-frame, .skiptranslate { display: none !important; }
          body { top: 0 !important; }
          .goog-te-gadget { font-size: 0 !important; }
          .goog-te-gadget a { display: none !important; }
        `}</style>
      </head>
      <body className="h-full">
        <div id="google_translate_element" style={{ display: 'none' }} />
        <Providers>{children}</Providers>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="gt-init" strategy="afterInteractive">{`
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'en',
              autoDisplay: false,
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
          }
        `}</Script>
      </body>
    </html>
  )
}
