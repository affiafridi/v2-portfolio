import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ─── Admin user ──────────────────────────────────────────────────
  const email = process.env.ADMIN_EMAIL || 'admin@admin.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const hash = await bcrypt.hash(password, 12)

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, password: hash, name: 'Admin' },
  })
  console.log('  Admin user created')

  // ─── Projects ────────────────────────────────────────────────────
  const projects = [
    {
      title: 'Modevelle',
      slug: 'modevelle',
      type: 'E-commerce Website',
      year: 2024,
      role: 'Full Stack Developer',
      client: 'Demo Project',
      duration: '6 weeks',
      description: "A demo e-commerce website for women's fashion — product listings, cart functionality, and user authentication. Built with Next.js and the Shopify Storefront API.",
      challenge: 'Synchronising real-time inventory with Shopify while keeping the storefront fast — solved by edge-cached API calls and optimistic UI updates so cart interactions feel instant.',
      tags: ['Next.js', 'Shopify API', 'GSAP'],
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=85',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=85',
        'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&q=85',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=85',
      ],
      features: [
        { title: 'Shopify Storefront API', desc: 'Real-time product sync, cart management and checkout flow powered by the Shopify Storefront API with edge-cached queries.' },
        { title: 'Animated Product Listing', desc: 'GSAP-driven page transitions and staggered product card reveals for a polished, magazine-style browsing experience.' },
        { title: 'Auth & Sessions', desc: 'Next-Auth with JWT sessions and Shopify customer accounts — persistent cart across devices and sessions.' },
        { title: 'Responsive Storefront', desc: 'Mobile-first layout with fluid typography, touch-friendly swipe galleries and optimised image delivery via Shopify CDN.' },
      ],
      url: '#',
      featured: true,
      sortOrder: 0,
    },
    {
      title: 'The Shear Room',
      slug: 'the-shear-room',
      type: 'Booking Website',
      year: 2024,
      role: 'Full Stack Developer',
      duration: '5 weeks',
      description: 'A demo booking website for a unisex salon brand — service listings, end-to-end booking workflow, and user authentication. Built with Next.js and Supabase.',
      challenge: 'Building a conflict-free slot booking engine without a third-party calendar service — implemented with Postgres row-level locking so double bookings are impossible at the database layer.',
      tags: ['Next.js', 'Supabase', 'GSAP'],
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200&q=85',
        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=85',
      ],
      features: [
        { title: 'Booking Engine', desc: 'Calendar-based slot picker with real-time availability from Supabase — concurrent bookings prevented at the DB layer with row-level locking.' },
        { title: 'Service Catalogue', desc: 'Dynamic service listing with pricing, duration, and stylist assignment managed entirely through Supabase tables and Row Level Security.' },
        { title: 'Supabase Auth', desc: 'Email + OAuth sign-in with Supabase Auth, protected booking routes, and a personal booking history dashboard per user.' },
        { title: 'Admin Dashboard', desc: 'Staff-facing view to see, confirm, and reschedule upcoming appointments — built as a protected Next.js route with role-based access.' },
      ],
      url: '#',
      featured: true,
      sortOrder: 1,
    },
    {
      title: 'Matilda Cake',
      slug: 'matilda-cake',
      type: 'Brand Website',
      year: 2023,
      role: 'Designer & Developer',
      duration: '4 weeks',
      description: 'A premium brand website for a boutique cake studio — dynamic product gallery, custom order builder, and a seamless client inquiry flow.',
      challenge: 'Translating a highly tactile, artisan brand into a digital experience — used Framer Motion for silky micro-interactions and Sanity CMS so the client can update the menu and gallery without a developer.',
      tags: ['Next.js', 'Sanity CMS', 'Framer Motion'],
      image: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=1200&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=85',
        'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=1200&q=85',
      ],
      features: [
        { title: 'Order Builder', desc: 'Step-by-step custom cake configurator — pick size, flavour, tiers, and occasion with live price calculation and a clean inquiry form.' },
        { title: 'Sanity CMS', desc: 'Fully headless CMS integration so the studio owner can update flavours, gallery images, and pricing without touching a line of code.' },
        { title: 'Product Gallery', desc: 'Masonry-style gallery with Framer Motion stagger reveals, lightbox view, and lazy-loaded images for fast initial paint.' },
        { title: 'Inquiry Flow', desc: 'Multi-step inquiry form with Sanity-backed submissions, email confirmation via Resend, and an admin inbox view inside Sanity Studio.' },
      ],
      url: '#',
      featured: true,
      sortOrder: 2,
    },
    {
      title: 'Portfolio v1',
      slug: 'portfolio-v1',
      type: 'Personal Portfolio',
      year: 2022,
      role: 'Designer & Developer',
      duration: '3 weeks',
      description: 'First iteration of my personal portfolio — advanced scroll animations, 3D canvas elements, and creative web interactions at the edge of the web.',
      challenge: 'Achieving 90+ Lighthouse scores while running Three.js scenes and GSAP ScrollTrigger sequences simultaneously — solved with dynamic imports, canvas pooling, and debounced resize observers.',
      tags: ['React', 'GSAP', 'Three.js'],
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1555066931-4365d14431b9?w=1200&q=85',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=85',
      ],
      features: [
        { title: 'GSAP ScrollTrigger', desc: 'Custom scroll-driven sequences including parallax layers, pinned sections, and staggered text reveals — all scrubbed to native scroll velocity.' },
        { title: 'Three.js Canvas', desc: 'Interactive 3D scenes built with Three.js — particle systems, geometry morphs, and a custom orbit control responding to cursor position.' },
        { title: 'Performance', desc: 'Lighthouse 92+ on mobile achieved via dynamic canvas imports, image WebP conversion, and font subsetting — heavy visuals, light payload.' },
        { title: 'Custom Cursor', desc: 'Magnetic custom cursor with GSAP lerp, blend-mode difference for hero contrast, and state-based shape morphing on interactive elements.' },
      ],
      url: '#',
      featured: true,
      sortOrder: 3,
    },
    {
      title: 'Nomad Studio',
      slug: 'nomad-studio',
      type: 'Agency Website',
      year: 2024,
      role: 'Creative Developer',
      duration: '5 weeks',
      description: 'A creative agency website with immersive scroll-driven storytelling, parallax layers and a bold editorial design language.',
      challenge: 'Building an immersive scroll narrative without sacrificing performance — used GSAP timeline scrubbing with CSS will-change hints and layer compositing to keep the main thread free.',
      tags: ['Next.js', 'GSAP', 'Tailwind'],
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=85',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=85',
      ],
      features: [
        { title: 'Scroll Storytelling', desc: 'Multi-panel pinned scroll sequence that narrates the agency story — each panel locks, animates, then releases as the user continues scrolling.' },
        { title: 'Editorial Typography', desc: 'Variable font usage with GSAP-driven weight and tracking animations — headlines morph as they enter and exit the viewport.' },
        { title: 'Parallax Layers', desc: 'Multi-depth parallax using CSS custom properties driven by a single rAF loop — foreground, mid, and background move at distinct rates.' },
        { title: 'Project Showcase', desc: 'Horizontal scroll project reel with drag-to-scroll (GSAP Draggable) and an active-item detail panel that fades between entries.' },
      ],
      url: '#',
      featured: false,
      sortOrder: 4,
    },
    {
      title: 'Vestra Finance',
      slug: 'vestra-finance',
      type: 'SaaS Dashboard',
      year: 2024,
      role: 'Full Stack Developer',
      duration: '8 weeks',
      description: 'A SaaS dashboard for personal finance tracking — real-time charts, transaction management and budget forecasting.',
      challenge: 'Keeping chart renders smooth while streaming real-time transaction data — used a virtual list for the transaction feed and Chart.js with incremental dataset updates rather than full re-renders.',
      tags: ['Next.js', 'Supabase', 'Chart.js'],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=85',
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=85',
      ],
      features: [
        { title: 'Real-time Charts', desc: 'Chart.js line and bar charts updated via Supabase Realtime subscriptions — smooth incremental data appending without full re-renders.' },
        { title: 'Transaction Feed', desc: 'Virtualised transaction list handling 10k+ rows with search, filter, and category tagging — sub-16ms renders on mid-range hardware.' },
        { title: 'Budget Forecasting', desc: 'Rule-based forecasting engine that projects monthly spend from historical patterns and flags budget overruns with inline alerts.' },
        { title: 'Auth & Tenancy', desc: 'Supabase RLS ensures strict data isolation per user — every query is automatically scoped to the authenticated session at the database layer.' },
      ],
      url: '#',
      featured: false,
      sortOrder: 5,
    },
    {
      title: 'Bloom Wellness',
      slug: 'bloom-wellness',
      type: 'Brand Website',
      year: 2023,
      role: 'Designer & Developer',
      duration: '4 weeks',
      description: 'A wellness brand website with smooth micro-animations, a booking system and a clean minimalist aesthetic.',
      challenge: 'Creating a sense of calm through motion — every animation had to feel deliberate and unhurried, using spring physics rather than duration curves to make transitions feel organic.',
      tags: ['Next.js', 'Framer Motion', 'Sanity'],
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=85',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=85',
      ],
      features: [
        { title: 'Spring Animations', desc: 'Every UI transition uses Framer Motion spring physics tuned to feel slow and intentional — reinforcing the calm brand personality.' },
        { title: 'Class Booking', desc: 'Integrated class schedule with real-time availability — users can book, cancel, and add to calendar directly from the website.' },
        { title: 'Sanity CMS', desc: 'The team manages blog content, class schedules, and instructor profiles entirely through Sanity Studio without developer involvement.' },
        { title: 'Accessibility', desc: 'WCAG AA compliant — focus rings, skip links, reduced-motion media query support, and semantic HTML throughout.' },
      ],
      url: '#',
      featured: false,
      sortOrder: 6,
    },
    {
      title: 'Cargolink',
      slug: 'cargolink',
      type: 'Web Application',
      year: 2023,
      role: 'Full Stack Developer',
      duration: '10 weeks',
      description: 'A logistics platform connecting shippers and carriers — live tracking, quote management and driver dashboards.',
      challenge: 'Real-time location updates for hundreds of concurrent shipments — solved with Supabase Realtime channels per shipment and a map clustering algorithm to keep Mapbox GL rendering performant.',
      tags: ['React', 'Node.js', 'PostgreSQL'],
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1200&q=85',
        'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=85',
      ],
      features: [
        { title: 'Live Tracking', desc: 'Mapbox GL map with real-time driver positions via Supabase Realtime — dynamic clustering keeps rendering fast even with hundreds of active shipments.' },
        { title: 'Quote Engine', desc: 'Instant freight quote calculator based on weight, dimensions, route, and carrier rates — quotes lock for 24 hours and convert to bookings in one click.' },
        { title: 'Driver Dashboard', desc: 'Mobile-optimised driver app built in React — shows assigned loads, turn-by-turn routing via Mapbox Directions API, and delivery confirmation with photo upload.' },
        { title: 'Shipper Portal', desc: 'Full shipment lifecycle management — create, track, and invoice shipments with PDF generation, email notifications, and a searchable history.' },
      ],
      url: '#',
      featured: false,
      sortOrder: 7,
    },
  ]

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    })
  }
  console.log(`  ${projects.length} projects seeded`)

  // ─── Services ────────────────────────────────────────────────────
  const services = [
    { slug: 'web-development', num: '01', title: 'Web Development', tag: 'Full Stack', description: 'End-to-end web solutions built with modern technologies. From pixel-perfect frontends to scalable backend systems, I craft digital products that are fast, maintainable, and built to last.', points: ['Next.js & React application architecture', 'REST & GraphQL API design and integration', 'Authentication, sessions & role-based access', 'Responsive, accessible, WCAG-compliant UI'], deliverables: ['Source code & documentation', 'CI/CD deployment pipeline', 'Performance audit', '30-day post-launch support'], image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=Web+Development', sortOrder: 0 },
    { slug: 'ui-ux-design', num: '02', title: 'UI/UX Design', tag: 'Interaction', description: 'Interfaces that feel intuitive before they feel beautiful. I design with user behaviour in mind — mapping flows, prototyping interactions, and refining until every tap and click feels inevitable.', points: ['User flow mapping & wireframing', 'High-fidelity Figma prototypes', 'Design system & component library', 'Usability testing & iteration'], deliverables: ['Figma source files', 'Design system documentation', 'Interactive prototype', 'Handoff specs'], image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=UI+%2F+UX+Design', sortOrder: 1 },
    { slug: 'motion-design', num: '03', title: 'Motion Design', tag: 'GSAP · Animation', description: 'Animation that earns its place — every transition, reveal, and micro-interaction is intentional. I use GSAP, Framer Motion, and CSS to turn static interfaces into experiences that feel alive.', points: ['GSAP ScrollTrigger & timeline sequences', 'Page transitions & route animations', 'Micro-interaction & hover effects', 'Performance-safe animation (will-change, RAF)'], deliverables: ['Animated component library', 'Motion spec documentation', 'Performance report', 'Source animations'], image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=Motion+Design', sortOrder: 2 },
    { slug: 'creative-direction', num: '04', title: 'Creative Direction', tag: 'Concept', description: 'Brand identity, visual language, and creative strategy. I help teams develop a consistent visual voice — from colour and type to imagery and tone — that resonates across every touchpoint.', points: ['Brand identity & visual language', 'Moodboards, colour & typography systems', 'Art direction for photography & video', 'Cross-platform creative guidelines'], deliverables: ['Brand guidelines document', 'Asset library', 'Style guide', 'Creative brief template'], image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=Creative+Direction', sortOrder: 3 },
    { slug: 'ecommerce', num: '05', title: 'E-commerce', tag: 'Commerce', description: 'Storefronts that convert. I build e-commerce experiences with the Shopify Storefront API, WooCommerce, or custom stacks — optimised for speed, discovery, and frictionless checkout.', points: ['Shopify Storefront API & custom themes', 'Product listings, cart & checkout flows', 'Inventory sync & order management', 'Conversion-focused UX patterns'], deliverables: ['Storefront codebase', 'Admin dashboard', 'Analytics setup', 'Merchant documentation'], image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=E-commerce', sortOrder: 4 },
    { slug: 'cms-integration', num: '06', title: 'CMS Integration', tag: 'Content', description: 'Headless CMS setups that give content teams independence without sacrificing developer control. Sanity, Contentful, or Payload — I build structured content models your editors will actually enjoy using.', points: ['Sanity, Contentful & Payload CMS setup', 'Custom content schemas & validation', 'Preview mode & live content editing', 'Webhook-driven revalidation (Next.js ISR)'], deliverables: ['CMS setup & schemas', 'Studio customisation', 'Editor documentation', 'Migration scripts'], image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=CMS+Integration', sortOrder: 5 },
    { slug: 'performance-optimisation', num: '07', title: 'Performance Optimisation', tag: 'Speed · Core Web Vitals', description: 'Speed is a feature. I audit and optimise existing sites for Lighthouse scores, Core Web Vitals, and real-world load times — cutting payload, removing render-blocking resources, and making every byte count.', points: ['Lighthouse & Core Web Vitals audit', 'Image optimisation & next-gen formats', 'Bundle analysis, code splitting & lazy loading', 'CDN strategy & edge caching setup'], deliverables: ['Full performance audit report', 'Optimised codebase', 'Before / after metrics', 'Ongoing monitoring setup'], image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=Performance+Optimisation', sortOrder: 6 },
    { slug: 'api-backend', num: '08', title: 'API & Backend', tag: 'Server · Database', description: 'Robust server-side systems that power your frontend without bottlenecks. From REST and GraphQL APIs to real-time Supabase backends, I build the data layer that keeps your product reliable at scale.', points: ['Node.js, Express & serverless functions', 'PostgreSQL / Supabase database design', 'Real-time subscriptions & webhooks', 'Third-party API integration & OAuth flows'], deliverables: ['API documentation (OpenAPI)', 'Database schema & migrations', 'Postman collection', 'Deployment & scaling guide'], image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=API+%26+Backend', sortOrder: 7 },
  ]

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    })
  }
  console.log(`  ${services.length} services seeded`)

  // ─── Blog posts ──────────────────────────────────────────────────
  const posts = [
    { slug: 'when-scroll-animations-hurt', num: '001', category: 'Motion', title: 'When Scroll Animations Hurt More Than They Help', excerpt: 'There is a point where animation stops serving the user and starts performing for the designer. How to know which side you are on.', date: '12 May 2025', readTime: '6 min', image: 'https://placehold.co/560x420/1a1a1a/f0eeea?text=001', published: true },
    { slug: 'typography-first', num: '002', category: 'Design', title: 'Typography First: Why I Start Every Project With Type', excerpt: 'Before colour, before layout, before anything else — getting the type system right is the fastest way to make everything else fall into place.', date: '3 Apr 2025', readTime: '5 min', image: 'https://placehold.co/560x420/f0eeea/1a1a1a?text=002', published: true },
    { slug: 'gsap-scrolltrigger-patterns', num: '003', category: 'Development', title: 'GSAP ScrollTrigger: The Only Patterns I Actually Use', excerpt: 'Stripped back to what is genuinely useful — fromTo with toggleActions, context cleanup, and why scrub is almost never the answer.', date: '18 Mar 2025', readTime: '8 min', image: 'https://placehold.co/560x420/ff4d00/f0eeea?text=003', published: true },
    { slug: 'case-against-dark-mode-default', num: '004', category: 'Design', title: 'The Case Against Dark Mode as the Default', excerpt: 'Dark mode has become a personality trait for developer portfolios. That is exactly why mine is not dark by default.', date: '27 Feb 2025', readTime: '4 min', image: 'https://placehold.co/560x420/1a1a1a/f0eeea?text=004', published: true },
    { slug: 'building-design-system-zero', num: '005', category: 'Process', title: 'Building a Design System From Zero Without Losing Your Mind', excerpt: 'Tokens, components, documentation — in what order and to what depth. A practical guide from someone who has done it both ways.', date: '9 Jan 2025', readTime: '10 min', image: 'https://placehold.co/560x420/f0eeea/1a1a1a?text=005', published: true },
    { slug: 'performance-budget-discipline', num: '006', category: 'Development', title: 'Performance Is a Design Decision, Not an Afterthought', excerpt: 'Every image, every font weight, every animation has a cost. The discipline of setting a budget before you write a single line.', date: '14 Dec 2024', readTime: '7 min', image: 'https://placehold.co/560x420/ff4d00/f0eeea?text=006', published: true },
  ]

  for (const p of posts) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    })
  }
  console.log(`  ${posts.length} posts seeded`)

  // ─── Stack categories & items ────────────────────────────────────
  const stackData = [
    {
      num: '01', label: 'Languages', desc: 'The languages I think in', sortOrder: 0,
      items: [
        { name: 'JavaScript', slug: 'javascript', color: 'F7DF1E', sortOrder: 0 },
        { name: 'TypeScript', slug: 'typescript', color: '3178C6', sortOrder: 1 },
        { name: 'Python', slug: 'python', color: '3776AB', sortOrder: 2 },
        { name: 'PHP', slug: 'php', color: '777BB4', sortOrder: 3 },
        { name: 'SQL', slug: 'mysql', color: '4479A1', sortOrder: 4 },
        { name: 'Bash', slug: 'gnubash', color: '4EAA25', sortOrder: 5 },
      ],
    },
    {
      num: '02', label: 'Frameworks', desc: 'The frameworks I build with', sortOrder: 1,
      items: [
        { name: 'Next.js', slug: 'nextdotjs', color: 'eeeeee', sortOrder: 0 },
        { name: 'React', slug: 'react', color: '61DAFB', sortOrder: 1 },
        { name: 'Vue.js', slug: 'vuedotjs', color: '4FC08D', sortOrder: 2 },
        { name: 'Node.js', slug: 'nodedotjs', color: '339933', sortOrder: 3 },
        { name: 'Express', slug: 'express', color: 'aaaaaa', sortOrder: 4 },
        { name: 'Laravel', slug: 'laravel', color: 'FF2D20', sortOrder: 5 },
        { name: 'Nuxt.js', slug: 'nuxtdotjs', color: '00DC82', sortOrder: 6 },
      ],
    },
    {
      num: '03', label: 'Motion & 3D', desc: 'Tools that bring things to life', sortOrder: 2,
      items: [
        { name: 'GSAP', slug: 'greensock', color: '88CE02', sortOrder: 0 },
        { name: 'Framer Motion', slug: 'framer', color: '6699FF', sortOrder: 1 },
        { name: 'Three.js', slug: 'threedotjs', color: 'cccccc', sortOrder: 2 },
        { name: 'Lenis', slug: '', color: 'f0eeea', sortOrder: 3 },
        { name: 'ScrollTrigger', slug: 'greensock', color: '88CE02', sortOrder: 4 },
        { name: 'Anime.js', slug: '', color: 'f0eeea', sortOrder: 5 },
      ],
    },
    {
      num: '04', label: 'Styling', desc: 'How I make things look right', sortOrder: 3,
      items: [
        { name: 'Tailwind CSS', slug: 'tailwindcss', color: '06B6D4', sortOrder: 0 },
        { name: 'Sass', slug: 'sass', color: 'CC6699', sortOrder: 1 },
        { name: 'CSS Modules', slug: 'css3', color: '1572B6', sortOrder: 2 },
        { name: 'Styled Comps', slug: 'styledcomponents', color: 'DB7093', sortOrder: 3 },
        { name: 'PostCSS', slug: 'postcss', color: 'DD3A0A', sortOrder: 4 },
        { name: 'Radix UI', slug: 'radixui', color: 'cccccc', sortOrder: 5 },
      ],
    },
    {
      num: '05', label: 'CMS & Headless', desc: 'Content infrastructure', sortOrder: 4,
      items: [
        { name: 'Sanity', slug: 'sanity', color: 'F03E2F', sortOrder: 0 },
        { name: 'Contentful', slug: 'contentful', color: '2478CC', sortOrder: 1 },
        { name: 'WordPress', slug: 'wordpress', color: '21759B', sortOrder: 2 },
        { name: 'Webflow', slug: 'webflow', color: '4353FF', sortOrder: 3 },
        { name: 'Shopify', slug: 'shopify', color: '7AB55C', sortOrder: 4 },
        { name: 'Strapi', slug: 'strapi', color: '4945FF', sortOrder: 5 },
      ],
    },
    {
      num: '06', label: 'DevOps & Tools', desc: 'How I ship and collaborate', sortOrder: 5,
      items: [
        { name: 'Git', slug: 'git', color: 'F05032', sortOrder: 0 },
        { name: 'Docker', slug: 'docker', color: '2496ED', sortOrder: 1 },
        { name: 'Vercel', slug: 'vercel', color: 'cccccc', sortOrder: 2 },
        { name: 'AWS', slug: 'amazonaws', color: 'FF9900', sortOrder: 3 },
        { name: 'Figma', slug: 'figma', color: 'F24E1E', sortOrder: 4 },
        { name: 'Postman', slug: 'postman', color: 'FF6C37', sortOrder: 5 },
        { name: 'VS Code', slug: 'visualstudiocode', color: '007ACC', sortOrder: 6 },
      ],
    },
    {
      num: '07', label: 'CRM & SaaS', desc: 'Platforms and integrations', sortOrder: 6,
      items: [
        { name: 'Stripe', slug: 'stripe', color: '635BFF', sortOrder: 0 },
        { name: 'Supabase', slug: 'supabase', color: '3ECF8E', sortOrder: 1 },
        { name: 'Firebase', slug: 'firebase', color: 'FFCA28', sortOrder: 2 },
        { name: 'HubSpot', slug: 'hubspot', color: 'FF7A59', sortOrder: 3 },
        { name: 'Salesforce', slug: 'salesforce', color: '00A1E0', sortOrder: 4 },
        { name: 'Klaviyo', slug: 'klaviyo', color: 'cccccc', sortOrder: 5 },
      ],
    },
    {
      num: '08', label: 'Web Solutions', desc: 'What I build end-to-end', sortOrder: 7,
      items: [
        { name: 'E-commerce', slug: 'shopify', color: '7AB55C', sortOrder: 0 },
        { name: 'SaaS Apps', slug: 'supabase', color: '3ECF8E', sortOrder: 1 },
        { name: 'Dashboards', slug: 'chartdotjs', color: 'FF6384', sortOrder: 2 },
        { name: 'REST APIs', slug: 'postman', color: 'FF6C37', sortOrder: 3 },
        { name: 'GraphQL', slug: 'graphql', color: 'E10098', sortOrder: 4 },
        { name: 'PWAs', slug: 'pwa', color: '5A0FC8', sortOrder: 5 },
      ],
    },
  ]

  for (const cat of stackData) {
    const { items, ...catData } = cat
    const category = await prisma.stackCategory.upsert({
      where: { id: `cat-${catData.num}` },
      update: catData,
      create: { id: `cat-${catData.num}`, ...catData },
    })
    for (const item of items) {
      await prisma.stackItem.upsert({
        where: { id: `item-${catData.num}-${item.sortOrder}` },
        update: { ...item, categoryId: category.id },
        create: { id: `item-${catData.num}-${item.sortOrder}`, ...item, categoryId: category.id },
      })
    }
  }
  console.log(`  ${stackData.length} stack categories seeded`)

  // ─── Site settings ───────────────────────────────────────────────
  const siteSettings = {
    hero: {
      heading: 'Building products people *enjoy using.*',
      bio: 'Self-taught developer passionate about turning ideas into real products. I build modern web applications, SaaS platforms, and digital experiences with a focus on performance, usability, and clean execution.',
      marqueeText: 'Full-Stack Developer',
      location: 'Dubai, UAE',
      availabilityStatus: true,
      availabilityText: 'Currently available for Freelance projects.',
      portraitImage: '/images/aftab.jpg',
    },
    about: {
      storyParagraph1: "I didn't learn development in a classroom. I learned it by building projects, solving problems, breaking things, and figuring out how to make them work again. What started as curiosity became a long-term commitment to creating products that are useful, reliable, and enjoyable to use.",
      storyParagraph2: 'Being self-taught taught me more than programming. It taught me how to learn, adapt, and solve problems independently. Every project is another opportunity to improve, experiment, and create something meaningful.',
      scrollRevealWords: [
        { w: 'A' },
        { w: 'developer' },
        { w: 'who', italic: true },
        { w: 'learned', italic: true },
        { w: 'by', italic: true },
        { w: 'building.', italic: true },
        { w: 'Not' },
        { w: 'in' },
        { w: 'a' },
        { w: 'classroom', accent: true },
        { w: '—' },
        { w: 'in' },
        { w: 'the' },
        { w: 'real' },
        { w: 'world.' },
      ],
      stats: [
        { num: '5+', label: 'Years' },
        { num: '40+', label: 'Projects' },
        { num: '2', label: 'Disciplines' },
      ],
      images: [
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
        'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=400&q=80',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
        'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80',
      ],
    },
    footer: {
      email: 'aftab@matildacake.com',
      socialLinks: [
        { label: 'LinkedIn', url: '#' },
        { label: 'GitHub', url: '#' },
        { label: 'Instagram', url: '#' },
        { label: 'Dribbble', url: '#' },
      ],
      tickerText: 'Available for Freelance · Based in Dubai · Creative Development · Motion Design · UI/UX Design · Web Development · ',
      wordReveal: [
        { w: 'Whether' },
        { w: "you're" },
        { w: 'starting', accent: true },
        { w: 'from' },
        { w: 'scratch' },
        { w: 'or' },
        { w: 'improving', italic: true },
        { w: 'an', italic: true },
        { w: 'existing', italic: true },
        { w: 'product,', italic: true },
        { w: "let's" },
        { w: 'build' },
        { w: 'something' },
        { w: 'real.' },
      ],
      images: [
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
        'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
        'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&q=80',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80',
      ],
      copyrightName: 'Aftab',
      techCredits: 'Next.js · GSAP · Three.js · Framer Motion',
    },
    contact: {
      interests: ['Web Development', 'UI/UX Design', 'E-commerce', 'CMS Integration', 'Motion Design', 'Full Package'],
      phonePlaceholder: '+971 XX XXX XXXX',
    },
  }

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: { data: siteSettings },
    create: { id: 'singleton', data: siteSettings },
  })
  console.log('  Site settings seeded')

  console.log('Seeding complete!')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
