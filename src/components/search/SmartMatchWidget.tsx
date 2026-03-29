'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight, Bot } from 'lucide-react'
import { Button, Input } from '@heroui/react'
import { smartMatchCoaches, SmartMatchResult } from '@/features/search/actions/smartMatch'
import { CoachCard } from '@/components/coaches/CoachCard'

export function SmartMatchWidget() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SmartMatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const matchData = await smartMatchCoaches(query)
      setResult(matchData)
    } catch (err: any) {
      console.error(err)
      setError(
        err.message || 'Something went wrong. Please check if your OpenAI API key is configured.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="bg-wial-blue/5 border-wial-blue/20 rounded-2xl border p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-wial-blue flex h-10 w-10 items-center justify-center rounded-full text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-wial-navy text-xl font-bold">AI Smart Coach Matching</h2>
            <p className="text-sm text-gray-600">
              Describe what you need in any language. We'll find the perfect coaches and explain
              why.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder='e.g. "We need a leadership coach in Brazil for our manufacturing team" or "Busco un coach nivel SALC en España"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            className="bg-wial-blue h-auto rounded-lg px-8 font-medium text-white"
            isDisabled={isLoading}
            isPending={isLoading}
          >
            Match Me
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </form>

        {/* Preset queries for demo */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="my-auto mr-2 text-xs font-medium text-gray-500">Try:</span>
          {[
            'Manufacturing leadership in Brazil',
            'Busco experto en dinámicas de equipo nivel SALC',
            'Need help resolving team conflicts in the healthcare sector',
          ].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuery(q)}
              className="hover:border-wial-blue hover:text-wial-blue rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      )}

      {result && (
        <div className="animate-in slide-in-from-bottom-4 fade-in flex flex-col gap-6 duration-500">
          {/* AI Explanation */}
          <div className="flex flex-row gap-4 rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <Bot className="mt-1 h-6 w-6 shrink-0 text-green-600" />
            <div className="flex flex-col gap-2">
              <p className="leading-relaxed text-green-900">{result.explanation}</p>
              {Object.keys(result.parsedFilters).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-700">
                    Semantic Query: <strong>"{result.parsedFilters.semanticSearchQuery}"</strong>
                  </span>
                  {result.parsedFilters.country && (
                    <span className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-700">
                      Location: <strong>{result.parsedFilters.country}</strong>
                    </span>
                  )}
                  {result.parsedFilters.certification && (
                    <span className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-700">
                      Cert: <strong>{result.parsedFilters.certification}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Coach Results Grid */}
          {result.coaches.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {result.coaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-gray-50 py-12 text-center text-gray-500">
              No coaches found matching these specific criteria.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
