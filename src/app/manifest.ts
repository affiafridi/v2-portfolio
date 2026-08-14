import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aftab — Creative Developer',
    short_name: 'Aftab',
    description: 'Creative developer crafting immersive digital experiences that push the limits of the web.',
    start_url: '/',
    display: 'browser',
    background_color: '#f0eeea',
    theme_color: '#ff4d00',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
