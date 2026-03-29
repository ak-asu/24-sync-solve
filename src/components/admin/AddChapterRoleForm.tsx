'use client'

import { useActionState } from 'react'
import { assignRoleAction } from '@/features/rbac/actions/roleManagement'
import { ROLE_LABELS } from '@/lib/utils/constants'
import type { ActionResult, UserRole } from '@/types'

interface Chapter {
  id: string
  name: string
}

interface AddChapterRoleFormProps {
  userId: string
  /** All chapters available to assign to. */
  chapters: Chapter[]
  /** Chapter IDs the user already has roles in — excluded from the selector. */
  existingChapterIds: string[]
  /** Roles the actor is allowed to assign. */
  assignableRoles?: UserRole[]
}

const ADMIN_ASSIGNABLE: UserRole[] = ['chapter_lead', 'content_editor', 'coach']

/**
 * Form for assigning a role in a chapter where the user has no existing roles.
 * Rendered on the admin users page; requires super_admin.
 */
export function AddChapterRoleForm({
  userId,
  chapters,
  existingChapterIds,
  assignableRoles = ADMIN_ASSIGNABLE,
}: AddChapterRoleFormProps) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    assignRoleAction,
    null
  )

  const available = chapters.filter((c) => !existingChapterIds.includes(c.id))

  if (available.length === 0) return null

  return (
    <form action={formAction} className="mt-2 flex flex-wrap items-center gap-2">
      <input type="hidden" name="user_id" value={userId} />

      <label htmlFor={`new-chapter-${userId}`} className="sr-only">
        Chapter
      </label>
      <select
        id={`new-chapter-${userId}`}
        name="chapter_id"
        defaultValue=""
        className="rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        required
      >
        <option value="" disabled>
          Chapter…
        </option>
        {available.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <label htmlFor={`new-role-${userId}`} className="sr-only">
        Role
      </label>
      <select
        id={`new-role-${userId}`}
        name="role"
        defaultValue=""
        className="rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        required
      >
        <option value="" disabled>
          Role…
        </option>
        {assignableRoles.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r] ?? r}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
      >
        {isPending ? '…' : '+ Assign'}
      </button>

      {state && !state.success && (
        <span className="text-xs text-red-600" role="alert">
          {state.error}
        </span>
      )}
      {state?.success && (
        <span className="text-xs text-green-600" role="status">
          {state.message}
        </span>
      )}
    </form>
  )
}
