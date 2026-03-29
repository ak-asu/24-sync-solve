import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPermissionContext, canPerformInChapter } from '@/lib/permissions/context'
import { ChapterInABoxForm } from '@/components/admin/ChapterInABoxForm'

interface ChapterManageGeneratePageProps {
  params: Promise<{ chapter: string }>
}

export async function generateMetadata({
  params,
}: ChapterManageGeneratePageProps): Promise<Metadata> {
  const { chapter: chapterSlug } = await params
  return { title: `Generate Content — ${chapterSlug.toUpperCase()}` }
}

export default async function ChapterManageGeneratePage({
  params,
}: ChapterManageGeneratePageProps) {
  const { chapter: chapterSlug } = await params

  const supabase = await createClient()

  const { data: chapter } = await supabase
    .from('chapters')
    .select('id, name, slug, accent_color, country_code')
    .eq('slug', chapterSlug)
    .single()

  if (!chapter) notFound()

  // Auth — layout already guards super_admin/chapter_lead, but verify content:edit here
  // to support content_editors being redirected out gracefully
  const ctx = await getPermissionContext()
  if (!ctx) redirect(`/login?redirect=/${chapterSlug}/manage/generate`)

  const canGenerate =
    ctx.globalRole === 'super_admin' || canPerformInChapter(ctx, chapter.id, 'content:edit')

  if (!canGenerate) redirect('/unauthorized')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="bg-wial-navy/10 mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Sparkles size={20} className="text-wial-navy" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate Homepage Content</h1>
          <p className="mt-1 text-sm text-gray-500">
            Provide details about <strong className="font-medium">{chapter.name}</strong> and AI
            will draft culturally-adapted content for the homepage. All blocks go into the approval
            queue.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <ChapterInABoxForm chapterId={chapter.id} />
      </div>
    </div>
  )
}
