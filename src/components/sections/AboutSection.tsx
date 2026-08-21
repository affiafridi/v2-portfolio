'use client'

import { Fragment } from 'react'
import { useCursorStore } from '@/store/useCursorStore'
import { useGifFlourishStore } from '@/store/useGifFlourishStore'
import ImageCycler       from '@/components/ui/ImageCycler'
import { parseWordReveal } from '@/lib/wordReveal'

/* ─── Images for accent word hover ──────────────────────────────── */
const ABOUT_IMAGES = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',  // code landscape
  'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=400&q=80',  // dev portrait
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80', // laptop landscape
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', // person portrait
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80', // code landscape
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80', // screen portrait
  'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80', // workspace landscape
]

/* ─── Design tokens ──────────────────────────────────────────────── */
const BG  = '#f0eeea'
const INK = '#1a1a1a'
const ACC = '#ff4d00'

/* ─── Word map for the scroll-scrub reveal ───────────────────────── */
type W = { w: string; italic?: boolean; accent?: boolean }

const WORDS: W[] = [
  { w: 'I'               },
  { w: 'taught',   italic: true },
  { w: 'myself',   italic: true },
  { w: 'by',       italic: true },
  { w: 'building', italic: true },
  { w: 'things.',  italic: true },
  { w: 'It'              },
  { w: 'started'         },
  { w: 'with'            },
  { w: 'a'                },
  { w: 'C++', accent: true },
  { w: 'project'         },
  { w: 'in'              },
  { w: '2016.'           },
]

const STATS = [
  { num: '5+',  label: 'Years'       },
  { num: '40+', label: 'Projects'    },
  { num: '2',   label: 'Disciplines' },
]

/* ─────────────────────────────────────────────────────────────────
   AboutSection — pure content, no section wrapper, no scroll
   animation of its own.
   This used to be a standalone pinned section; it's now rendered as
   panel 0 inside WorkSection's shared sticky/panel-stack system, so
   About and the projects share ONE continuous pin — scrolling forward
   from About slides a project up to cover it exactly the way each
   project covers the one before it, with no hand-off to normal
   scroll in between. WorkSection's own gsap.context owns every
   animation here (selector-scoped to `.ab-word` etc.), timed against
   the shared scroll-jacked timeline — see WorkSection.tsx.
   ───────────────────────────────────────────────────────────────── */
export default function AboutSection({ settings = {} as Record<string, unknown> }: { settings?: Record<string, unknown> }) {
  const aboutImages = (settings.images as string[]) || ABOUT_IMAGES
  /* Static, not settings-driven — this was flipping back to stale DB
     content (an old version of this line) even after being updated
     there directly; hardcoding it removes that path entirely so what's
     in WORDS above is always exactly what renders. */
  /* Admin-editable markup ("*italic*" / "**accent**"), parsed into the
     same per-word shape WORDS already is — see src/lib/wordReveal.ts.
     Falls back to the hardcoded default the same way every other field
     on this page does when the setting hasn't been filled in yet. */
  const scrollRevealText = settings.scrollRevealText as string | undefined
  const aboutWords  = scrollRevealText?.trim() ? parseWordReveal(scrollRevealText) : WORDS
  const aboutStats  = (settings.stats as { num: string; label: string }[]) || STATS
  const storyP1     = (settings.storyParagraph1 as string) || "I didn't learn development in a classroom. I learned it by building projects, solving problems, breaking things, and figuring out how to make them work again. What started as curiosity became a long-term commitment to creating products that are useful, reliable, and enjoyable to use."
  const storyP2     = (settings.storyParagraph2 as string) || 'Being self-taught taught me more than programming. It taught me how to learn, adapt, and solve problems independently. Every project is another opportunity to improve, experiment, and create something meaningful.'
  const { setCursorType } = useCursorStore()
  const openFlourish = useGifFlourishStore((s) => s.open)

  /* ── Shared text sizes ── */
  const LABEL_STYLE: React.CSSProperties = {
    fontSize:      '10px',
    fontWeight:    600,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color:         `${INK}40`,
    display:       'block',
    marginBottom:  '10px',
  }

  return (
    <div
      className="ab-section"
      style={{
        background: BG,
        width:      '100%',
        height:     '100%',
        display:    'flex',
        flexDirection:  'column',
        justifyContent: 'space-between',
        padding:    'clamp(64px, 8vw, 108px) clamp(32px, 6.5vw, 96px)',
      }}
    >

      {/* ══ 1. BIG SECTION TITLE ═════════════════════════════════ */}
      <h2
        className="ab-title"
        style={{
          fontSize:      'clamp(72px, 11.5vw, 168px)',
          fontWeight:    800,
          letterSpacing: '-0.04em',
          lineHeight:    0.88,
          color:         INK,
          margin:        0,
          userSelect:    'none',
        }}
      >
        About
      </h2>

      {/* ══ 2. BODY: left bio + right word-scrub ════════════════
          CRITICAL: minmax(0, Xfr) instead of plain Xfr.
          Without the 0 minimum, a grid cell's implicit minimum
          is "auto" (= content width). The huge inline statement
          text would expand the right cell to thousands of pixels,
          crushing the left column to near-zero.
          minmax(0, Xfr) forces the minimum to 0 so the cell
          MUST stay within its fr share, causing the text to wrap.
          ═════════════════════════════════════════════════════════ */}
      <div
        className="ab-body"
        style={{
          display:             'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
          gap:                 'clamp(40px, 5.5vw, 88px)',
          alignItems:          'end',
        }}
      >

        {/* ── Left: bio blocks ──────────────────────────────── */}
        <div className="ab-bio-col" style={{ display: 'flex', flexDirection: 'column', gap: '2.4rem' }}>

          <div className="ab-left-item">
            <span style={LABEL_STYLE}>My Story</span>
            <p style={{ fontSize: '16px', lineHeight: 1.7, color: `${INK}85`, margin: 0, textAlign: 'justify' }}>
              {storyP1}
            </p>
          </div>

          <div
            className="ab-left-item"
            style={{ borderLeft: `2px solid ${ACC}`, paddingLeft: '16px' }}
          >
            <p style={{ fontSize: '16px', lineHeight: 1.7, color: `${INK}85`, margin: 0, textAlign: 'justify' }}>
              {storyP2}
            </p>
          </div>

        </div>

        {/* ── Right: scroll-scrubbed word reveal ────────────── */}
        <p
          className="ab-statement"
          style={{
            fontSize:      'clamp(40px, 5.8vw, 88px)',
            fontWeight:    800,
            letterSpacing: '-0.03em',
            lineHeight:    1.07,
            margin:        0,
            /* overflowWrap ensures very long words (if any) wrap */
            overflowWrap:  'break-word',
          }}
        >
          {aboutWords.map(({ w, italic, accent }, i) => {
            const wordSpan = (
              <span
                className="ab-word"
                style={{
                  display:     'inline',
                  opacity:     accent ? 0.30 : 0.07,
                  fontStyle:   italic ? 'italic'  : 'normal',
                  color:       accent  ? ACC       : INK,
                  ...(accent ? {
                    textDecorationLine:      'underline',
                    textDecorationColor:     ACC,
                    textUnderlineOffset:     '7px',
                    textDecorationThickness: '3px',
                  } : {}),
                }}
              >
                {w}
              </span>
            )

            /* A real space character between words — not just margin —
               gives the browser an actual line-break opportunity. Spans
               with zero whitespace between them (margin-only gap) can't
               wrap at ordinary word boundaries; on the mobile 1-column
               layout that showed up as either a mid-word split or, for
               longer sentences, no wrapping at all (silently clipped). */
            return (
              <Fragment key={i}>
                {accent ? <ImageCycler images={aboutImages}>{wordSpan}</ImageCycler> : wordSpan}
                {' '}
              </Fragment>
            )
          })}
        </p>

      </div>

      {/* ══ 3. FOOTER: stats + CTA ═══════════════════════════════ */}
      <div
        className="ab-footer"
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          flexWrap:       'wrap',
          gap:            '20px',
          borderTop:      `1px solid ${INK}12`,
          paddingTop:     'clamp(22px, 3.5vw, 36px)',
        }}
      >

        {/* Stats */}
        <div style={{ display: 'flex', gap: 'clamp(28px, 4.5vw, 64px)' }}>
          {aboutStats.map(({ num, label }) => (
            <div key={label} className="ab-stat">
              <div
                style={{
                  fontSize:      'clamp(22px, 2.6vw, 40px)',
                  fontWeight:    800,
                  letterSpacing: '-0.03em',
                  color:         INK,
                  lineHeight:    1,
                }}
              >
                {num}
              </div>
              <div
                style={{
                  fontSize:      '10px',
                  fontWeight:    500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color:         `${INK}42`,
                  marginTop:     '6px',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA — plays the GIF flourish, which opens the contact modal
            itself once it finishes */}
        <button
          type="button"
          onClick={openFlourish}
          className="ab-cta"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '10px',
            fontSize:       '12px',
            fontWeight:     600,
            letterSpacing:  '0.12em',
            textTransform:  'uppercase',
            color:          INK,
            background:     'none',
            border:         'none',
            borderBottom:   `1px solid ${INK}28`,
            paddingLeft:    0,
            paddingRight:   0,
            paddingTop:     0,
            paddingBottom:  '4px',
            cursor:         'none',
            transition:     'color 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = ACC
            e.currentTarget.style.borderColor = ACC
            setCursorType('hover')
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = INK
            e.currentTarget.style.borderColor = `${INK}28`
            setCursorType('default')
          }}
        >
          Have a project in mind?
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
            <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

      </div>

    </div>
  )
}
