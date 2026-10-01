import { ArrowUp } from 'lucide-react'
import { profile } from '../../data/profile'

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="flex flex-col items-center justify-between gap-4 border-t border-paper-3 pt-8 sm:flex-row dark:border-white/8">
        <p className="text-center font-mono text-xs text-slate-400 sm:text-left dark:text-slate-500">
          © {new Date().getFullYear()} {profile.name} · Built with React, Tailwind CSS &amp; Vite · Deployed on Netlify
        </p>
        <a
          href="#top"
          className="inline-flex items-center gap-2 rounded-lg border border-paper-3 px-3 py-2 font-mono text-xs text-slate-500 transition-colors hover:border-brand/50 hover:text-brand dark:border-white/10 dark:text-slate-400"
        >
          Back to top
          <ArrowUp className="size-3.5" />
        </a>
      </div>
    </footer>
  )
}
