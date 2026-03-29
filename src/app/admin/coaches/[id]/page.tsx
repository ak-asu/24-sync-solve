import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Award, Calendar, Mail, Eye, EyeOff, ShieldCheck, ShieldX } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCoachByIdAdmin } from '@/features/coaches/queries/getCoachById'
import { CoachProfileView } from '@/components/coaches/CoachProfileView'
import { CoachStatusToggle } from '@/components/admin/CoachStatusToggle'
import { CERTIFICATION_LABELS } from '@/lib/utils/constants'
import { formatDate } from '@/lib/utils/format'
import type { CertificationLevel } from '@/types/database'

interface AdminCoachReviewPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: AdminCoachReviewPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const coach = await getCoachByIdAdmin(supabase, id)
  const name = coach?.profile?.full_name ?? 'Unknown Coach'
  return { title: `Review: ${name}` }
}

export const revalidate = 0 // Always fresh — status toggles must reflect immediately

export default async function AdminCoachReviewPage({ params }: AdminCoachReviewPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const coach = await getCoachByIdAdmin(supabase, id)

  if (!coach) notFound()

  const name = coach.profile?.full_name ?? 'Unknown'
  const certLabel =
    CERTIFICATION_LABELS[coach.certification_level as CertificationLevel] ??
    coach.certification_level

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <Link
        href="/admin/coaches"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to Coaches
      </Link>

      {/* ── Admin header card ─────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start gap-6 p-6">
          {/* Avatar */}
          <div className="shrink-0">
            {coach.photo_url ? (
              <Image
                src={coach.photo_url}
                alt={`${name}'s profile photo`}
                width={80}
                height={80}
                className="size-20 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div
                className="bg-wial-navy flex size-20 items-center justify-center rounded-full text-2xl font-bold text-white"
                aria-hidden="true"
              >
                {name[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Coach info */}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>

            {coach.profile?.email && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                <Mail size={13} aria-hidden="true" />
                {coach.profile.email}
              </p>
            )}

            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-700">
              <Award size={13} aria-hidden="true" />
              {coach.certification_level} — {certLabel}
            </p>

            {coach.certification_date && (
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar size={12} aria-hidden="true" />
                Certified {formatDate(coach.certification_date)}
              </p>
            )}

            {/* Status badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  coach.is_published ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                }`}
              >
                {coach.is_published ? (
                  <Eye size={11} aria-hidden="true" />
                ) : (
                  <EyeOff size={11} aria-hidden="true" />
                )}
                {coach.is_published ? 'Published' : 'Not published'}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  coach.is_verified ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {coach.is_verified ? (
                  <ShieldCheck size={11} aria-hidden="true" />
                ) : (
                  <ShieldX size={11} aria-hidden="true" />
                )}
                {coach.is_verified ? 'Verified' : 'Not verified'}
              </span>
            </div>
          </div>

          {/* Admin action toggles */}
          <div className="flex shrink-0 flex-col gap-3">
            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Admin Controls
            </p>
            <div className="flex items-center gap-3">
              <span className="min-w-[5rem] text-sm text-gray-600">Published</span>
              <CoachStatusToggle
                coachId={coach.id}
                coachName={name}
                field="published"
                currentValue={coach.is_published}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="min-w-[5rem] text-sm text-gray-600">Verified</span>
              <CoachStatusToggle
                coachId={coach.id}
                coachName={name}
                field="verified"
                currentValue={coach.is_verified}
              />
            </div>
          </div>
        </div>

        {/* Metadata footer */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-100 bg-gray-50 px-6 py-3 text-xs text-gray-400">
          <span>ID: {coach.id}</span>
          <span>Created: {formatDate(coach.created_at)}</span>
          <span>Updated: {formatDate(coach.updated_at)}</span>
          {coach.chapter && (
            <span>
              Chapter:{' '}
              <Link
                href={`/${coach.chapter.slug}`}
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                {coach.chapter.name} ↗
              </Link>
            </span>
          )}
          {coach.is_published && (
            <Link
              href={`/coaches/${coach.id}`}
              target="_blank"
              className="ms-auto text-blue-500 hover:underline"
            >
              View public profile ↗
            </Link>
          )}
        </div>
      </div>

      {/* ── Full profile view ─────────────────────────────────────────────── */}
      <CoachProfileView coach={coach} />
    </div>
  )
}
