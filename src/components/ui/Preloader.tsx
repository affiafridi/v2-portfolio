'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/* ─── Blob grid — 33 positions, covers full viewport + corners ────── */
const BLOBS = [
  { x: -2,  y: 5,   s: 0.24 }, { x: 17,  y: 3,   s: 0.21 },
  { x: 35,  y: 7,   s: 0.23 }, { x: 53,  y: 2,   s: 0.20 },
  { x: 71,  y: 6,   s: 0.22 }, { x: 89,  y: 4,   s: 0.21 },
  { x: 103, y: 8,   s: 0.24 },
  { x: 8,   y: 25,  s: 0.21 }, { x: 26,  y: 29,  s: 0.23 },
  { x: 44,  y: 24,  s: 0.20 }, { x: 62,  y: 30,  s: 0.22 },
  { x: 80,  y: 26,  s: 0.21 }, { x: 101, y: 28,  s: 0.23 },
  { x: -3,  y: 48,  s: 0.24 }, { x: 15,  y: 52,  s: 0.22 },
  { x: 34,  y: 46,  s: 0.21 }, { x: 51,  y: 51,  s: 0.25 },
  { x: 69,  y: 49,  s: 0.21 }, { x: 87,  y: 53,  s: 0.23 },
  { x: 104, y: 47,  s: 0.22 },
  { x: 6,   y: 70,  s: 0.22 }, { x: 23,  y: 74,  s: 0.20 },
  { x: 42,  y: 69,  s: 0.23 }, { x: 60,  y: 75,  s: 0.21 },
  { x: 78,  y: 71,  s: 0.22 }, { x: 99,  y: 73,  s: 0.23 },
  { x: -1,  y: 91,  s: 0.24 }, { x: 19,  y: 95,  s: 0.22 },
  { x: 39,  y: 90,  s: 0.21 }, { x: 58,  y: 96,  s: 0.22 },
  { x: 76,  y: 92,  s: 0.21 }, { x: 94,  y: 94,  s: 0.23 },
  { x: 107, y: 89,  s: 0.24 },
]

const BG = '#0a0a0a'

export default function Preloader() {
  const [mounted, setMounted]   = useState(true)
  const canvasRef               = useRef<HTMLCanvasElement>(null)
  const counterRef              = useRef<HTMLSpanElement>(null)
  /* one proxy per blob — GSAP tweens {p:0→1} with stagger */
  const proxies                 = useRef(BLOBS.map(() => ({ p: 0 })))
  const active                  = useRef(true)
  const raf                     = useRef(0)
  /* store DPR so draw loop reads it without recalculating */
  const dprRef                  = useRef(1)

  useEffect(() => {
    /* ── Strict Mode safety: reset on every mount ── */
    active.current = true
    proxies.current.forEach(px => { px.p = 0 })

    const canvas  = canvasRef.current
    const counter = counterRef.current
    if (!canvas || !counter) return

    const ctx = canvas.getContext('2d')!
    document.body.style.overflow = 'hidden'

    /* ── Size canvas — full resolution with DPR ── */
    const resize = () => {
      const dpr   = window.devicePixelRatio || 1
      dprRef.current = dpr
      const w     = window.innerWidth
      const h     = window.innerHeight
      canvas.width  = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width  = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    /* ── Draw loop ──────────────────────────────────────────────────
       Strategy: fill black each frame, then punch holes with radial
       gradient + destination-out. Full viewport resolution — no
       offscreen downscale, no getImageData, no pixelation.
       ─────────────────────────────────────────────────────────────── */
    const draw = () => {
      if (!active.current) return
      raf.current = requestAnimationFrame(draw)

      const W = window.innerWidth
      const H = window.innerHeight

      /* solid black background */
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, W, H)

      /* punch transparent holes via destination-out radial gradients */
      ctx.globalCompositeOperation = 'destination-out'

      for (let i = 0; i < proxies.current.length; i++) {
        const p = proxies.current[i].p
        if (p < 0.001) continue

        const b  = BLOBS[i]
        const cx = (b.x / 100) * W
        const cy = (b.y / 100) * H
        /* radius scales with both viewport width and progress */
        const r  = b.s * W * p

        /* soft-edged hole: opaque core → fully transparent edge */
        const grad = ctx.createRadialGradient(cx, cy, r * 0.45, cx, cy, r)
        grad.addColorStop(0,    'rgba(0,0,0,1)')
        grad.addColorStop(0.72, 'rgba(0,0,0,0.96)')
        grad.addColorStop(1,    'rgba(0,0,0,0)')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalCompositeOperation = 'source-over'
    }

    draw()

    /* ── Reveal page content — called right before burn phase ── */
    const revealPage = () => {
      const pc = document.getElementById('pc')
      if (pc) pc.style.visibility = ''
    }

    /* ── Cleanup helper — used in onComplete AND in cleanup fn ── */
    const teardown = () => {
      active.current = false
      cancelAnimationFrame(raf.current)
      document.body.style.overflow = ''
      document.documentElement.removeAttribute('data-loading')
      revealPage()   /* safety: ensure page is always unblocked */
    }

    /* ── GSAP timeline ─────────────────────────────────────────────
       ~2.2 s total so Hero entrance overlaps the burn phase.
       ──────────────────────────────────────────────────────────── */
    const tl = gsap.timeline({
      onComplete() {
        teardown()
        setMounted(false)
      },
    })

    const cProxy = { val: 0 }

    tl
      /* 1 — count 0 → 100 */
      .to(cProxy, {
        val: 100,
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate() { if (counter) counter.textContent = `${Math.round(cProxy.val)}%` },
      })
      /* 2 — counter out */
      .to(counter, { y: -32, opacity: 0, duration: 0.22, ease: 'power2.in' }, '-=0.05')
      /* 3 — reveal page content just before holes appear so Hero
              animations are mid-play when burn holes expose them */
      .call(revealPage)
      /* 4 — burn holes: all 33 blobs staggered randomly */
      .to(proxies.current, {
        p:        1,
        duration: 0.95,
        ease:     'expo.inOut',
        stagger:  { each: 0.012, from: 'random' },
      }, '+=0.06')
      /* 4 — fade canvas out (already mostly transparent by now) */
      .to(canvas, { opacity: 0, duration: 0.18, ease: 'none' }, '-=0.1')

    /* ── Safety valve: force-unmount if something blocks onComplete ── */
    const safety = window.setTimeout(() => {
      teardown()
      setMounted(false)
    }, 6000)

    return () => {
      teardown()
      window.removeEventListener('resize', resize)
      window.clearTimeout(safety)
      tl.kill()
    }
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* canvas — transparent pixels reveal the page beneath */}
      <canvas
        ref={canvasRef}
        style={{
          position:      'fixed',
          inset:         0,
          zIndex:        9999,
          display:       'block',
          pointerEvents: 'none',   /* CRITICAL: don't block mouse/touch */
        }}
      />

      {/* counter — above canvas, no compositing side-effects */}
      <div
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         10000,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          pointerEvents:  'none',
        }}
      >
        <span
          ref={counterRef}
          style={{
            fontFamily:    'var(--font-inter), system-ui, sans-serif',
            fontSize:      'clamp(52px, 9vw, 108px)',
            fontWeight:    800,
            letterSpacing: '-0.04em',
            color:         '#f0eeea',
            userSelect:    'none',
          }}
        >
          0%
        </span>
      </div>
    </>
  )
}
