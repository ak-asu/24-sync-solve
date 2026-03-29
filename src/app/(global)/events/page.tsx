import type { Metadata } from 'next'
import { Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUpcomingEvents } from '@/features/events/queries/getEvents'
import { eventFilterSchema } from '@/lib/utils/validation'
import { EventFilterBar } from '@/components/events/EventFilterBar'
import { EventCard } from '@/components/events/EventCard'
import type { EventType } from '@/types/database'

export const revalidate = 60 // 1-minute ISR — events update frequently

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming WIAL workshops, webinars, conferences, and certification programs.',
}

interface EventsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const rawParams = await searchParams
  const parsed = eventFilterSchema.safeParse({
    type: rawParams['type'],
    upcoming: rawParams['upcoming'],
  })
  const filters = parsed.success ? parsed.data : { upcoming: true }

  const supabase = await createClient()
  const events = await getUpcomingEvents(supabase, {
    limit: 24,
    type: filters.type as EventType | undefined,
    upcoming: filters.upcoming,
  })

  return (
    <>
      <section className="bg-wial-navy py-12 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold">Events</h1>
          <p className="mt-3 text-white/80">
            Upcoming workshops, webinars, conferences, and certification programs.
          </p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <EventFilterBar
            activeType={(filters.type as string | undefined) ?? ''}
            upcoming={filters.upcoming ?? true}
          />

          {events.length === 0 ? (
            <div className="py-20 text-center">
              <Calendar size={40} className="mx-auto mb-4 text-gray-300" aria-hidden="true" />
              <p className="font-medium text-gray-500">No upcoming events at this time.</p>
              <p className="mt-1 text-sm text-gray-400">Check back soon for new events.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
