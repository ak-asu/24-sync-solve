'use client'

import { useState } from 'react'
import { Input, Button, Tabs, Tab, Avatar } from '@heroui/react'
import { searchKnowledge } from '@/features/knowledge/actions/searchKnowledge'
import { ResourceCard } from '@/components/resources/ResourceCard'
import type { Resource } from '@/features/resources/types'
import type { UserRole } from '@/types'

export function KnowledgeSearchBar({ userRole }: { userRole: UserRole | null }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ resources: Resource[]; coaches: any[] } | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await searchKnowledge(query)
      setResults(res as any)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
      <form onSubmit={handleSearch} className="mb-8 flex w-full max-w-2xl gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Action Learning for healthcare teams"
          className="flex-grow"
        />
        <Button
          type="submit"
          size="lg"
          variant="primary"
          className="bg-wial-red text-white"
          isPending={loading}
        >
          Search
        </Button>
      </form>

      {results && (
        <div className="w-full space-y-12">
          {results.resources.length > 0 ? (
            <section>
              <div className="mb-6 flex items-baseline justify-between border-b pb-2">
                <h2 className="text-wial-navy text-2xl font-bold">
                  Matched Resources ({results.resources.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </section>
          ) : (
            <p className="py-4 text-center text-gray-500">No matching resources found.</p>
          )}

          {results.coaches.length > 0 && (
            <section>
              <div className="mb-6 flex items-baseline justify-between border-b pb-2">
                <h2 className="text-wial-navy text-2xl font-bold">Coaches (Semantic Match)</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {results.coaches.map((coach) => (
                  <div
                    key={coach.user_id}
                    className="flex gap-4 rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <Avatar className="text-large h-16 w-16 flex-shrink-0">
                      <Avatar.Image
                        src={coach.profiles?.avatar_url ?? undefined}
                        alt={coach.profiles?.full_name ?? 'Coach'}
                      />
                    </Avatar>
                    <div className="flex flex-grow flex-col truncate">
                      <div className="mr-1 truncate text-lg font-semibold">
                        {coach.profiles?.full_name}
                      </div>
                      <div className="text-wial-red mb-1.5 text-sm font-medium">
                        {coach.certification_level} Coach
                      </div>
                      <div className="truncate text-sm text-gray-500">
                        {coach.location_city}, {coach.location_country}
                      </div>
                      {coach.specializations && coach.specializations.length > 0 && (
                        <div className="mt-1 truncate text-xs font-medium tracking-wide text-gray-400 uppercase">
                          {coach.specializations.join(' • ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
