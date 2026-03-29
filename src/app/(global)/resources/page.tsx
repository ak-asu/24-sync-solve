import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getResources, getResourceCategories } from '@/features/resources/queries/getResources'
import { getUserCompletions } from '@/features/resources/queries/getCompletions'
import { getCoachMapByResourceIds } from '@/features/resources/queries/getCoachCourseMappings'
import { getPermissionContext } from '@/lib/permissions/context'
import { hasPermission } from '@/lib/permissions/permissions'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { ResourceFilters } from '@/components/resources/ResourceFilters'
import { KnowledgeSearchBar } from '@/components/knowledge/KnowledgeSearchBar'
import type { ResourceType } from '@/features/resources/types'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Videos, articles, PDFs, and tools to deepen your Action Learning practice — curated by WIAL.',
}

interface ResourcesPageProps {
  searchParams: Promise<{ type?: string; category?: string; q?: string }>
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const { type: typeParam, category: categoryParam, q: searchParam } = await searchParams

  const VALID_TYPES: ResourceType[] = ['video', 'article', 'pdf', 'link']
  const currentType: ResourceType | null = VALID_TYPES.includes(typeParam as ResourceType)
    ? (typeParam as ResourceType)
    : null
  const currentCategory = categoryParam ?? null
  const currentSearch = searchParam ?? null

  const supabase = await createClient()
  const ctx = await getPermissionContext()
  const canManage =
    ctx !== null && !ctx.isSuspended && hasPermission(ctx.globalRole, 'content:create')

  const [{ items: resources, total }, categories, completedIds] = await Promise.all([
    getResources(supabase, {
      // No chapterId, no globalOnly → all resources
      type: currentType,
      category: currentCategory,
      search: currentSearch,
      publishedOnly: !canManage,
    }),
    getResourceCategories(supabase),
    ctx ? getUserCompletions(supabase, ctx.userId) : Promise.resolve(null),
  ])

  const resourceCoachMap = await getCoachMapByResourceIds(
    supabase,
    resources.map((resource) => resource.id)
  )

  return (
    <main id="main-content" className="bg-white">
      {/* Hero Section */}
      <section className="bg-wial-navy py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">Resources</h1>
              <p className="mt-6 text-xl leading-8 text-white/80">
                Videos, articles, PDFs, and tools to deepen your Action Learning practice.
              </p>
            </div>
            {canManage && (
              <Link
                href="/resources/manage"
                className="shrink-0 rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Manage Resources
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Primary Discovery Section (AI Search) */}
      <section className="relative z-10 -mt-10 px-6 pb-16 lg:px-8">
        <div className="shadow-navy/10 mx-auto max-w-5xl rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl">
          <div className="mb-10 text-center">
            <h2 className="text-wial-navy text-3xl font-bold">Search the Knowledge Base</h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-500">
              Ask questions or find specific topics across our entire library of research articles,
              videos, and webinars.
            </p>
          </div>
          <KnowledgeSearchBar userRole={ctx?.globalRole ?? null} />
        </div>
      </section>

      {/* Filters + grid */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Filter tabs */}
          <div className="mb-8">
            <Suspense>
              <ResourceFilters
                currentType={currentType}
                currentCategory={currentCategory}
                currentSearch={currentSearch}
                categories={categories}
              />
            </Suspense>
          </div>

          {/* Resource count */}
          <p className="mb-6 text-sm text-gray-500" aria-live="polite">
            {total === 0 ? 'No resources found.' : `${total} resource${total !== 1 ? 's' : ''}`}
          </p>

          {/* Grid */}
          {resources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
              <p className="font-medium text-gray-500">No resources yet.</p>
              {canManage ? (
                <Link
                  href="/resources/manage/create"
                  className="text-wial-red mt-3 inline-block text-sm font-medium hover:underline"
                >
                  Add your first resource →
                </Link>
              ) : (
                <p className="mt-2 text-sm text-gray-400">Check back soon.</p>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  teachingCoaches={resourceCoachMap[resource.id] ?? []}
                  isCompleted={completedIds ? completedIds.has(resource.id) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
