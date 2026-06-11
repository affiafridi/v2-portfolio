'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'

gsap.registerPlugin(ScrollTrigger)

/* ─── Palette ────────────────────────────────────────────────────── */
const DARK  = '#0a0a0a'
const CREAM = '#f0eeea'
const ACC   = '#ff4d00'

/* ─── Data ───────────────────────────────────────────────────────── */
interface Tech { name: string; slug: string; color: string }
interface Cat  { num: string; label: string; desc: string; items: Tech[] }

const STACK: Cat[] = [
  {
    num: '01', label: 'Languages', desc: 'The languages I think in',
    items: [
      { name: 'JavaScript', slug: 'javascript', color: 'F7DF1E' },
      { name: 'TypeScript', slug: 'typescript',  color: '3178C6' },
      { name: 'Python',     slug: 'python',       color: '3776AB' },
      { name: 'PHP',        slug: 'php',          color: '777BB4' },
      { name: 'SQL',        slug: 'mysql',        color: '4479A1' },
      { name: 'Bash',       slug: 'gnubash',      color: '4EAA25' },
    ],
  },
  {
    num: '02', label: 'Frameworks', desc: 'The frameworks I build with',
    items: [
      { name: 'Next.js',  slug: 'nextdotjs',  color: 'eeeeee' },
      { name: 'React',    slug: 'react',      color: '61DAFB' },
      { name: 'Vue.js',   slug: 'vuedotjs',   color: '4FC08D' },
      { name: 'Node.js',  slug: 'nodedotjs',  color: '339933' },
      { name: 'Express',  slug: 'express',    color: 'aaaaaa' },
      { name: 'Laravel',  slug: 'laravel',    color: 'FF2D20' },
      { name: 'Nuxt.js',  slug: 'nuxtdotjs',  color: '00DC82' },
    ],
  },
  {
    num: '03', label: 'Motion & 3D', desc: 'Tools that bring things to life',
    items: [
      { name: 'GSAP',          slug: 'greensock', color: '88CE02' },
      { name: 'Framer Motion', slug: 'framer',    color: '6699FF' },
      { name: 'Three.js',      slug: 'threedotjs',color: 'cccccc' },
      { name: 'Lenis',         slug: '',           color: 'f0eeea' },
      { name: 'ScrollTrigger', slug: 'greensock', color: '88CE02' },
      { name: 'Anime.js',      slug: '',           color: 'f0eeea' },
    ],
  },
  {
    num: '04', label: 'Styling', desc: 'How I make things look right',
    items: [
      { name: 'Tailwind CSS',  slug: 'tailwindcss',     color: '06B6D4' },
      { name: 'Sass',          slug: 'sass',             color: 'CC6699' },
      { name: 'CSS Modules',   slug: 'css3',             color: '1572B6' },
      { name: 'Styled Comps',  slug: 'styledcomponents', color: 'DB7093' },
      { name: 'PostCSS',       slug: 'postcss',          color: 'DD3A0A' },
      { name: 'Radix UI',      slug: 'radixui',          color: 'cccccc' },
    ],
  },
  {
    num: '05', label: 'CMS & Headless', desc: 'Content infrastructure',
    items: [
      { name: 'Sanity',      slug: 'sanity',     color: 'F03E2F' },
      { name: 'Contentful',  slug: 'contentful', color: '2478CC' },
      { name: 'WordPress',   slug: 'wordpress',  color: '21759B' },
      { name: 'Webflow',     slug: 'webflow',    color: '4353FF' },
      { name: 'Shopify',     slug: 'shopify',    color: '7AB55C' },
      { name: 'Strapi',      slug: 'strapi',     color: '4945FF' },
    ],
  },
  {
    num: '06', label: 'DevOps & Tools', desc: 'How I ship and collaborate',
    items: [
      { name: 'Git',     slug: 'git',              color: 'F05032' },
      { name: 'Docker',  slug: 'docker',           color: '2496ED' },
      { name: 'Vercel',  slug: 'vercel',           color: 'cccccc' },
      { name: 'AWS',     slug: 'amazonaws',        color: 'FF9900' },
      { name: 'Figma',   slug: 'figma',            color: 'F24E1E' },
      { name: 'Postman', slug: 'postman',          color: 'FF6C37' },
      { name: 'VS Code', slug: 'visualstudiocode', color: '007ACC' },
    ],
  },
  {
    num: '07', label: 'CRM & SaaS', desc: 'Platforms and integrations',
    items: [
      { name: 'Stripe',     slug: 'stripe',     color: '635BFF' },
      { name: 'Supabase',   slug: 'supabase',   color: '3ECF8E' },
      { name: 'Firebase',   slug: 'firebase',   color: 'FFCA28' },
      { name: 'HubSpot',    slug: 'hubspot',    color: 'FF7A59' },
      { name: 'Salesforce', slug: 'salesforce', color: '00A1E0' },
      { name: 'Klaviyo',    slug: 'klaviyo',    color: 'cccccc' },
    ],
  },
  {
    num: '08', label: 'Web Solutions', desc: 'What I build end-to-end',
    items: [
      { name: 'E-commerce', slug: 'shopify',    color: '7AB55C' },
      { name: 'SaaS Apps',  slug: 'supabase',   color: '3ECF8E' },
      { name: 'Dashboards', slug: 'chartdotjs', color: 'FF6384' },
      { name: 'REST APIs',  slug: 'postman',    color: 'FF6C37' },
      { name: 'GraphQL',    slug: 'graphql',    color: 'E10098' },
      { name: 'PWAs',       slug: 'pwa',        color: '5A0FC8' },
    ],
  },
]

/* ─── Initials fallback ──────────────────────────────────────────── */
function Initials({ name, color }: { name: string; color: string }) {
  const abbr = name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: 30, height: 30, borderRadius: 7,
      background: `#${color}18`, border: `1px solid #${color}38`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '9px', fontWeight: 800, color: `#${color}`,
      fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '-0.02em', flexShrink: 0,
    }}>
      {abbr}
    </div>
  )
}

/* ─── Logo card ───────────────────────────────────────────────────── */
function TechCard({ tech }: { tech: Tech }) {
  const { setCursorType } = useCursorStore()
  const cardRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const [imgErr, setImgErr] = useState(false)

  const onEnter = () => {
    /* Kill any in-flight tweens on this card first — prevents stacking */
    gsap.killTweensOf(cardRef.current)
    gsap.killTweensOf(nameRef.current)
    gsap.to(cardRef.current, {
      backgroundColor: `#${tech.color}14`,
      borderColor:     `#${tech.color}35`,
      y: -4,
      duration: 0.20, ease: 'power2.out',
    })
    gsap.to(nameRef.current, { color: CREAM, duration: 0.16 })
    setCursorType('hover')
  }

  const onLeave = () => {
    gsap.killTweensOf(cardRef.current)
    gsap.killTweensOf(nameRef.current)
    gsap.to(cardRef.current, {
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderColor:     'rgba(255,255,255,0.07)',
      y: 0,
      duration: 0.22, ease: 'power2.out',
    })
    gsap.to(nameRef.current, { color: 'rgba(240,238,234,0.45)', duration: 0.18 })
    setCursorType('default')
  }

  return (
    <div
      ref={cardRef}
      className="sk-logo-card"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        border:          '1px solid rgba(255,255,255,0.07)',
        borderRadius:    '14px',
        padding:         'clamp(14px, 1.8vw, 20px)',
        cursor:          'none',
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'flex-start',
        gap:             '12px',
        opacity:         0,       /* hidden until GSAP reveals */
        willChange:      'transform, opacity',
      }}
    >
      {tech.slug && !imgErr ? (
        <img
          src={`https://cdn.simpleicons.org/${tech.slug}/${tech.color}`}
          alt=""
          width={30}
          height={30}
          style={{ display: 'block', objectFit: 'contain', opacity: 0.88, flexShrink: 0 }}
          onError={() => setImgErr(true)}
        />
      ) : (
        <Initials name={tech.name} color={tech.color} />
      )}
      <span
        ref={nameRef}
        style={{
          fontSize:      'clamp(10px, 0.82vw, 12.5px)',
          fontWeight:    500,
          letterSpacing: '0.04em',
          color:         'rgba(240,238,234,0.45)',
          lineHeight:    1.3,
        }}
      >
        {tech.name}
      </span>
    </div>
  )
}

/* ─── Section ────────────────────────────────────────────────────── */
export default function StackSection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef    = useRef<HTMLDivElement>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { setCursorType } = useCursorStore()

  /* Debounced switch — 80ms prevents triggering on fast mouse passes   */
  const switchCategory = useCallback((idx: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setActiveIdx(idx), 80)
  }, [])

  /* Animate logo cards in on every category change.
     gsap.killTweensOf([...cards]) cancels any previous in-flight
     animation before starting the new one — this is the key fix
     for the "stacks on all tabs" bug.                                  */
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cards = grid.querySelectorAll<HTMLElement>('.sk-logo-card')
    if (!cards.length) return

    gsap.killTweensOf([...cards])
    gsap.fromTo(
      [...cards],
      { opacity: 0, filter: 'blur(10px)', x: 8 },
      {
        opacity: 1, filter: 'blur(0px)', x: 0,
        duration: 0.42, stagger: { each: 0.055, from: 'start' },
        ease: 'power2.out', overwrite: true,
      },
    )
  }, [activeIdx])

  /* Section entry */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.sk-title', {
        y: -30, opacity: 0, duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current!, start: 'top 80%', once: true },
      })
      gsap.from('.sk-sublabel', {
        y: 14, opacity: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current!, start: 'top 80%', once: true },
      })
      gsap.from('.sk-tab', {
        y: -12, opacity: 0, duration: 0.55, ease: 'power3.out', stagger: 0.045,
        scrollTrigger: { trigger: sectionRef.current!, start: 'top 75%', once: true },
      })
      gsap.from('.sk-grid-wrap', {
        y: 24, opacity: 0, duration: 0.70, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current!, start: 'top 72%', once: true },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const cat = STACK[activeIdx]

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: DARK,
        backgroundImage: 'radial-gradient(rgba(240,238,234,0.030) 1px, transparent 1px)',
        backgroundSize:  '26px 26px',
        position:        'relative',
        zIndex:          2,
        padding:         'clamp(64px,8vw,108px) clamp(32px,6.5vw,96px)',
      }}
    >

      {/* ── Heading ─────────────────────────────────────────────── */}
      <div style={{
        display:        'flex',
        alignItems:     'flex-end',
        justifyContent: 'space-between',
        paddingBottom:  'clamp(32px, 4vw, 52px)',
        borderBottom:   '1px solid rgba(240,238,234,0.06)',
        marginBottom:   'clamp(0px, 0vw, 0px)',   /* tabs sit right below */
      }}>
        <h2 className="sk-title" style={{
          fontSize:      'clamp(72px, 11.5vw, 168px)',
          fontWeight:    800,
          letterSpacing: '-0.04em',
          lineHeight:    0.88,
          color:         CREAM,
          margin:        0,
          userSelect:    'none',
        }}>
          Stack
        </h2>
        <span className="sk-sublabel" style={{
          fontSize:      '11px',
          fontWeight:    600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         ACC,
          paddingBottom: '12px',
        }}>
          Technologies & Tools
        </span>
      </div>

      {/* ── Horizontal tab row ──────────────────────────────────── */}
      {/*
          Pure CSS transitions drive the active-state colours.
          No GSAP on the tabs themselves — eliminates the stacking
          problem entirely for the tab indicator.
          marginBottom: -1px lets the active tab's 2px border sit
          flush over the row's 1px border-bottom for a clean underline.
      */}
      <div style={{
        display:      'flex',
        alignItems:   'flex-end',
        overflowX:    'auto',
        borderBottom: '1px solid rgba(240,238,234,0.08)',
        marginBottom: 'clamp(28px, 3.5vw, 48px)',
        gap:          0,
        scrollbarWidth: 'none',
      }}>
        {STACK.map((c, i) => (
          <div
            key={c.num}
            className="sk-tab"
            onMouseEnter={() => { switchCategory(i); setCursorType('hover') }}
            onMouseLeave={() => setCursorType('default')}
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            '7px',
              padding:        'clamp(12px,1.4vw,16px) clamp(14px,1.8vw,22px)',
              cursor:         'none',
              flexShrink:     0,
              whiteSpace:     'nowrap',
              marginBottom:   '-1px',       /* underline flush trick */
              borderBottom:   `2px solid ${i === activeIdx ? ACC : 'transparent'}`,
              transition:     'border-color 0.22s ease',
            }}
          >
            <span style={{
              fontSize:      '9px',
              fontWeight:    700,
              letterSpacing: '0.14em',
              color:         i === activeIdx ? ACC : 'rgba(255,77,0,0.28)',
              transition:    'color 0.22s ease',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {c.num}
            </span>
            <span style={{
              fontSize:      'clamp(10.5px, 0.92vw, 13px)',
              fontWeight:    600,
              letterSpacing: '-0.01em',
              color:         i === activeIdx ? CREAM : 'rgba(240,238,234,0.28)',
              transition:    'color 0.22s ease',
            }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Logo grid ────────────────────────────────────────────── */}
      <div className="sk-grid-wrap">

        {/* Active category sub-header */}
        <div style={{
          display:       'flex',
          alignItems:    'baseline',
          gap:           '10px',
          marginBottom:  'clamp(18px, 2.2vw, 28px)',
        }}>
          <span style={{
            fontSize:      '9px',
            fontWeight:    700,
            letterSpacing: '0.16em',
            color:         ACC,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {cat.num}
          </span>
          <span style={{
            fontSize:      '11px',
            fontWeight:    600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         'rgba(240,238,234,0.32)',
          }}>
            {cat.label}
          </span>
          <span style={{
            fontSize:  '11px',
            color:     CREAM,
            marginLeft:'auto',
            letterSpacing: '0.08em',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {String(cat.items.length).padStart(2, '0')} tools
          </span>
        </div>

        {/* Cards */}
        <div
          ref={gridRef}
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(100px,11vw,138px),1fr))',
            gap:                 '10px',
          }}
        >
          {cat.items.map(tech => (
            <TechCard key={`${cat.num}-${tech.name}`} tech={tech} />
          ))}
        </div>

        {/* Category description */}
        <p style={{
          marginTop:     'clamp(16px, 2vw, 24px)',
          fontSize:      '11px',
          letterSpacing: '0.05em',
          color:         'rgba(240,238,234,0.16)',
          lineHeight:    1.6,
        }}>
          {cat.desc}
        </p>

      </div>
    </section>
  )
}
