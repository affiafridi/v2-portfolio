'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useCursorStore } from '@/store/useCursorStore'

const CREAM = '#f0eeea'
const INK = '#1a1a1a'
const ACC = '#ff4d00'

export default function NotFoundContent() {
  const sectionRef = useRef<HTMLElement>(null)
  const { setCursorType } = useCursorStore()

  // Hide before first paint — prevents a flash of unstyled content, same
  // pattern as WorkPageHero.
  useLayoutEffect(() => {
    gsap.set('.nf-eyebrow', { opacity: 0, y: -16 })
    gsap.set('.nf-number', { opacity: 0, y: -48, filter: 'blur(14px)' })
    gsap.set('.nf-message', { opacity: 0, y: -20, filter: 'blur(8px)' })
    gsap.set('.nf-actions', { opacity: 0, y: 16 })
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to('.nf-eyebrow', { y: 0, opacity: 1, duration: 0.6 })
        .to('.nf-number', { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.3 }, '-=0.35')
        .to('.nf-message', { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0 }, '-=0.85')
        .to('.nf-actions', { y: 0, opacity: 1, duration: 0.7 }, '-=0.5')
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        background: CREAM,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(24px,4vw,48px) 24px',
        textAlign: 'center',
      }}
    >
      <span
        className="nf-eyebrow"
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: `${INK}55`,
          marginBottom: 'clamp(16px,2vw,28px)',
        }}
      >
        Error 404
      </span>

      <div
        className="nf-number"
        style={{
          fontSize: 'clamp(96px, 18vw, 260px)',
          fontWeight: 800,
          letterSpacing: '-0.05em',
          lineHeight: 0.86,
          color: INK,
          display: 'inline-flex',
          alignItems: 'flex-end',
          gap: '0.05em',
          userSelect: 'none',
        }}
      >
        <span>4</span>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 'clamp(56px, 11vw, 150px)',
            height: 'clamp(56px, 11vw, 150px)',
            borderRadius: '50%',
            background: ACC,
            flexShrink: 0,
            marginBottom: 'clamp(6px, 1.2vw, 20px)',
          }}
        />
        <span>4</span>
      </div>

      <p
        className="nf-message"
        style={{
          fontSize: 'clamp(16px, 1.6vw, 20px)',
          fontWeight: 500,
          color: INK,
          opacity: 0.7,
          maxWidth: '440px',
          marginTop: 'clamp(20px,2.5vw,32px)',
          lineHeight: 1.5,
        }}
      >
        This page couldn&apos;t be found. It may have moved, or the link might be broken.
      </p>

      <div
        className="nf-actions"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(24px,3vw,40px)',
          marginTop: 'clamp(36px,4.5vw,56px)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: INK,
            textDecoration: 'none',
            borderBottom: `1px solid ${INK}28`,
            paddingBottom: '4px',
            transition: 'color 0.22s ease, border-color 0.22s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = ACC; e.currentTarget.style.borderColor = ACC; setCursorType('hover') }}
          onMouseLeave={(e) => { e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = `${INK}28`; setCursorType('default') }}
        >
          Back to Home
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
            <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <Link
          href="/work"
          style={{
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: `${INK}80`,
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = INK; setCursorType('hover') }}
          onMouseLeave={(e) => { e.currentTarget.style.color = `${INK}80`; setCursorType('default') }}
        >
          View Work
        </Link>

        <Link
          href="/blog"
          style={{
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: `${INK}80`,
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = INK; setCursorType('hover') }}
          onMouseLeave={(e) => { e.currentTarget.style.color = `${INK}80`; setCursorType('default') }}
        >
          Read Blog
        </Link>
      </div>
    </section>
  )
}
