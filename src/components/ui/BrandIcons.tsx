/**
 * Brand marks that react-icons v5 doesn't ship.
 * Simple Icons dropped the AWS/Azure/dbt/OpenAI glyphs from the `si` set over
 * trademark policy, so AWS and Azure come from other sets (see skills.ts) and
 * the rest are hand-drawn here at the same 24x24 viewBox react-icons uses.
 */

type Props = { className?: string }

/** dbt's hexagonal mark with the slash cut out of the middle. */
export function DbtIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .84 2.7 6.21v10.74L12 22.32l9.3-5.37V6.21L12 .84Zm0 2.08 7.5 4.33v8.66L12 20.24l-7.5-4.33V7.25L12 2.92Z" />
      <path d="M15.53 7.4a1.2 1.2 0 0 1 .35 1.68l-.9 1.39a2.4 2.4 0 0 0 0 2.62l.9 1.39a1.2 1.2 0 0 1-2.01 1.3l-.9-1.38a2.4 2.4 0 0 0-2.27-1.1 2.4 2.4 0 0 1-2.4-1.2 2.4 2.4 0 0 1 .13-2.6l.9-1.39a1.2 1.2 0 0 1 2.01 1.3l-.51.79 3.04 1.75.52-.8.05-.07a1.2 1.2 0 0 1 1.09-1.68Z" />
    </svg>
  )
}

/** OpenAI's interlocking-knot mark, simplified to a single stroke. */
export function OpenAiIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.2a3.1 3.1 0 0 1 5.32 1.1 3.1 3.1 0 0 1 2.2 4.6 3.1 3.1 0 0 1 0 3.9 3.1 3.1 0 0 1-2.2 4.6A3.1 3.1 0 0 1 12 20.8a3.1 3.1 0 0 1-5.32-1.4 3.1 3.1 0 0 1-2.2-4.6 3.1 3.1 0 0 1 0-3.9 3.1 3.1 0 0 1 2.2-4.6A3.1 3.1 0 0 1 12 3.2Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.6 15.8 9.8v4.4L12 16.4l-3.8-2.2V9.8L12 7.6Z" />
    </svg>
  )
}

/** Generic "warehouse/table" glyph for SQL-ish skills with no vendor logo. */
export function SqlIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <ellipse cx="12" cy="5.6" rx="7.4" ry="3.1" />
      <path d="M19.4 9.1c0 1.7-3.31 3.1-7.4 3.1s-7.4-1.4-7.4-3.1v3.4c0 1.71 3.31 3.1 7.4 3.1s7.4-1.39 7.4-3.1V9.1Z" />
      <path d="M19.4 15c0 1.71-3.31 3.1-7.4 3.1s-7.4-1.39-7.4-3.1v3.4c0 1.71 3.31 3.1 7.4 3.1s7.4-1.39 7.4-3.1V15Z" />
    </svg>
  )
}
