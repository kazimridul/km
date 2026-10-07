import { ArrowUp } from 'lucide-react'
import { profile } from '../../data/profile'

export function Footer() {
  return (
    <footer className="relative z-10 mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8">
      <div className="hairline" />
      <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-center font-mono text-[11px] tracking-wider text-slate-500 sm:text-left">
          © {new Date().getFullYear()} {profile.name} · Built with React, Three.js &amp; React Three Fiber
        </p>
        <a href="#top" className="btn-ghost !px-3.5 !py-2 !text-[10px]">
          Back to top
          <ArrowUp className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </footer>
  )
}
