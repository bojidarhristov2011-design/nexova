'use client'

import { useState, useEffect, useRef } from 'react'

const LANGUAGES = [
  { code: 'en',    label: 'English',            flag: '🇬🇧' },
  { code: 'es',    label: 'Español',            flag: '🇪🇸' },
  { code: 'fr',    label: 'Français',           flag: '🇫🇷' },
  { code: 'de',    label: 'Deutsch',            flag: '🇩🇪' },
  { code: 'it',    label: 'Italiano',           flag: '🇮🇹' },
  { code: 'pt',    label: 'Português',          flag: '🇵🇹' },
  { code: 'nl',    label: 'Nederlands',         flag: '🇳🇱' },
  { code: 'pl',    label: 'Polski',             flag: '🇵🇱' },
  { code: 'ro',    label: 'Română',             flag: '🇷🇴' },
  { code: 'bg',    label: 'Български',          flag: '🇧🇬' },
  { code: 'el',    label: 'Ελληνικά',           flag: '🇬🇷' },
  { code: 'tr',    label: 'Türkçe',             flag: '🇹🇷' },
  { code: 'ru',    label: 'Русский',            flag: '🇷🇺' },
  { code: 'ar',    label: 'العربية',            flag: '🇸🇦' },
  { code: 'zh-CN', label: '中文 (简体)',         flag: '🇨🇳' },
  { code: 'zh-TW', label: '中文 (繁體)',         flag: '🇹🇼' },
  { code: 'ja',    label: '日本語',             flag: '🇯🇵' },
  { code: 'ko',    label: '한국어',             flag: '🇰🇷' },
  { code: 'hi',    label: 'हिन्दी',             flag: '🇮🇳' },
  { code: 'sv',    label: 'Svenska',            flag: '🇸🇪' },
  { code: 'da',    label: 'Dansk',              flag: '🇩🇰' },
  { code: 'fi',    label: 'Suomi',              flag: '🇫🇮' },
  { code: 'no',    label: 'Norsk',              flag: '🇳🇴' },
  { code: 'cs',    label: 'Čeština',            flag: '🇨🇿' },
  { code: 'sk',    label: 'Slovenčina',         flag: '🇸🇰' },
  { code: 'hu',    label: 'Magyar',             flag: '🇭🇺' },
  { code: 'hr',    label: 'Hrvatski',           flag: '🇭🇷' },
  { code: 'uk',    label: 'Українська',         flag: '🇺🇦' },
  { code: 'he',    label: 'עברית',              flag: '🇮🇱' },
  { code: 'id',    label: 'Bahasa Indonesia',   flag: '🇮🇩' },
  { code: 'ms',    label: 'Bahasa Melayu',      flag: '🇲🇾' },
  { code: 'th',    label: 'ภาษาไทย',           flag: '🇹🇭' },
  { code: 'vi',    label: 'Tiếng Việt',         flag: '🇻🇳' },
]

function setGoogleTranslateLanguage(langCode: string) {
  // Reset to English first if switching back
  if (langCode === 'en') {
    const iframe = document.querySelector<HTMLIFrameElement>('.goog-te-banner-frame')
    if (iframe) {
      const btn = iframe.contentDocument?.querySelector<HTMLElement>('.goog-te-button button')
      btn?.click()
    }
    // Alternative: reload without the cookie
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname
    window.location.reload()
    return
  }
  // Set cookie directly — Google Translate reads this
  const cookie = `/en/${langCode}`
  document.cookie = `googtrans=${cookie}; path=/`
  document.cookie = `googtrans=${cookie}; path=/; domain=${window.location.hostname}`

  // Try to trigger via the hidden select element
  const select = document.querySelector<HTMLSelectElement>('.goog-te-combo')
  if (select) {
    select.value = langCode
    select.dispatchEvent(new Event('change'))
  } else {
    // Widget not ready yet — reload so cookie takes effect
    window.location.reload()
  }
}

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('en')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Read current language from cookie
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/)
    if (match) setCurrent(match[1])

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(code: string, label: string, flag: string) {
    setCurrent(code)
    setOpen(false)
    setGoogleTranslateLanguage(code)
    // Store readable label for display
    localStorage.setItem('nx_lang_label', `${flag} ${label}`)
  }

  const currentLang = LANGUAGES.find(l => l.code === current) ?? LANGUAGES[0]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          width: '100%', padding: '0.4375rem 0.75rem', borderRadius: 8,
          fontSize: '0.875rem', color: open ? '#c4b5fd' : 'var(--muted)',
          background: open ? 'rgba(124,58,237,0.12)' : 'transparent',
          border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
          transition: 'background 0.12s, color 0.12s',
        }}
      >
        <span style={{ fontSize: '0.9375rem', width: 18, textAlign: 'center', flexShrink: 0 }}>🌐</span>
        <span style={{ flex: 1 }}>{currentLang.flag} {currentLang.label}</span>
        <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', bottom: '110%', left: 0, right: 0,
          background: '#13132a', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: '0.375rem', zIndex: 999,
          maxHeight: 280, overflowY: 'auto',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
        }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => select(lang.code, lang.label, lang.flag)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                width: '100%', padding: '0.4rem 0.625rem', borderRadius: 7,
                background: current === lang.code ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: current === lang.code ? '#c4b5fd' : 'var(--muted)',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit', fontSize: '0.84rem',
                transition: 'background 0.1s',
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
