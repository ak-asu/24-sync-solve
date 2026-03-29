import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Award,
  Eye,
  EyeOff,
  ShieldCheck,
  User,
  CreditCard,
  Settings,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCoachProfileByUserId } from '@/features/coaches/queries/getCoachById'
import { CERTIFICATION_LABELS } from '@/lib/utils/constants'
import type { CertificationLevel } from '@/types/database'

export const metadata: Metadata = { title: 'Dashboard' }

export const revalidate = 0 // Always fresh — reflects latest profile status

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/dashboard')

  // ── Fetch user profile ─────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url, chapter_id')
    .eq('id', user.id)
    .single()

  // Super admins belong in /admin, not the dashboard
  if (profile?.role === 'super_admin') {
    redirect('/admin')
  }

  const isCoach = profile?.role === 'coach'
  const isChapterManager = profile?.role === 'chapter_lead' || profile?.role === 'content_editor'

  // ── Fetch coach profile if applicable ─────────────────────────────────────
  const coachProfile = isCoach ? await getCoachProfileByUserId(supabase, user.id) : null

  // ── Fetch chapter slug for chapter managers ───────────────────────────────
  let chapterSlug: string | null = null
  if (isChapterManager && profile?.chapter_id) {
    const { data: chapterData } = await supabase
      .from('chapters')
      .select('slug')
      .eq('id', profile.chapter_id)
      .single()
    chapterSlug = chapterData?.slug ?? null
  }

  const name = profile?.full_name ?? user.email ?? 'User'
  const certLabel =
    coachProfile &&
    (CERTIFICATION_LABELS[coachProfile.certification_level as CertificationLevel] ??
      coachProfile.certification_level)

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="bg-wial-navy py-12 text-white">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="flex items-center gap-5">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={`${name}'s avatar`}
                width={56}
                height={56}
                className="size-14 rounded-full object-cover ring-2 ring-white/30"
              />
            ) : (
              <div
                className="bg-wial-red flex size-14 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white ring-2 ring-white/30"
                aria-hidden="true"
              >
                {name[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm text-white/60">Welcome back</p>
              <h1 className="text-2xl font-extrabold">{name}</h1>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-5xl space-y-10 px-6 lg:px-8">
          {/* ── Coach profile card ──────────────────────────────────────── */}
          {isCoach && (
            <div>
              <h2 className="text-wial-navy mb-4 text-lg font-semibold">Coach Profile</h2>

              {coachProfile ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Cert + status badges */}
                    <div>
                      <p className="font-semibold text-gray-900">{certLabel}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            coachProfile.is_published
                              ? 'bg-green-50 text-green-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}
                        >
                          {coachProfile.is_published ? (
                            <Eye size={11} aria-hidden="true" />
                          ) : (
                            <EyeOff size={11} aria-hidden="true" />
                          )}
                          {coachProfile.is_published ? 'Published' : 'Not published'}
                        </span>
                        {coachProfile.is_verified && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            <ShieldCheck size={11} aria-hidden="true" />
                            Verified
                          </span>
                        )}
                        {!coachProfile.is_published && (
                          <span className="text-xs text-gray-400">
                            Admin review required to publish your profile.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action links */}
                    <div className="flex flex-wrap gap-3">
                      {coachProfile.is_published && (
                        <Link
                          href={`/coaches/${coachProfile.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          View public profile
                          <ExternalLink size={13} aria-hidden="true" />
                        </Link>
                      )}
                      <Link
                        href="/coaches/profile"
                        className="bg-wial-navy hover:bg-wial-navy-dark rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors"
                      >
                        Manage profile
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                  <Award size={32} className="text-wial-navy mx-auto mb-3" aria-hidden="true" />
                  <p className="font-medium text-gray-600">No coach profile found.</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Coach profiles are created by WIAL administrators after certification.
                  </p>
                  <Link
                    href="/certification"
                    className="bg-wial-red hover:bg-wial-red-dark mt-5 inline-block rounded-xl px-5 py-2 text-sm font-semibold text-white transition-colors"
                  >
                    Learn about certification
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ── Chapter manager card ────────────────────────────────────── */}
          {isChapterManager && chapterSlug && (
            <div>
              <h2 className="text-wial-navy mb-4 text-lg font-semibold">Chapter Management</h2>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-600">
                  You have content management access for your chapter.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/${chapterSlug}`}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View chapter site
                  </Link>
                  <Link
                    href={`/${chapterSlug}/events/manage`}
                    className="bg-wial-navy hover:bg-wial-navy-dark rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors"
                  >
                    Manage events
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── Quick links ─────────────────────────────────────────────── */}
          <div>
            <h2 className="text-wial-navy mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isCoach && (
                <Link
                  href="/coaches/profile"
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="bg-wial-navy flex size-10 shrink-0 items-center justify-center rounded-full text-white">
                    <User size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">My Profile</p>
                    <p className="text-xs text-gray-500">Edit your coach profile</p>
                  </div>
                </Link>
              )}

              <Link
                href="/coaches"
                className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="bg-wial-red/10 text-wial-red flex size-10 shrink-0 items-center justify-center rounded-full">
                  <Award size={18} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Coach Directory</p>
                  <p className="text-xs text-gray-500">Browse certified coaches</p>
                </div>
              </Link>

              <Link
                href="/events"
                className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                  <CreditCard size={18} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Upcoming Events</p>
                  <p className="text-xs text-gray-500">Workshops, webinars, and more</p>
                </div>
              </Link>

              <Link
                href="/account/settings"
                className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  <Settings size={18} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Account Settings</p>
                  <p className="text-xs text-gray-500">Manage your account</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
