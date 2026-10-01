import { useCallback, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

/**
 * Reads the theme the inline script in index.html already resolved, so the
 * class on <html> stays the single source of truth and we never flash.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // Storage can be blocked (private mode); the class is still applied.
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return { theme, toggle }
}
