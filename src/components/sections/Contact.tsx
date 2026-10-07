import { ArrowUpRight, Download, Mail, MapPin, Phone } from 'lucide-react'
import { type Channel, contactChannels } from '../../data/contact'
import { profile } from '../../data/profile'
import { fallbackSocialIcon, socialIcons } from '../../data/socialIcons'
import type { IconLike } from '../../data/types'
import { useUi } from '../../store/ui'
import { Reveal, SectionHeader } from '../ui/motion'

const ICONS: Record<string, IconLike> = { email: Mail, cv: Download, phone: Phone }

function iconFor(c: Channel) {
  return ICONS[c.id] ?? socialIcons[c.label] ?? fallbackSocialIcon
}

/** The communication console. Hovering a channel wakes the 3D node and streams packets toward it. */
export function Contact() {
  const channels = contactChannels()
  const hover = useUi((s) => s.contactHover)
  const set = useUi((s) => s.set)

  return (
    <section id="contact" className="relative flex min-h-[105svh] items-center py-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="scrim max-w-2xl lg:max-w-[48%]">
          <SectionHeader index="07" label="Contact" stage="Let's build something" title="Let's build something together." />
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-400">
              Open to data engineering, backend engineering, cloud and data-driven projects.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div data-block-3d className="glass glass-blur mt-8 overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3 font-mono text-[10px] tracking-[0.2em] uppercase">
                <span className="text-slate-500">comm://kmh · connection terminal</span>
                <span className="flex items-center gap-2 text-brand/80">
                  <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
                  Channels open
                </span>
              </div>

              <ul className="divide-y divide-white/[0.05]">
                {channels.map((c) => {
                  const Icon = iconFor(c)
                  const on = hover === c.id
                  return (
                    <li key={c.id}>
                      <a
                        href={c.href}
                        {...(c.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                        {...(c.download ? { download: '' } : {})}
                        onPointerEnter={() => set({ contactHover: c.id })}
                        onPointerLeave={() => set({ contactHover: null })}
                        onFocus={() => set({ contactHover: c.id })}
                        onBlur={() => set({ contactHover: null })}
                        className={`group grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 transition-colors ${
                          on ? 'bg-brand/[0.06]' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <span
                          className={`grid size-9 place-items-center rounded-lg border transition-colors ${
                            on ? 'border-brand/50 bg-brand/15 text-brand' : 'border-white/10 text-slate-400'
                          }`}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-mono text-[10px] tracking-[0.2em] text-slate-500 uppercase">
                            <span className="text-brand/60" aria-hidden="true">
                              &gt;{' '}
                            </span>
                            {c.label}
                          </span>
                          <span className="mt-0.5 block truncate font-mono text-sm text-slate-100">{c.value}</span>
                        </span>
                        <span
                          className={`flex items-center gap-1 font-mono text-[10px] font-semibold tracking-[0.18em] uppercase transition-colors ${
                            on ? 'text-brand' : 'text-slate-600'
                          }`}
                        >
                          <span className="hidden sm:inline">{c.download ? 'Download' : 'Connect'}</span>
                          <ArrowUpRight className="size-3.5" aria-hidden="true" />
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>

              <div className="flex items-center gap-2 border-t border-white/[0.06] px-5 py-3 font-mono text-[11px] text-slate-500">
                <MapPin className="size-3.5" aria-hidden="true" />
                {profile.location}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
