import { getAnthropicClient, AGENT_MODELS, type AgentType } from './client'

interface RouteDecision {
  agent: AgentType
  learning_mode: 'feynman' | 'pomodoro' | 'review' | 'general'
  topic_id: string | null
  confidence: number
}

// Orchestrator system prompt (cached for cost savings)
const ORCHESTRATOR_SYSTEM = `You are the Orchestrator for a Finnish university entry exam learning platform. Route each student message to the correct agent.

Agents:
- tutor: Questions about concepts, explanations, help understanding topics, Feynman mode
- question_generator: "Give me practice questions", "I want to practice", requests for quizzes
- assessment: Submitting answers, requesting scores, evaluating Feynman explanations
- study_plan: Schedule, plan, what to study next, Pomodoro planning
- content_summarizer: Summaries, flashcards, cheat sheets, quick reviews

Detect learning mode from context:
- feynman: Student says "let me explain" / "selitän" / learning_mode context
- pomodoro: Student in timed session / mentions Pomodoro
- review: Spaced repetition session / review mode
- general: Default

Return JSON only: {"agent":"tutor","learning_mode":"general","topic_id":null,"confidence":0.95}`

export async function routeMessage(
  message: string,
  context?: { learning_mode?: string; topic_id?: string }
): Promise<RouteDecision> {
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: AGENT_MODELS.orchestrator,
    max_tokens: 200,
    temperature: 0,
    system: [
      {
        type: 'text',
        text: ORCHESTRATOR_SYSTEM,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Context: ${JSON.stringify(context || {})}\nMessage: ${message}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    return JSON.parse(text) as RouteDecision
  } catch {
    // Fallback to tutor if parsing fails
    return {
      agent: 'tutor',
      learning_mode: 'general',
      topic_id: null,
      confidence: 0.5,
    }
  }
}

// Call a specific agent with its system prompt and conversation history
export async function callAgent(
  agent: AgentType,
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options?: { stream?: boolean; maxTokens?: number; temperature?: number }
) {
  const client = getAnthropicClient()
  const model = AGENT_MODELS[agent]

  if (options?.stream) {
    return client.messages.stream({
      model,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.3,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    })
  }

  return client.messages.create({
    model,
    max_tokens: options?.maxTokens || 1000,
    temperature: options?.temperature || 0.3,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages,
  })
}
