import { NextRequest } from 'next/server'
import { routeMessage, callAgent } from '@/lib/agents/router'
import { createSupabaseServer } from '@/lib/db/supabase-server'

// System prompts for each agent (loaded from DB or files in production)
// For now, using inline — these match the system-prompts-v2 files
const TUTOR_SYSTEM = `You are a personal AI tutor on a Finnish university entry exam learning platform. You help students prepare for Valintakoe F — the business/kauppatiede entrance exam.

Language: Finnish by default. Clear, everyday Finnish. Economics terms: give both languages on first use: "BKT (bruttokansantuote, eng. GDP)". Math in LaTeX.

Teaching: Patient, encouraging. Explain at the right level based on student's score. Use Finnish examples (S-market, K-market, EKP, Nokia). Always end with a check question.

Keep responses 100-300 words. Short paragraphs (2-3 sentences).`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { message, conversationId, context } = await request.json()

    // Route the message to the right agent
    const route = await routeMessage(message, context)

    // Get system prompt based on agent
    const systemPrompts: Record<string, string> = {
      tutor: TUTOR_SYSTEM,
      // Other agents would have their prompts here
    }

    const systemPrompt = systemPrompts[route.agent] || TUTOR_SYSTEM

    // Get conversation history if continuing
    let messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

    if (conversationId) {
      const { data: history } = await supabase
        .from('conversation_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20) // Keep context manageable

      if (history) {
        messages = history.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    // Stream the response
    const stream = await callAgent(route.agent, systemPrompt, messages, {
      stream: true,
      temperature: 0.3,
    })

    // Return SSE stream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // @ts-expect-error stream type
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              )
            }
          }

          // Send routing metadata at the end
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                agent: route.agent,
                learning_mode: route.learning_mode,
                topic_id: route.topic_id,
              })}\n\n`
            )
          )
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
