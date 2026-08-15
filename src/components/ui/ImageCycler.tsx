'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'

interface Card {
  id:     number
  src:    string
  width:  number   // px — varies per card
  height: number   // px — varies: portrait vs landscape
  rotate: number   // deg — random tilt
}

/* Portrait and landscape ratios mixed */
const RATIOS = [
  { w: 240, h: 310 }, // portrait tall
  { w: 300, h: 220 }, // landscape wide
  { w: 210, h: 280 }, // portrait narrow
  { w: 320, h: 210 }, // landscape wider
  { w: 230, h: 300 }, // portrait
  { w: 290, h: 200 }, // landscape short
  { w: 260, h: 330 }, // portrait taller
]

const MAX_STACK = 5  // how many cards stay visible at once

/* ─────────────────────────────────────────────────────────────────
   ImageCycler
   On hover: builds a growing stack of cards above the word.
   Each new card bounces in on top; older cards stay behind,
   shrinking slightly and fading — like a deck of polaroids.
   ───────────────────────────────────────────────────────────────── */
export default function ImageCycler({
  images,
  children,
}: {
  images:   string[]
  children: React.ReactNode
}) {
  const [active, setActive]   = useState(false)
  const [stack,  setStack]    = useState<Card[]>([])
  const [hasPointer, setHasPointer] = useState(true)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const holdRef    = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const counterRef = useRef(0)
  const imgIdxRef  = useRef(0)
  const cardRefs   = useRef<Map<number, HTMLSpanElement>>(new Map())

  /* Touch devices can synthesize a mouseenter on tap with no matching
     mouseleave, leaving this hover-only image stack stuck open and
     covering the text underneath — disable the interaction entirely
     on touch/coarse-pointer devices instead of chasing that state. */
  useEffect(() => {
    setHasPointer(window.matchMedia('(pointer: fine)').matches)
  }, [])

  const pushCard = useCallback(() => {
    const id  = counterRef.current++
    const src = images[imgIdxRef.current % images.length]
    imgIdxRef.current++

    const ratio = RATIOS[id % RATIOS.length]
    const card: Card = {
      id,
      src,
      width:  ratio.w,
      height: ratio.h,
      rotate: (Math.random() - 0.5) * 14,   // ±7°
    }

    setStack(prev => [card, ...prev].slice(0, MAX_STACK))
  }, [images])

  /* Animate the newest card in after it's mounted */
  useEffect(() => {
    if (!active || stack.length === 0) return
    const newest = stack[0]
    const el = cardRefs.current.get(newest.id)
    if (!el) return
    gsap.fromTo(el,
      { scale: 0.72, y: 18, opacity: 0, rotate: newest.rotate + (Math.random() - 0.5) * 10 },
      { scale: 1,    y: 0,  opacity: 1, rotate: newest.rotate,
        duration: 0.30, ease: 'back.out(2.2)' }
    )
  }, [stack, active])

  const stop = useCallback(() => {
    /* Stop adding new cards */
    if (timerRef.current) clearInterval(timerRef.current)

    /* Hold briefly, then remove cards back → front one by one */
    holdRef.current = setTimeout(() => {
      const els = [...cardRefs.current.values()]
      // DOM order is oldest→newest, so 'start' removes oldest (back) first
      if (els.length === 0) { setActive(false); setStack([]); return }

      gsap.to(els, {
        scale:   0.6,
        y:       30,
        opacity: 0,
        rotate:  (i: number) => (i % 2 === 0 ? 14 : -14),
        duration: 0.28,
        ease:    'back.in(1.8)',
        stagger: { each: 0.12, from: 'start' }, // 120ms gap — clearly one by one
        onComplete() {
          setActive(false)
          setStack([])
          cardRefs.current.clear()
        },
      })
    }, 450)
  }, [])

  /* Cancel hold timer if re-hovered before cards exit */
  const start = useCallback(() => {
    if (holdRef.current) clearTimeout(holdRef.current)
    counterRef.current = 0
    imgIdxRef.current  = 0
    setStack([])
    cardRefs.current.clear()
    setActive(true)
    pushCard()
    timerRef.current = setInterval(pushCard, 300)
  }, [pushCard])

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (holdRef.current)  clearTimeout(holdRef.current)
    if (autoStopRef.current) clearTimeout(autoStopRef.current)
  }, [])

  /* Touch has no hover — tap toggles the stack instead. A second tap
     dismisses it early; otherwise it auto-dismisses on its own so it
     can never get stuck open the way an unpaired hover event would. */
  const handleTap = useCallback(() => {
    if (active) {
      if (autoStopRef.current) clearTimeout(autoStopRef.current)
      stop()
    } else {
      start()
      autoStopRef.current = setTimeout(stop, 2600)
    }
  }, [active, start, stop])

  return (
    <span
      style={{ position: 'relative', display: 'inline' }}
      onMouseEnter={hasPointer ? start : undefined}
      onMouseLeave={hasPointer ? stop : undefined}
      onClick={hasPointer ? undefined : handleTap}
    >
      {children}

      {/* Stack container */}
      {active && (
        <span
          style={{
            position:      'absolute',
            top:           '50%',
            left:          '50%',
            transform:     'translate(-50%, -50%)',
            display:       'block',
            width:         '340px',
            height:        '360px',
            pointerEvents: 'none',
            zIndex:        200,
          }}
        >
          {/* Render oldest first so newest is on top in DOM */}
          {[...stack].reverse().map((card, reverseIdx) => {
            // stackIdx 0 = newest (front), MAX_STACK-1 = oldest (back)
            const stackIdx = stack.length - 1 - reverseIdx
            const scale    = 1 - stackIdx * 0.07
            const yBack    = stackIdx * 9          // older cards sit lower
            const opacity  = 1 - stackIdx * 0.18

            return (
              <span
                key={card.id}
                ref={el => {
                  if (el) cardRefs.current.set(card.id, el)
                  else    cardRefs.current.delete(card.id)
                }}
                style={{
                  position:        'absolute',
                  bottom:          yBack,
                  left:            '50%',
                  marginLeft:      -(card.width / 2),
                  display:         'block',
                  width:           card.width,
                  height:          card.height,
                  borderRadius:    '9px',
                  overflow:        'hidden',
                  transform:       `scale(${stackIdx === 0 ? 1 : scale}) rotate(${card.rotate}deg)`,
                  transformOrigin: 'bottom center',
                  opacity,
                  zIndex:          MAX_STACK - stackIdx,
                  boxShadow:       '0 10px 32px rgba(0,0,0,0.22)',
                  border:          '1px solid rgba(255,255,255,0.10)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.src}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </span>
            )
          })}
        </span>
      )}
    </span>
  )
}

