'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useMenuStore }    from '@/store/useMenuStore'
import { useCursorStore }  from '@/store/useCursorStore'
import { useContactStore } from '@/store/useContactStore'
import { scheduleMenuClose, cancelMenuClose } from '@/store/menuHoverTimer'

/* ─────────────────────────────────────────────────────────────────
   MenuOverlay — Centered floating panel, same width as sticky header.

   STRUCTURE
   ─────────
   • Full-screen backdrop  (z-299): blurs the hero behind, click = close
   • Centered panel        (z-300): width = min(90vw, 500px), top-0
     The centering wrapper is a plain div (translateX -50%).
     GSAP animates only clipPath on the inner panel — no conflict.

   OPEN  animation: clipPath bottom 100% → 0%  (sheet unrolls from top)
   CLOSE animation: clipPath bottom 0%   → 100% (snaps back up)
   ───────────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { num: '01', label: 'Index',   href: '/',        note: 'Home'             },
  { num: '02', label: 'Work',    href: '/work',    note: 'Selected projects'},
  { num: '03', label: 'About',   href: '/about',   note: 'Who I am'         },
  { num: '04', label: 'Process', href: '/process', note: 'How I work'       },
  { num: '05', label: 'Contact', href: '/contact', note: 'Let\'s talk'      },
]

const BG      = '#0d0d0d'
const CREAM   = '#f0eeea'
const ACCENT  = '#ff4d00'
const DIVIDER = 'rgba(240,238,234,0.07)'
const MUTED   = 'rgba(240,238,234,0.32)'

export default function MenuOverlay() {
  const { isOpen, close }     = useMenuStore()
  const { setCursorType }     = useCursorStore()
  const { open: openContact } = useContactStore()

  const panelRef = useRef<HTMLDivElement>(null)
  const tlRef    = useRef<gsap.core.Timeline | null>(null)

  /* ── Lock body scroll when open ──────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  /* ── GSAP panel animation ────────────────────────────────────── */
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    tlRef.current?.kill()

    if (isOpen) {
      /* Reset child elements so stagger is fresh each open */
      gsap.set(['.mo-topbar', '.mo-logo', '.mo-item', '.mo-footer'], {
        clearProps: 'opacity,y,filter',
      })
      gsap.set('.mo-line', { scaleX: 0 })

      const tl = gsap.timeline()
      tlRef.current = tl

      const lines = gsap.utils.toArray<HTMLElement>('.mo-line')

      /* Panel unrolls from top */
      tl.fromTo(panel,
          { clipPath: 'inset(0% 0% 100% 0% round 20px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 0.68, ease: 'expo.inOut' }
        )
        /* Topbar */
        .from('.mo-topbar',
          { y: -10, opacity: 0, duration: 0.28, ease: 'power2.out' },
          0.10
        )
        /* Logo blurs in */
        .fromTo('.mo-logo',
          { opacity: 0, filter: 'blur(8px)', y: 8 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.38, ease: 'power2.out' },
          0.20
        )
        /* Line 1 wipes — starts with logo, doesn't block nav */
        .fromTo(lines[0],
          { scaleX: 0 },
          { scaleX: 1, duration: 0.38, ease: 'power3.out' },
          0.28
        )
        /* Nav items blur in — start right after line begins, no waiting */
        .fromTo('.mo-item',
          { opacity: 0, filter: 'blur(10px)', x: 6 },
          { opacity: 1, filter: 'blur(0px)',  x: 0, duration: 0.38, stagger: { each: 0.07 }, ease: 'power2.out' },
          0.34
        )
        /* Line 2 wipes as last item is coming in */
        .fromTo(lines[1],
          { scaleX: 0 },
          { scaleX: 1, duration: 0.38, ease: 'power3.out' },
          0.68
        )
        /* Footer blurs in */
        .fromTo('.mo-footer',
          { opacity: 0, filter: 'blur(8px)', y: 6 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.32, ease: 'power2.out' },
          0.72
        )

    } else {
      const tl = gsap.timeline()
      tlRef.current = tl

      tl.to(['.mo-logo', '.mo-item', '.mo-footer'], {
          opacity: 0, filter: 'blur(6px)', y: -8, duration: 0.16, stagger: 0.02, ease: 'power2.in',
        })
        .to(panel, {
          clipPath: 'inset(0% 0% 100% 0% round 20px)',
          duration: 0.50, ease: 'expo.inOut',
        }, 0.06)
    }
  }, [isOpen])

  return (
    <>
      {/* ── Full-screen backdrop — click outside to close ─────── */}
      <div
        className="fixed inset-0 z-[299]"
        style={{
          background:           'rgba(10,10,10,0.45)',
          backdropFilter:       isOpen ? 'blur(6px)' : 'none',
          WebkitBackdropFilter: isOpen ? 'blur(6px)' : 'none',
          opacity:              isOpen ? 1 : 0,
          pointerEvents:        isOpen ? 'auto' : 'none',
          transition:           'opacity 0.4s ease, backdrop-filter 0.4s ease',
        }}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Centering wrapper — NOT animated (owns translateX) ── */}
      {/* top: 20px matches the sticky header's top-5 position   */}
      <div
        className="fixed z-[300]"
        style={{
          top:           '20px',
          left:          '50%',
          transform:     'translateX(-50%)',
          width:         'min(90vw, 500px)',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onMouseEnter={cancelMenuClose}
        onMouseLeave={() => scheduleMenuClose(close)}
      >
        {/* ── Animated panel (GSAP owns clipPath only) ────────── */}
        <div
          ref={panelRef}
          className="flex flex-col overflow-hidden"
          style={{
            background:   BG,
            clipPath:     'inset(0% 0% 100% 0% round 20px)',
            borderRadius: '20px',
            maxHeight:    'calc(100dvh - 40px)',
            overflow:     'hidden',   /* never show scrollbar — not even briefly during animation */
          }}
        >

          {/* ── TOP BAR ────────────────────────────────────────── */}
          <div
            className="mo-topbar flex items-center justify-between px-6 py-5"
            style={{ borderBottom: `1px solid ${DIVIDER}` }}
          >
            {/* Availability pulse */}
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-[7px] w-[7px]">
                <span
                  className="absolute inline-flex h-full w-full rounded-full animate-ping"
                  style={{ background: '#22c55e', opacity: 0.55 }}
                />
                <span
                  className="relative inline-flex h-[7px] w-[7px] rounded-full"
                  style={{ background: '#22c55e' }}
                />
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.18em]"
                style={{ color: MUTED }}
              >
                Available for freelance
              </span>
            </div>

            {/* Close */}
            <button
              onClick={close}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]
                         transition-colors duration-200"
              style={{ color: MUTED }}
              onMouseEnter={(e) => { e.currentTarget.style.color = CREAM; setCursorType('hover') }}
              onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; setCursorType('default') }}
              aria-label="Close menu"
            >
              Close
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[13px]"
                style={{ border: `1px solid rgba(240,238,234,0.15)` }}
              >
                ×
              </span>
            </button>
          </div>

          {/* ── LOGO ───────────────────────────────────────────── */}
          <div
            className="mo-logo flex flex-col items-center py-7"
          >
            <span
              className="text-[28px] font-bold tracking-tight"
              style={{ color: CREAM }}
            >
              Aftab.
            </span>
            <span
              className="mt-1 text-[10px] uppercase tracking-[0.22em]"
              style={{ color: 'rgba(240,238,234,0.25)' }}
            >
              Creative Developer
            </span>
          </div>

          {/* ── LINE 1 — wipes in after logo ───────────────────── */}
          <div className="mo-line" style={{ height: '1px', background: DIVIDER, transformOrigin: 'left center', scaleX: 0 }} />

          {/* ── NAV ITEMS ──────────────────────────────────────── */}
          <nav className="flex flex-col">
            {NAV_ITEMS.map((item) => {
              const isContact = item.label === 'Contact'
              const handleClick = () => {
                close()
                if (isContact) openContact()
              }
              const inner = (
                <>
                  {/* Number + label */}
                  <div className="flex items-baseline gap-4">
                    <span className="text-[10px] tabular-nums" style={{ color: ACCENT }}>
                      {item.num}
                    </span>
                    <span
                      className="text-[clamp(26px,5vw,40px)] font-bold leading-none tracking-tight
                                 transition-transform duration-300 group-hover:translate-x-1.5"
                      style={{ color: CREAM }}
                    >
                      {item.label}
                    </span>
                  </div>
                  {/* Note + arrow */}
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[10px] uppercase tracking-[0.1em]
                                 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ color: MUTED }}
                    >
                      {item.note}
                    </span>
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center
                                 rounded-full text-[12px]
                                 -translate-x-2 opacity-0
                                 transition-all duration-300
                                 group-hover:opacity-100 group-hover:translate-x-0"
                      style={{ border: `1px solid rgba(240,238,234,0.18)`, color: CREAM }}
                    >
                      →
                    </span>
                  </div>
                </>
              )

              return isContact ? (
                <button
                  key={item.label}
                  onClick={handleClick}
                  className="mo-item group flex items-center justify-between px-6 py-4
                             transition-colors duration-200 w-full text-left"
                  style={{ borderBottom: `1px solid ${DIVIDER}`, background: 'none', border: `none`, borderBottom: `1px solid ${DIVIDER}`, cursor: 'none' }}
                  onMouseEnter={() => setCursorType('hover')}
                  onMouseLeave={() => setCursorType('default')}
                >
                  {inner}
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleClick}
                  className="mo-item group flex items-center justify-between px-6 py-4
                             transition-colors duration-200"
                  style={{ borderBottom: `1px solid ${DIVIDER}` }}
                  onMouseEnter={() => setCursorType('hover')}
                  onMouseLeave={() => setCursorType('default')}
                >
                  {inner}
                </Link>
              )
            })}
          </nav>

          {/* ── LINE 2 — wipes in after nav items ──────────────── */}
          <div className="mo-line" style={{ height: '1px', background: DIVIDER, transformOrigin: 'left center', scaleX: 0 }} />

          {/* ── FOOTER ─────────────────────────────────────────── */}
          <div
            className="mo-footer flex items-center justify-between gap-4 px-6 py-5"
          >
            {/* Location + email */}
            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className="text-[10px] uppercase tracking-[0.14em] truncate"
                style={{ color: 'rgba(240,238,234,0.25)' }}
              >
                Dubai, UAE
              </span>
              <a
                href="mailto:affiafridi.dev@gmail.com"
                className="text-[11px] tracking-wide truncate transition-colors duration-200"
                style={{ color: MUTED }}
                onMouseEnter={(e) => { e.currentTarget.style.color = CREAM; setCursorType('hover') }}
                onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; setCursorType('default') }}
              >
                aftab@matildacake.com
              </a>
            </div>

            {/* CTA */}
            <button
              onClick={() => { close(); openContact() }}
              className="flex flex-shrink-0 items-center gap-2 rounded-full px-5 py-2.5
                         text-[10px] font-medium uppercase tracking-[0.16em]
                         transition-all duration-300 hover:gap-3"
              style={{ background: CREAM, color: BG, border: 'none', cursor: 'none' }}
              onMouseEnter={() => setCursorType('hover')}
              onMouseLeave={() => setCursorType('default')}
            >
              Let&apos;s work
              <span>↗</span>
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
