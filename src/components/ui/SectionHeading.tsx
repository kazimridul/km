import { Reveal } from './Reveal'

type Props = {
  /** Monospace index shown above the title, e.g. "02". */
  index: string
  title: string
  subtitle?: string
}

export function SectionHeading({ index, title, subtitle }: Props) {
  return (
    <Reveal className="mb-12 md:mb-16">
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-semibold text-gradient">{index}</span>
        <span className="h-px w-10 bg-linear-to-r from-brand/60 to-transparent" />
      </div>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </Reveal>
  )
}
