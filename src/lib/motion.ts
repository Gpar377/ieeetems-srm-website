import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis: Lenis | null = null

/** Weighted smooth scroll on desktop, wired into GSAP so scroll scenes stay in sync. */
export function startSmoothScroll() {
  if (reducedMotion() || lenis) return
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.4 })
  else el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
}

/** Turns every in-page #link into a smooth scroll. */
export function handleAnchorClick(e: MouseEvent) {
  const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
  if (!a) return
  const id = a.getAttribute('href')!.slice(1)
  if (!id || !document.getElementById(id)) return
  e.preventDefault()
  scrollToId(id)
  history.replaceState(null, '', `#${id}`)
}

export { gsap, ScrollTrigger }
