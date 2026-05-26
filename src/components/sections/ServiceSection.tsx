'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'

gsap.registerPlugin(ScrollTrigger)

const CREAM = '#f0eeea'
const INK   = '#1a1a1a'
const ACC   = '#ff4d00'

/* ─── Services ───────────────────────────────────────────────────── */
const SERVICES = [
  { num: '01', label: 'Web Development',    tag: 'Full Stack'  },
  { num: '02', label: 'UI/UX Design',       tag: 'Interaction' },
  { num: '03', label: 'GSAP Animations',    tag: 'Motion'      },
  { num: '04', label: 'Creative Direction', tag: 'Concept'     },
  { num: '05', label: 'E-commerce',         tag: 'Commerce'    },
  { num: '06', label: 'CMS Integration',    tag: 'Content'     },
]

/* Per-service image: unique left offset for "own position" feel */
const IMG_OFFSETS = [
  { left: '4.5vw'  },
  { left: '3.0vw'  },
  { left: '5.0vw'  },
  { left: '3.5vw'  },
  { left: '4.0vw'  },
  { left: '3.0vw'  },
]

/* ─── Mockup previews ────────────────────────────────────────────── */
function ImgWebDev() {
  return (
    <div style={{ width:'100%', height:'100%', background:'#0c0c0c', fontFamily:'system-ui,sans-serif', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'5px', padding:'8px 12px', background:'#181818', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        {['rgba(255,90,90,0.8)','rgba(255,200,0,0.6)','rgba(50,205,100,0.6)'].map(c => <div key={c} style={{ width:'7px', height:'7px', borderRadius:'50%', background:c }}/>)}
        <div style={{ flex:1, marginLeft:'6px', background:'rgba(255,255,255,0.05)', borderRadius:'3px', padding:'3px 8px' }}>
          <span style={{ fontSize:'7px', color:'rgba(255,255,255,0.22)', fontFamily:'monospace' }}>localhost:3000</span>
        </div>
      </div>
      <div style={{ flex:1, padding:'18px 16px 0', display:'flex', gap:'14px' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'7px', color:'rgba(255,77,0,0.65)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'8px' }}>Creative Developer</div>
          <div style={{ fontSize:'clamp(16px,3vw,28px)', fontWeight:900, color:'#f0f0f0', letterSpacing:'-0.04em', lineHeight:0.9, marginBottom:'12px' }}>
            Building<br/><span style={{ color:'#ff4d00' }}>the web.</span>
          </div>
          <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
            {['Next.js','GSAP','TS','Tailwind'].map(t => (
              <span key={t} style={{ fontSize:'6px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'100px', padding:'2px 7px', color:'rgba(255,255,255,0.32)' }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ width:'38%', background:'linear-gradient(145deg,rgba(255,77,0,0.10),rgba(255,77,0,0.03))', borderRadius:'8px 8px 0 0', position:'relative', overflow:'hidden' }}>
          {[...Array(3)].map((_,i) => <div key={i} style={{ position:'absolute', border:`1px solid rgba(255,77,0,${0.07+i*0.06})`, borderRadius:'50%', width:`${55+i*35}%`, height:`${55+i*35}%`, top:'50%', left:'50%', transform:'translate(-50%,-50%)' }}/>)}
        </div>
      </div>
    </div>
  )
}

function ImgUIUX() {
  return (
    <div style={{ width:'100%', height:'100%', background:'#fafaf8', fontFamily:'system-ui,sans-serif', overflow:'hidden', padding:'12px 14px 0' }}>
      <div style={{ fontSize:'6px', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(0,0,0,0.22)', marginBottom:'10px' }}>Design System</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
        {[['#1a1a1a','#fff','Button'],['transparent','#555','Ghost'],['#f0f0f0','#999','Input'],['#fff','#1a1a1a','Card']].map(([bg,c,n]) => (
          <div key={n} style={{ background:bg as string, borderRadius:'5px', padding:'7px 9px', border: bg === 'transparent' ? '1px solid #ccc' : 'none', boxShadow: n === 'Card' ? '0 2px 6px rgba(0,0,0,0.07)' : 'none' }}>
            <div style={{ fontSize:'7px', fontWeight:700, color:c as string }}>{n}</div>
            <div style={{ height:'2px', background:'rgba(0,0,0,0.05)', borderRadius:'1px', width:'55%', marginTop:'3px' }}/>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:'4px', marginBottom:'8px' }}>
        {['#1a1a1a','#ff4d00','#f0eeea','#888','#e0dbd4','#bbb'].map(c => (
          <div key={c} style={{ flex:1, height:'20px', borderRadius:'3px', background:c, border:'1px solid rgba(0,0,0,0.07)' }}/>
        ))}
      </div>
      <div style={{ borderTop:'1px solid rgba(0,0,0,0.05)', paddingTop:'8px' }}>
        {[{s:'18px',w:900,t:'Display'},{s:'13px',w:700,t:'Heading'},{s:'10px',w:400,t:'Body'}].map(({s,w,t}) => (
          <div key={t} style={{ display:'flex', alignItems:'baseline', gap:'6px', marginBottom:'3px' }}>
            <span style={{ fontSize:s, fontWeight:w, color:'#111', lineHeight:1 }}>{t}</span>
            <span style={{ fontSize:'6px', color:'rgba(0,0,0,0.25)' }}>{s}/{w}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImgGSAP() {
  return (
    <div style={{ width:'100%', height:'100%', background:'#0a0a0a', fontFamily:'system-ui,sans-serif', overflow:'hidden', padding:'14px 16px' }}>
      <div style={{ fontSize:'6px', color:'rgba(255,77,0,0.55)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'10px' }}>GSAP Timeline</div>
      {[{l:'scale',w:0.94,d:0},{l:'opacity',w:0.68,d:0.05},{l:'y',w:0.80,d:0.03},{l:'blur',w:0.52,d:0.08},{l:'stagger',w:0.88,d:0.02}].map((item,i) => (
        <div key={item.l} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'7px' }}>
          <span style={{ fontSize:'6px', color:'rgba(255,255,255,0.18)', width:'32px', fontFamily:'monospace' }}>{item.l}</span>
          <div style={{ flex:1, height:'5px', background:'rgba(255,255,255,0.04)', borderRadius:'3px', overflow:'hidden', position:'relative' }}>
            <div style={{ position:'absolute', left:`${item.d*100}%`, width:`${(item.w-item.d)*100}%`, height:'100%', background:`rgba(255,77,0,${0.38+i*0.11})`, borderRadius:'3px' }}/>
          </div>
        </div>
      ))}
      <div style={{ marginTop:'10px', background:'rgba(255,255,255,0.03)', borderRadius:'5px', padding:'7px 9px', fontFamily:'monospace' }}>
        <div style={{ fontSize:'7px', color:'rgba(255,77,0,0.70)', marginBottom:'2px' }}>gsap.timeline(&#123;&#125;)</div>
        <div style={{ fontSize:'6px', color:'rgba(255,255,255,0.28)' }}>&nbsp;&nbsp;.from(el, &#123; y:40, opacity:0 &#125;)</div>
        <div style={{ fontSize:'6px', color:'rgba(255,255,255,0.28)' }}>&nbsp;&nbsp;.to(el2, &#123; scale:1 &#125;, &apos;-=0.2&apos;)</div>
      </div>
    </div>
  )
}

function ImgBrand() {
  return (
    <div style={{ width:'100%', height:'100%', background:'#f5f2ee', fontFamily:'system-ui,sans-serif', overflow:'hidden', padding:'14px 16px' }}>
      <div style={{ fontSize:'6px', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(0,0,0,0.25)', marginBottom:'12px' }}>Brand Identity</div>
      <div style={{ fontSize:'clamp(16px,2.8vw,24px)', fontWeight:900, color:'#1a1a1a', letterSpacing:'-0.04em', lineHeight:0.9, marginBottom:'10px' }}>Wordmark.</div>
      <div style={{ display:'flex', gap:'0', marginBottom:'10px', borderRadius:'6px', overflow:'hidden' }}>
        {[['#1a1a1a','50%'],['#ff4d00','20%'],['#f0eeea','15%'],['#888','10%'],['#e0dbd4','5%']].map(([c,w]) => (
          <div key={c} style={{ width:w as string, height:'28px', background:c as string }}/>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'4px' }}>
        {[
          'linear-gradient(135deg,#ffe8d0,#ffd0a0)',
          'linear-gradient(135deg,#1a1a1a,#333)',
          'linear-gradient(135deg,#f0eeea,#e0dbd4)',
          'linear-gradient(135deg,#ff4d00,#ff8040)',
          'linear-gradient(135deg,#c8c2b8,#b0a898)',
          'linear-gradient(135deg,#0a0a0a,#1a1a1a)',
        ].map((bg,i) => (
          <div key={i} style={{ aspectRatio:'1', borderRadius:'5px', background:bg }}/>
        ))}
      </div>
    </div>
  )
}

function ImgEcom() {
  return (
    <div style={{ width:'100%', height:'100%', background:'#f7f5f2', fontFamily:'system-ui,sans-serif', overflow:'hidden' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 12px', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize:'8px', fontWeight:800, color:'#111' }}>Shop</span>
        <div style={{ display:'flex', gap:'10px' }}>
          {['New In','Sale','About'].map(n => <span key={n} style={{ fontSize:'6px', color:'rgba(0,0,0,0.32)' }}>{n}</span>)}
        </div>
        <span style={{ fontSize:'7px', color:'rgba(0,0,0,0.38)' }}>Cart (2)</span>
      </div>
      <div style={{ padding:'10px 12px 0' }}>
        <div style={{ fontSize:'6px', letterSpacing:'0.10em', textTransform:'uppercase', color:'rgba(0,0,0,0.20)', marginBottom:'6px' }}>New Arrivals</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'5px', marginBottom:'9px' }}>
          {[{bg:'#e8e2d8',p:'AED 420'},{bg:'#d8d0c4',p:'AED 680'},{bg:'#ccc6ba',p:'AED 290'}].map(item => (
            <div key={item.bg} style={{ borderRadius:'6px', overflow:'hidden', background:item.bg, aspectRatio:'2/3', position:'relative' }}>
              <div style={{ position:'absolute', bottom:'5px', left:'3px', right:'3px', background:'rgba(255,255,255,0.90)', borderRadius:'2px', padding:'2px 4px' }}>
                <div style={{ fontSize:'6px', color:'#333', fontWeight:700 }}>{item.p}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:'#1a1a1a', borderRadius:'100px', padding:'6px 12px', display:'inline-flex', alignItems:'center', gap:'5px' }}>
          <span style={{ fontSize:'7px', color:'#fff', fontWeight:600 }}>Add to Cart →</span>
        </div>
      </div>
    </div>
  )
}

function ImgCMS() {
  return (
    <div style={{ width:'100%', height:'100%', background:'#fff', fontFamily:'system-ui,sans-serif', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#101010', padding:'7px 12px', display:'flex', alignItems:'center', gap:'8px' }}>
        <span style={{ fontSize:'8px', color:'rgba(255,255,255,0.42)', fontWeight:600 }}>Sanity Studio</span>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'4px' }}>
          <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#22c55e' }}/>
          <span style={{ fontSize:'6px', color:'rgba(255,255,255,0.25)' }}>Connected</span>
        </div>
      </div>
      <div style={{ flex:1, padding:'10px 14px' }}>
        <div style={{ fontSize:'6px', color:'rgba(0,0,0,0.26)', marginBottom:'8px', letterSpacing:'0.05em' }}>Documents · 4 total</div>
        {[{t:'Hero Section',s:'Published',time:'2h ago'},{t:'Blog Post',s:'Published',time:'1d ago'},{t:'About Page',s:'Draft',time:'5m ago'},{t:'Projects',s:'Published',time:'3d ago'}].map(item => (
          <div key={item.t} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(0,0,0,0.04)' }}>
            <div>
              <div style={{ fontSize:'8px', color:'#111', fontWeight:500 }}>{item.t}</div>
              <div style={{ fontSize:'6px', color:'rgba(0,0,0,0.26)', marginTop:'1px' }}>{item.time}</div>
            </div>
            <span style={{ fontSize:'6px', borderRadius:'3px', padding:'2px 6px', fontWeight:600, background: item.s === 'Published' ? 'rgba(34,197,94,0.10)' : 'rgba(251,146,60,0.12)', color: item.s === 'Published' ? '#15803d' : '#c2650a' }}>{item.s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const PREVIEWS = [ImgWebDev, ImgUIUX, ImgGSAP, ImgBrand, ImgEcom, ImgCMS]

/* ─── Component ──────────────────────────────────────────────────── */
export default function ServiceSection() {
  const sectionRef  = useRef<HTMLElement>(null)
  const rowRefs     = useRef<(HTMLDivElement | null)[]>([])
  const labelRefs   = useRef<(HTMLSpanElement | null)[]>([])
  const tagRefs     = useRef<(HTMLSpanElement | null)[]>([])
  const numRefs     = useRef<(HTMLSpanElement | null)[]>([])
  const floatRef    = useRef<HTMLDivElement>(null)
  const previewRefs = useRef<(HTMLDivElement | null)[]>([])
  const prevIdx     = useRef(-1)
  const { setCursorType } = useCursorStore()
  const N = SERVICES.length

  /* ── Hover handlers ──────────────────────────────────────────── */
  const handleEnter = (idx: number) => {
    const row = rowRefs.current[idx]
    if (!row || !floatRef.current) return

    const prev = prevIdx.current

    /* Center the image vertically on the hovered row */
    const rect    = row.getBoundingClientRect()
    const centerY = rect.top + rect.height / 2

    /* Position float — each service has its own left offset */
    gsap.set(floatRef.current, {
      left: IMG_OFFSETS[idx].left,
      top:  centerY,
      y:    '-50%',
    })
    gsap.to(floatRef.current, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' })

    /* Swap preview image — kill stale tweens first so no leftover opacity
       from a skipped service, then drive every preview to its target state */
    previewRefs.current.forEach((el, i) => {
      if (!el) return
      gsap.killTweensOf(el)
      gsap.to(el, {
        opacity:  i === idx ? 1 : 0,
        duration: i === idx ? 0.35 : 0.15,
        ease:     i === idx ? 'power2.out' : 'power2.in',
      })
    })
    prevIdx.current = idx

    /* Only touch the outgoing and incoming labels — leave all others alone */
    if (prev >= 0 && prev !== idx) {
      if (labelRefs.current[prev])
        gsap.to(labelRefs.current[prev]!, { color: 'rgba(26,26,26,0.38)', duration: 0.28, ease: 'power2.out' })
      if (tagRefs.current[prev])
        gsap.to(tagRefs.current[prev]!,   { opacity: 0, x: 8, duration: 0.18 })
      if (numRefs.current[prev])
        gsap.to(numRefs.current[prev]!,   { opacity: 0.18, duration: 0.22 })
    }
    if (labelRefs.current[idx])
      gsap.to(labelRefs.current[idx]!, { color: INK, duration: 0.28, ease: 'power2.out' })
    if (tagRefs.current[idx])
      gsap.to(tagRefs.current[idx]!,   { opacity: 1, x: 0, duration: 0.24, ease: 'power2.out' })
    if (numRefs.current[idx])
      gsap.to(numRefs.current[idx]!,   { opacity: 0.55, duration: 0.22 })

    setCursorType('hover')
  }

  const handleLeave = () => {
    if (!floatRef.current) return
    gsap.to(floatRef.current, { opacity: 0, scale: 0.96, duration: 0.22, ease: 'power2.in' })

    labelRefs.current.forEach(el =>
      el && gsap.to(el, { color: 'rgba(26,26,26,0.38)', duration: 0.28, ease: 'power2.out' }))
    tagRefs.current.forEach(el =>
      el && gsap.to(el, { opacity: 0, x: 6, duration: 0.18 }))
    numRefs.current.forEach(el =>
      el && gsap.to(el, { opacity: 0.18, duration: 0.22 }))

    setCursorType('default')
  }

  /* ── Setup & entrance animations ────────────────────────────── */
  useEffect(() => {
    /* Initial states */
    labelRefs.current.forEach(el => el && gsap.set(el, { color: 'rgba(26,26,26,0.38)' }))
    tagRefs.current.forEach(el   => el && gsap.set(el, { opacity: 0, x: 6 }))
    numRefs.current.forEach(el   => el && gsap.set(el, { opacity: 0.18 }))
    previewRefs.current.forEach(el => el && gsap.set(el, { opacity: 0 }))
    if (floatRef.current) gsap.set(floatRef.current, { opacity: 0, scale: 0.96 })

    const ctx = gsap.context(() => {
      /* Heading drops in */
      gsap.from('.sv-title', {
        y: -28, opacity: 0, duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current!, start: 'top 80%' },
      })
      /* Rows stagger in from left */
      gsap.from('.sv-row', {
        x: -24, opacity: 0, duration: 0.65, ease: 'power3.out', stagger: 0.055,
        scrollTrigger: { trigger: '.sv-list', start: 'top 72%' },
      })
      /* CTA fades up */
      gsap.from('.sv-cta-wrap', {
        y: 20, opacity: 0, duration: 0.70, ease: 'power3.out',
        scrollTrigger: { trigger: '.sv-cta-wrap', start: 'top 92%' },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{ background: CREAM, position: 'relative', zIndex: 2 }}
      onMouseLeave={handleLeave}
    >

      {/* ══ HEADING — identical to About ════════════════════════════ */}
      <div style={{ padding: 'clamp(64px,8vw,108px) clamp(32px,6.5vw,96px) 0' }}>
        <h2
          className="sv-title"
          style={{
            fontSize:      'clamp(72px, 11.5vw, 168px)',
            fontWeight:    800,
            letterSpacing: '-0.04em',
            lineHeight:    0.88,
            color:         INK,
            margin:        0,
            marginBottom:  'clamp(40px, 6vw, 80px)',
            userSelect:    'none',
          }}
        >
          Services
        </h2>
      </div>

      {/* ══ SERVICE LIST ════════════════════════════════════════════ */}
      <div
        className="sv-list"
        style={{
          paddingLeft:  '34vw',
          paddingRight: 'clamp(32px, 6.5vw, 96px)',
        }}
      >
        <div style={{ borderTop: `1px solid rgba(26,26,26,0.10)` }}>
          {SERVICES.map((s, i) => (
            <div
              key={s.num}
              className="sv-row"
              ref={el => { rowRefs.current[i] = el }}
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={handleLeave}
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        'clamp(12px, 1.6vw, 22px) 0',
                borderBottom:   `1px solid rgba(26,26,26,0.10)`,
                cursor:         'none',
              }}
            >
              {/* Name + tag */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flex: 1, minWidth: 0 }}>
                <span
                  ref={el => { labelRefs.current[i] = el }}
                  style={{
                    fontSize:      'clamp(32px, 5.2vw, 82px)',
                    fontWeight:    800,
                    letterSpacing: '-0.03em',
                    lineHeight:    1.0,
                    textTransform: 'uppercase',
                    color:         'rgba(26,26,26,0.38)',
                    userSelect:    'none',
                    flexShrink:    0,
                  }}
                >
                  {s.label}
                </span>
                <span
                  ref={el => { tagRefs.current[i] = el }}
                  style={{
                    fontSize:      '10px',
                    fontWeight:    600,
                    letterSpacing: '0.20em',
                    textTransform: 'uppercase',
                    color:         'rgba(26,26,26,0.38)',
                    opacity:       0,
                    whiteSpace:    'nowrap',
                    flexShrink:    0,
                  }}
                >
                  {s.tag}
                </span>
              </div>

              {/* Number */}
              <span
                ref={el => { numRefs.current[i] = el }}
                style={{
                  fontSize:      '10px',
                  fontWeight:    600,
                  letterSpacing: '0.18em',
                  color:         INK,
                  opacity:       0.18,
                  flexShrink:    0,
                  marginLeft:    '12px',
                }}
              >
                {s.num}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SEE ALL — same as About CTA ════════════════════════════ */}
      <div
        className="sv-cta-wrap"
        style={{
          display:        'flex',
          justifyContent: 'center',
          padding:        'clamp(40px, 6vw, 80px) clamp(32px, 6.5vw, 96px)',
          margin:         '0 clamp(32px, 6.5vw, 96px)',
          borderTop:      `1px solid rgba(26,26,26,0.10)`,
        }}
      >
        <Link
          href="/work"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '10px',
            fontSize:       '12px',
            fontWeight:     600,
            letterSpacing:  '0.12em',
            textTransform:  'uppercase',
            color:          INK,
            textDecoration: 'none',
            borderBottom:   `1px solid rgba(26,26,26,0.28)`,
            paddingBottom:  '4px',
            transition:     'color 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = ACC; e.currentTarget.style.borderColor = ACC; setCursorType('hover') }}
          onMouseLeave={e => { e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = 'rgba(26,26,26,0.28)'; setCursorType('default') }}
        >
          See all services
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
            <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      {/* ══ FLOATING IMAGE — fixed, appears on hover ════════════════
          position:fixed keeps it in viewport regardless of scroll.
          Top is set dynamically to the hovered row's center.
          Each service has its own left offset.
          ═══════════════════════════════════════════════════════════ */}
      <div
        ref={floatRef}
        style={{
          position:     'fixed',
          width:        'min(25vw, 340px)',
          aspectRatio:  '4/3',
          pointerEvents:'none',
          zIndex:       200,
          opacity:      0,
          borderRadius: '14px',
          overflow:     'hidden',
          boxShadow:    '0 24px 60px rgba(0,0,0,0.13), 0 2px 0 rgba(255,255,255,0.45) inset',
          border:       '1px solid rgba(0,0,0,0.07)',
        }}
      >
        {PREVIEWS.map((Preview, i) => (
          <div
            key={i}
            ref={el => { previewRefs.current[i] = el }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <Preview />
          </div>
        ))}
      </div>

    </section>
  )
}
