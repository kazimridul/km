import { Download, Mail, MapPin, Phone } from 'lucide-react'
import { profile } from '../../data/profile'
import { fallbackSocialIcon, socialIcons } from '../../data/socialIcons'
import type { IconLike } from '../../data/types'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

type Card = { icon: IconLike; label: string; value: string; href: string; external?: boolean }

export function Contact() {
  const cards: Card[] = [
    { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { icon: Phone, label: 'Phone', value: profile.phone, href: `tel:${profile.phoneHref}` },
    // Only socials with a URL make it onto the page.
    ...profile.socials
      .filter((s) => s.url)
      .map((s) => ({
        icon: socialIcons[s.label] ?? fallbackSocialIcon,
        label: s.label,
        value: s.handle || s.url.replace(/^https?:\/\/(www\.)?/, ''),
        href: s.url,
        external: true,
      })),
  ]

  return (
    <section
      id="contact"
      className="scroll-mt-24 border-t border-paper-3 bg-paper-2/40 py-20 md:py-28 dark:border-white/6 dark:bg-ink-1/40"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          index="06"
          title="Get in touch"
          subtitle="Open to data engineering and backend roles. The quickest way to reach me is email."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.07}>
              <a
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                className="surface group flex items-center gap-4 p-6 transition-all hover:-translate-y-0.5 hover:border-brand/40"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-ink-0">
                  <c.icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium tracking-wider text-slate-400 uppercase dark:text-slate-500">
                    {c.label}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-sm font-medium text-slate-900 dark:text-white">
                    {c.value}
                  </span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="surface mt-8 flex flex-col items-center gap-5 p-8 text-center sm:p-10">
            <MapPin className="size-5 text-slate-400" />
            <p className="max-w-lg text-lg leading-relaxed font-medium text-slate-700 sm:text-xl dark:text-slate-200">
              Based in {profile.location}, working with teams across time zones.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-brand to-accent px-5 py-3 text-sm font-semibold text-ink-0 shadow-lg shadow-brand/20 transition-transform hover:-translate-y-0.5"
              >
                <Mail className="size-4" />
                Email me
              </a>
              <a
                href={profile.resumePath}
                download
                className="inline-flex items-center gap-2 rounded-xl border border-paper-3 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand/50 hover:text-brand dark:border-white/12 dark:text-slate-200"
              >
                <Download className="size-4" />
                Download Resume
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
