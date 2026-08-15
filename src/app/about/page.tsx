import { notFound } from 'next/navigation'

// Hidden for now — page isn't built yet, so direct navigation 404s the same
// way an unbuilt route normally would, instead of showing the "About" stub.
export default function AboutPage() {
  notFound()
}
