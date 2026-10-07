import { AnimatePresence, motion } from 'motion/react'
import { Download, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { profile } from '../../data/profile'
import { sectionIds, sections } from '../../data/sections'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'

/** Floating frosted pill that tightens once you start scrolling. */
export function Nav() {
  const active = useActiveSection(sectionIds)
  const [open, setOpen] = useState(false)
  const [compact, setCompact] = useState(false)

  useLockBodyScroll(open)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:rounded-lg focus:bg-ice focus:px-4 focus:py-2 focus:font-medium focus:text-ink-0"
      >
        Skip to content
      </a>

      <header
        data-block-3d
        className={`fixed inset-x-0 z-50 flex justify-center px-3 transition-[top] duration-500 ease-out-expo sm:px-5 ${
          compact ? 'top-3' : 'top-5'
        }`}
      >
        <nav
          aria-label="Primary"
          className={`glass glass-blur flex w-full items-center justify-between rounded-2xl transition-all duration-500 ease-out-expo ${
            compact ? 'h-12 max-w-4xl px-2.5' : 'h-14 max-w-6xl px-3.5'
          }`}
        >
          <a href="#top" className="flex items-center gap-2.5 rounded-lg px-1.5 py-1" aria-label={`${profile.name} — home`}>
            <span
              className={`grid place-items-center rounded-lg border border-brand/30 bg-brand/[0.07] font-mono font-semibold tracking-wider text-ice transition-all duration-500 ${
                compact ? 'h-7 px-2 text-[10px]' : 'h-8 px-2.5 text-[11px]'
              }`}
            >
              {profile.initials}
            </span>
          </a>

          <ul className="hidden items-center gap-0.5 lg:flex">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? 'true' : undefined}
                  className={`relative rounded-lg px-3 py-2 font-mono text-[10.5px] font-medium tracking-[0.18em] uppercase transition-colors ${
                    active === s.id ? 'text-ice' : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {active === s.id && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/[0.06]"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span className="relative">{s.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <a
              href={profile.resumePath}
              download
              className={`hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] font-mono text-[10.5px] font-semibold tracking-[0.16em] text-ice uppercase transition-all duration-500 hover:border-brand/50 hover:bg-brand/10 sm:inline-flex ${
                compact ? 'h-8 px-3' : 'h-9 px-3.5'
              }`}
            >
              <Download className="size-3.5" aria-hidden="true" />
              Download CV
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="grid size-9 place-items-center rounded-lg border border-white/10 text-slate-200 lg:hidden"
            >
              {open ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            data-block-3d
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink-0/70 backdrop-blur-sm"
            />
            <motion.ul
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="glass absolute inset-x-3 top-20 space-y-0.5 rounded-2xl bg-ink-1/95 p-2.5"
            >
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-4 rounded-xl px-4 py-3.5 font-mono text-xs tracking-[0.18em] uppercase ${
                      active === s.id ? 'bg-white/[0.06] text-ice' : 'text-slate-300'
                    }`}
                  >
                    <span className="text-brand/70">{s.index}</span>
                    {s.label}
                  </a>
                </li>
              ))}
              <li className="pt-1.5">
                <a
                  href={profile.resumePath}
                  download
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full justify-center"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download CV
                </a>
              </li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
