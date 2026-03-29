'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  requirePermission,
  canPerformInChapter,
  getPermissionContext,
} from '@/lib/permissions/context'
import { analyzeResourceContent } from '@/features/knowledge/ai'
import type { ActionResult } from '@/types'

const resourceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(500).optional(),
  type: z.enum(['video', 'article', 'pdf', 'link', 'webinar']),
  url: z.string().url('Must be a valid URL'),
  thumbnail_url: z.string().url().optional().or(z.literal('')),
  category: z.string().max(50).optional(),
  is_published: z.boolean().default(true),
  raw_text: z.string().optional(),
  authors: z.array(z.string()).optional(),
  presenter: z.string().optional(),
  published_year: z.number().int().optional().nullable(),
})

export type ResourceFormData = z.infer<typeof resourceSchema>

/** Require permission to manage resources — global role for null chapterId, chapter role otherwise. */
async function requireResourcePermission(
  chapterId: string | null,
  permission: 'content:create' | 'content:edit'
) {
  if (chapterId) {
    const ctx = await getPermissionContext()
    if (!ctx) throw new Error('Authentication required.')
    if (ctx.isSuspended) throw new Error('Your account is suspended.')
    if (!canPerformInChapter(ctx, chapterId, permission)) {
      throw new Error('You do not have permission to perform this action.')
    }
    return ctx
  }
  // Global resource — check global role
  return requirePermission(permission)
}

export async function createResourceAction(
  chapterId: string | null,
  formData: ResourceFormData
): Promise<ActionResult<null>> {
  try {
    const ctx = await requireResourcePermission(chapterId, 'content:create')
    const parsed = resourceSchema.parse(formData)
    const supabase = await createClient()

    let aiData = {}
    if (parsed.raw_text) {
      const analysis = await analyzeResourceContent(parsed.title, parsed.raw_text)
      aiData = {
        raw_text: parsed.raw_text,
        summary: analysis.summary,
        key_findings: analysis.key_findings,
        relevance_tags: analysis.relevance_tags,
        translations: analysis.translations,
        embedding: analysis.embedding,
      }
    } else if (parsed.description) {
      // Fallback: analyze description if no raw_text provided
      const analysis = await analyzeResourceContent(parsed.title, parsed.description)
      aiData = {
        summary: analysis.summary,
        key_findings: analysis.key_findings,
        relevance_tags: analysis.relevance_tags,
        translations: analysis.translations,
        embedding: analysis.embedding,
      }
    }

    const { error } = await supabase.from('resources').insert({
      title: parsed.title,
      description: parsed.description ?? null,
      type: parsed.type,
      url: parsed.url,
      thumbnail_url: parsed.thumbnail_url || null,
      category: parsed.category || null,
      is_published: parsed.is_published,
      chapter_id: chapterId,
      created_by: ctx.userId,
      authors: parsed.authors || null,
      presenter: parsed.presenter || null,
      published_year: parsed.published_year || null,
      ...aiData,
    } as any)

    if (error) throw new Error(error.message)

    revalidatePath('/resources')
    revalidatePath('/resources/manage')
    return { success: true, data: null, message: 'Resource created.' }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create resource.',
    }
  }
}

export async function updateResourceAction(
  resourceId: string,
  chapterId: string | null,
  formData: ResourceFormData
): Promise<ActionResult<null>> {
  try {
    await requireResourcePermission(chapterId, 'content:edit')
    const parsed = resourceSchema.parse(formData)
    const supabase = await createClient()

    let aiData = {}
    if (parsed.raw_text) {
      const analysis = await analyzeResourceContent(parsed.title, parsed.raw_text)
      aiData = {
        raw_text: parsed.raw_text,
        summary: analysis.summary,
        key_findings: analysis.key_findings,
        relevance_tags: analysis.relevance_tags,
        translations: analysis.translations,
        embedding: analysis.embedding,
      }
    }

    const { error } = await supabase
      .from('resources')
      .update({
        title: parsed.title,
        description: parsed.description ?? null,
        type: parsed.type,
        url: parsed.url,
        thumbnail_url: parsed.thumbnail_url || null,
        category: parsed.category || null,
        is_published: parsed.is_published,
        authors: parsed.authors || null,
        presenter: parsed.presenter || null,
        published_year: parsed.published_year || null,
        ...aiData,
      } as any)
      .eq('id', resourceId)

    if (error) throw new Error(error.message)

    revalidatePath('/resources')
    revalidatePath('/resources/manage')
    return { success: true, data: null, message: 'Resource updated.' }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update resource.',
    }
  }
}

export async function deleteResourceAction(
  resourceId: string,
  chapterId: string | null
): Promise<ActionResult<null>> {
  try {
    await requireResourcePermission(chapterId, 'content:edit')
    const supabase = await createClient()

    const { error } = await supabase.from('resources').delete().eq('id', resourceId)

    if (error) throw new Error(error.message)

    revalidatePath('/resources')
    revalidatePath('/resources/manage')
    return { success: true, data: null, message: 'Resource deleted.' }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete resource.',
    }
  }
}
