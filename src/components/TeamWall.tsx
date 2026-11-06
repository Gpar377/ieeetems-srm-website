import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { advisors, board, type Member } from '../data/team'
import { reducedMotion } from '../lib/motion'

type Item = { kind: 'member'; m: Member } | { kind: 'sticker'; text: string; tone: 'blue' | 'marker' | 'line' }

const stickers: Item[] = [
  { kind: 'sticker', text: 'Pitch Perfect', tone: 'marker' },
  { kind: 'sticker', text: '100+ members', tone: 'blue' },
  { kind: 'sticker', text: 'Kattankulathur', tone: 'line' },
  { kind: 'sticker', text: 'Validate first', tone: 'line' },
]

/**
 * The board as a pile of photo cards you can grab and throw.
 * Bodies are simulated by Matter.js and drawn as real DOM elements, so names stay
 * selectable text and touch on the background still scrolls the page.
 */
function Wall({ items }: { items: Item[] }) {
  const box = useRef<HTMLDivElement>(null)
  const els = useRef<(HTMLElement | null)[]>([])
  const api = useRef<{ shake: () => void } | null>(null)

  useEffect(() => {
    const container = box.current
    if (!container) return
    const { Engine, Bodies, Body, Composite, Constraint, Query, Runner } = Matter
    const engine = Engine.create({ gravity: { x: 0, y: 1.1 } })
    const runner = Runner.create()
    let W = container.clientWidth
    let H = container.clientHeight
    const T = 200

    const walls = [
      Bodies.rectangle(W / 2, H + T / 2, W * 3, T, { isStatic: true }),
      Bodies.rectangle(-T / 2, H / 2, T, H * 4, { isStatic: true }),
      Bodies.rectangle(W + T / 2, H / 2, T, H * 4, { isStatic: true }),
      Bodies.rectangle(W / 2, -H * 1.5, W * 3, T, { isStatic: true }),
    ]
    Composite.add(engine.world, walls)

    const bodies = items.map((_, i) => {
      const el = els.current[i]!
      const w = el.offsetWidth
      const h = el.offsetHeight
      const b = Bodies.rectangle(40 + Math.random() * (W - 80), -h - i * 70 - Math.random() * 200, w, h, {
        chamfer: { radius: 10 },
        restitution: 0.25,
        friction: 0.4,
        frictionAir: 0.012,
        angle: (Math.random() - 0.5) * 0.9,
      })
      ;(b as Matter.Body & { _w: number; _h: number })._w = w
      ;(b as Matter.Body & { _w: number; _h: number })._h = h
      return b
    })

    let started = false
    const begin = () => {
      if (started) return
      started = true
      if (reducedMotion()) {
        // No falling: lay the pile out already settled.
        bodies.forEach((b, i) => Body.setPosition(b, { x: 60 + ((i * 137) % Math.max(1, W - 120)), y: H - 90 - (i % 3) * 40 }))
      }
      Composite.add(engine.world, bodies)
      Runner.run(runner, engine)
    }

    const io = new IntersectionObserver((e) => e[0].isIntersecting && begin(), { threshold: 0.25 })
    io.observe(container)

    let raf = 0
    const draw = () => {
      raf = requestAnimationFrame(draw)
      bodies.forEach((b, i) => {
        const el = els.current[i]
        if (!el) return
        const bb = b as Matter.Body & { _w: number; _h: number }
        el.style.transform = `translate(${b.position.x - bb._w / 2}px, ${b.position.y - bb._h / 2}px) rotate(${b.angle}rad)`
      })
    }
    draw()

    // Dragging: a spring from the pointer to the grabbed body.
    let drag: Matter.Constraint | null = null
    const local = (e: PointerEvent) => {
      const r = container.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('a,button')) return
      const p = local(e)
      const hit = Query.point(bodies, p)[0]
      if (!hit) return
      e.preventDefault()
      container.setPointerCapture(e.pointerId)
      drag = Constraint.create({
        pointA: p,
        bodyB: hit,
        pointB: { x: p.x - hit.position.x, y: p.y - hit.position.y },
        stiffness: 0.18,
        damping: 0.05,
        length: 0,
      })
      Composite.add(engine.world, drag)
      container.classList.add('is-grabbing')
    }
    const move = (e: PointerEvent) => {
      if (drag) drag.pointA = local(e)
    }
    const up = () => {
      if (drag) Composite.remove(engine.world, drag)
      drag = null
      container.classList.remove('is-grabbing')
    }
    container.addEventListener('pointerdown', down)
    container.addEventListener('pointermove', move)
    container.addEventListener('pointerup', up)
    container.addEventListener('pointercancel', up)

    const onResize = () => {
      const nW = container.clientWidth
      const nH = container.clientHeight
      Body.setPosition(walls[0], { x: nW / 2, y: nH + T / 2 })
      Body.setPosition(walls[2], { x: nW + T / 2, y: nH / 2 })
      bodies.forEach((b) => {
        if (b.position.x > nW - 20) Body.setPosition(b, { x: nW - 60, y: b.position.y })
      })
      W = nW
      H = nH
    }
    window.addEventListener('resize', onResize)

    api.current = {
      shake: () => {
        begin()
        bodies.forEach((b) =>
          Body.setVelocity(b, { x: (Math.random() - 0.5) * 30, y: -10 - Math.random() * 22 }),
        )
      },
    }

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      Runner.stop(runner)
      Engine.clear(engine)
      window.removeEventListener('resize', onResize)
      container.removeEventListener('pointerdown', down)
      container.removeEventListener('pointermove', move)
      container.removeEventListener('pointerup', up)
      container.removeEventListener('pointercancel', up)
    }
  }, [items])

  return (
    <>
      <div className="wall" ref={box} aria-hidden="true">
        {items.map((it, i) =>
          it.kind === 'member' ? (
            <div className="polaroid" key={it.m.name} ref={(el) => { els.current[i] = el }}>
              <img src={it.m.photo} alt="" draggable={false} width="560" height="700" />
              <span className="polaroid__name">{it.m.name}</span>
              <span className="polaroid__role">{it.m.role}</span>
            </div>
          ) : (
            <div className={`sticker sticker--${it.tone}`} key={it.text} ref={(el) => { els.current[i] = el }}>
              {it.text}
            </div>
          ),
        )}
      </div>
      <button className="pill pill--ghost wall__shake" onClick={() => api.current?.shake()}>Shake the pile</button>
    </>
  )
}

export function TeamWall() {
  const [view, setView] = useState<'pile' | 'list'>(() => (typeof window !== 'undefined' && reducedMotion() ? 'list' : 'pile'))
  const [items] = useState<Item[]>(() => {
    const all: Item[] = [...board.map((m) => ({ kind: 'member', m }) as Item), ...stickers]
    return all
  })

  return (
    <section id="team" className="team" aria-labelledby="team-h">
      <div className="team__head">
        <h2 id="team-h" className="display">The board</h2>
        <p className="lede">Thirteen people running the chapter in 2026. Grab one and throw them around, they're used to it.</p>
        <div className="seg" role="group" aria-label="Team view">
          <button aria-pressed={view === 'pile'} onClick={() => setView('pile')}>Pile</button>
          <button aria-pressed={view === 'list'} onClick={() => setView('list')}>List</button>
        </div>
      </div>

      {view === 'pile' ? (
        <div className="wall-wrap">
          <Wall items={items} />
          {/* Same people, readable by screen readers and keyboard. */}
          <ul className="visually-hidden">
            {board.map((m) => (
              <li key={m.name}>{m.linkedin ? <a href={m.linkedin}>{m.name}, {m.role}</a> : `${m.name}, ${m.role}`}</li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="grid-team">
          {board.map((m) => (
            <li key={m.name}>
              <a href={m.linkedin ?? undefined} target="_blank" rel="noopener noreferrer" className="gt">
                <img src={m.photo} alt="" loading="lazy" width="560" height="700" />
                <span className="gt__name">{m.name}</span>
                <span className="gt__role">{m.role}</span>
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="advisor">
        {advisors.map((a) => (
          <a key={a.name} href={a.linkedin} target="_blank" rel="noopener noreferrer" className="advisor__card">
            <img src={a.photo} alt="" loading="lazy" width="560" height="700" />
            <span>
              <span className="advisor__role">{a.role}</span>
              <span className="advisor__name">{a.name}</span>
              <span className="advisor__note">Helped found IEEE TEMS SRM and still guides the board on strategy.</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
