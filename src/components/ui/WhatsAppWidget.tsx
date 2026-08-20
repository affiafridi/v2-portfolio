'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { useCursorStore } from '@/store/useCursorStore'
import { useWhatsAppStore } from '@/store/useWhatsAppStore'

const GREEN = '#00E676'   // neon accent used for the offset shadow + FAB
const INK   = '#111111'   // outline colour — the defining trait of this style
const OFFSET = 5          // hard shadow offset, px

interface WhatsAppSettings {
  enabled?:         boolean
  number?:          string
  profileImage?:    string
  displayName?:     string
  greetingMessage?: string
}

/* Floating WhatsApp widget.

   Visual language is neo-brutalist, matching the reference: a hard
   (zero-blur) green shadow offset down-right, a solid dark outline, and
   generous corner radii. The shadow is applied as a `drop-shadow`
   filter on the wrapper rather than `box-shadow` on the card, because
   drop-shadow follows the rendered alpha silhouette — so the speech
   bubble's tail gets the same green edge as the card body, which a
   rectangular box-shadow can't do.

   Nothing is sent from this site: the button only builds a wa.me link
   and hands the visitor to WhatsApp, where they review the prefilled
   text before actually sending it.

   Mounted globally like ContactModal/MenuOverlay, and held back until
   first opened for the same reason those are — the panel and avatar
   shouldn't cost anything on a page load where nobody touches it. */
export default function WhatsAppWidget({ settings }: { settings?: WhatsAppSettings }) {
  const isOpen  = useWhatsAppStore((s) => s.isOpen)
  const setOpen = useWhatsAppStore((s) => s.setOpen)
  const toggle  = useWhatsAppStore((s) => s.toggle)

  const [hasOpened, setHasOpened] = useState(false)
  const [message, setMessage]     = useState('')

  const panelRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  /* The site hides the native cursor globally (body { cursor: none })
     and draws its own, so every interactive element has to declare
     cursor:none AND drive the shared store — otherwise the custom
     cursor keeps its default state over this widget and, with
     cursor:pointer set, the real arrow reappears on top of it. */
  const { setCursorType } = useCursorStore()
  const hoverCursor = {
    onMouseEnter: () => setCursorType('hover'),
    onMouseLeave: () => setCursorType('default'),
  }

  const number   = (settings?.number || '').replace(/\D/g, '')
  const enabled  = settings?.enabled && number.length > 0
  const name     = settings?.displayName || 'Aftab'
  const greeting = settings?.greetingMessage || 'Hi there 👋, How can I help you?'
  const avatar   = settings?.profileImage

  useEffect(() => {
    if (isOpen) setHasOpened(true)
  }, [isOpen])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || !hasOpened) return
    if (!tweenRef.current) {
      tweenRef.current = gsap.fromTo(panel,
        { autoAlpha: 0, y: 14, scale: 0.97, transformOrigin: 'bottom right' },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.26, ease: 'power3.out', paused: true }
      )
    }
    if (isOpen) tweenRef.current.play()
    else tweenRef.current.reverse()
  }, [isOpen, hasOpened])

  if (!enabled) return null

  const canSend = message.trim().length > 0

  const handleSend = () => {
    /* No greeting fallback any more: the greeting is written in the
       site owner's voice ("How can I help you?"), so firing it off as
       the visitor's own message reads wrong. With no CTA button left to
       carry a default, an empty box simply means nothing to send. */
    if (!canSend) return
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message.trim())}`, '_blank', 'noopener,noreferrer')
    setMessage('')
    setOpen(false)
    /* The element under the pointer unmounts on close, so its own
       mouseleave never fires — without this the cursor stays stuck in
       its hover state over the rest of the page. */
    setCursorType('default')
  }

  return (
    /* zIndex sits deliberately between BackToTop (9000) and ContactModal
       (9500), and crucially BELOW Cursor's 99999 — matching that value
       meant the tie was broken by DOM order, and since this renders last
       in PortfolioShell it painted over the custom cursor, making the
       cursor vanish anywhere above this widget. */
    <div style={{ position: 'fixed', right: 'clamp(16px,3vw,28px)', bottom: 'clamp(16px,3vw,28px)', zIndex: 9400 }}>
      {hasOpened && (
        <div
          ref={panelRef}
          style={{
            position: 'absolute', bottom: 'calc(100% + 20px)', right: 0,
            /* Split width/maxWidth deliberately — combining them as
               min(300px, calc(100vw - 32px)) collapsed to the parent's
               shrink-to-fit width (58px, the FAB) instead of resolving
               against the viewport. Verified live before this fix. */
            width: '316px', maxWidth: 'calc(100vw - 32px)',
            visibility: isOpen ? 'visible' : 'hidden',
            pointerEvents: isOpen ? 'auto' : 'none',
            /* Hard, zero-blur shadow that traces the card AND its tail. */
            filter: `drop-shadow(${OFFSET}px ${OFFSET}px 0 ${GREEN})`,
          }}
        >
          <div
            style={{
              position: 'relative', background: '#fff',
              border: `2px solid ${INK}`, borderRadius: '24px',
              padding: '20px 20px 18px',
            }}
          >
            {/* ── Header: avatar + name + online ─────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  position: 'relative', width: '48px', height: '48px', flexShrink: 0,
                  borderRadius: '50%', overflow: 'hidden',
                  border: `2px solid ${INK}`, background: GREEN,
                }}
              >
                {avatar ? (
                  <Image src={avatar} alt="" fill sizes="48px" className="object-cover" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2V5z" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: INK, letterSpacing: '-0.01em' }}>{name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: GREEN, border: `1px solid ${INK}`, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}>Online</span>
                </div>
              </div>

              <button
                onClick={() => { setOpen(false); setCursorType('default') }}
                {...hoverCursor}
                aria-label="Close"
                style={{
                  background: 'none', border: 'none', cursor: 'none', padding: '2px',
                  color: 'rgba(0,0,0,0.4)', fontSize: '20px', lineHeight: 1, flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            {/* ── Greeting ───────────────────────────────────────── */}
            <p style={{ fontSize: '15px', lineHeight: 1.5, color: INK, margin: '0 0 14px', fontWeight: 500 }}>
              {greeting}
            </p>

            {/* ── Message + send ─────────────────────────────────────
                Enter and the icon run the same handler, so the two paths
                can't drift apart. */}
            <div style={{ position: 'relative' }}>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
                placeholder="Type your message…"
                aria-label="Your message"
                onMouseEnter={() => setCursorType('text')}
                onMouseLeave={() => setCursorType('default')}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: `2px solid ${INK}`, borderRadius: '999px',
                  /* Right padding reserves the send button's slot so long
                     text scrolls under it rather than behind it. */
                  padding: '12px 52px 12px 18px',
                  fontSize: '14px', color: INK,
                  outline: 'none', background: '#fff',
                  fontFamily: 'inherit', cursor: 'none',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!canSend}
                aria-label="Send via WhatsApp"
                onMouseEnter={() => setCursorType(canSend ? 'hover' : 'default')}
                onMouseLeave={() => setCursorType('default')}
                style={{
                  position: 'absolute', right: '5px', top: '50%',
                  transform: 'translateY(-50%)',
                  width: '34px', height: '34px',
                  borderRadius: '50%',
                  /* No border of its own: it sits inside the input's 2px
                     outline, and two concentric rings a few px apart read
                     as noise. */
                  border: 'none',
                  background: canSend ? GREEN : 'rgba(0,0,0,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'none', padding: 0,
                  transition: 'background 0.18s ease',
                }}
              >
                {/* Path spans 3→21 on both axes, so it is already centred
                    on the 24x24 viewBox — it needs no nudging, and the
                    flex centring above does the rest. */}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M3 20.5l18-8.5L3 3.5 3 10l12 2-12 2 0 6.5z"
                    fill={canSend ? INK : 'rgba(0,0,0,0.35)'}
                  />
                </svg>
              </button>
            </div>

            {/* ── Speech-bubble tail ─────────────────────────────────
                Rotated square carrying only its outer two borders, so it
                reads as a continuation of the card's outline. The patch
                after it erases the card's own bottom border across the
                tail's mouth — without it the tail looks stuck on rather
                than part of the bubble. */}
            <div
              style={{
                position: 'absolute', right: '26px', bottom: '-13px',
                width: '22px', height: '22px', background: '#fff',
                transform: 'rotate(45deg)',
                borderRight: `2px solid ${INK}`, borderBottom: `2px solid ${INK}`,
                borderRadius: '0 0 5px 0',
              }}
            />
            <div
              style={{
                position: 'absolute', right: '29px', bottom: '-1px',
                width: '18px', height: '4px', background: '#fff',
              }}
            />
          </div>
        </div>
      )}

      {/* ── FAB — no hover animation, per request ─────────────────── */}
      <button
        onClick={toggle}
        {...hoverCursor}
        aria-label={isOpen ? 'Close WhatsApp chat' : 'Open WhatsApp chat'}
        style={{
          width: '58px', height: '58px', borderRadius: '50%',
          background: GREEN, border: `2px solid ${INK}`, cursor: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
          padding: 0,
        }}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M12 3a9 9 0 0 0-7.75 13.53L3 21l4.6-1.21A9 9 0 1 0 12 3z" fill={INK} />
            <path d="M9.1 7.3c-.2-.44-.4-.45-.58-.46h-.5c-.17 0-.45.06-.68.32-.24.26-.9.87-.9 2.13s.92 2.47 1.05 2.64c.13.17 1.8 2.83 4.42 3.85 2.18.86 2.62.68 3.1.64.47-.04 1.5-.6 1.72-1.2.21-.58.21-1.08.15-1.19-.07-.1-.24-.17-.5-.3-.26-.13-1.5-.75-1.74-.83-.23-.09-.4-.13-.57.13-.17.26-.65.83-.8 1-.15.17-.3.19-.55.06-.26-.13-1.08-.4-2.05-1.26-.76-.68-1.27-1.5-1.42-1.76-.15-.26-.02-.4.11-.53.11-.11.26-.3.39-.44.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.55-1.35-.78-1.85z" fill={GREEN} />
          </svg>
        )}
      </button>
    </div>
  )
}
