import { useReducedMotion } from 'motion/react'

/**
 * The hero's animated DAG: sources → Airflow → dbt → BigQuery, with packets
 * streaming along the edges.
 *
 * Motion is SMIL (`animateMotion`), which the `prefers-reduced-motion` CSS
 * block in index.css cannot stop — so the packets are removed from the DOM
 * entirely when reduced motion is set, leaving a legible static diagram.
 */

const SOURCES = [
  { label: 'REST APIs', cy: 50 },
  { label: 'PostgreSQL', cy: 165 },
  { label: 'CSV / PDF', cy: 280 },
]

const STAGES = [
  { label: 'Airflow', sub: 'orchestrate', cx: 250 },
  { label: 'dbt', sub: 'transform', cx: 420 },
  { label: 'BigQuery', sub: 'warehouse', cx: 580 },
]

const EDGES = [
  { id: 'e1', d: 'M134,50 C166,50 166,165 198,165', tone: 'brand' },
  { id: 'e2', d: 'M134,165 L198,165', tone: 'brand' },
  { id: 'e3', d: 'M134,280 C166,280 166,165 198,165', tone: 'brand' },
  { id: 'e4', d: 'M302,165 L368,165', tone: 'brand' },
  { id: 'e5', d: 'M472,165 L528,165', tone: 'accent' },
] as const

const FLOW_SECONDS = 2.4
/** Two packets per edge, half a cycle apart, so each edge reads as a stream. */
const PACKET_OFFSETS = [0, FLOW_SECONDS / 2]

export function PipelineGraph({ className }: { className?: string }) {
  const reduced = useReducedMotion()

  return (
    <svg
      viewBox="0 0 660 330"
      className={className}
      role="img"
      aria-label="Data pipeline diagram: REST APIs, PostgreSQL and CSV or PDF sources flow into Apache Airflow, then dbt, then BigQuery."
    >
      <defs>
        <linearGradient id="pg-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="pg-glow">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="420" cy="165" r="190" fill="url(#pg-glow)" />

      {/* Column captions */}
      <text x="75" y="14" className="fill-slate-400 dark:fill-slate-500" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" letterSpacing="1.5">
        SOURCES
      </text>

      {/* Edges */}
      <g fill="none" stroke="url(#pg-edge)" strokeWidth="1.75">
        {EDGES.map((e) => (
          <path key={e.id} id={e.id} d={e.d} />
        ))}
      </g>

      {/* Flowing packets */}
      {!reduced &&
        EDGES.flatMap((e) =>
          PACKET_OFFSETS.map((offset) => (
            <circle
              key={`${e.id}-${offset}`}
              r="3.5"
              className={e.tone === 'brand' ? 'fill-brand' : 'fill-accent'}
            >
              <animateMotion dur={`${FLOW_SECONDS}s`} begin={`${offset}s`} repeatCount="indefinite" rotate="auto">
                <mpath href={`#${e.id}`} />
              </animateMotion>
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.12;0.85;1"
                dur={`${FLOW_SECONDS}s`}
                begin={`${offset}s`}
                repeatCount="indefinite"
              />
            </circle>
          )),
        )}

      {/* Source nodes */}
      {SOURCES.map((s) => (
        <g key={s.label}>
          <rect
            x="16"
            y={s.cy - 20}
            width="118"
            height="40"
            rx="10"
            className="fill-white stroke-slate-200 dark:fill-ink-2 dark:stroke-white/10"
            strokeWidth="1"
          />
          <circle cx="36" cy={s.cy} r="3" className="fill-brand" />
          <text
            x="50"
            y={s.cy + 4}
            className="fill-slate-600 dark:fill-slate-300"
            fontSize="11.5"
            fontFamily="var(--font-mono)"
          >
            {s.label}
          </text>
        </g>
      ))}

      {/* Pipeline stages */}
      {STAGES.map((st, i) => (
        <g key={st.label}>
          <rect
            x={st.cx - 52}
            y="141"
            width="104"
            height="48"
            rx="12"
            className="fill-white stroke-slate-200 dark:fill-ink-2 dark:stroke-white/10"
            strokeWidth="1"
          />
          {/* Breathing highlight ring, staggered so the chain looks sequential. */}
          {!reduced && (
            <rect
              x={st.cx - 52}
              y="141"
              width="104"
              height="48"
              rx="12"
              fill="none"
              className={i === STAGES.length - 1 ? 'stroke-accent' : 'stroke-brand'}
              strokeWidth="1.25"
            >
              <animate
                attributeName="opacity"
                values="0;0.85;0"
                dur={`${FLOW_SECONDS}s`}
                begin={`${i * 0.45}s`}
                repeatCount="indefinite"
              />
            </rect>
          )}
          <text
            x={st.cx}
            y="162"
            textAnchor="middle"
            className="fill-slate-900 dark:fill-white"
            fontSize="14"
            fontWeight="600"
            fontFamily="var(--font-mono)"
          >
            {st.label}
          </text>
          <text
            x={st.cx}
            y="178"
            textAnchor="middle"
            className="fill-slate-400 dark:fill-slate-500"
            fontSize="9.5"
            fontFamily="var(--font-mono)"
            letterSpacing="1.2"
          >
            {st.sub.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  )
}
