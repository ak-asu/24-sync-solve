import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { pipeline, env } from '@xenova/transformers'

// Setup environment for the script
env.allowLocalModels = false

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or secret key is not defined in .env file')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

class EmbeddingService {
  private static instance: any = null

  static async getInstance() {
    if (!this.instance) {
      this.instance = await pipeline('feature-extraction', 'intfloat/multilingual-e5-small', {
        quantized: false,
      })
    }
    return this.instance
  }

  static async getEmbedding(text: string): Promise<number[]> {
    const extractor = await EmbeddingService.getInstance()
    const output = await extractor(text, { pooling: 'mean', normalize: true })
    return Array.from(output.data)
  }
}

async function seedSearchIndex() {
  console.log('Fetching all published coaches...')
  const { data: coaches, error: coachesError } = await supabase
    .from('coach_profiles')
    .select(
      'id, bio, specializations, location_city, location_country, profile:profiles!coach_profiles_user_id_fkey(full_name)'
    )
    .eq('is_published', true)

  if (coachesError) {
    console.error('Error fetching coaches:', coachesError)
    return
  }

  if (!coaches || coaches.length === 0) {
    console.log('No published coaches found to index.')
    return
  }

  console.log(
    `Found ${coaches.length} published coaches. Downloading model and generating embeddings...`
  )

  // Wipe existing index
  await supabase
    .from('coach_search_documents')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  for (const coach of coaches) {
    // Generate text payload matching our desired search format
    const name = (coach as any).profile?.full_name || ''
    const content = `
      Name: ${name}
      Bio: ${coach.bio || ''}
      Specializations: ${(coach.specializations || []).join(', ')}
      Location: ${coach.location_city || ''}, ${coach.location_country || ''}
    `.trim()

    if (!content.trim()) {
      continue
    }

    try {
      console.log(`Embedding coach: ${name} (${coach.id})...`)
      const embedding = await EmbeddingService.getEmbedding(content)

      const { error: insertError } = await supabase.from('coach_search_documents').insert({
        coach_id: coach.id,
        content,
        embedding,
      })

      if (insertError) {
        console.error(`Error inserting document for coach ${coach.id}:`, insertError)
      } else {
        console.log(`Indexed coach ${coach.id}.`)
      }
    } catch (e) {
      console.error(`Failed to generate embedding for coach ${coach.id}`, e)
    }
  }

  console.log('Successfully completed seeding the search index.')
}

seedSearchIndex()
