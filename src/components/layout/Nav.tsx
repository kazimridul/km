import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { profile } from '../../data/profile'
import { sectionIds, sections } from '../../data/sections'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { ThemeToggle } from './ThemeToggle'

export function Nav() {
  const active = useActiveSection(sectionIds as unknown as string[])
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useLockBodyScroll(open)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Esc closes the mobile drawer.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:font-medium focus:text-ink-0"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-shadow ${
          scrolled ? 'glass border-b border-paper-3 dark:border-white/8' : ''
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="group flex items-center gap-2.5" aria-label={`${profile.name} — home`}>
            <span className="grid size-8 place-items-center rounded-lg bg-linear-to-br from-brand to-accent font-mono text-sm font-bold text-ink-0">
              K
            </span>
            <span className="hidden text-sm font-semibold text-slate-900 sm:block dark:text-white">
              {profile.name}
            </span>
          </a>

          <div className="flex items-center gap-1.5">
            <ul className="mr-2 hidden items-center gap-1 md:flex">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? 'true' : undefined}
                    className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active === s.id
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {s.label}
                    {active === s.id && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-linear-to-r from-brand to-accent"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>

            <ThemeToggle />

            <a
              href={profile.resumePath}
              download
              className="ml-1 hidden rounded-lg bg-linear-to-r from-brand to-accent px-4 py-2 text-sm font-semibold text-ink-0 transition-opacity hover:opacity-90 sm:block"
            >
              Resume
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="grid size-9 place-items-center rounded-lg border border-paper-3 text-slate-600 md:hidden dark:border-white/10 dark:text-slate-300"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink-0/60 backdrop-blur-sm"
            />
            <motion.ul
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute inset-x-4 top-20 space-y-1 rounded-2xl border border-paper-3 bg-paper-1 p-3 shadow-2xl dark:border-white/10 dark:bg-ink-1"
            >
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                      active === s.id
                        ? 'bg-paper-2 text-slate-900 dark:bg-white/6 dark:text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="font-mono text-xs text-brand">{s.index}</span>
                    {s.label}
                  </a>
                </li>
              ))}
              <li className="pt-1">
                <a
                  href={profile.resumePath}
                  download
                  onClick={() => setOpen(false)}
                  className="block rounded-xl bg-linear-to-r from-brand to-accent px-4 py-3 text-center text-base font-semibold text-ink-0"
                >
                  Download Resume
                </a>
              </li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
