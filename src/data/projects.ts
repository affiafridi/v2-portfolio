import type { Project } from '@/types'

export const projects: Project[] = [
  {
    id: '1',
    title: 'Luminary',
    slug: 'luminary',
    description:
      'An immersive brand identity and web experience for a luxury lighting studio exploring the boundaries of light and space.',
    tags: ['Brand Identity', 'Web Design', 'Three.js'],
    image: '/images/projects/luminary.jpg',
    url: 'https://luminary.example.com',
    year: 2024,
  },
  {
    id: '2',
    title: 'Forma',
    slug: 'forma',
    description:
      'A generative art platform where mathematics meets visual expression — procedural geometry rendered in real time.',
    tags: ['Creative Development', 'WebGL', 'React'],
    image: '/images/projects/forma.jpg',
    url: 'https://forma.example.com',
    year: 2024,
  },
  {
    id: '3',
    title: 'Parallax Studio',
    slug: 'parallax-studio',
    description:
      'A motion design studio portfolio driven entirely by scroll — every section choreographed with GSAP timelines.',
    tags: ['Motion Design', 'GSAP', 'Next.js'],
    image: '/images/projects/parallax.jpg',
    year: 2023,
  },
  {
    id: '4',
    title: 'Noctua',
    slug: 'noctua',
    description:
      'A dark-mode e-commerce experience for an artisanal coffee brand, balancing editorial art direction with conversion.',
    tags: ['E-commerce', 'UI/UX', 'Framer Motion'],
    image: '/images/projects/noctua.jpg',
    url: 'https://noctua.example.com',
    year: 2023,
  },
]
