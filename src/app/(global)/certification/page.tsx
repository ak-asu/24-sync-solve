import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPageWithBlocks } from '@/features/content/queries/getPageBlocks'
import { EditablePageRendererWrapper as EditablePageRenderer } from '@/components/editor/EditablePageRendererWrapper'
import { canEditChapter } from '@/lib/utils/serverAuth'
import { CERTIFICATION_LABELS, CERTIFICATION_ORDER } from '@/lib/utils/constants'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Certification',
  description:
    'Earn globally recognized Action Learning coach certification at four progressive levels: CALC, PALC, SALC, and MALC.',
}

export default async function CertificationPage() {
  const supabase = await createClient()
  const isEditor = await canEditChapter(null)
  const result = await getPageWithBlocks(supabase, null, 'certification', isEditor)

  return result ? (
    <EditablePageRenderer initialBlocks={result.blocks} pageId={result.page.id} />
  ) : (
    <FallbackCertification />
  )
}

const LEVEL_DETAILS: Record<
  string,
  { hours: string; sets: string; cycle: string; desc: string; pathway: string }
> = {
  CALC: {
    hours: '32+ hours',
    sets: '3 supervised sets',
    cycle: '2-year recertification',
    desc: 'Entry-level certification for practitioners new to Action Learning facilitation.',
    pathway:
      'Complete training program → Log 3 supervised coaching sets → Submit application → Receive CALC credential',
  },
  PALC: {
    hours: '100+ coaching hours',
    sets: '5 sets logged',
    cycle: '2-year recertification',
    desc: 'For coaches with demonstrated competency across diverse organizational contexts.',
    pathway:
      'Hold CALC → Accumulate 100+ coaching hours → Complete 5 logged sets → Peer review → Apply for PALC',
  },
  SALC: {
    hours: '200+ coaching hours',
    sets: '8+ sets with peer review',
    cycle: '2-year recertification',
    desc: 'Recognizes mastery in complex organizational settings.',
    pathway:
      'Hold PALC → Accumulate 200+ hours → Submit 8+ sets with peer review → Mentor evaluation → Apply for SALC',
  },
  MALC: {
    hours: 'Extensive field contribution',
    sets: 'Demonstrated mastery',
    cycle: '2-year recertification',
    desc: 'The highest WIAL certification — awarded to coaches with exceptional mastery and significant contribution to the field.',
    pathway:
      'Hold SALC → Significant field contribution → Global peer nomination → WIAL review committee → MALC awarded',
  },
}

const PROCESS_STEPS = [
  {
    step: '1',
    title: 'Find a Training Program',
    body: 'Enroll in a WIAL-accredited CALC training program run by a SALC or MALC certified coach in your region.',
  },
  {
    step: '2',
    title: 'Complete Your Training Hours',
    body: 'Attend the required 32+ hours of structured Action Learning training including live facilitation practice.',
  },
  {
    step: '3',
    title: 'Log Supervised Coaching Sets',
    body: 'Facilitate a minimum number of Action Learning sets (varies by level) under supervision of a certified coach.',
  },
  {
    step: '4',
    title: 'Submit Your Application',
    body: 'Apply through WIAL with your session logs, supervisor endorsement, and required documentation.',
  },
  {
    step: '5',
    title: 'Receive Your Credential',
    body: 'Upon approval, receive your digital badge (via Credly) and physical certificate. Begin your 2-year recertification cycle.',
  },
]

function FallbackCertification() {
  return (
    <>
      {/* Hero */}
      <section className="bg-wial-navy py-16 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h1 className="text-4xl font-extrabold">Action Learning Certification</h1>
          <p className="mt-4 text-lg text-white/80">
            Earn globally recognized credentials as an Action Learning coach. WIAL certifications
            are recognized by organizations across 20+ countries.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/coaches/apply"
              className="bg-wial-red hover:bg-wial-red-dark rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors"
            >
              Apply for Certification
            </Link>
            <Link
              href="/coaches"
              className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Find a Certified Coach
            </Link>
          </div>
        </div>
      </section>

      {/* Certification levels */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <h2 className="text-wial-navy mb-2 text-3xl font-bold">Certification Levels</h2>
          <p className="mb-10 text-gray-500">
            All certifications are valid for 2 years and require continuing education to renew.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {CERTIFICATION_ORDER.map((level, i) => {
              const details = LEVEL_DETAILS[level]
              if (!details) return null
              return (
                <div key={level} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-wial-red flex size-9 items-center justify-center rounded-full text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <span className="text-wial-red text-lg font-extrabold">{level}</span>
                      <p className="text-sm font-semibold text-gray-900">
                        {CERTIFICATION_LABELS[level]}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{details.desc}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-white px-3 py-2">
                      <dt className="font-semibold tracking-wide text-gray-500 uppercase">Hours</dt>
                      <dd className="mt-0.5 font-medium text-gray-900">{details.hours}</dd>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2">
                      <dt className="font-semibold tracking-wide text-gray-500 uppercase">Sets</dt>
                      <dd className="mt-0.5 font-medium text-gray-900">{details.sets}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs text-gray-400">
                    <span className="font-medium text-gray-500">Path: </span>
                    {details.pathway}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How to get certified */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 className="text-wial-navy mb-10 text-3xl font-bold">How to Get Certified</h2>
          <ol className="space-y-6">
            {PROCESS_STEPS.map((s) => (
              <li key={s.step} className="flex gap-5">
                <span className="bg-wial-navy mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                  {s.step}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{s.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Recertification */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 p-8">
            <h2 className="text-wial-navy text-2xl font-bold">Recertification</h2>
            <p className="mt-3 text-gray-600">
              All WIAL certifications are valid for 2 years. To maintain your credential you must
              complete continuing education requirements and submit a recertification application
              before your credential expires.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-wial-red mt-0.5 font-bold">•</span>
                Complete required continuing education credits in the 2-year window
              </li>
              <li className="flex items-start gap-2">
                <span className="text-wial-red mt-0.5 font-bold">•</span>
                Log additional coaching sets at your certification level
              </li>
              <li className="flex items-start gap-2">
                <span className="text-wial-red mt-0.5 font-bold">•</span>
                Submit recertification application with supervisor endorsement
              </li>
              <li className="flex items-start gap-2">
                <span className="text-wial-red mt-0.5 font-bold">•</span>
                WIAL sends reminder emails at 3 months, 2 months, and 1 month before expiry
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-wial-navy py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-white">
            Ready to Start Your Certification Journey?
          </h2>
          <p className="mt-3 text-white/70">
            Connect with a WIAL chapter near you or apply directly to begin your CALC training.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/coaches/apply"
              className="bg-wial-red hover:bg-wial-red-dark rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors"
            >
              Apply Now
            </Link>
            <Link
              href="/coaches"
              className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Browse Coaches
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
