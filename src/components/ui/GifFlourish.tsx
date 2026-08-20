'use client'

import { useEffect, useRef } from 'react'
import LoopingVideo from '@/components/ui/LoopingVideo'
import { gsap } from 'gsap'
import { useGifFlourishStore } from '@/store/useGifFlourishStore'
import { useContactStore } from '@/store/useContactStore'

const ACC  = '#ff4d00'
const DARK = '#0d0d0d'

/* Brief celebratory flourish that plays before the contact modal opens —
   triggered from the site's two most intentional "let's talk" CTAs
   (Start a Project on service pages, "Have a project in mind?" in
   About), not the routine header/footer contact links, so it reads as
   a specific little reward rather than something that gets old fast
   from being seen on every click. Entirely GSAP-timed (one timeline,
   entrance → hold → exit → onComplete), no scroll/viewport dependency
   at all — sidesteps every class of "doesn't fire" bug this session
   has otherwise had to chase down for scroll-gated reveals. */
export default function GifFlourish() {
  const isOpen        = useGifFlourishStore((s) => s.isOpen)
  const closeFlourish  = useGifFlourishStore((s) => s.close)
  const openContact    = useContactStore((s) => s.open)

  const overlayRef = useRef<HTMLDivElement>(null)
  const ringRef     = useRef<HTMLDivElement>(null)
  const ring2Ref     = useRef<HTMLDivElement>(null)
  const cardRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const overlay = overlayRef.current!
    const ring    = ringRef.current!
    const ring2   = ring2Ref.current!
    const card    = cardRef.current!

    gsap.set(overlay, { autoAlpha: 0 })
    gsap.set(card,    { scale: 0.34, autoAlpha: 0, rotate: -7, filter: 'blur(6px)' })
    gsap.set([ring, ring2], { scale: 0.5, autoAlpha: 0 })

    const tl = gsap.timeline({
      /* Small beat before anything starts — clicking used to launch
         straight into the overlay fading in, which read as too abrupt
         since the page underneath had no moment to actually register
         before getting covered. This holds on the current page first,
         then starts the flourish right after. */
      delay: 0.14,
      onComplete() {
        closeFlourish()
        openContact()
      },
    })

    tl.to(overlay, { autoAlpha: 1, duration: 0.24, ease: 'power2.out' })
      /* "Stamp" — three chained segments instead of one smooth ease,
         so the motion has a fast run-in, a brief hesitation partway
         through, then a quick snap to finish, rather than a single
         continuous curve. */
      .to(card, {
        scale: 0.90, rotate: -1, autoAlpha: 1, filter: 'blur(1.2px)',
        duration: 0.26, ease: 'power3.out',
      }, '-=0.10')
      .to(card, {
        scale: 0.955, rotate: -0.3, filter: 'blur(0.4px)',
        duration: 0.20, ease: 'sine.inOut',
      })
      .to(card, {
        scale: 1, rotate: 0, filter: 'blur(0px)',
        duration: 0.15, ease: 'power2.in',
      })
      /* Accent ring pulses outward once from the stamp point and fades
         — the same orange-dot motif used across Hero/WorkPageHero/
         section labels, here as a one-shot "impact" flourish instead
         of a static accent. A second, softer ring trails slightly
         behind for a bit of depth rather than one flat pulse. */
      .to(ring, { scale: 2.1, autoAlpha: 0.55, duration: 0.55, ease: 'power2.out' }, '-=0.42')
      .to(ring, { autoAlpha: 0, duration: 0.35, ease: 'power1.in' }, '-=0.10')
      .to(ring2, { scale: 2.6, autoAlpha: 0.28, duration: 0.65, ease: 'power2.out' }, '-=0.60')
      .to(ring2, { autoAlpha: 0, duration: 0.35, ease: 'power1.in' }, '-=0.15')
      /* Hold on screen. */
      .to({}, { duration: 0.42 })
      /* Exit — settle back down with a soft blur dissolve rather than
         a hard cut, so it reads as one continuous motion straight into
         the contact modal opening underneath. */
      .to(card, { scale: 0.94, autoAlpha: 0, filter: 'blur(10px)', duration: 0.30, ease: 'power2.in' })
      .to(overlay, { autoAlpha: 0, duration: 0.24, ease: 'power1.in' }, '-=0.16')

    return () => { tl.kill() }
  }, [isOpen, closeFlourish, openContact])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      aria-hidden
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         100000,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:           'rgba(13,13,13,0.62)',
        backdropFilter:       'blur(10px) saturate(140%)',
        WebkitBackdropFilter: 'blur(10px) saturate(140%)',
        pointerEvents:  'none',
      }}
    >
      <div
        ref={ring2Ref}
        style={{
          position: 'absolute', width: 'min(340px,74vw)', aspectRatio: '1',
          borderRadius: '50%', border: `1px solid ${ACC}`,
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: 'absolute', width: 'min(280px,62vw)', aspectRatio: '1',
          borderRadius: '50%', border: `1.5px solid ${ACC}`,
        }}
      />
      <div
        ref={cardRef}
        style={{
          position:     'relative',
          width:        'min(320px,68vw)',
          aspectRatio:  '1',
          borderRadius: 'clamp(16px,2vw,24px)',
          overflow:     'hidden',
          background:   DARK,
          border:       `1px solid ${ACC}40`,
          boxShadow:    '0 32px 90px rgba(0,0,0,0.45)',
        }}
      >
        <LoopingVideo
          src="/uploads/1786797195871-reach-out.mp4"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    </div>
  )
}
