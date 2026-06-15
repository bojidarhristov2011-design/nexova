import { useState, useEffect } from 'react'

export function usePersistedState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const saved = sessionStorage.getItem('nexova_' + key)
      return saved !== null ? JSON.parse(saved) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      sessionStorage.setItem('nexova_' + key, JSON.stringify(state))
    } catch {}
  }, [key, state])

  return [state, setState]
}
