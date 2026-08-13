'use client'

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'
import type { CursorType } from '@/types'
import FooterSection from '@/components/sections/FooterSection'

interface ServiceData {
  slug: string; num: string; title: string; tag: string; description: string
  points: string[]; deliverables: string[]; image: string | null
}

gsap.registerPlugin(ScrollTrigger)

const CREAM = '#f0eeea'
const INK   = '#1a1a1a'
const ACC   = '#ff4d00'

/* ─── Service mockup previews ────────────────────────────────────── */
function PreviewWebDev() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#0c0c0c',display:'flex',flexDirection:'column',overflow:'hidden' }}>
      <div style={{ display:'flex',alignItems:'center',gap:'5px',padding:'10px 14px',background:'#181818',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        {['rgba(255,90,90,0.8)','rgba(255,200,0,0.6)','rgba(50,205,100,0.6)'].map(c=><div key={c} style={{ width:'8px',height:'8px',borderRadius:'50%',background:c }}/>)}
        <div style={{ flex:1,marginLeft:'8px',background:'rgba(255,255,255,0.05)',borderRadius:'4px',padding:'4px 10px' }}>
          <span style={{ fontSize:'8px',color:'rgba(255,255,255,0.22)',fontFamily:'var(--font-geist-mono),monospace' }}>localhost:3000</span>
        </div>
      </div>
      <div style={{ flex:1,padding:'22px 20px 0',display:'flex',gap:'16px' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'8px',color:'rgba(255,77,0,0.65)',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'10px' }}>Creative Developer</div>
          <div style={{ fontSize:'clamp(18px,2.5vw,30px)',fontWeight:900,color:'#f0f0f0',letterSpacing:'-0.04em',lineHeight:0.9,marginBottom:'14px' }}>Building<br/><span style={{ color:'#ff4d00' }}>the web.</span></div>
          <div style={{ display:'flex',gap:'5px',flexWrap:'wrap' }}>
            {['Next.js','GSAP','TS','Tailwind'].map(t=><span key={t} style={{ fontSize:'7px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'100px',padding:'3px 8px',color:'rgba(255,255,255,0.32)' }}>{t}</span>)}
          </div>
        </div>
        <div style={{ width:'38%',background:'linear-gradient(145deg,rgba(255,77,0,0.10),rgba(255,77,0,0.03))',borderRadius:'8px 8px 0 0',position:'relative',overflow:'hidden' }}>
          {[...Array(3)].map((_,i)=><div key={i} style={{ position:'absolute',border:`1px solid rgba(255,77,0,${0.07+i*0.06})`,borderRadius:'50%',width:`${55+i*35}%`,height:`${55+i*35}%`,top:'50%',left:'50%',transform:'translate(-50%,-50%)' }}/>)}
        </div>
      </div>
    </div>
  )
}
function PreviewUIUX() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#fafaf8',overflow:'hidden',padding:'16px 18px 0' }}>
      <div style={{ fontSize:'7px',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(0,0,0,0.22)',marginBottom:'12px' }}>Design System</div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px' }}>
        {[['#1a1a1a','#fff','Button'],['transparent','#555','Ghost'],['#f0f0f0','#999','Input'],['#fff','#1a1a1a','Card']].map(([bg,c,n])=>(
          <div key={n} style={{ background:bg as string,borderRadius:'6px',padding:'9px 11px',border:bg==='transparent'?'1px solid #ccc':'none' }}>
            <div style={{ fontSize:'8px',fontWeight:700,color:c as string }}>{n}</div>
            <div style={{ height:'2px',background:'rgba(0,0,0,0.05)',borderRadius:'1px',width:'55%',marginTop:'4px' }}/>
          </div>
        ))}
      </div>
      <div style={{ display:'flex',gap:'5px',marginBottom:'10px' }}>
        {['#1a1a1a','#ff4d00','#f0eeea','#888','#e0dbd4','#bbb'].map(c=><div key={c} style={{ flex:1,height:'22px',borderRadius:'4px',background:c }}/>)}
      </div>
      <div style={{ borderTop:'1px solid rgba(0,0,0,0.05)',paddingTop:'10px' }}>
        {[{s:'20px',w:900,t:'Display'},{s:'14px',w:700,t:'Heading'},{s:'11px',w:400,t:'Body'}].map(({s,w,t})=>(
          <div key={t} style={{ display:'flex',alignItems:'baseline',gap:'7px',marginBottom:'4px' }}>
            <span style={{ fontSize:s,fontWeight:w,color:'#111',lineHeight:1 }}>{t}</span>
            <span style={{ fontSize:'7px',color:'rgba(0,0,0,0.25)' }}>{s}/{w}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
function PreviewMotion() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#0a0a0a',overflow:'hidden',padding:'18px 20px' }}>
      <div style={{ fontSize:'7px',color:'rgba(255,77,0,0.55)',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'12px' }}>GSAP Timeline</div>
      {[{l:'scale',w:0.94,d:0},{l:'opacity',w:0.68,d:0.05},{l:'y',w:0.80,d:0.03},{l:'blur',w:0.52,d:0.08},{l:'stagger',w:0.88,d:0.02}].map((item,i)=>(
        <div key={item.l} style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'9px' }}>
          <span style={{ fontSize:'7px',color:'rgba(255,255,255,0.18)',width:'36px',fontFamily:'var(--font-geist-mono),monospace' }}>{item.l}</span>
          <div style={{ flex:1,height:'5px',background:'rgba(255,255,255,0.04)',borderRadius:'3px',overflow:'hidden',position:'relative' }}>
            <div style={{ position:'absolute',left:`${item.d*100}%`,width:`${(item.w-item.d)*100}%`,height:'100%',background:`rgba(255,77,0,${0.38+i*0.11})`,borderRadius:'3px' }}/>
          </div>
        </div>
      ))}
      <div style={{ marginTop:'14px',background:'rgba(255,255,255,0.03)',borderRadius:'6px',padding:'9px 11px',fontFamily:'var(--font-geist-mono),monospace' }}>
        <div style={{ fontSize:'8px',color:'rgba(255,77,0,0.70)',marginBottom:'3px' }}>gsap.timeline(&#123;&#125;)</div>
        <div style={{ fontSize:'7px',color:'rgba(255,255,255,0.28)' }}>&nbsp;&nbsp;.from(el,&#123;y:40,opacity:0&#125;)</div>
        <div style={{ fontSize:'7px',color:'rgba(255,255,255,0.28)' }}>&nbsp;&nbsp;.to(el2,&#123;scale:1&#125;,&apos;-=0.2&apos;)</div>
      </div>
    </div>
  )
}
function PreviewBrand() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#f5f2ee',overflow:'hidden',padding:'18px 20px' }}>
      <div style={{ fontSize:'7px',letterSpacing:'0.14em',textTransform:'uppercase',color:'rgba(0,0,0,0.25)',marginBottom:'14px' }}>Brand Identity</div>
      <div style={{ fontSize:'clamp(18px,2.5vw,26px)',fontWeight:900,color:'#1a1a1a',letterSpacing:'-0.04em',lineHeight:0.9,marginBottom:'12px' }}>Wordmark.</div>
      <div style={{ display:'flex',marginBottom:'12px',borderRadius:'7px',overflow:'hidden' }}>
        {[['#1a1a1a','50%'],['#ff4d00','20%'],['#f0eeea','15%'],['#888','10%'],['#e0dbd4','5%']].map(([c,w])=><div key={c} style={{ width:w as string,height:'28px',background:c as string }}/>)}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'5px' }}>
        {['linear-gradient(135deg,#ffe8d0,#ffd0a0)','linear-gradient(135deg,#1a1a1a,#333)','linear-gradient(135deg,#f0eeea,#e0dbd4)','linear-gradient(135deg,#ff4d00,#ff8040)','linear-gradient(135deg,#c8c2b8,#b0a898)','linear-gradient(135deg,#0a0a0a,#1a1a1a)'].map((bg,i)=>(
          <div key={i} style={{ aspectRatio:'1',borderRadius:'5px',background:bg }}/>
        ))}
      </div>
    </div>
  )
}
function PreviewEcom() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#f7f5f2',overflow:'hidden' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 14px',borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize:'9px',fontWeight:800,color:'#111' }}>Shop</span>
        <div style={{ display:'flex',gap:'12px' }}>{['New In','Sale','About'].map(n=><span key={n} style={{ fontSize:'7px',color:'rgba(0,0,0,0.32)' }}>{n}</span>)}</div>
        <span style={{ fontSize:'8px',color:'rgba(0,0,0,0.38)' }}>Cart (2)</span>
      </div>
      <div style={{ padding:'12px 14px 0' }}>
        <div style={{ fontSize:'7px',letterSpacing:'0.10em',textTransform:'uppercase',color:'rgba(0,0,0,0.20)',marginBottom:'8px' }}>New Arrivals</div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'6px',marginBottom:'11px' }}>
          {[{bg:'#e8e2d8',p:'AED 420'},{bg:'#d8d0c4',p:'AED 680'},{bg:'#ccc6ba',p:'AED 290'}].map(item=>(
            <div key={item.bg} style={{ borderRadius:'7px',overflow:'hidden',background:item.bg,aspectRatio:'2/3',position:'relative' }}>
              <div style={{ position:'absolute',bottom:'6px',left:'4px',right:'4px',background:'rgba(255,255,255,0.90)',borderRadius:'3px',padding:'3px 5px' }}>
                <div style={{ fontSize:'7px',color:'#333',fontWeight:700 }}>{item.p}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:'#1a1a1a',borderRadius:'100px',padding:'7px 14px',display:'inline-flex',alignItems:'center',gap:'6px' }}>
          <span style={{ fontSize:'8px',color:'#fff',fontWeight:600 }}>Add to Cart →</span>
        </div>
      </div>
    </div>
  )
}
function PreviewCMS() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#fff',display:'flex',flexDirection:'column' }}>
      <div style={{ background:'#101010',padding:'9px 14px',display:'flex',alignItems:'center',gap:'10px' }}>
        <span style={{ fontSize:'9px',color:'rgba(255,255,255,0.42)',fontWeight:600 }}>Sanity Studio</span>
        <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:'5px' }}>
          <div style={{ width:'7px',height:'7px',borderRadius:'50%',background:'#22c55e' }}/>
          <span style={{ fontSize:'7px',color:'rgba(255,255,255,0.25)' }}>Live</span>
        </div>
      </div>
      <div style={{ flex:1,padding:'12px 16px' }}>
        {[{t:'Hero Section',s:'Published',time:'2h ago'},{t:'Blog Post',s:'Published',time:'1d ago'},{t:'About Page',s:'Draft',time:'5m ago'},{t:'Projects',s:'Published',time:'3d ago'}].map(item=>(
          <div key={item.t} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(0,0,0,0.04)' }}>
            <div>
              <div style={{ fontSize:'9px',color:'#111',fontWeight:500 }}>{item.t}</div>
              <div style={{ fontSize:'7px',color:'rgba(0,0,0,0.26)',marginTop:'1px' }}>{item.time}</div>
            </div>
            <span style={{ fontSize:'7px',borderRadius:'4px',padding:'2px 7px',fontWeight:600,background:item.s==='Published'?'rgba(34,197,94,0.10)':'rgba(251,146,60,0.12)',color:item.s==='Published'?'#15803d':'#c2650a' }}>{item.s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
function PreviewPerf() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#0d0d0d',overflow:'hidden',padding:'18px 20px' }}>
      <div style={{ fontSize:'7px',color:'rgba(255,77,0,0.55)',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'14px' }}>Lighthouse Score</div>
      {[{l:'Performance',v:96},{l:'Accessibility',v:100},{l:'Best Practices',v:95},{l:'SEO',v:100}].map(item=>(
        <div key={item.l} style={{ marginBottom:'11px' }}>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'4px' }}>
            <span style={{ fontSize:'7px',color:'rgba(255,255,255,0.35)' }}>{item.l}</span>
            <span style={{ fontSize:'7px',color:item.v>=95?'#22c55e':'rgba(255,77,0,0.8)',fontWeight:700,fontFamily:'var(--font-geist-mono),monospace' }}>{item.v}</span>
          </div>
          <div style={{ height:'4px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',overflow:'hidden' }}>
            <div style={{ height:'100%',width:`${item.v}%`,background:item.v>=95?'rgba(34,197,94,0.60)':'rgba(255,77,0,0.50)',borderRadius:'2px' }}/>
          </div>
        </div>
      ))}
      <div style={{ marginTop:'14px',fontSize:'7px',color:'rgba(255,255,255,0.15)',fontFamily:'var(--font-geist-mono),monospace' }}>FCP: 0.4s · LCP: 0.9s · CLS: 0</div>
    </div>
  )
}
function PreviewAPI() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#0a0f0a',overflow:'hidden',padding:'18px 20px' }}>
      <div style={{ fontSize:'7px',color:'rgba(34,197,94,0.60)',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'12px' }}>API Endpoints</div>
      {[{m:'GET',p:'/api/products',s:'200'},{m:'POST',p:'/api/orders',s:'201'},{m:'PUT',p:'/api/users/:id',s:'200'},{m:'DELETE',p:'/api/sessions',s:'204'}].map(item=>(
        <div key={item.p} style={{ display:'flex',alignItems:'center',gap:'10px',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize:'7px',fontWeight:700,fontFamily:'var(--font-geist-mono),monospace',color:item.m==='GET'?'rgba(34,197,94,0.80)':item.m==='POST'?'rgba(59,130,246,0.80)':item.m==='PUT'?'rgba(251,146,60,0.80)':'rgba(239,68,68,0.80)',width:'38px' }}>{item.m}</span>
          <span style={{ fontSize:'7px',color:'rgba(255,255,255,0.25)',fontFamily:'var(--font-geist-mono),monospace',flex:1 }}>{item.p}</span>
          <span style={{ fontSize:'7px',color:'rgba(34,197,94,0.70)',fontFamily:'var(--font-geist-mono),monospace' }}>{item.s}</span>
        </div>
      ))}
    </div>
  )
}

const PREVIEWS = [PreviewWebDev, PreviewUIUX, PreviewMotion, PreviewBrand, PreviewEcom, PreviewCMS, PreviewPerf, PreviewAPI]

/* ─── Single service row ─────────────────────────────────────────── */
function ServiceRow({ service, index, setCursorType, onDividerComplete, playFnRef }: {
  service:           ServiceData
  index:             number
  setCursorType:     (t: CursorType) => void
  onDividerComplete: () => void
  playFnRef:         { current: (() => void) | null }
}) {
  const rowRef               = useRef<HTMLDivElement>(null)
  const Preview              = PREVIEWS[index]
  const inViewRef            = useRef(false)
  const readyRef             = useRef(index === 0)
  const revealedRef          = useRef(false)          // plays once, never again
  const tlRef                = useRef<gsap.core.Timeline | null>(null)
  const onDividerCompleteRef = useRef(onDividerComplete)

  /* keep callback ref current without re-running the effect */
  useEffect(() => { onDividerCompleteRef.current = onDividerComplete })

  /* hide before first paint */
  useLayoutEffect(() => {
    const el = rowRef.current!
    gsap.set(el.querySelectorAll('.sr-num'),     { autoAlpha: 0, y: 12 })
    gsap.set(el.querySelectorAll('.sr-name'),    { autoAlpha: 0, y: 36, clipPath: 'inset(0 0 100% 0)' })
    gsap.set(el.querySelectorAll('.sr-desc'),    { autoAlpha: 0, filter: 'blur(8px)', y: 10 })
    gsap.set(el.querySelectorAll('.sr-pt'),      { autoAlpha: 0, x: -12 })
    gsap.set(el.querySelectorAll('.sr-cta'),     { autoAlpha: 0, y: 10 })
    gsap.set(el.querySelectorAll('.sr-img'),     { autoAlpha: 0, y: 28, scale: 0.96 })
    gsap.set(el.querySelectorAll('.sr-divider'), { clipPath: 'inset(0 100% 0 0)' })
  }, [])

  useEffect(() => {
    const el = rowRef.current!

    /* Play once — if already revealed, do nothing */
    const doPlay = () => {
      if (revealedRef.current) return
      revealedRef.current = true
      tlRef.current?.progress(0).play()
    }

    /* Snap to fully-visible end state without animation */
    const doSnap = () => {
      if (revealedRef.current) return
      revealedRef.current = true
      tlRef.current?.progress(1).pause()
    }

    /* Parent calls this when the previous row's divider finishes */
    playFnRef.current = () => {
      readyRef.current = true
      if (inViewRef.current) doPlay()
    }

    let st: ScrollTrigger | null = null

    const tl = gsap.timeline({ paused: true })

    tl.fromTo(el.querySelectorAll('.sr-num'),
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.40, ease: 'power2.out' })
      .fromTo(el.querySelectorAll('.sr-name'),
        { autoAlpha: 0, y: 36, clipPath: 'inset(0 0 100% 0)' },
        { autoAlpha: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.70, ease: 'expo.out' }, '-=0.22')
      .fromTo(el.querySelectorAll('.sr-img'),
        { autoAlpha: 0, y: 28, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out' }, '-=0.50')
      .fromTo(el.querySelectorAll('.sr-desc'),
        { autoAlpha: 0, filter: 'blur(8px)', y: 10 },
        { autoAlpha: 1, filter: 'blur(0px)', y: 0, duration: 0.50, ease: 'power2.out' }, '-=0.42')
      .fromTo(el.querySelectorAll('.sr-pt'),
        { autoAlpha: 0, x: -12 },
        { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power2.out', stagger: 0.05 }, '-=0.22')
      .fromTo(el.querySelectorAll('.sr-cta'),
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '-=0.18')
      .fromTo(el.querySelectorAll('.sr-divider'),
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.65, ease: 'power3.out',
          onComplete: () => onDividerCompleteRef.current() }, '+=0.10')

    tlRef.current = tl

    st = ScrollTrigger.create({
      trigger: el,
      start:   'top 80%',
      onEnter: () => {
        inViewRef.current = true
        if (readyRef.current) doPlay()
      },
      onLeaveBack: () => {
        inViewRef.current = false
        /* Snap to fully visible if skipped (scrolled too fast / never reached).
           Ensures no empty section on scroll-up. Animation stays permanent. */
        doSnap()
      },
    })

    return () => { tl.kill(); st?.kill() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  return (
    /* Outer wrapper — rowRef scope for GSAP context */
    <div ref={rowRef}>

      {/* Grid — padding lives here, NOT on the wrapper */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: '1fr minmax(0, 420px)',
          gap:                 'clamp(40px, 6vw, 88px)',
          padding:             'clamp(56px,7vw,96px) clamp(32px,6.5vw,96px)',
          alignItems:          'start',
        }}
      >
      {/* ── Left: content ──────────────────────────────────────── */}
      <div>

        {/* Section label + number */}
        <div className="sr-num" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'clamp(18px,2.8vw,30px)' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: `${INK}35` }}>
            What I Do
          </span>
          <span style={{ width: '1px', height: '14px', background: `${INK}18` }} />
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', color: ACC }}>
            {service.num}
          </span>
        </div>

        {/* Service name — large editorial heading */}
        <h2
          className="sr-name"
          style={{
            fontSize:      'clamp(48px, 7.5vw, 110px)',
            fontWeight:    800,
            letterSpacing: '-0.04em',
            lineHeight:    0.88,
            color:         INK,
            margin:        '0 0 clamp(20px, 3vw, 36px)',
            textTransform: 'uppercase',
          }}
        >
          {service.title}
        </h2>

        {/* Description */}
        <p
          className="sr-desc"
          style={{
            fontSize:   'clamp(13px, 1.2vw, 16px)',
            lineHeight:  1.70,
            color:      `${INK}65`,
            maxWidth:   '54ch',
            margin:     '0 0 clamp(16px, 2.5vw, 24px)',
          }}
        >
          {service.description}
        </p>

        {/* Points — 2-column grid, uppercase tracking text */}
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'auto auto',
            gap:                 '0',
            width:               'fit-content',
            marginBottom:        'clamp(22px, 3vw, 36px)',
            borderTop:           `1px solid ${INK}0e`,
          }}
        >
          {service.points.map((pt, pi) => (
            <div
              key={pi}
              className="sr-pt"
              style={{
                padding:       '8px 0',
                borderBottom:  `1px solid ${INK}0e`,
                borderRight:   pi % 2 === 0 ? `1px solid ${INK}0e` : 'none',
                paddingRight:  pi % 2 === 0 ? '28px' : '0',
                paddingLeft:   pi % 2 === 1 ? '20px' : '0',
                fontSize:      '10px',
                fontWeight:    600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color:         `${INK}60`,
                lineHeight:    1.4,
                whiteSpace:    'nowrap',
              }}
            >
              {pt}
            </div>
          ))}
        </div>

        {/* Learn More */}
        <Link
          href={`/services/${service.slug}`}
          className="sr-cta"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '8px',
            fontSize:       '11px',
            fontWeight:     700,
            letterSpacing:  '0.18em',
            textTransform:  'uppercase',
            color:          `${INK}55`,
            textDecoration: 'none',
            transition:     'color 0.2s ease, gap 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = ACC; e.currentTarget.style.gap = '14px'; setCursorType('hover') }}
          onMouseLeave={e => { e.currentTarget.style.color = `${INK}55`; e.currentTarget.style.gap = '8px'; setCursorType('default') }}
        >
          Learn More
          <svg width="24" height="10" viewBox="0 0 28 10" fill="none" aria-hidden>
            <path d="M0 5h26M22 1l5 4-5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      {/* ── Right: image ───────────────────────────────────────── */}
      <div
        className="sr-img"
        style={{
          borderRadius: 'clamp(10px, 1.2vw, 16px)',
          overflow:     'hidden',
          aspectRatio:  '4/3',
          border:       `1px solid ${INK}0d`,
          boxShadow:    '0 24px 64px rgba(0,0,0,0.08)',
        }}
      >
        <Preview />
      </div>

      </div>

      {/* Divider — border-top renders identically at every scroll position */}
      <div
        className="sr-divider"
        style={{
          height:    0,
          borderTop: `1px solid ${INK}`,
          display:   'block',
        }}
      />

    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function ServicesPageClient({ services = [] }: { services?: ServiceData[] }) {
  const heroRef = useRef<HTMLElement>(null)
  const { setCursorType } = useCursorStore()

  /* One slot per row — parent calls playFnRefs[i+1] when row i's divider completes */
  const playFnRefs = useRef<Array<{ current: (() => void) | null }>>(
    Array.from({ length: services.length }, () => ({ current: null }))
  )

  const handleDividerComplete = useCallback((i: number) => {
    playFnRefs.current[i + 1]?.current?.()
  }, [])

  useLayoutEffect(() => {
    gsap.set('.sph-line1',  { opacity: 0, y: -48, filter: 'blur(12px)' })
    gsap.set('.sph-line2',  { opacity: 0, y: -36, filter: 'blur(10px)' })
    gsap.set('.sph-scroll', { opacity: 0, y: 16 })
  }, [])

  useEffect(() => {
    const el = heroRef.current!

    const resetHero = () => {
      gsap.set('.sph-line1',  { opacity: 0, y: -48, filter: 'blur(12px)' })
      gsap.set('.sph-line2',  { opacity: 0, y: -36, filter: 'blur(10px)' })
      gsap.set('.sph-scroll', { opacity: 0, y: 16 })
    }

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
    tl.to('.sph-line1',  { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.30 })
      .to('.sph-line2',  { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.20 }, '-=0.80')
      .to('.sph-scroll', { y: 0, opacity: 1, duration: 0.70 }, '-=0.50')

    /* play on first load */
    tl.play()

    /* restart hero when scrolling back up. Do NOT reset service rows here,
       because that hides rows that are currently visible on upward scroll. */
    const st = ScrollTrigger.create({
      trigger:    el,
      start:      'top top',
      end:        'bottom top',
      onLeave:     resetHero,
      onEnterBack: () => {
        tl.restart()
      },
    })

    return () => { tl.kill(); st.kill() }
  }, [])

  return (
    <div style={{ background: CREAM }}>

      {/* ══ HERO — matches Selected Work on /work ════════════════════ */}
      <section
        ref={heroRef}
        style={{
          background:     CREAM,
          height:         '100vh',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        'clamp(24px,3.5vw,48px) 0',
          position:       'relative',
          overflow:       'hidden',
        }}
      >
        {/* Heading */}
        <div style={{ width: '100%', textAlign: 'center', userSelect: 'none', lineHeight: 0.86 }}>
          <div
            className="sph-line1"
            style={{
              fontSize:      'clamp(80px, 16vw, 240px)',
              fontWeight:    800,
              letterSpacing: '-0.05em',
              color:         INK,
            }}
          >
            What I
          </div>
          <div
            className="sph-line2"
            style={{
              fontSize:      'clamp(80px, 16vw, 240px)',
              fontWeight:    800,
              letterSpacing: '-0.05em',
              color:         INK,
              display:       'inline-flex',
              alignItems:    'flex-end',
              gap:           '0.06em',
            }}
          >
            Build
            {/* Orange ball accent */}
            <span
              style={{
                display:      'inline-block',
                width:        'clamp(16px, 2.2vw, 38px)',
                height:       'clamp(16px, 2.2vw, 38px)',
                borderRadius: '50%',
                background:   ACC,
                flexShrink:   0,
                marginBottom: 'clamp(10px, 1.4vw, 22px)',
              }}
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="sph-scroll"
          style={{
            position:      'absolute',
            bottom:        'clamp(20px, 3vw, 36px)',
            left:          '50%',
            transform:     'translateX(-50%)',
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           '10px',
          }}
        >
          <div style={{ width: '1px', height: '48px', background: `linear-gradient(to bottom, ${ACC}, transparent)` }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ACC }} />
        </div>
      </section>

      {/* ══ SERVICE LIST ════════════════════════════════════════════ */}
      {services.map((service, i) => (
        <ServiceRow
          key={service.slug}
          service={service}
          index={i}
          setCursorType={setCursorType}
          onDividerComplete={() => handleDividerComplete(i)}
          playFnRef={playFnRefs.current[i]}
        />
      ))}

      <FooterSection />

    </div>
  )
}
