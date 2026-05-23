'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCursorStore } from '@/store/useCursorStore'
import { useMenuStore }   from '@/store/useMenuStore'

/* ─── Nav data ───────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Index',   href: '/' },
  { label: 'Work',    href: '/work' },
  { label: 'About',   href: '/about' },
  { label: 'Contact', href: '/contact' },
]

/* ─── Logo SVG ───────────────────────────────────────────────────── */
function LogoMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 16L12 8.5L15.5 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 13.5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/* ─── Nav item — bracket hover style ────────────────────────────── */
function NavItem({
  item,
  activeId,
  setActiveId,
  theme = 'dark',
}: {
  item:        { label: string; href: string }
  activeId:    string | null
  setActiveId: (v: string | null) => void
  theme?:      'light' | 'dark'
}) {
  const { setCursorType } = useCursorStore()
  const isActive = activeId === item.label

  const fg    = theme === 'light' ? '#1a1a1a'             : '#f0f0f0'
  const muted = theme === 'light' ? 'rgba(26,26,26,0.38)' : 'rgba(240,240,240,0.38)'

  return (
    <Link
      href={item.href}
      className="relative px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em]"
      style={{ color: isActive ? fg : muted, transition: 'color 0.2s ease' }}
      onMouseEnter={() => { setActiveId(item.label); setCursorType('hover') }}
      onMouseLeave={() => setCursorType('default')}
    >
      <span className="flex items-center">
        <span style={{ opacity: isActive ? 1 : 0, marginRight: isActive ? '3px' : '0', transition: 'opacity 0.18s ease, margin 0.18s ease' }}>
          [
        </span>
        <span>{item.label}</span>
        <span style={{ opacity: isActive ? 1 : 0, marginLeft: isActive ? '3px' : '0', transition: 'opacity 0.18s ease, margin 0.18s ease' }}>
          ]
        </span>
      </span>
    </Link>
  )
}

/* ─── DEFAULT header — nav only (logo lives in root Header) ─────── */
function DefaultHeader() {
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <motion.div
      key="default"
      className="pointer-events-none fixed left-0 right-0 top-0 z-50"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Nav — bare text, no pill container */}
      <div className="flex justify-center pt-7">
        <nav
          className="pointer-events-auto flex items-center"
          onMouseLeave={() => setActiveId(null)}
        >
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.label} item={item} activeId={activeId} setActiveId={setActiveId} theme="light" />
          ))}
        </nav>
      </div>
    </motion.div>
  )
}

/* ─── STICKY header — dark pill ──────────────────────────────────── */
function StickyHeader() {
  const { setCursorType }  = useCursorStore()
  const { toggle, isOpen } = useMenuStore()

  return (
    <motion.div
      key="sticky"
      className="pointer-events-none fixed left-0 right-0 top-5 z-50 flex justify-center px-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <nav
        className="pointer-events-auto flex items-center justify-between rounded-full px-6 py-4"
        style={{
          width:                'min(90vw, 500px)',
          background:           'rgba(10,10,10,0.90)',
          backdropFilter:       'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border:               '1px solid rgba(240,240,240,0.08)',
        }}
      >
        {/* Left: Let's talk */}
        <Link
          href="/contact"
          className="text-[11px] font-medium uppercase tracking-[0.15em]"
          style={{ color: 'rgba(240,240,240,0.38)', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f0f0f0'; setCursorType('hover') }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.38)'; setCursorType('default') }}
        >
          Let&apos;s talk
        </Link>

        {/* Center: logo */}
        <Link
          href="/"
          aria-label="Home"
          style={{ color: 'rgba(240,240,240,0.55)', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f0f0f0'; setCursorType('hover') }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.55)'; setCursorType('default') }}
        >
          <LogoMark />
        </Link>

        {/* Right: Menu toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.15em]"
          style={{ color: 'rgba(240,240,240,0.38)', transition: 'color 0.2s ease' }}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f0f0f0'; setCursorType('hover') }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.38)'; setCursorType('default') }}
        >
          Menu
          <span className="flex flex-col gap-[4px]" aria-hidden="true">
            <motion.span
              className="block h-px w-4 bg-current"
              animate={isOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22 }}
            />
            <motion.span
              className="block h-px bg-current"
              animate={isOpen ? { rotate: -45, y: -3.5, width: 16 } : { rotate: 0, y: 0, width: 10 }}
              transition={{ duration: 0.22 }}
            />
          </span>
        </button>
      </nav>
    </motion.div>
  )
}

/* ─── Root export ────────────────────────────────────────────────── */
export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const { setCursorType } = useCursorStore()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      {/* ── Logo — standalone fixed, NEVER inside a Framer Motion parent.
           An animated opacity/transform ancestor traps mix-blend-mode into
           its own stacking context, breaking the inversion. This element
           has no compositing ancestor so it blends directly against the page. */}
      <Link
        href="/"
        style={{
          position:      'fixed',
          left:          '2rem',
          top:           '1.75rem',
          zIndex:        60,
          fontSize:      'clamp(20px, 2vw, 26px)',
          fontWeight:    700,
          letterSpacing: '-0.02em',
          color:         '#ffffff',
          mixBlendMode:  'difference',
          pointerEvents: 'auto',
          transition:    'opacity 0.2s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.65'; setCursorType('hover') }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1';    setCursorType('default') }}
      >
        Aftab.
      </Link>

      <AnimatePresence mode="wait">
        {scrolled ? <StickyHeader key="sticky" /> : <DefaultHeader key="default" />}
      </AnimatePresence>
    </>
  )
}
