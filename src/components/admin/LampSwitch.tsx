'use client'

import { useCallback, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/* Geometry — every offset below is derived from these, so the wire,
   shade, cord and knob can't drift apart when any one is retuned.
   Deliberately compact: the lamp shares a viewport with the login card
   directly beneath it, so height here is height the form loses. */
const CANOPY_H = 6
const WIRE_H   = 64
const SHADE_W  = 106
const SHADE_H  = 44
const CORD_LEN = 68
const KNOB_H   = 20

const SHADE_TOP    = CANOPY_H + WIRE_H
const SHADE_BOTTOM = SHADE_TOP + SHADE_H
const CORD_TOP     = SHADE_BOTTOM - 8
const KNOB_TOP     = CORD_TOP + CORD_LEN
const TOTAL_H      = KNOB_TOP + KNOB_H + 6

const MAX_PULL = 68
const TRIGGER  = 36
/* Below this a press counts as a tap rather than a pull, so clicking
   works as well as dragging — this gates the only way into the admin,
   so it must never depend on a gesture landing correctly. */
const TAP_SLOP = 5

/* Dust in the beam. Hardcoded rather than randomised because this
   renders on the server first — Math.random() here would produce
   different values on client and server and trip a hydration mismatch.
   x is px from centre, y is px from the top of the lamp. */
const MOTES = [
  { x: -14, y: 150, s: 2.0, delay: 0.0, dur: 7.4 },
  { x:  22, y: 186, s: 1.5, delay: 1.9, dur: 8.6 },
  { x: -34, y: 224, s: 2.4, delay: 0.7, dur: 6.8 },
  { x:  11, y: 262, s: 1.7, delay: 3.1, dur: 9.2 },
  { x:  44, y: 246, s: 1.3, delay: 2.4, dur: 7.9 },
  { x: -52, y: 300, s: 2.1, delay: 4.2, dur: 8.1 },
  { x:  31, y: 338, s: 1.6, delay: 1.2, dur: 9.7 },
  { x: -24, y: 372, s: 2.3, delay: 5.0, dur: 7.2 },
  { x:  62, y: 356, s: 1.4, delay: 3.6, dur: 8.9 },
  { x: -68, y: 410, s: 1.9, delay: 2.0, dur: 9.4 },
  { x:  48, y: 442, s: 2.2, delay: 4.7, dur: 7.6 },
  { x: -12, y: 470, s: 1.5, delay: 0.4, dur: 8.3 },
]

export default function LampSwitch({
  on,
  onToggle,
  reduced = false,
}: {
  on: boolean
  onToggle: () => void
  reduced?: boolean
}) {
  const swayRef  = useRef<HTMLDivElement>(null)
  const knobRef  = useRef<HTMLButtonElement>(null)
  const cordRef  = useRef<HTMLDivElement>(null)
  const haloRef  = useRef<HTMLDivElement>(null)
  const coneRef  = useRef<HTMLDivElement>(null)
  const bulbRef  = useRef<HTMLDivElement>(null)
  const shadeRef = useRef<HTMLDivElement>(null)
  const lipRef   = useRef<HTMLDivElement>(null)
  const moteRef  = useRef<HTMLDivElement>(null)

  const dragging = useRef(false)
  const startY   = useRef(0)
  const pulled   = useRef(0)
  const idleRef  = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    if (knobRef.current) gsap.set(knobRef.current, { xPercent: -50, y: 0 })
  }, [])

  /* A barely-there drift so the lamp reads as a hanging object rather
     than a decal. Restarted after every pull settles, killed the moment
     a new drag begins so the two never fight over `rotation`. */
  const startIdleSway = useCallback(() => {
    if (reduced || !swayRef.current) return
    idleRef.current?.kill()
    idleRef.current = gsap.to(swayRef.current, {
      rotation: 0.55, duration: 3.4, yoyo: true, repeat: -1, ease: 'sine.inOut',
    })
  }, [reduced])

  useEffect(() => {
    startIdleSway()
    return () => { idleRef.current?.kill() }
  }, [startIdleSway])

  const setPull = useCallback((y: number) => {
    pulled.current = y
    if (knobRef.current) gsap.set(knobRef.current, { y })
    /* transformOrigin is the cord's top, so scaling reads as the cord
       stretching downward rather than growing from its middle. */
    if (cordRef.current) gsap.set(cordRef.current, { scaleY: 1 + y / CORD_LEN })
    /* The cord hangs right of centre, so pulling it tips the whole
       fixture clockwise about the ceiling mount — the reason the sway
       exists at all rather than being decoration. */
    if (swayRef.current && !reduced) gsap.set(swayRef.current, { rotation: (y / MAX_PULL) * 3.6 })
  }, [reduced])

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragging.current = true
    startY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
    idleRef.current?.kill()
    gsap.killTweensOf([knobRef.current, cordRef.current, swayRef.current])
  }

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return
    const raw = Math.max(0, e.clientY - startY.current)
    /* Exponential ease-out rather than a hard clamp: gives easily at
       first then stiffens, so it feels elastic instead of hitting an
       invisible wall at MAX_PULL. */
    setPull(MAX_PULL * (1 - Math.exp(-raw / MAX_PULL)))
  }

  const endDrag = () => {
    if (!dragging.current) return
    dragging.current = false
    const travelled = pulled.current
    pulled.current = 0

    const ease = 'elastic.out(1, 0.42)'
    if (knobRef.current) gsap.to(knobRef.current, { y: 0, duration: 0.95, ease })
    if (cordRef.current) gsap.to(cordRef.current, { scaleY: 1, duration: 0.95, ease })
    /* Longer and looser than the cord's recoil — a hanging fixture has
       far more inertia than the string you tugged, so it keeps swinging
       after the cord has already settled. */
    if (swayRef.current && !reduced) {
      gsap.to(swayRef.current, {
        rotation: 0, duration: 1.9, ease: 'elastic.out(1, 0.22)',
        onComplete: startIdleSway,
      })
    }

    /* A tap counts, a committed pull counts, a half-hearted pull
       deliberately doesn't — the cord snapping back with the light still
       off is the feedback that you didn't pull far enough. */
    if (travelled < TAP_SLOP || travelled >= TRIGGER) onToggle()
  }

  /* Keyboard activation only. A pointer click also lands here but with
     detail >= 1, and endDrag already handled that one — without this
     check every tap would toggle twice and cancel itself out. */
  const onClick = (e: React.MouseEvent) => {
    if (e.detail === 0) onToggle()
  }

  /* Light on/off. Purely presentational, so under reduced-motion the same
     end states are applied at duration 0 — the lamp still visibly turns
     on, it just doesn't flicker or ramp. */
  useEffect(() => {
    const d = (v: number) => (reduced ? 0 : v)
    const lit = [haloRef.current, coneRef.current, bulbRef.current, shadeRef.current, lipRef.current, moteRef.current]
    gsap.killTweensOf(lit)

    if (on) {
      if (reduced) {
        gsap.set([bulbRef.current, shadeRef.current, lipRef.current, coneRef.current, moteRef.current], { opacity: 1 })
        gsap.set(haloRef.current, { opacity: 1 })
        return
      }
      /* Two stutters before it holds — a filament catching, which is what
         sells it as a switch rather than a fade. */
      gsap.timeline()
        .to(haloRef.current, { opacity: 0.5,  duration: 0.06 })
        .to(haloRef.current, { opacity: 0.1,  duration: 0.05 })
        .to(haloRef.current, { opacity: 0.85, duration: 0.05 })
        .to(haloRef.current, { opacity: 0.22, duration: 0.06 })
        .to(haloRef.current, { opacity: 1,    duration: 0.45, ease: 'power2.out' })

      gsap.to([bulbRef.current, lipRef.current], { opacity: 1, duration: d(0.42), delay: d(0.16), ease: 'power2.out' })
      gsap.to(shadeRef.current, { opacity: 1, duration: d(0.55), delay: d(0.16), ease: 'power2.out' })
      gsap.to(coneRef.current,  { opacity: 1, duration: d(0.8),  delay: d(0.2),  ease: 'power2.out' })
      gsap.to(moteRef.current,  { opacity: 1, duration: d(1.4),  delay: d(0.5),  ease: 'power1.out' })
    } else {
      gsap.to(lit, { opacity: 0, duration: d(0.32), ease: 'power2.in' })
    }
  }, [on, reduced])

  /* Motes drift upward on the convection off a warm bulb. Started once
     and left running — they're inside a wrapper whose opacity is what
     actually gates visibility, so there's no need to stop and restart
     them every time the lamp toggles. */
  useEffect(() => {
    if (reduced || !moteRef.current) return
    const dots = Array.from(moteRef.current.children) as HTMLElement[]
    const tweens = dots.map((dot, i) => {
      const m = MOTES[i]
      return gsap.to(dot, {
        y: -46, opacity: 0.42, duration: m.dur, delay: m.delay,
        repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
    })
    return () => { tweens.forEach(t => t.kill()) }
  }, [reduced])

  return (
    <div style={{ position: 'relative', width: SHADE_W, height: TOTAL_H, flexShrink: 0 }}>
      {/* Everything hangs off this, rotated about the ceiling mount, so
          the shade, bulb, cord and the light itself all swing together
          as one fixture rather than sliding independently. */}
      <div ref={swayRef} style={{ position: 'absolute', inset: 0, transformOrigin: 'top center' }}>

        {/* Light cone — behind everything so the card below is lit from
            behind rather than washed over. */}
        <div
          ref={coneRef}
          aria-hidden
          style={{
            position: 'absolute', top: SHADE_BOTTOM - 4, left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(150vw, 820px)', height: '96vh',
            clipPath: 'polygon(45.5% 0, 54.5% 0, 100% 100%, 0% 100%)',
            /* Fades out by ~56% rather than running the full height: the
               card sits directly in the beam now, and a longer tail kept
               the light visibly streaming past its bottom edge to the
               foot of the page, which pulled the eye away from the form. */
            background:
              'linear-gradient(to bottom, rgba(255,186,104,0.32), rgba(255,186,104,0.08) 30%, rgba(255,186,104,0) 56%)',
            filter: 'blur(24px)', opacity: 0, pointerEvents: 'none', zIndex: 0,
          }}
        />

        {/* Dust in the beam */}
        <div
          ref={moteRef}
          aria-hidden
          style={{ position: 'absolute', top: 0, left: '50%', width: 0, height: 0, opacity: 0, pointerEvents: 'none', zIndex: 1 }}
        >
          {MOTES.map((m, i) => (
            <span
              key={i}
              style={{
                position: 'absolute', left: m.x, top: m.y,
                width: m.s, height: m.s, borderRadius: '50%',
                background: 'rgba(255,214,150,0.85)',
                filter: 'blur(0.4px)', opacity: 0.12,
              }}
            />
          ))}
        </div>

        {/* Bulb halo */}
        <div
          ref={haloRef}
          aria-hidden
          style={{
            position: 'absolute', top: SHADE_BOTTOM - 130, left: '50%',
            transform: 'translateX(-50%)',
            width: 264, height: 264, borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(255,196,120,0.52) 0%, rgba(255,196,120,0.14) 40%, rgba(255,196,120,0) 68%)',
            filter: 'blur(8px)', opacity: 0, pointerEvents: 'none', zIndex: 2,
          }}
        />

        {/* Ceiling mount */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 26, height: CANOPY_H, borderRadius: '0 0 4px 4px',
            background: 'linear-gradient(rgba(255,255,255,0.20), rgba(255,255,255,0.09))',
            zIndex: 5,
          }}
        />

        {/* Wire */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: CANOPY_H, left: '50%', transform: 'translateX(-50%)',
            width: 1.5, height: WIRE_H,
            background: 'linear-gradient(rgba(255,255,255,0.24), rgba(255,255,255,0.13))',
            zIndex: 4,
          }}
        />

        {/* Shade — unlit base. A separate lit overlay fades in on top
            rather than tweening this one's gradient, since GSAP can
            interpolate opacity cleanly but not background-image. */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: SHADE_TOP, left: 0,
            width: SHADE_W, height: SHADE_H,
            clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0% 100%)',
            background: 'linear-gradient(160deg, rgba(255,255,255,0.13), rgba(255,255,255,0.05) 55%, rgba(255,255,255,0.09))',
            zIndex: 5,
          }}
        />
        {/* Shade — lit overlay: hot along the inner lower edge where the
            bulb actually sits, cooler up top. */}
        <div
          ref={shadeRef}
          aria-hidden
          style={{
            position: 'absolute', top: SHADE_TOP, left: 0,
            width: SHADE_W, height: SHADE_H,
            clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0% 100%)',
            background:
              'linear-gradient(to bottom, rgba(255,186,104,0.10) 0%, rgba(255,201,133,0.30) 62%, rgba(255,224,178,0.62) 100%)',
            opacity: 0, zIndex: 6,
          }}
        />

        {/* Lit rim along the shade's open bottom edge */}
        <div
          ref={lipRef}
          aria-hidden
          style={{
            position: 'absolute', top: SHADE_BOTTOM - 2, left: 0,
            width: SHADE_W, height: 3, borderRadius: '50%',
            background: 'rgba(255,226,180,0.9)',
            filter: 'blur(1.5px)', opacity: 0, zIndex: 7,
          }}
        />

        {/* Bulb — dim glass always present, hot core fades in over it */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: SHADE_BOTTOM - 7, left: '50%',
            transform: 'translateX(-50%)',
            width: 16, height: 16, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', zIndex: 4,
          }}
        />
        <div
          ref={bulbRef}
          aria-hidden
          style={{
            position: 'absolute', top: SHADE_BOTTOM - 7, left: '50%',
            transform: 'translateX(-50%)',
            width: 16, height: 16, borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 38%, #fffaf0 0%, #ffd79a 45%, #ffb757 100%)',
            boxShadow: '0 0 20px 6px rgba(255,190,110,0.75)',
            opacity: 0, zIndex: 4,
          }}
        />

        {/* Pull cord */}
        <div
          ref={cordRef}
          aria-hidden
          style={{
            position: 'absolute', top: CORD_TOP, left: '50%', marginLeft: 27,
            width: 1.5, height: CORD_LEN, transformOrigin: 'top center',
            background: 'linear-gradient(rgba(255,255,255,0.28), rgba(255,255,255,0.15))',
            zIndex: 8,
          }}
        />

        {/* Knob — a real <button> so it focuses and responds to the
            keyboard; the drag is layered on top of that rather than
            replacing it. touchAction:'none' stops the browser claiming
            the vertical drag for page scrolling on touch. */}
        <button
          ref={knobRef}
          type="button"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={onClick}
          aria-pressed={on}
          aria-label={on ? 'Turn the lamp off' : 'Pull the cord to turn the lamp on'}
          style={{
            position: 'absolute', top: KNOB_TOP, left: `calc(50% + 27px)`,
            width: 13, height: KNOB_H, padding: 0,
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.24)',
            background: 'linear-gradient(rgba(255,255,255,0.24), rgba(255,255,255,0.11))',
            cursor: 'grab', touchAction: 'none', zIndex: 9,
          }}
        />
      </div>
    </div>
  )
}
