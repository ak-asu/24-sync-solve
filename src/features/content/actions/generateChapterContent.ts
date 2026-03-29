'use server'

import Anthropic from '@anthropic-ai/sdk'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPermissionContext, canPerformInChapter } from '@/lib/permissions/context'
import { validateBlockContent } from '@/features/content/blocks/schemas'
import type { ActionResult, Json } from '@/types'

// ── Input schema ────────────────────────────────────────────────────────────

const coachInputSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().min(1).max(400),
  title: z
    .string()
    .max(100)
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  photo_url: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
})

const generateChapterContentSchema = z.object({
  chapter_id: z.string().uuid(),
  language: z.enum(['en', 'pt-BR', 'es', 'fr', 'ar', 'de', 'ja']),
  cultural_context: z
    .string()
    .max(500)
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  coaches: z.array(coachInputSchema).min(1).max(3),
  event_title: z
    .string()
    .max(200)
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  event_date: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  event_description: z
    .string()
    .max(500)
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  testimonial_quote: z.string().min(1).max(500),
  testimonial_author: z.string().min(1).max(100),
  testimonial_title: z
    .string()
    .max(100)
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  testimonial_org: z
    .string()
    .max(100)
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  testimonial_photo: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  hero_image_url: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
})

type GenerateInput = z.infer<typeof generateChapterContentSchema>

export interface GenerateResult {
  blocksUpdated: number
  chapterSlug: string
}

// ── Prompt builders ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a content writer for WIAL (World Institute for Action Learning), a global organization that certifies Action Learning coaches. Generate professional, culturally appropriate website content for a WIAL chapter homepage. Respond ONLY with valid JSON matching the exact schema provided. Do not include markdown code fences, explanations, or extra keys.`

function buildUserPrompt(input: GenerateInput, chapterName: string): string {
  const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English',
    'pt-BR': 'Brazilian Portuguese',
    es: 'Spanish',
    fr: 'French',
    ar: 'Arabic',
    de: 'German',
    ja: 'Japanese',
  }

  const coachLines = input.coaches
    .map((c) => `- ${c.name}${c.title ? ` (${c.title})` : ''}: ${c.bio}`)
    .join('\n')

  const eventSection = input.event_title
    ? `Title: ${input.event_title}${input.event_date ? `, Date: ${input.event_date}` : ''}${input.event_description ? `, Description: ${input.event_description}` : ''}`
    : 'No upcoming event provided — omit specific event references.'

  const culturalNote = input.cultural_context ? `Cultural context: ${input.cultural_context}` : ''

  return `Generate homepage content for the WIAL ${chapterName} chapter.

Language: ${LANGUAGE_NAMES[input.language] ?? input.language}
${culturalNote}

Chapter coaches (use their names and expertise to enrich the About section text — do NOT create a separate team or coaches section):
${coachLines}

Upcoming event (mention naturally in the About text if relevant — do NOT create a separate events section):
${eventSection}

Testimonial:
Quote: "${input.testimonial_quote}"
Author: ${input.testimonial_author}${input.testimonial_title ? `, ${input.testimonial_title}` : ''}${input.testimonial_org ? ` at ${input.testimonial_org}` : ''}

Return a JSON object with EXACTLY these 5 keys. Write all text content in ${LANGUAGE_NAMES[input.language] ?? input.language}. Keep tone professional yet approachable.

{
  "hero": {
    "headline": "<compelling headline for the chapter homepage, max 120 chars>",
    "subheadline": "<supporting sentence about what this chapter does, max 300 chars>",
    "cta_primary_text": "<short join/learn CTA label, max 60 chars>",
    "cta_primary_href": ""
  },
  "text": {
    "heading": "<section heading for the about section, max 120 chars>",
    "paragraphs": ["<paragraph 1 — what Action Learning is and why it matters locally>", "<paragraph 2 — mention the coaches by name and their expertise>", "<paragraph 3 — call to connect or learn more>"]
  },
  "stats": {
    "heading": "<section heading for stats, max 120 chars>",
    "items": [
      {"value": "<short number or metric displayed large, e.g. '50+' or '200'>", "label": "<short descriptive label displayed small beneath the number, e.g. 'Certified Coaches'>"},
      {"value": "<number/metric>", "label": "<label>"},
      {"value": "<number/metric>", "label": "<label>"},
      {"value": "<number/metric>", "label": "<label>"}
    ]
  },
  "testimonial": {
    "heading": "<section heading for testimonials, max 120 chars>",
    "items": [
      {"quote": "${input.testimonial_quote}", "name": "${input.testimonial_author}", "title": ${input.testimonial_title ? `"${input.testimonial_title}"` : 'null'}, "organization": ${input.testimonial_org ? `"${input.testimonial_org}"` : 'null'}}
    ]
  },
  "cta": {
    "heading": "<compelling join CTA heading, max 120 chars>",
    "subheading": "<supporting sentence, max 300 chars>",
    "button_text": "<button label, max 60 chars>",
    "button_href": "https://example.com/contact",
    "variant": "dark"
  }
}`
}

// ── ProseMirror conversion ──────────────────────────────────────────────────

function toProseMirror(paragraphs: string[]): Record<string, unknown> {
  return {
    type: 'doc',
    content: paragraphs.map((text) => ({
      type: 'paragraph',
      content: [{ type: 'text', text }],
    })),
  }
}

// ── Server action ───────────────────────────────────────────────────────────

export async function generateChapterContentAction(
  _prevState: ActionResult<GenerateResult> | null,
  formData: FormData
): Promise<ActionResult<GenerateResult>> {
  // ── Parse coaches from JSON string ───────────────────────────────────────
  let coachesRaw: unknown
  try {
    coachesRaw = JSON.parse((formData.get('coaches') as string) || '[]')
  } catch {
    return { success: false, error: 'Invalid coach data. Please try again.' }
  }

  const raw = {
    chapter_id: formData.get('chapter_id') as string,
    language: formData.get('language') as string,
    cultural_context: (formData.get('cultural_context') as string) || undefined,
    coaches: coachesRaw,
    event_title: (formData.get('event_title') as string) || undefined,
    event_date: (formData.get('event_date') as string) || undefined,
    event_description: (formData.get('event_description') as string) || undefined,
    testimonial_quote: formData.get('testimonial_quote') as string,
    testimonial_author: formData.get('testimonial_author') as string,
    testimonial_title: (formData.get('testimonial_title') as string) || undefined,
    testimonial_org: (formData.get('testimonial_org') as string) || undefined,
    testimonial_photo: (formData.get('testimonial_photo') as string) || undefined,
    hero_image_url: (formData.get('hero_image_url') as string) || undefined,
  }

  const result = generateChapterContentSchema.safeParse(raw)
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const [key, issues] of Object.entries(result.error.flatten().fieldErrors)) {
      if (issues) fieldErrors[key] = issues
    }
    return { success: false, error: 'Please fix the errors below.', fieldErrors }
  }

  const input = result.data

  // ── Auth ─────────────────────────────────────────────────────────────────
  const ctx = await getPermissionContext()
  if (!ctx) return { success: false, error: 'Authentication required.' }
  if (ctx.isSuspended) return { success: false, error: 'Your account is suspended.' }

  const canGenerate =
    ctx.globalRole === 'super_admin' || canPerformInChapter(ctx, input.chapter_id, 'content:edit')

  if (!canGenerate) return { success: false, error: 'Permission denied.' }

  // ── Fetch chapter slug (needed for redirect and prompt) ──────────────────
  const adminClient = createAdminClient()

  const { data: chapter } = await adminClient
    .from('chapters')
    .select('slug, name')
    .eq('id', input.chapter_id)
    .single()

  if (!chapter) return { success: false, error: 'Chapter not found.' }

  // ── Call Claude ──────────────────────────────────────────────────────────
  const anthropicKey = process.env['ANTHROPIC_API_KEY']
  if (!anthropicKey) {
    console.error('ANTHROPIC_API_KEY is not set')
    return {
      success: false,
      error: 'AI service is not configured. Please contact an administrator.',
    }
  }

  const client = new Anthropic({ apiKey: anthropicKey })

  let rawText: string
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(input, chapter.name) }],
    })
    rawText = message.content[0]?.type === 'text' ? message.content[0].text : ''
  } catch (err) {
    console.error('Anthropic API error:', err)
    return { success: false, error: 'AI service unavailable. Please try again.' }
  }

  // ── Parse AI response ────────────────────────────────────────────────────
  let parsed: Record<string, unknown>
  try {
    // Strip markdown fences if model includes them despite instructions
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()
    parsed = JSON.parse(cleaned) as Record<string, unknown>
  } catch {
    console.error('Failed to parse AI response:', rawText)
    return { success: false, error: 'AI returned invalid content. Please try again.' }
  }

  // ── Build and validate block contents ───────────────────────────────────
  type GeneratedBlocks = {
    hero: unknown
    text: unknown
    stats: unknown
    testimonial: unknown
    cta: unknown
  }

  // Inject testimonial photo if uploaded
  const testimonialItems = [
    {
      quote: input.testimonial_quote,
      name: input.testimonial_author,
      title: input.testimonial_title ?? undefined,
      organization: input.testimonial_org ?? undefined,
      photo_url: input.testimonial_photo ?? undefined,
    },
  ]

  const heroContent = parsed.hero as Record<string, unknown> | undefined
  const textContent = parsed.text as Record<string, unknown> | undefined
  const statsContent = parsed.stats as Record<string, unknown> | undefined
  const testimonialContent = parsed.testimonial as Record<string, unknown> | undefined
  const ctaContent = parsed.cta as Record<string, unknown> | undefined

  const generatedBlocks: GeneratedBlocks = {
    hero: {
      headline: heroContent?.headline ?? '',
      subheadline: heroContent?.subheadline ?? '',
      cta_primary_text: heroContent?.cta_primary_text ?? 'Join Our Chapter',
      cta_primary_href: '',
      background_image_url: input.hero_image_url ?? undefined,
    },
    text: {
      heading: textContent?.heading ?? '',
      body: toProseMirror(
        Array.isArray(textContent?.paragraphs) ? (textContent.paragraphs as string[]) : []
      ),
    },
    stats: {
      heading: statsContent?.heading ?? '',
      items: Array.isArray(statsContent?.items) ? statsContent.items : [],
    },
    testimonial: {
      heading: testimonialContent?.heading ?? 'What Our Clients Say',
      items: testimonialItems,
    },
    cta: {
      heading: ctaContent?.heading ?? 'Ready to Get Started?',
      subheading: ctaContent?.subheading ?? '',
      button_text: ctaContent?.button_text ?? 'Contact Us',
      button_href: `${process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://wial.org'}/${chapter.slug}/contact`,
      variant: 'dark' as const,
    },
  }

  // Validate each block against its Zod schema
  const blockTypes = ['hero', 'text', 'stats', 'testimonial', 'cta'] as const

  for (const blockType of blockTypes) {
    const validation = validateBlockContent(blockType, generatedBlocks[blockType])
    if (!validation.success) {
      console.error(`Block validation failed for ${blockType}:`, validation.error.flatten())
      return {
        success: false,
        error: `Generated content for "${blockType}" block failed validation. Please try again.`,
      }
    }
  }

  // ── Fetch home page for this chapter ─────────────────────────────────────
  const { data: page } = await adminClient
    .from('pages')
    .select('id')
    .eq('chapter_id', input.chapter_id)
    .eq('slug', 'home')
    .single()

  if (!page) {
    return {
      success: false,
      error: 'Home page not found for this chapter. Ensure the chapter has been provisioned.',
    }
  }

  // ── Fetch existing blocks ─────────────────────────────────────────────────
  const { data: existingBlocks } = await adminClient
    .from('content_blocks')
    .select('id, block_type')
    .eq('page_id', page.id)

  const existingMap = new Map(existingBlocks?.map((b) => [b.block_type, b.id]) ?? [])

  // ── Upsert blocks ─────────────────────────────────────────────────────────
  let blocksUpdated = 0
  const now = new Date().toISOString()

  for (const blockType of blockTypes) {
    const content = generatedBlocks[blockType] as Json
    const existingId = existingMap.get(blockType)

    if (existingId) {
      const { error } = await adminClient
        .from('content_blocks')
        .update({
          draft_version: content,
          status: 'pending_approval',
          requires_approval: true,
          updated_by: ctx.userId,
          updated_at: now,
        })
        .eq('id', existingId)

      if (error) {
        console.error(`Failed to update block ${blockType}:`, error)
        continue
      }
    } else {
      const { error } = await adminClient.from('content_blocks').insert({
        page_id: page.id,
        block_type: blockType,
        content: content,
        draft_version: content,
        status: 'pending_approval',
        requires_approval: true,
        is_visible: true,
        sort_order: blockTypes.indexOf(blockType),
        created_by: ctx.userId,
        updated_by: ctx.userId,
      })

      if (error) {
        console.error(`Failed to insert block ${blockType}:`, error)
        continue
      }
    }

    blocksUpdated++
  }

  // ── Audit log ─────────────────────────────────────────────────────────────
  await adminClient.from('audit_log').insert({
    user_id: ctx.userId,
    action: 'ai_generate_content',
    entity_type: 'content_blocks',
    entity_id: page.id,
    new_value: {
      chapter_id: input.chapter_id,
      language: input.language,
      blocks_updated: blocksUpdated,
    } as Json,
  })

  // ── Revalidate ────────────────────────────────────────────────────────────
  revalidatePath('/', 'layout')

  return {
    success: true,
    data: { blocksUpdated, chapterSlug: chapter.slug },
    message: `${blocksUpdated} content blocks generated. Review them in the Approvals tab.`,
  }
}
