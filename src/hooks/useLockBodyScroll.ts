import { useEffect } from 'react'

/**
 * Freezes background scrolling while a modal/drawer is open. Pads for the
 * scrollbar width so the page doesn't jump sideways as it disappears.
 */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const { overflow, paddingRight } = document.body.style
    const gap = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (gap > 0) document.body.style.paddingRight = `${gap}px`

    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [locked])
}
