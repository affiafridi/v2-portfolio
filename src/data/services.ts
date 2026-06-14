export interface Service {
  slug:         string
  num:          string
  title:        string
  tag:          string
  description:  string
  points:       string[]
  deliverables: string[]
  image:        string   // image URL for hero on detail page
}

export const services: Service[] = [
  {
    slug:        'web-development',
    num:         '01',
    title:       'Web Development',
    tag:         'Full Stack',
    description: 'End-to-end web solutions built with modern technologies. From pixel-perfect frontends to scalable backend systems, I craft digital products that are fast, maintainable, and built to last.',
    points: [
      'Next.js & React application architecture',
      'REST & GraphQL API design and integration',
      'Authentication, sessions & role-based access',
      'Responsive, accessible, WCAG-compliant UI',
    ],
    deliverables: ['Source code & documentation', 'CI/CD deployment pipeline', 'Performance audit', '30-day post-launch support'],
    image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=Web+Development',
  },
  {
    slug:        'ui-ux-design',
    num:         '02',
    title:       'UI/UX Design',
    tag:         'Interaction',
    description: 'Interfaces that feel intuitive before they feel beautiful. I design with user behaviour in mind — mapping flows, prototyping interactions, and refining until every tap and click feels inevitable.',
    points: [
      'User flow mapping & wireframing',
      'High-fidelity Figma prototypes',
      'Design system & component library',
      'Usability testing & iteration',
    ],
    deliverables: ['Figma source files', 'Design system documentation', 'Interactive prototype', 'Handoff specs'],
    image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=UI+%2F+UX+Design',
  },
  {
    slug:        'motion-design',
    num:         '03',
    title:       'Motion Design',
    tag:         'GSAP · Animation',
    description: 'Animation that earns its place — every transition, reveal, and micro-interaction is intentional. I use GSAP, Framer Motion, and CSS to turn static interfaces into experiences that feel alive.',
    points: [
      'GSAP ScrollTrigger & timeline sequences',
      'Page transitions & route animations',
      'Micro-interaction & hover effects',
      'Performance-safe animation (will-change, RAF)',
    ],
    deliverables: ['Animated component library', 'Motion spec documentation', 'Performance report', 'Source animations'],
    image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=Motion+Design',
  },
  {
    slug:        'creative-direction',
    num:         '04',
    title:       'Creative Direction',
    tag:         'Concept',
    description: 'Brand identity, visual language, and creative strategy. I help teams develop a consistent visual voice — from colour and type to imagery and tone — that resonates across every touchpoint.',
    points: [
      'Brand identity & visual language',
      'Moodboards, colour & typography systems',
      'Art direction for photography & video',
      'Cross-platform creative guidelines',
    ],
    deliverables: ['Brand guidelines document', 'Asset library', 'Style guide', 'Creative brief template'],
    image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=Creative+Direction',
  },
  {
    slug:        'ecommerce',
    num:         '05',
    title:       'E-commerce',
    tag:         'Commerce',
    description: 'Storefronts that convert. I build e-commerce experiences with the Shopify Storefront API, WooCommerce, or custom stacks — optimised for speed, discovery, and frictionless checkout.',
    points: [
      'Shopify Storefront API & custom themes',
      'Product listings, cart & checkout flows',
      'Inventory sync & order management',
      'Conversion-focused UX patterns',
    ],
    deliverables: ['Storefront codebase', 'Admin dashboard', 'Analytics setup', 'Merchant documentation'],
    image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=E-commerce',
  },
  {
    slug:        'cms-integration',
    num:         '06',
    title:       'CMS Integration',
    tag:         'Content',
    description: 'Headless CMS setups that give content teams independence without sacrificing developer control. Sanity, Contentful, or Payload — I build structured content models your editors will actually enjoy using.',
    points: [
      'Sanity, Contentful & Payload CMS setup',
      'Custom content schemas & validation',
      'Preview mode & live content editing',
      'Webhook-driven revalidation (Next.js ISR)',
    ],
    deliverables: ['CMS setup & schemas', 'Studio customisation', 'Editor documentation', 'Migration scripts'],
    image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=CMS+Integration',
  },
  {
    slug:        'performance-optimisation',
    num:         '07',
    title:       'Performance Optimisation',
    tag:         'Speed · Core Web Vitals',
    description: 'Speed is a feature. I audit and optimise existing sites for Lighthouse scores, Core Web Vitals, and real-world load times — cutting payload, removing render-blocking resources, and making every byte count.',
    points: [
      'Lighthouse & Core Web Vitals audit',
      'Image optimisation & next-gen formats',
      'Bundle analysis, code splitting & lazy loading',
      'CDN strategy & edge caching setup',
    ],
    deliverables: ['Full performance audit report', 'Optimised codebase', 'Before / after metrics', 'Ongoing monitoring setup'],
    image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=Performance+Optimisation',
  },
  {
    slug:        'api-backend',
    num:         '08',
    title:       'API & Backend',
    tag:         'Server · Database',
    description: 'Robust server-side systems that power your frontend without bottlenecks. From REST and GraphQL APIs to real-time Supabase backends, I build the data layer that keeps your product reliable at scale.',
    points: [
      'Node.js, Express & serverless functions',
      'PostgreSQL / Supabase database design',
      'Real-time subscriptions & webhooks',
      'Third-party API integration & OAuth flows',
    ],
    deliverables: ['API documentation (OpenAPI)', 'Database schema & migrations', 'Postman collection', 'Deployment & scaling guide'],
    image: 'https://placehold.co/800x600/1a1a1a/f0eeea?text=API+%26+Backend',
  },
]
