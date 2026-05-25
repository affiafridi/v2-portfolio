'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/* ─── Hole grid — organic blobs punched through dark canvas ─────── */
/* Positions as fraction of viewport (0–1), seed drives waviness     */
const HOLES = [
  /* row 0 */
  { x: 0.03, y: 0.05, seed: 1.2 },
  { x: 0.20, y: 0.02, seed: 2.3 },
  { x: 0.38, y: 0.08, seed: 3.7 },
  { x: 0.57, y: 0.03, seed: 4.1 },
  { x: 0.76, y: 0.07, seed: 5.5 },
  { x: 0.96, y: 0.04, seed: 6.2 },
  /* row 1 */
  { x: 0.10, y: 0.22, seed: 7.8 },
  { x: 0.28, y: 0.25, seed: 8.3 },
  { x: 0.47, y: 0.20, seed: 9.1 },
  { x: 0.65, y: 0.24, seed: 10.6 },
  { x: 0.83, y: 0.21, seed: 11.4 },
  /* row 2 */
  { x: 0.02, y: 0.45, seed: 12.9 },
  { x: 0.20, y: 0.48, seed: 13.2 },
  { x: 0.38, y: 0.43, seed: 14.7 },
  { x: 0.56, y: 0.47, seed: 15.1 },
  { x: 0.74, y: 0.44, seed: 16.8 },
  { x: 0.93, y: 0.46, seed: 17.3 },
  /* row 3 */
  { x: 0.12, y: 0.67, seed: 18.5 },
  { x: 0.30, y: 0.70, seed: 19.2 },
  { x: 0.48, y: 0.65, seed: 20.9 },
  { x: 0.66, y: 0.68, seed: 21.4 },
  { x: 0.84, y: 0.66, seed: 22.7 },
  /* row 4 */
  { x: 0.04, y: 0.88, seed: 23.1 },
  { x: 0.22, y: 0.85, seed: 24.6 },
  { x: 0.40, y: 0.90, seed: 25.3 },
  { x: 0.58, y: 0.86, seed: 26.8 },
  { x: 0.76, y: 0.89, seed: 27.2 },
  { x: 0.95, y: 0.86, seed: 28.9 },
  /* centre + gap-fillers */
  { x: 0.50, y: 0.50, seed: 29.4 },
  { x: 0.14, y: 0.38, seed: 30.7 },
  { x: 0.86, y: 0.38, seed: 31.2 },
  { x: 0.33, y: 0.58, seed: 32.5 },
  { x: 0.68, y: 0.56, seed: 33.8 },
]

/* Draw an organic wavy circle via sine-wave radial perturbation */
function drawOrganic(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  seed: number,
) {
  const pts = 48
  ctx.beginPath()
  for (let j = 0; j <= pts; j++) {
    const angle = (j / pts) * Math.PI * 2
    const wave =
      1 +
      Math.sin(angle * 3 + seed * 1.1) * 0.18 +
      Math.sin(angle * 5 + seed * 0.7) * 0.11 +
      Math.sin(angle * 7 + seed * 1.3) * 0.06
    const pr = r * wave
    const px = cx + pr * Math.cos(angle)
    const py = cy + pr * Math.sin(angle)
    if (j === 0) ctx.moveTo(px, py)
    else         ctx.lineTo(px, py)
  }
  ctx.closePath()
}

export default function Preloader() {
  const [mounted, setMounted] = useState(true)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const canvas  = canvasRef.current
    const counter = counterRef.current
    if (!canvas || !counter) return

    document.body.style.overflow = 'hidden'

    /* Size canvas to fill viewport exactly */
    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width  = W
    canvas.height = H

    /* R_MAX: 28% of viewport diagonal — enough for holes to fully overlap
       and erase the entire dark overlay even with organic waviness.        */
    const R_MAX = Math.hypot(W, H) * 0.28

    const ctx = canvas.getContext('2d')!

    /* Per-hole proxy objects — GSAP tweens `.r` on each */
    const proxyArr = HOLES.map(() => ({ r: 0 }))

    /* RAF draw loop — fills dark, then punches transparent holes */
    let running = true
    let raf     = 0

    const draw = () => {
      if (!running) return

      ctx.clearRect(0, 0, W, H)

      /* Solid dark fill */
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, W, H)

      /* Punch organic transparent holes through the fill */
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,1)'
      proxyArr.forEach((p, i) => {
        if (p.r <= 0.5) return
        drawOrganic(ctx, HOLES[i].x * W, HOLES[i].y * H, p.r, HOLES[i].seed)
        ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }
    draw()

    /* ── Helpers ─────────────────────────────────────────────────── */
    const revealPage = () => {
      const pc = document.getElementById('pc')
      if (pc) pc.style.visibility = ''
    }

    const teardown = () => {
      running = false
      cancelAnimationFrame(raf)
      document.body.style.overflow = ''
      document.documentElement.removeAttribute('data-loading')
      revealPage()
    }

    /* ── Main timeline ───────────────────────────────────────────── */
    const cProxy = { val: 0 }

    const tl = gsap.timeline({
      onComplete() {
        teardown()
        setMounted(false)
      },
    })

    tl
      /* 1 — count 0 → 100 */
      .to(cProxy, {
        val: 100,
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate() {
          if (counter) counter.textContent = `${Math.round(cProxy.val)}%`
        },
      })

      /* 2 — counter slides out upward */
      .to(counter, { y: -28, opacity: 0, duration: 0.22, ease: 'power2.in' }, '-=0.05')

      /* 3 — show page behind canvas so Hero starts mid-animation */
      .call(revealPage)

      /* 4 — organic holes grow from random positions → page shows through */
      .to(proxyArr, {
        r:        R_MAX,
        duration: 1.10,
        ease:     'expo.inOut',
        stagger:  { each: 0.022, from: 'random' },
      }, '+=0.04')

      /* 5 — fade remaining dark fringe, then done */
      .to(canvas, { opacity: 0, duration: 0.22, ease: 'power1.in' })

    /* Safety unmount in case timeline stalls */
    const safety = window.setTimeout(() => {
      teardown()
      setMounted(false)
    }, 6000)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      teardown()
      window.clearTimeout(safety)
      tl.kill()
    }
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Canvas — dark fill with transparent holes burned through it */}
      <canvas
        ref={canvasRef}
        style={{
          position:      'fixed',
          inset:         0,
          zIndex:        9998,
          pointerEvents: 'none',
          display:       'block',
        }}
      />

      {/* Counter — above canvas, unaffected by composite ops */}
      <div
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         9999,
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
