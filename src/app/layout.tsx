import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Nexova — AI Agent Platform',
  description: 'Build and deploy AI agents for your business in minutes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <style>{`
          /* Hide Google Translate toolbar */
          .goog-te-banner-frame, .skiptranslate { display: none !important; }
          body { top: 0 !important; }
          /* Hide Google branding in dropdown */
          .goog-te-gadget { font-size: 0 !important; }
          .goog-te-gadget a { display: none !important; }
        `}</style>
      </head>
      <body className="h-full">
        {/* Hidden Google Translate widget — controlled via LanguageSwitcher */}
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
