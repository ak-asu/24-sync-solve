'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { useTranslations } from 'next-intl'

interface ResourceScopeToggleProps {
  currentScope: 'chapter' | 'all'
  chapterName: string
}

export function ResourceScopeToggle({ currentScope, chapterName }: ResourceScopeToggleProps) {
  const t = useTranslations('resources.scope')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function setScope(scope: 'chapter' | 'all') {
    const params = new URLSearchParams(searchParams.toString())
    if (scope === 'all') {
      params.set('scope', 'all')
    } else {
      params.delete('scope')
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const base =
    'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1'
  const active = 'bg-wial-navy text-white focus:ring-wial-navy'
  const inactive = 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-400'

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm ${isPending ? 'opacity-60' : ''}`}
      role="group"
      aria-label="Resource scope"
    >
      <button
        type="button"
        onClick={() => setScope('chapter')}
        className={`${base} ${currentScope === 'chapter' ? active : inactive}`}
        aria-pressed={currentScope === 'chapter'}
      >
        {chapterName}
      </button>
      <button
        type="button"
        onClick={() => setScope('all')}
        className={`${base} ${currentScope === 'all' ? active : inactive}`}
        aria-pressed={currentScope === 'all'}
      >
        {t('all')}
      </button>
    </div>
  )
}
