import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { pipeline, env } from '@xenova/transformers'

env.allowLocalModels = false
dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function run() {
  const query = process.argv[2] || 'Team dynamics in manufacturing'
  const extractor = await pipeline('feature-extraction', 'intfloat/multilingual-e5-small', {
    quantized: false,
  })
  const output = await extractor(query, { pooling: 'mean', normalize: true })
  const embedding = Array.from(output.data)

  const { data, error } = await supabase.rpc('match_coach_documents', {
    query_embedding: embedding as any,
    match_threshold: 0.0, // Set to 0 to see all scores
    match_count: 20,
  })

  console.log(`Query: "${query}"`)
  console.log('Raw matches:')
  console.log(data)
}

run()
