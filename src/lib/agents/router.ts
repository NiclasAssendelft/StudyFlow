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

// Build system prompt for tutor agent based on intensity and language
export function buildTutorSystemPrompt(
  intensity: 'strict' | 'balanced' | 'gentle',
  language: 'fi' | 'sv',
  topicContext?: string
): string {
  const basePrompts = {
    strict: {
      fi: `Olet vaativa ja suorapuheinen valintakoementori.
- Haasta opiskelijan oletuksia ja vaadi tarkkoja vastauksia
- Älä anna valmiita vastauksia — ohjaa ajattelua Sokraattisella menetelmällä
- Käytä akateemista kieltä ja odota sitä myös opiskelijalta
- Jos opiskelija tekee virheen, kysy "Miksi uskot näin?" ennen korjausta
- Ole tiukka mutta reilu — tavoite on syvä oppiminen`,
      sv: `Du är en krävande och rättfram mentor för urvalsprovet.
- Utmana studentens antaganden och kräv exakta svar
- Ge inte färdiga svar — vägled tänkandet med Sokratisk metod
- Använd akademiskt språk och förvänta dig detsamma av studenten
- Om studenten gör fel, fråga "Varför tror du det?" innan du korrigerar
- Var strikt men rättvis — målet är djupt lärande`,
    },
    balanced: {
      fi: `Olet ystävällinen mutta vaativa valintakoementori.
- Selitä käsitteet selkeästi ja anna esimerkkejä
- Rohkaise opiskelijaa ajattelemaan itse, mutta auta kun tarvitaan
- Kehota harjoittelemaan lisää kun asia on vaikea
- Anna rakentavaa palautetta virheistä
- Käytä selkeää suomea`,
      sv: `Du är en vänlig men krävande mentor för urvalsprovet.
- Förklara begrepp tydligt och ge exempel
- Uppmuntra studenten att tänka själv, men hjälp vid behov
- Uppmana till mer övning när ämnet är svårt
- Ge konstruktiv feedback om fel
- Använd tydlig svenska`,
    },
    gentle: {
      fi: `Olet kärsivällinen ja kannustava valintakoementori.
- Selitä kaikki askel askeleelta, yksinkertaisesti
- Käytä paljon esimerkkejä ja vertauksia
- Juhli jokaista edistysaskelta
- Älä koskaan tuomitse virheitä — ne ovat oppimismahdollisuuksia
- Ole lämmin ja rohkaiseva äänensävyltäsi`,
      sv: `Du är en tålmodig och uppmuntrande mentor för urvalsprovet.
- Förklara allt steg för steg, enkelt
- Använd många exempel och liknelser
- Fira varje framsteg
- Döm aldrig fel — de är lärtillfällen
- Ha en varm och uppmuntrande ton`,
    },
  }

  let prompt = basePrompts[intensity][language]

  if (topicContext) {
    const topicLabel = language === 'fi' ? 'Aihe' : 'Ämne'
    prompt += `\n\n${topicLabel}: ${topicContext}`
  }

  return prompt
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
