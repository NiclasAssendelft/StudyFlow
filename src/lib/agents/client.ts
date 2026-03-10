import Anthropic from '@anthropic-ai/sdk'

// Singleton Anthropic client
let anthropicClient: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })
  }
  return anthropicClient
}

// Agent model assignments
export const AGENT_MODELS = {
  orchestrator: 'claude-haiku-4-5-20251001',
  tutor: 'claude-sonnet-4-6-20250514',
  question_generator: 'claude-opus-4-6-20250610',
  assessment: 'claude-sonnet-4-6-20250514',
  study_plan: 'claude-sonnet-4-6-20250514',
  content_summarizer: 'claude-haiku-4-5-20251001',
} as const

export type AgentType = keyof typeof AGENT_MODELS
