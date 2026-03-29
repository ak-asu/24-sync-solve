'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'
import { setLocale } from '@/features/i18n/actions/setLocale'
import { LOCALE_OPTIONS } from '@/lib/i18n/locales'

interface LanguageSwitcherProps {
  currentLocale: string
  label: string
}

export function LanguageSwitcher({ currentLocale, label }: LanguageSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    startTransition(async () => {
      await setLocale(next)
      router.refresh()
    })
  }

  return (
    <div className="relative flex items-center">
      <Globe
        size={14}
        className="pointer-events-none absolute start-2 text-[var(--color-brand-shell)]/60"
        aria-hidden="true"
      />
      <select
        value={currentLocale}
        onChange={handleChange}
        disabled={isPending}
        aria-label={label}
        className="appearance-none rounded border border-[var(--color-brand-shell)]/20 bg-transparent py-1 ps-7 pe-2 text-sm text-[var(--color-brand-shell)]/90 transition-colors hover:border-[var(--color-brand-shell)]/40 focus:ring-2 focus:ring-[var(--color-brand-shell)] focus:outline-none disabled:opacity-50"
      >
        {LOCALE_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  )
}
