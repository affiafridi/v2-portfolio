'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorStore } from '@/store/useCursorStore'

gsap.registerPlugin(ScrollTrigger)

/* ─── Tokens ─────────────────────────────────────────────────────── */
const CREAM = '#f0eeea'
const INK   = '#1a1a1a'
const RING_SIZE = 120
const RING_R    = 48
const RING_CIRC = 2 * Math.PI * RING_R

/* ─── Card stack positions (front → back, bottom-anchored) ──────── */
const STACK = [
  { y:   0,  scale: 1.00,  opacity: 1,    zIndex: 12, filter: 'blur(0px)'  }, // front — sharp, full size
  { y: -58,  scale: 0.93,  opacity: 0.90, zIndex: 11, filter: 'blur(2.5px)' }, // middle — 58px above front
  { y: -115, scale: 0.86,  opacity: 0.78, zIndex: 10, filter: 'blur(5px)'  }, // back — 57px above middle (equal step)
]

/* ─── Projects ───────────────────────────────────────────────────── */
interface Project {
  id: string; title: string; type: string
  stack: string[]; desc: string; url: string
  bg: string; blobA: string; blobB: string
}

const PROJECTS: Project[] = [
  {
    id: '01', title: 'Modevelle', type: 'Ecommerce Website',
    stack: ['Next.js', 'Shopify API', 'GSAP'],
    desc: "A demo e-commerce website for women's fashion — product listings, cart functionality, and user authentication. Built with Next.js and the Shopify Storefront API.",
    url: '#', bg: '#241c14',
    blobA: 'rgba(195,130,55,0.72)', blobB: 'rgba(100,60,18,0.55)',
  },
  {
    id: '02', title: 'The Shear Room', type: 'Booking Website',
    stack: ['Next.js', 'Supabase', 'GSAP'],
    desc: 'A demo booking website for a unisex salon brand — service listings, end-to-end booking workflow, and user authentication. Built with Next.js and Supabase.',
    url: '#', bg: '#101820',
    blobA: 'rgba(45,105,185,0.70)', blobB: 'rgba(15,48,95,0.55)',
  },
  {
    id: '03', title: 'Matilda Cake', type: 'Brand Website',
    stack: ['Next.js', 'Sanity CMS', 'Framer Motion'],
    desc: 'A premium brand website for a boutique cake studio — dynamic product gallery, custom order builder, and a seamless client inquiry flow.',
    url: '#', bg: '#1e1018',
    blobA: 'rgba(185,75,155,0.68)', blobB: 'rgba(90,30,80,0.55)',
  },
  {
    id: '04', title: 'Portfolio v1', type: 'Personal Portfolio',
    stack: ['React', 'GSAP', 'Three.js'],
    desc: 'First iteration of my personal portfolio — advanced scroll animations, 3D canvas elements, and creative web interactions at the edge of the web.',
    url: '#', bg: INK,
    blobA: 'rgba(255,77,0,0.55)', blobB: 'rgba(255,140,40,0.28)',
  },
]

/* ─── Per-project website screenshot frames (browser-window scale) ── */
function getFrames(p: Project): React.ReactNode[] {
  const F = { fontFamily: 'system-ui, -apple-system, sans-serif' }

  /* ══ MODEVELLE ══════════════════════════════════════════════════ */
  if (p.id === '01') return [
    /* Hero */
    <div key="a" style={{ ...F, background:'#f7f5f2', height:'100%', overflow:'hidden' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 18px', borderBottom:'1px solid rgba(0,0,0,0.07)' }}>
        <span style={{ fontSize:'11px', fontWeight:800, color:'#111', letterSpacing:'-0.02em' }}>Modevelle</span>
        <div style={{ display:'flex', gap:'16px' }}>
          {['Shop','New In','About','Cart'].map(n=><span key={n} style={{ fontSize:'8px', color:'#aaa' }}>{n}</span>)}
        </div>
      </div>
      <div style={{ display:'flex', padding:'18px 18px 0', gap:'14px', alignItems:'flex-start' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'clamp(26px,5vw,42px)', fontWeight:900, lineHeight:0.86, color:'#0d0d0d', letterSpacing:'-0.05em', marginBottom:'10px' }}>Modevelle</div>
          <div style={{ fontSize:'9px', color:'#bbb', lineHeight:1.6, maxWidth:'140px' }}>Where timeless style meets modern grace — discover outfits for every moment.</div>
          <div style={{ marginTop:'12px', display:'inline-flex', background:'#0d0d0d', borderRadius:'100px', padding:'6px 14px' }}>
            <span style={{ fontSize:'8px', color:'#fff', fontWeight:600, letterSpacing:'0.06em' }}>Shop Now →</span>
          </div>
        </div>
        <div style={{ width:'35%', flexShrink:0, aspectRatio:'2/3', background:'linear-gradient(160deg,#e0dbd4,#cbc5bc)', borderRadius:'8px', overflow:'hidden', position:'relative' }}>
          <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:'55%', height:'76%', background:'rgba(0,0,0,0.08)', borderRadius:'50% 50% 0 0' }} />
        </div>
      </div>
    </div>,

    /* Product grid */
    <div key="b" style={{ ...F, background:'#f7f5f2', height:'100%', overflow:'hidden', padding:'16px 18px' }}>
      <div style={{ fontSize:'8px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'#bbb', marginBottom:'12px' }}>New Collection</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'7px' }}>
        {[['#dedad3','Midi Dress','AED 420'],['#d3cec7','Blazer','AED 680'],['#cac5bc','Pants','AED 340'],['#d8d3cc','Silk Top','AED 290']].map(([c,n,price])=>(
          <div key={n} style={{ background:String(c), borderRadius:'6px', overflow:'hidden', position:'relative', aspectRatio:'2/3' }}>
            <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:'52%', height:'70%', background:'rgba(0,0,0,0.07)', borderRadius:'50% 50% 0 0' }} />
            <div style={{ position:'absolute', bottom:'5px', left:'4px', right:'4px', background:'rgba(255,255,255,0.88)', borderRadius:'3px', padding:'3px 5px' }}>
              <div style={{ fontSize:'7px', color:'#555', fontWeight:600 }}>{n}</div>
              <div style={{ fontSize:'7px', color:'#999' }}>{price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>,

    /* Product detail */
    <div key="c" style={{ ...F, background:'#fff', height:'100%', overflow:'hidden', display:'flex' }}>
      <div style={{ flex:'0 0 48%', background:'linear-gradient(160deg,#ece8e2,#d8d3cc)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', bottom:'6%', left:'50%', transform:'translateX(-50%)', width:'52%', height:'72%', background:'rgba(0,0,0,0.08)', borderRadius:'50% 50% 0 0' }} />
      </div>
      <div style={{ flex:1, padding:'20px 16px', display:'flex', flexDirection:'column', justifyContent:'center', gap:'10px' }}>
        <span style={{ fontSize:'7px', color:'#ccc', letterSpacing:'0.14em', textTransform:'uppercase' }}>Modevelle Studio</span>
        <div style={{ fontSize:'22px', fontWeight:800, color:'#111', lineHeight:1.0, letterSpacing:'-0.04em' }}>Silk Wrap<br/>Dress</div>
        <div style={{ fontSize:'16px', fontWeight:700, color:'#111' }}>AED 380</div>
        <div style={{ display:'flex', gap:'6px' }}>
          {['XS','S','M','L'].map((s,i)=>(
            <div key={s} style={{ width:'26px', height:'26px', borderRadius:'50%', border: i===1 ? '2px solid #111' : '1px solid #ddd', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:'8px', color: i===1 ? '#111' : '#bbb', fontWeight:600 }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ background:'#111', borderRadius:'100px', padding:'8px 18px', display:'inline-flex', alignItems:'center', justifyContent:'center', alignSelf:'flex-start' }}>
          <span style={{ fontSize:'9px', color:'#fff', fontWeight:600, letterSpacing:'0.06em' }}>Add to Cart</span>
        </div>
      </div>
    </div>,
  ]

  /* ══ THE SHEAR ROOM ════════════════════════════════════════════ */
  if (p.id === '02') return [
    /* Hero */
    <div key="a" style={{ ...F, background:'#0c141e', height:'100%', overflow:'hidden' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize:'10px', fontWeight:700, color:'#e0e0e0', letterSpacing:'0.07em' }}>THE SHEAR ROOM</span>
        <div style={{ display:'flex', gap:'16px' }}>
          {['Services','Book','About'].map(n=><span key={n} style={{ fontSize:'8px', color:'rgba(255,255,255,0.35)' }}>{n}</span>)}
        </div>
      </div>
      <div style={{ padding:'18px 18px 0', display:'flex', gap:'14px', alignItems:'flex-start' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'8px', color:'rgba(255,255,255,0.28)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'8px' }}>· Your look</div>
          <div style={{ fontSize:'clamp(20px,4vw,34px)', fontWeight:800, lineHeight:0.92, color:'#fff', letterSpacing:'-0.04em', marginBottom:'12px' }}>Always Here<br/>for Our Clients</div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#fff', borderRadius:'100px', padding:'6px 14px' }}>
            <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:'#111', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:'9px', color:'#fff' }}>↗</span>
            </div>
            <span style={{ fontSize:'9px', color:'#111', fontWeight:600 }}>Book now</span>
          </div>
        </div>
        <div style={{ width:'34%', flexShrink:0, aspectRatio:'3/4', borderRadius:'8px', overflow:'hidden', background:'#1a2535', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg,rgba(45,105,185,0.4),rgba(15,48,95,0.6))' }} />
        </div>
      </div>
    </div>,

    /* Services */
    <div key="b" style={{ ...F, background:'#0c141e', height:'100%', overflow:'hidden', padding:'16px 18px' }}>
      <div style={{ fontSize:'8px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:'14px' }}>Our Services</div>
      {[['Haircut & Style','AED 85'],['Beard Trim','AED 55'],['Color & Highlights','AED 150'],['Scalp Treatment','AED 95']].map(([name,price])=>(
        <div key={name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.68)', fontWeight:500 }}>{name}</span>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.30)' }}>{price}</span>
            <div style={{ width:'22px', height:'22px', borderRadius:'50%', border:'1px solid rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>→</span>
            </div>
          </div>
        </div>
      ))}
    </div>,

    /* Footer brand */
    <div key="c" style={{ ...F, background:'#0c141e', height:'100%', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1, padding:'14px 18px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'8px', alignContent:'start' }}>
        {[['Menu',['About','Services','Reviews','Location']],['Explore',['Trends','Stylists']],['Contact',['rshn@gmail.com','+91 98765']]].map(([title,items])=>(
          <div key={String(title)}>
            <div style={{ fontSize:'7px', color:'rgba(255,255,255,0.28)', letterSpacing:'0.10em', textTransform:'uppercase', marginBottom:'8px' }}>{title}</div>
            {(items as string[]).map(item=><div key={item} style={{ fontSize:'9px', color:'rgba(255,255,255,0.50)', marginBottom:'5px', lineHeight:1.4 }}>{item}</div>)}
          </div>
        ))}
      </div>
      <div style={{ height:'44%', background:'#06080f', overflow:'hidden', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg,rgba(20,40,70,0.7),rgba(5,12,25,0.95))' }} />
        <span style={{ fontSize:'clamp(20px,3.5vw,40px)', fontWeight:900, color:'rgba(255,255,255,0.82)', letterSpacing:'-0.04em', textTransform:'uppercase', position:'relative', zIndex:1 }}>THE SHEAR ROOM</span>
      </div>
    </div>,
  ]

  /* ══ MATILDA CAKE ══════════════════════════════════════════════ */
  if (p.id === '03') return [
    /* Hero */
    <div key="a" style={{ ...F, background:'#fdf6f0', height:'100%', overflow:'hidden' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 18px', borderBottom:'1px solid rgba(139,58,82,0.08)' }}>
        <span style={{ fontSize:'11px', fontWeight:700, color:'#8b3a52', fontStyle:'italic' }}>Matilda Cake</span>
        <div style={{ display:'flex', gap:'16px' }}>
          {['Menu','Order','Gallery'].map(n=><span key={n} style={{ fontSize:'8px', color:'#c07080' }}>{n}</span>)}
        </div>
      </div>
      <div style={{ padding:'18px 18px 0', display:'flex', gap:'14px', alignItems:'flex-start' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'8px', color:'rgba(139,58,82,0.38)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:'8px' }}>— artisan cakes</div>
          <div style={{ fontSize:'clamp(24px,4.5vw,38px)', fontWeight:800, lineHeight:0.88, color:'#3a1a22', letterSpacing:'-0.04em', marginBottom:'10px' }}>Baked<br/>with love.</div>
          <div style={{ fontSize:'9px', color:'#b08090', lineHeight:1.6, maxWidth:'130px', marginBottom:'12px' }}>Custom cakes for every occasion — beautifully designed.</div>
          <div style={{ display:'inline-flex', alignItems:'center', border:'1.5px solid rgba(139,58,82,0.30)', borderRadius:'100px', padding:'6px 14px' }}>
            <span style={{ fontSize:'8px', color:'#8b3a52', fontWeight:600 }}>Order Now →</span>
          </div>
        </div>
        <div style={{ width:'34%', flexShrink:0, aspectRatio:'1/1', borderRadius:'50%', background:'linear-gradient(145deg,#f4c8d4,#e8a0b8,#d48898)', overflow:'hidden', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.45), transparent 60%)' }} />
        </div>
      </div>
    </div>,

    /* Flavours */
    <div key="b" style={{ ...F, background:'#fdf6f0', height:'100%', overflow:'hidden', padding:'16px 18px' }}>
      <div style={{ fontSize:'8px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(139,58,82,0.38)', marginBottom:'12px' }}>Seasonal Flavours</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
        {[['#fce4ea','Rose Lychee','Classic elegance'],['#fef3d0','Lemon Verbena','Citrus-bright'],['#e0eed0','Pistachio Rose','Nutty & floral'],['#d8e4f8','Blueberry Cream','Bold & fruity']].map(([bg,name,desc])=>(
          <div key={name} style={{ background:String(bg), borderRadius:'10px', padding:'14px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#3a1a22', marginBottom:'4px' }}>{name}</div>
            <div style={{ fontSize:'9px', color:'rgba(58,26,34,0.50)', lineHeight:1.4 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>,

    /* Order form */
    <div key="c" style={{ ...F, background:'#fdf6f0', height:'100%', overflow:'hidden', padding:'16px 18px' }}>
      <div style={{ fontSize:'8px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(139,58,82,0.38)', marginBottom:'12px' }}>Build Your Cake</div>
      {[['Size','6 inch · 8 inch · 10 inch'],['Flavour','Rose Lychee'],['Tiers','Single · Double'],['Occasion','Birthday']].map(([label,value])=>(
        <div key={label} style={{ marginBottom:'8px' }}>
          <div style={{ fontSize:'7px', color:'rgba(139,58,82,0.40)', letterSpacing:'0.10em', textTransform:'uppercase', marginBottom:'4px' }}>{label}</div>
          <div style={{ background:'rgba(139,58,82,0.06)', border:'1px solid rgba(139,58,82,0.12)', borderRadius:'6px', padding:'7px 10px' }}>
            <span style={{ fontSize:'10px', color:'#8b3a52' }}>{value}</span>
          </div>
        </div>
      ))}
      <div style={{ background:'#8b3a52', borderRadius:'100px', padding:'8px 20px', display:'inline-flex', marginTop:'8px' }}>
        <span style={{ fontSize:'9px', color:'#fff', fontWeight:600 }}>Place Order →</span>
      </div>
    </div>,
  ]

  /* ══ PORTFOLIO V1 ══════════════════════════════════════════════ */
  return [
    /* Hero */
    <div key="a" style={{ ...F, background:'#0c0c0c', height:'100%', overflow:'hidden' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize:'11px', fontWeight:700, color:'#e8e8e8', letterSpacing:'0.04em' }}>Aftab.</span>
        <div style={{ display:'flex', gap:'16px' }}>
          {['Work','About','Contact'].map(n=><span key={n} style={{ fontSize:'8px', color:'rgba(255,255,255,0.30)' }}>{n}</span>)}
        </div>
      </div>
      <div style={{ padding:'18px 18px 0' }}>
        <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.22)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:'8px' }}>Creative Developer</div>
        <div style={{ fontSize:'clamp(26px,5vw,44px)', fontWeight:900, lineHeight:0.88, color:'#f0f0f0', letterSpacing:'-0.05em', marginBottom:'12px' }}>
          Building<br/><span style={{ color:'#ff4d00' }}>the web.</span>
        </div>
        <div style={{ height:'52px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {[...Array(5)].map((_,i)=>(
            <div key={i} style={{ position:'absolute', width:`${20+i*16}px`, height:`${20+i*16}px`, border:`1px solid rgba(255,77,0,${0.10+i*0.05})`, borderRadius:'50%' }} />
          ))}
          <span style={{ fontSize:'8px', color:'rgba(255,255,255,0.14)', letterSpacing:'0.14em', position:'relative', zIndex:1 }}>THREE.JS CANVAS</span>
        </div>
      </div>
    </div>,

    /* Work list */
    <div key="b" style={{ ...F, background:'#0c0c0c', height:'100%', overflow:'hidden', padding:'16px 18px' }}>
      <div style={{ fontSize:'8px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.20)', marginBottom:'14px' }}>Selected Work</div>
      {[['01','Modevelle','Ecommerce · 2024'],['02','The Shear Room','Booking · 2024'],['03','Matilda Cake','Brand · 2023']].map(([num,name,type])=>(
        <div key={num} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
            <span style={{ fontSize:'9px', color:'rgba(255,255,255,0.18)', fontWeight:600 }}>{num}</span>
            <span style={{ fontSize:'16px', color:'rgba(255,255,255,0.75)', fontWeight:700, letterSpacing:'-0.02em' }}>{name}</span>
          </div>
          <span style={{ fontSize:'8px', color:'rgba(255,255,255,0.25)', letterSpacing:'0.08em' }}>{type}</span>
        </div>
      ))}
    </div>,

    /* Terminal */
    <div key="c" style={{ ...F, background:'#0c0c0c', height:'100%', overflow:'hidden', padding:'16px 18px' }}>
      <div style={{ fontSize:'8px', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.20)', marginBottom:'12px' }}>About</div>
      <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'16px 18px', fontFamily:'monospace' }}>
        <div style={{ fontSize:'10px', color:'rgba(255,77,0,0.85)', marginBottom:'10px' }}>$ whoami</div>
        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.60)', lineHeight:1.8 }}>
          Creative developer + designer.<br/>
          Based in Dubai 🇦🇪<br/>
          5+ years · 40+ projects<br/>
          <span style={{ color:'rgba(255,255,255,0.25)' }}>React · Next.js · GSAP · Three.js</span>
        </div>
        <div style={{ display:'inline-block', width:'8px', height:'14px', background:'rgba(255,77,0,0.75)', marginTop:'10px', borderRadius:'1px' }} />
      </div>
    </div>,
  ]
}

/* ─── Card stack — "next, next, next" queue animation ───────────────
   3 browser-window cards stacked bottom-anchored.
   Every 2.2 s: front card slides up and out, the two cards behind
   step forward, and the exited card re-enters at the back of the stack.
   All transitions run at fixed speed, independent of scroll.
   ─────────────────────────────────────────────────────────────────── */
function CardStack({ p }: { p: Project }) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  /* orderRef: indices into cardRefs ordered front→back */
  const orderRef = useRef([0, 1, 2])
  const frames   = getFrames(p)

  useEffect(() => {
    const els = cardRefs.current.filter((el): el is HTMLDivElement => el !== null)
    if (els.length < 3) return

    /* Set initial stack positions */
    els.forEach((el, i) => {
      gsap.set(el, {
        ...STACK[i],
        transformOrigin: 'bottom center',
      })
    })

    const interval = setInterval(() => {
      const [front, mid, back] = orderRef.current
      const frontEl = els[front]
      const midEl   = els[mid]
      const backEl  = els[back]

      /*
       * Sequence designed so 2 back cards are always clearly visible:
       *
       * t=0.00  front fades out fast (0.10s)
       * t=0.00  mid begins zooming to front (0.62s expo.out)
       * t=0.08  back begins stepping to mid — stays at STACK[2] a bit longer
       *          so the back position looks occupied while front is leaving
       * t=0.10  front is invisible → snap to STACK[2], fade in (0.36s)
       *
       * Gap where STACK[2] has no card = t(0.08 → 0.10) = only ~20ms,
       * and back has barely moved by then so visually undetectable.
       */

      /* 1. Front disappears quickly */
      gsap.to(frontEl, {
        opacity:  0,
        duration: 0.10,
        ease:     'power1.in',
        onComplete() {
          /* Snap to back, fade in smoothly */
          gsap.set(frontEl, { ...STACK[2], opacity: 0 })
          gsap.to(frontEl,  { opacity: STACK[2].opacity, duration: 0.36, ease: 'power2.out' })
        },
      })

      /* 2. Mid zooms forward — the hero move */
      gsap.to(midEl, { ...STACK[0], duration: 0.62, ease: 'expo.out' })

      /* 3. Back steps up with a tiny delay — keeps STACK[2] occupied longer */
      gsap.to(backEl, { ...STACK[1], duration: 0.55, ease: 'expo.out', delay: 0.08 })

      orderRef.current = [mid, back, front]
    }, 1100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ position:'relative', width:'100%', height:'clamp(220px,30vw,420px)' }}>
      {frames.map((frame, i) => (
        <div
          key={i}
          ref={el => { cardRefs.current[i] = el }}
          style={{
            position:     'absolute',
            bottom:       0,
            left:         0,
            right:        0,
            borderRadius: '12px',
            overflow:     'hidden',
            border:       '1px solid rgba(255,255,255,0.12)',
            boxShadow:    '0 4px 16px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.06) inset',
          }}
        >
          <div style={{ height:'clamp(220px,30vw,420px)', overflow:'hidden' }}>
            {frame}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Single panel ───────────────────────────────────────────────── */
function Panel({ p, idx, total }: { p: Project; idx: number; total: number }) {
  const { setCursorType } = useCursorStore()

  return (
    <div
      className={`wk-panel wk-panel-${idx}`}
      style={{ position:'absolute', inset:'14px', borderRadius:'32px', overflow:'hidden', background:p.bg, willChange:'transform' }}
    >
      {/* Blurred first-frame background */}
      <div aria-hidden style={{ position:'absolute', inset:0, overflow:'hidden', zIndex:0 }}>
        <div style={{ position:'absolute', inset:'-12%', filter:'blur(80px)', opacity:0.55, transform:'scale(1.18)', mixBlendMode:'overlay' }}>
          {getFrames(p)[0]}
        </div>
      </div>

      {/* Brand colour blobs */}
      <div aria-hidden style={{ position:'absolute', inset:0, zIndex:1, background:`radial-gradient(ellipse 72% 62% at 22% 14%, ${p.blobA}, transparent 62%), radial-gradient(ellipse 58% 68% at 84% 82%, ${p.blobB}, transparent 62%)` }} />
      {/* Vignette */}
      <div aria-hidden style={{ position:'absolute', inset:0, zIndex:2, background:'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 35%, rgba(0,0,0,0.48) 100%)' }} />

      {/* Content grid */}
      <div style={{
        position:'absolute', inset:0, zIndex:3,
        display:'grid',
        gridTemplateColumns:'minmax(0,1.6fr) minmax(0,1fr)',
        padding:'clamp(1.8rem,2.4vw,2.6rem)',
        gap:'clamp(1.5rem,2.8vw,3rem)',
      }}>

        {/* ── LEFT col: ring pinned top-left, content pinned bottom — aligns with images ── */}
        <div style={{ position:'relative' }}>

          {/* Ring counter — top-left, offset down */}
          <div className="wk-content" style={{ position:'absolute', top:'clamp(1.4rem,2.2vw,2.8rem)', left:0, width:`${RING_SIZE}px`, height:`${RING_SIZE}px`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'2px' }}>

            <svg width={RING_SIZE} height={RING_SIZE} style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}>
              {/* Track */}
              <circle cx={RING_SIZE/2} cy={RING_SIZE/2} r={RING_R} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
              {/* One small dot per project on the track */}
              {Array.from({ length: total }).map((_, t) => {
                const angle = (t / total) * 2 * Math.PI
                const dx = RING_SIZE / 2 + RING_R * Math.cos(angle)
                const dy = RING_SIZE / 2 + RING_R * Math.sin(angle)
                return <circle key={t} cx={dx} cy={dy} r="2" fill={t === idx ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.22)'} />
              })}
              {/* Progress arc */}
              <circle className={`wk-ring wk-ring-${idx}`} cx={RING_SIZE/2} cy={RING_SIZE/2} r={RING_R} fill="none" stroke="rgba(255,255,255,0.80)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={RING_CIRC} strokeDashoffset={RING_CIRC} />
            </svg>

            {/* Center content */}
            <span style={{ fontSize:'6.5px', letterSpacing:'0.24em', textTransform:'uppercase', color:'rgba(255,255,255,0.30)', position:'relative', zIndex:1 }}>Project</span>
            <span style={{ fontSize:'26px', fontWeight:800, letterSpacing:'-0.04em', color:'rgba(255,255,255,0.92)', position:'relative', zIndex:1, lineHeight:1.1 }}>{p.id}</span>
            <div style={{ width:'16px', height:'1px', background:'rgba(255,255,255,0.18)', position:'relative', zIndex:1, margin:'3px 0' }} />
            <span style={{ fontSize:'9px', fontWeight:400, letterSpacing:'0.04em', color:'rgba(255,255,255,0.28)', position:'relative', zIndex:1 }}>/{String(total).padStart(2,'0')}</span>
          </div>

          {/* Title + desc + CTA — positioned at green mark (upper-middle of left col) */}
          <div style={{ position:'absolute', top:'46%', left:0, right:0 }}>
            <h3 className="wk-left" style={{ fontSize:'clamp(36px,4.8vw,78px)', fontWeight:800, letterSpacing:'-0.03em', lineHeight:0.92, color:'#fff', textTransform:'uppercase', margin:'0 0 1.1rem' }}>{p.title}</h3>
            <p className="wk-left" style={{ fontSize:'13px', lineHeight:1.9, color:'rgba(255,255,255,0.52)', margin:'0 0 1.7rem', maxWidth:'420px' }}>{p.desc}</p>
            <a href={p.url} className="wk-left"
              style={{
                display:'inline-flex', alignItems:'center', gap:'10px',
                fontSize:'12px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase',
                color:'rgba(255,255,255,0.72)', textDecoration:'none',
                borderBottom:'1px solid rgba(255,255,255,0.28)',
                paddingBottom:'4px',
                transition:'color 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={e=>{ e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(255,255,255,0.75)'; setCursorType('hover') }}
              onMouseLeave={e=>{ e.currentTarget.style.color='rgba(255,255,255,0.72)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.28)'; setCursorType('default') }}
            >
              Visit site
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ── RIGHT col: tags pushed down from nav, cards pinned bottom — fully independent ── */}
        <div style={{ position:'relative', paddingTop:'clamp(3rem,5vw,5.5rem)' }}>

          {/* Type + tags — sit naturally after paddingTop, clear of the nav */}
          <div style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
            <p className="wk-type" style={{
              fontSize:'clamp(12px,1.05vw,15px)', fontWeight:600,
              letterSpacing:'0.22em', textTransform:'uppercase',
              color:'rgba(255,255,255,0.90)', margin:0,
            }}>
              {p.type}
            </p>
            <div className="wk-line" style={{ width:'100%', height:'1px', background:'rgba(255,255,255,0.18)', transformOrigin:'left center' }} />
            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center' }}>
              {p.stack.map((tech, i) => (
                <span key={tech} style={{ display:'inline-flex', alignItems:'center' }}>
                  <span className="wk-tag" style={{ fontSize:'clamp(11px,0.95vw,14px)', fontWeight:500, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.75)' }}>
                    {tech}
                  </span>
                  {i < p.stack.length - 1 && (
                    <span className="wk-tag" style={{ fontSize:'clamp(11px,0.95vw,14px)', color:'rgba(255,255,255,0.26)', margin:'0 12px' }}>·</span>
                  )}
                </span>
              ))}
            </div>
            <div className="wk-line" style={{ width:'100%', height:'1px', background:'rgba(255,255,255,0.18)', transformOrigin:'left center' }} />
          </div>

          {/* Cards — pinned to bottom, independent from tags */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0 }}>
            <CardStack p={p} />
          </div>

        </div>
      </div>
    </div>
  )
}

/* ─── Section ────────────────────────────────────────────────────── */
export default function WorkSection() {
  const sectionRef     = useRef<HTMLElement>(null)
  const progressRef    = useRef<(HTMLDivElement | null)[]>([])
  const prevActiveIdx  = useRef<number>(-1)
  const animatedPanels = useRef<Set<number>>(new Set())
  const N              = PROJECTS.length

  useEffect(() => {
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('.wk-panel')

      function revealPanel(idx: number) {
        if (animatedPanels.current.has(idx)) return
        animatedPanels.current.add(idx)

        /* Ring counter — fades up independently */
        gsap.fromTo(`.wk-panel-${idx} .wk-content`,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
        )

        /* Left col: heading → para → button, blur-in staggered */
        gsap.fromTo(`.wk-panel-${idx} .wk-left`,
          { opacity: 0, filter: 'blur(10px)', y: 10 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.65, stagger: { each: 0.14 }, ease: 'power2.out', delay: 0.10 }
        )

        /* Right col: step-by-step sequential reveal */
        const lines = gsap.utils.toArray<HTMLElement>(`.wk-panel-${idx} .wk-line`)
        const tl = gsap.timeline({ delay: 0.05 })

        // 1. Type label blurs in
        tl.fromTo(`.wk-panel-${idx} .wk-type`,
          { opacity: 0, filter: 'blur(8px)', y: 8 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.50, ease: 'power2.out' }
        )
        // 2. First line wipes in from left
        .fromTo(lines[0],
          { scaleX: 0 },
          { scaleX: 1, duration: 0.55, ease: 'power3.out' },
          '-=0.10'
        )
        // 3. Tags blur in one by one
        .fromTo(`.wk-panel-${idx} .wk-tag`,
          { opacity: 0, filter: 'blur(10px)', x: 6 },
          { opacity: 1, filter: 'blur(0px)', x: 0, duration: 0.42, stagger: { each: 0.09 }, ease: 'power2.out' },
          '-=0.05'
        )
        // 4. Second line wipes in after last tag
        .fromTo(lines[1],
          { scaleX: 0 },
          { scaleX: 1, duration: 0.55, ease: 'power3.out' },
          '+=0.04'
        )
      }

      function resetPanels() {
        animatedPanels.current.clear()
        prevActiveIdx.current = -1
        panels.forEach((_, i) => {
          if (i > 0) gsap.set(panels[i], { filter: 'blur(14px)' })
          else        gsap.set(panels[i], { filter: 'blur(0px)' })
          gsap.set(`.wk-panel-${i} .wk-content`, { opacity: 0, y: 16 })
          gsap.set(`.wk-panel-${i} .wk-type`,    { opacity: 0, filter: 'blur(8px)', y: 8 })
          gsap.set(`.wk-panel-${i} .wk-tag`,     { opacity: 0, filter: 'blur(10px)', x: 6 })
          gsap.set(`.wk-panel-${i} .wk-left`,    { opacity: 0, filter: 'blur(10px)', y: 10 })
          gsap.set(`.wk-panel-${i} .wk-line`,    { scaleX: 0 })
        })
      }

      panels.forEach((_, i) => {
        if (i > 0) {
          gsap.set(`.wk-panel-${i}`, { yPercent:100, scale:0.94, filter:'blur(14px)' })
        }
        /* All panels — content starts hidden so there's no flash on load */
        gsap.set(`.wk-panel-${i} .wk-content`, { opacity:0, y:16 })
        gsap.set(`.wk-panel-${i} .wk-type`,    { opacity:0, filter:'blur(8px)', y:8 })
        gsap.set(`.wk-panel-${i} .wk-tag`,     { opacity:0, filter:'blur(10px)', x:6 })
        gsap.set(`.wk-panel-${i} .wk-left`,    { opacity:0, filter:'blur(10px)', y:10 })
        gsap.set(`.wk-panel-${i} .wk-line`,    { scaleX:0 })
      })

      gsap.fromTo('.wk-sticky',
        { scale:0.88, y:60 },
        { scale:1, y:0, ease:'power2.out', scrollTrigger:{ trigger:sectionRef.current!, start:'top 90%', end:'top top', scrub:1.0 } }
      )

      ScrollTrigger.create({
        trigger:sectionRef.current!, start:'top 30%',
        onEnter:     () => revealPanel(0),
        onLeaveBack: () => resetPanels(),
      })

      const tl = gsap.timeline()
      for (let i = 1; i < N; i++) {
        const t = i - 1
        tl.to(panels[i-1], { scale:0.90, yPercent:-4, opacity:0.12, filter:'blur(18px)', duration:1, ease:'power2.inOut' }, t)
        tl.to(panels[i],   { yPercent:0, scale:1, filter:'blur(0px)', duration:1, ease:'power2.inOut' }, t)
      }

      ScrollTrigger.create({
        animation:tl,
        trigger:sectionRef.current!, start:'top top', end:'bottom bottom', scrub:1.5,
        onUpdate(self) {
          const activeIdx = Math.min(Math.floor(self.progress * N + 0.06), N - 1)
          progressRef.current.forEach((bar, i) => {
            if (!bar) return
            bar.style.height     = i === activeIdx ? '28px' : '16px'
            bar.style.background = i === activeIdx ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.20)'
          })
          const offset = RING_CIRC * (1 - self.progress)
          for (let i = 0; i < N; i++) {
            const ring = document.querySelector<SVGCircleElement>(`.wk-ring-${i}`)
            if (ring) ring.style.strokeDashoffset = `${offset}`
          }
          if (activeIdx !== prevActiveIdx.current) {
            prevActiveIdx.current = activeIdx
            setTimeout(() => revealPanel(activeIdx), 100)
          }
        },
      })

    }, sectionRef)
    return () => ctx.revert()
  }, [N])

  return (
    <section ref={sectionRef} style={{ height:`${N*100}vh`, background:CREAM, position:'relative', zIndex:2, marginTop:'-120px' }}>
      <div className="wk-sticky" style={{ position:'sticky', top:0, height:'100vh', overflow:'hidden', background:CREAM }}>
        {PROJECTS.map((p,i) => <Panel key={p.id} p={p} idx={i} total={N} />)}
        <div style={{ position:'absolute', top:'2.5rem', right:'2.5rem', display:'flex', alignItems:'flex-end', gap:'4px', zIndex:20 }}>
          {PROJECTS.map((_,i) => (
            <div key={i} ref={el=>{ progressRef.current[i]=el }}
              style={{ width:'2.5px', height:i===0?'28px':'16px', background:i===0?'rgba(255,255,255,0.92)':'rgba(255,255,255,0.20)', borderRadius:'2px', transition:'height 0.3s ease, background 0.3s ease' }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
