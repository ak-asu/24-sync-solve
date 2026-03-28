import type { Metadata } from 'next'
import GlobalHomePage from './(global)/page'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'WIAL — World Institute for Action Learning',
  description:
    'WIAL certifies Action Learning coaches across 20+ countries. Find a coach, get certified, or join a chapter near you.',
  openGraph: {
    title: 'WIAL — World Institute for Action Learning',
    description:
      'Transforming leaders through the power of Action Learning. Certified coaches in 20+ countries.',
  },
}

export default function HomePage() {
  return <GlobalHomePage />
}
