import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPageWithBlocks } from '@/features/content/queries/getPageBlocks'
import { EditablePageRendererWrapper as EditablePageRenderer } from '@/components/editor/EditablePageRendererWrapper'
import { canEditChapter } from '@/lib/utils/serverAuth'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Action Learning resources, research publications, webinars, and practitioner guides from WIAL.',
}

export default async function ResourcesPage() {
  const supabase = await createClient()
  const isEditor = await canEditChapter(null)
  const result = await getPageWithBlocks(supabase, null, 'resources', isEditor)

  return result ? (
    <EditablePageRenderer initialBlocks={result.blocks} pageId={result.page.id} />
  ) : (
    <FallbackResources />
  )
}

const RESOURCE_CATEGORIES = [
  {
    title: 'Research & Publications',
    icon: '📄',
    desc: 'Peer-reviewed articles from the Action Learning: Research and Practice journal, covering theory, case studies, and evidence-based practice across industries and regions.',
    items: [
      'Action Learning in organizational change management',
      'Cross-cultural applications of the WIAL methodology',
      'Measuring ROI in Action Learning programs',
      'Leadership development through Action Learning sets',
    ],
  },
  {
    title: 'Practitioner Guides',
    icon: '📘',
    desc: 'Step-by-step guides and facilitation frameworks for Action Learning coaches at all certification levels.',
    items: [
      'CALC Facilitation Starter Guide',
      'Running a Problem Statement Workshop',
      'Virtual Action Learning Set Best Practices',
      'Coaching Reflection Templates',
    ],
  },
  {
    title: 'Webinars & Recordings',
    icon: '🎥',
    desc: 'Past webinars featuring WIAL master coaches, researchers, and organizational leaders sharing real-world experiences.',
    items: [
      'Introduction to Action Learning (free)',
      'Advanced Facilitation Techniques',
      'Action Learning in Healthcare Settings',
      'Building a Coaching Culture with Action Learning',
    ],
  },
  {
    title: 'Tools & Templates',
    icon: '🛠',
    desc: 'Ready-to-use worksheets, session planning templates, and evaluation instruments for coaches and chapter leads.',
    items: [
      'Action Learning Set Planning Template',
      'Coach Session Log (CALC)',
      'Organizational Assessment Questionnaire',
      'Cohort Progress Tracker',
    ],
  },
]

function FallbackResources() {
  return (
    <>
      {/* Hero */}
      <section className="bg-wial-navy py-16 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h1 className="text-4xl font-extrabold">Resources & Library</h1>
          <p className="mt-4 text-lg text-white/80">
            Research, practitioner guides, webinar recordings, and tools for Action Learning coaches
            and organizational leaders.
          </p>
        </div>
      </section>

      {/* Resource categories */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {RESOURCE_CATEGORIES.map((cat) => (
              <div key={cat.title} className="rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {cat.icon}
                  </span>
                  <h2 className="text-wial-navy text-lg font-bold">{cat.title}</h2>
                </div>
                <p className="mt-3 text-sm text-gray-600">{cat.desc}</p>
                <ul className="mt-4 space-y-1.5">
                  {cat.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-wial-red mt-0.5 font-bold">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research library note */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-wial-navy text-2xl font-bold">Action Learning Journal</h2>
            <p className="mt-3 text-gray-600">
              WIAL publishes and curates research through the{' '}
              <em>Action Learning: Research and Practice</em> journal, the leading peer-reviewed
              publication in the field. Articles cover coach development, organizational change,
              cross-cultural applications, and evidence-based practice.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Access to full articles is available to WIAL members and certified coaches. Contact
              your chapter lead or reach out to WIAL Global for access information.
            </p>
            <div className="mt-6">
              <Link
                href="/about#contact"
                className="bg-wial-navy hover:bg-wial-navy-dark inline-block rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-wial-navy py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-white">Contribute to the Community</h2>
          <p className="mt-3 text-white/70">
            WIAL certified coaches are encouraged to share case studies, research, and tools with
            the global community.
          </p>
          <Link
            href="/about#contact"
            className="bg-wial-red hover:bg-wial-red-dark mt-8 inline-block rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            Submit a Resource
          </Link>
        </div>
      </section>
    </>
  )
}
