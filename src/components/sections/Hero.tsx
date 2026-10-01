import { motion } from 'motion/react'
import { ArrowDown, Download, Mail } from 'lucide-react'
import avatar from '../../assets/profile.png'
import { profile, stats } from '../../data/profile'
import { fallbackSocialIcon, socialIcons } from '../../data/socialIcons'
import { PipelineGraph } from '../ui/PipelineGraph'

export function Hero() {
  // Socials with no URL yet are skipped entirely rather than rendered dead.
  const socials = profile.socials.filter((s) => s.url)

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 md:pb-24">
      {/* Backdrop: faint grid + two colour blooms */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 text-slate-900 grid-backdrop opacity-40 dark:text-white dark:opacity-100" />
        <div className="absolute -top-32 -left-24 size-96 rounded-full bg-brand/12 blur-3xl" />
        <div className="absolute top-20 -right-24 size-96 rounded-full bg-accent/12 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-paper-0 dark:to-ink-0" />
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          {/* Left — identity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-4">
              <img
                src={avatar}
                alt={profile.name}
                width={72}
                height={72}
                className="size-18 rounded-full ring-2 ring-brand/40 ring-offset-4 ring-offset-paper-0 dark:ring-offset-ink-0"
              />
              <div>
                <span className="chip border-brand/30! bg-brand/10! text-brand!">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-70" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
                  </span>
                  {profile.title}
                </span>
                <p className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">{profile.location}</p>
              </div>
            </div>

            <h1 className="mt-7 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Kazi Midul <span className="text-gradient">Hossen</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              {profile.tagline}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={profile.resumePath}
                download
                className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-brand to-accent px-5 py-3 text-sm font-semibold text-ink-0 shadow-lg shadow-brand/20 transition-transform hover:-translate-y-0.5"
              >
                <Download className="size-4" />
                Download Resume
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-xl border border-paper-3 bg-paper-1 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand/50 hover:text-brand dark:border-white/12 dark:bg-white/4 dark:text-slate-200"
              >
                Get in touch
              </a>

              <div className="flex items-center gap-1.5 sm:ml-2">
                <a
                  href={`mailto:${profile.email}`}
                  aria-label="Email"
                  title={profile.email}
                  className="grid size-10 place-items-center rounded-xl border border-paper-3 text-slate-500 transition-colors hover:border-brand/50 hover:text-brand dark:border-white/12 dark:text-slate-400"
                >
                  <Mail className="size-4.5" />
                </a>
                {socials.map((s) => {
                  const Icon = socialIcons[s.label] ?? fallbackSocialIcon
                  return (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={s.label}
                      className="grid size-10 place-items-center rounded-xl border border-paper-3 text-slate-500 transition-colors hover:border-brand/50 hover:text-brand dark:border-white/12 dark:text-slate-400"
                    >
                      <Icon className="size-4.5" />
                    </a>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Right — the pipeline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="surface relative p-5 shadow-xl shadow-slate-900/5 dark:shadow-black/40"
          >
            <div className="mb-3 flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-red-400/70" />
              <span className="size-2.5 rounded-full bg-amber-400/70" />
              <span className="size-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-2 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                daily_ingest.dag
              </span>
            </div>
            <PipelineGraph className="w-full" />
          </motion.div>
        </div>

        {/* Stat strip */}
        <motion.dl
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-paper-3 bg-paper-3 sm:grid-cols-4 dark:border-white/8 dark:bg-white/8"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-paper-1 px-5 py-6 text-center dark:bg-ink-1">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-mono text-3xl font-bold text-gradient">{s.value}</span>
                <span className="mt-1 block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  {s.label}
                </span>
              </dd>
            </div>
          ))}
        </motion.dl>

        <div className="mt-12 flex justify-center">
          <a
            href="#about"
            aria-label="Scroll to About"
            className="grid size-10 place-items-center rounded-full border border-paper-3 text-slate-400 transition-colors hover:border-brand/50 hover:text-brand dark:border-white/10"
          >
            <ArrowDown className="size-4 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  )
}
