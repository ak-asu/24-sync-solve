'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { ResourceFormData } from '@/features/resources/actions/manageResources'
import type { ActionResult } from '@/types'

interface ResourceFormProps {
  onSubmit: (data: ResourceFormData) => Promise<ActionResult<null>>
  initialData?: Partial<ResourceFormData>
  submitLabel: string
  cancelHref: string
}

const TYPE_OPTIONS = [
  { value: 'video', label: 'Video (YouTube or other video link)' },
  { value: 'article', label: 'Article (external blog post or web page)' },
  { value: 'pdf', label: 'PDF (downloadable document)' },
  { value: 'link', label: 'Link (any other URL)' },
] as const

export function ResourceForm({
  onSubmit,
  initialData,
  submitLabel,
  cancelHref,
}: ResourceFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<ResourceFormData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    type: initialData?.type ?? 'article',
    url: initialData?.url ?? '',
    thumbnail_url: initialData?.thumbnail_url ?? '',
    category: initialData?.category ?? '',
    is_published: initialData?.is_published ?? true,
  })

  function set<K extends keyof ResourceFormData>(key: K, value: ResourceFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await onSubmit(form)
      if (result.success) {
        toast.success(result.message ?? 'Saved.')
        router.push(cancelHref)
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-wial-navy focus:outline-none focus:ring-1 focus:ring-wial-navy'
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700'

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Title */}
      <div>
        <label htmlFor="res-title" className={labelClass}>
          Title{' '}
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
        </label>
        <input
          id="res-title"
          type="text"
          required
          maxLength={200}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Introduction to Action Learning"
          className={inputClass}
        />
      </div>

      {/* Type */}
      <div>
        <label htmlFor="res-type" className={labelClass}>
          Type{' '}
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
        </label>
        <select
          id="res-type"
          value={form.type}
          onChange={(e) => set('type', e.target.value as ResourceFormData['type'])}
          className={inputClass}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* URL */}
      <div>
        <label htmlFor="res-url" className={labelClass}>
          URL{' '}
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
        </label>
        <input
          id="res-url"
          type="url"
          required
          value={form.url}
          onChange={(e) => set('url', e.target.value)}
          placeholder="https://…"
          className={inputClass}
        />
        {form.type === 'video' && (
          <p className="mt-1 text-xs text-gray-500">
            Paste a YouTube URL — a thumbnail will be auto-generated.
          </p>
        )}
        {form.type === 'pdf' && (
          <p className="mt-1 text-xs text-gray-500">
            Upload a PDF via the file upload API and paste the resulting URL.
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="res-description" className={labelClass}>
          Description
        </label>
        <textarea
          id="res-description"
          rows={3}
          maxLength={500}
          value={form.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Brief description of this resource…"
          className={inputClass}
        />
      </div>

      {/* Thumbnail URL */}
      <div>
        <label htmlFor="res-thumbnail" className={labelClass}>
          Thumbnail URL
          <span className="ms-1 text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="res-thumbnail"
          type="url"
          value={form.thumbnail_url ?? ''}
          onChange={(e) => set('thumbnail_url', e.target.value)}
          placeholder="https://… (auto-derived for YouTube links)"
          className={inputClass}
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="res-category" className={labelClass}>
          Category
          <span className="ms-1 text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="res-category"
          type="text"
          maxLength={50}
          value={form.category ?? ''}
          onChange={(e) => set('category', e.target.value)}
          placeholder="e.g. Leadership, Research, Tools"
          className={inputClass}
        />
      </div>

      {/* Published */}
      <div className="flex items-center gap-2">
        <input
          id="res-published"
          type="checkbox"
          checked={form.is_published}
          onChange={(e) => set('is_published', e.target.checked)}
          className="text-wial-navy focus:ring-wial-navy h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="res-published" className="text-sm text-gray-700">
          Published (visible on public site)
        </label>
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-wial-navy hover:bg-wial-navy-dark rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
        <a href={cancelHref} className="text-sm font-medium text-gray-500 hover:text-gray-700">
          Cancel
        </a>
      </div>
    </form>
  )
}
