import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getChapterById } from '@/features/chapters/queries/getChapterAdmin'
import { ChapterInABoxForm } from '@/components/admin/ChapterInABoxForm'

interface GenerateChapterContentPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: GenerateChapterContentPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const chapter = await getChapterById(supabase, id)
  return { title: chapter ? `Generate Content — ${chapter.name}` : 'Generate Chapter Content' }
}

export default async function GenerateChapterContentPage({
  params,
}: GenerateChapterContentPageProps) {
  const { id } = await params

  const supabase = await createClient()
  const chapter = await getChapterById(supabase, id)

  if (!chapter) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          href={`/admin/chapters/${id}`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Back to {chapter.name}
        </Link>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="bg-wial-navy/10 mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Sparkles size={20} className="text-wial-navy" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate Homepage Content</h1>
          <p className="mt-1 text-sm text-gray-500">
            Provide some details about <strong className="font-medium">{chapter.name}</strong> and
            AI will draft culturally-adapted content for the homepage. All blocks go into the
            approval queue.
          </p>
        </div>
      </div>

      {/* Chapter badge */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
        <span
          className="inline-block size-4 shrink-0 rounded-full"
          style={{ backgroundColor: chapter.accent_color ?? '#CC0000' }}
          aria-hidden="true"
        />
        <div className="text-sm">
          <span className="font-medium text-gray-700">/{chapter.slug}</span>
          <span className="mx-2 text-gray-400">·</span>
          <span className="text-gray-500">{chapter.country_code}</span>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <ChapterInABoxForm chapterId={id} backHref="/admin/chapters" />
      </div>
    </div>
  )
}
