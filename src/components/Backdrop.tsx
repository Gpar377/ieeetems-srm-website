import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../lib/motion'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * Fixed WebGL layer behind the whole page. Reads scroll position each frame and
 * tells the gear how far to scatter (hero → middle) and when to reassemble (Join).
 */
export function Backdrop() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let raf = 0
    let field: import('../three/GearField').GearField | null = null
    let cancelled = false
    // Three.js loads after the page text, so the hero copy never waits on the 3D.
    import('../three/GearField').then(({ GearField, webglAvailable }) => {
      if (cancelled) return
      if (!webglAvailable()) {
        setFallback(true)
        return
      }
      const small = window.innerWidth < 700 || navigator.hardwareConcurrency <= 4
      field = new GearField(canvas, { count: small ? 14000 : 34000, logoUrl: 'brand/tems.png', reducedMotion: reducedMotion() })
      field.init().catch(() => setFallback(true))
      update()
    })

    const update = () => {
      if (!field) return
      raf = requestAnimationFrame(update)
      const vh = window.innerHeight
      const y = window.scrollY
      const hero = document.getElementById('top')
      const join = document.getElementById('contact')
      const heroH = hero?.offsetHeight ?? vh
      const out = clamp01(y / (heroH * 0.9))
      const back = join ? clamp01((y + vh - join.offsetTop) / (vh * 0.9)) : 0
      const rm = reducedMotion()
      field.targets.scatter = rm ? 0 : out * (1 - back)
      field.targets.camZ = rm ? 6 : 6 - out * (1 - back) * 3.2
      // Dim while content sits on top; reduced motion just fades the gear.
      field.targets.dim = rm ? Math.max(0.25, 1 - out * 0.75) * (1 - back) + back * 0.6 : 1 - out * (1 - back) * 0.55 - back * 0.35
    }
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      field?.dispose()
    }
  }, [])

  return (
    <div className="backdrop" aria-hidden="true">
      {fallback ? <span className="backdrop__logo" style={{ WebkitMaskImage: 'url(brand/tems.png)', maskImage: 'url(brand/tems.png)' }} /> : <canvas ref={ref} />}
    </div>
  )
}
