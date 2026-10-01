import { useEffect, useState } from 'react'

/**
 * Scroll-spy for the nav. Tracks whichever observed section is nearest the top
 * of the viewport rather than "first intersecting", so scrolling up highlights
 * the right link instead of lagging a section behind.
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const pick = () => {
      // 5rem nav offset, then a little slack so a section counts as "current"
      // once its heading area reaches the top third of the screen.
      const line = window.innerHeight * 0.32
      let current = elements[0].id

      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) current = el.id
      }

      // Bottom of the page can never scroll the last section past the line.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        current = elements[elements.length - 1].id
      }

      setActive(current)
    }

    pick()
    window.addEventListener('scroll', pick, { passive: true })
    window.addEventListener('resize', pick)
    return () => {
      window.removeEventListener('scroll', pick)
      window.removeEventListener('resize', pick)
    }
  }, [ids])

  return active
}
