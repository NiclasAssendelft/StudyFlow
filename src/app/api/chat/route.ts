import { NextRequest } from 'next/server'
import { routeMessage, callAgent, buildTutorSystemPrompt } from '@/lib/agents/router'
import { createSupabaseServer } from '@/lib/db/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { message, conversationId, context } = await request.json()

    // Fetch student profile for tutor intensity and language preference
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('tutor_intensity, language_preference')
      .eq('auth_user_id', user.id)
      .single()

    const intensity = (profile?.tutor_intensity || 'balanced') as 'strict' | 'balanced' | 'gentle'
    const language = (profile?.language_preference || 'fi') as 'fi' | 'sv'

    // Route the message to the right agent
    const route = await routeMessage(message, context)

    // Get system prompt based on agent and student preferences
    let systemPrompt: string

    if (route.agent === 'tutor') {
      systemPrompt = buildTutorSystemPrompt(intensity, language, context?.topicName)
    } else {
      // Other agents would have their prompts here
      systemPrompt = buildTutorSystemPrompt(intensity, language, context?.topicName)
    }

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
