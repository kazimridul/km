import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`grid size-9 place-items-center rounded-lg border border-paper-3 bg-paper-1 text-slate-600 transition-colors hover:text-brand dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-brand ${className}`}
    >
      {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </button>
  )
}
