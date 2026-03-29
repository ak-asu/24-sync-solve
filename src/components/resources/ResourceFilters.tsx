'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useRef } from 'react'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ResourceType } from '@/features/resources/types'
import { RESOURCE_TYPE_LABELS } from '@/features/resources/types'

const TYPES: ResourceType[] = ['video', 'article', 'pdf', 'link']

interface ResourceFiltersProps {
  currentType: ResourceType | null
  currentCategory: string | null
  currentSearch: string | null
  categories: string[]
}

export function ResourceFilters({
  currentType,
  currentCategory,
  currentSearch,
  categories,
}: ResourceFiltersProps) {
  const t = useTranslations('resources')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  function handleSearch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setParam('q', value.trim() || null)
    }, 300)
  }

  const tabBase =
    'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1'
  const tabActive = 'bg-wial-navy text-white focus:ring-wial-navy'
  const tabInactive = 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-400'

  return (
    <div className={`space-y-4 ${isPending ? 'opacity-60' : ''}`}>
      {/* Search input */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          defaultValue={currentSearch ?? ''}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t('search.placeholder')}
          className="focus:border-wial-navy focus:ring-wial-navy/20 w-full rounded-xl border border-gray-200 bg-white py-2 ps-9 pe-4 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:outline-none"
          aria-label={t('search.placeholder')}
        />
      </div>

      {/* Type + category filters */}
      <div className="flex flex-wrap gap-2" aria-label={t('filters.filterByType')}>
        <button
          type="button"
          onClick={() => setParam('type', null)}
          className={`${tabBase} ${currentType === null ? tabActive : tabInactive}`}
          aria-pressed={currentType === null}
        >
          {t('filters.all')}
        </button>
        {TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setParam('type', currentType === type ? null : type)}
            className={`${tabBase} ${currentType === type ? tabActive : tabInactive}`}
            aria-pressed={currentType === type}
          >
            {RESOURCE_TYPE_LABELS[type]}
          </button>
        ))}

        {categories.length > 0 && (
          <>
            <span className="self-center text-gray-300" aria-hidden="true">
              |
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setParam('category', currentCategory === cat ? null : cat)}
                className={`${tabBase} ${currentCategory === cat ? tabActive : tabInactive}`}
                aria-pressed={currentCategory === cat}
              >
                {cat}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
