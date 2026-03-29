import { pipeline, env } from '@xenova/transformers'

// Setup environment for Next.js to not use local caching since it might crash on Vercel
env.allowLocalModels = false

class EmbeddingService {
  private static instance: any = null

  static async getInstance() {
    if (!this.instance) {
      // Load 'intfloat/multilingual-e5-small' model asynchronously.
      // quantized=false avoids a specific download issue we've seen on the hub
      this.instance = await pipeline('feature-extraction', 'intfloat/multilingual-e5-small', {
        quantized: false,
      })
    }
    return this.instance
  }

  static async getEmbedding(text: string): Promise<number[]> {
    const extractor = await EmbeddingService.getInstance()
    // 'mean' pooling and normalization is typically required for e5 models
    const output = await extractor(text, { pooling: 'mean', normalize: true })
    return Array.from(output.data)
  }
}

export const getEmbedding = EmbeddingService.getEmbedding
