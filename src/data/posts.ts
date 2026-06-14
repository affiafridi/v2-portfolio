export interface Post {
  slug:      string
  num:       string
  category:  string
  title:     string
  excerpt:   string
  date:      string
  readTime:  string
  image:     string
}

export const posts: Post[] = [
  {
    slug:     'when-scroll-animations-hurt',
    num:      '001',
    category: 'Motion',
    title:    'When Scroll Animations Hurt More Than They Help',
    excerpt:  'There is a point where animation stops serving the user and starts performing for the designer. How to know which side you are on.',
    date:     '12 May 2025',
    readTime: '6 min',
    image:    'https://placehold.co/560x420/1a1a1a/f0eeea?text=001',
  },
  {
    slug:     'typography-first',
    num:      '002',
    category: 'Design',
    title:    'Typography First: Why I Start Every Project With Type',
    excerpt:  'Before colour, before layout, before anything else — getting the type system right is the fastest way to make everything else fall into place.',
    date:     '3 Apr 2025',
    readTime: '5 min',
    image:    'https://placehold.co/560x420/f0eeea/1a1a1a?text=002',
  },
  {
    slug:     'gsap-scrolltrigger-patterns',
    num:      '003',
    category: 'Development',
    title:    'GSAP ScrollTrigger: The Only Patterns I Actually Use',
    excerpt:  'Stripped back to what is genuinely useful — fromTo with toggleActions, context cleanup, and why scrub is almost never the answer.',
    date:     '18 Mar 2025',
    readTime: '8 min',
    image:    'https://placehold.co/560x420/ff4d00/f0eeea?text=003',
  },
  {
    slug:     'case-against-dark-mode-default',
    num:      '004',
    category: 'Design',
    title:    'The Case Against Dark Mode as the Default',
    excerpt:  'Dark mode has become a personality trait for developer portfolios. That is exactly why mine is not dark by default.',
    date:     '27 Feb 2025',
    readTime: '4 min',
    image:    'https://placehold.co/560x420/1a1a1a/f0eeea?text=004',
  },
  {
    slug:     'building-design-system-zero',
    num:      '005',
    category: 'Process',
    title:    'Building a Design System From Zero Without Losing Your Mind',
    excerpt:  'Tokens, components, documentation — in what order and to what depth. A practical guide from someone who has done it both ways.',
    date:     '9 Jan 2025',
    readTime: '10 min',
    image:    'https://placehold.co/560x420/f0eeea/1a1a1a?text=005',
  },
  {
    slug:     'performance-budget-discipline',
    num:      '006',
    category: 'Development',
    title:    'Performance Is a Design Decision, Not an Afterthought',
    excerpt:  'Every image, every font weight, every animation has a cost. The discipline of setting a budget before you write a single line.',
    date:     '14 Dec 2024',
    readTime: '7 min',
    image:    'https://placehold.co/560x420/ff4d00/f0eeea?text=006',
  },
]
