import { useState, useEffect } from 'react'

export function usePersistedState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Always start with defaultValue so server and first client render match exactly.
  // Restore the saved value only after mount, to avoid a hydration mismatch.
  const [state, setState] = useState<T>(defaultValue)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('nexova_' + key)
      if (saved !== null) setState(JSON.parse(saved))
    } catch {}
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    if (!hydrated) return
    try {
      sessionStorage.setItem('nexova_' + key, JSON.stringify(state))
    } catch {}
  }, [key, state, hydrated])

  return [state, setState]
}
