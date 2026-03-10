'use client'

import { useState, useEffect, useRef } from 'react'

interface TutorPopupProps {
  isOpen: boolean
  onClose: () => void
  context: {
    question: string
    studentAnswer: string
    correctAnswer: string
    explanation: string
    topicName: string
  }
}

interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
}

export function TutorPopup({ isOpen, onClose, context }: TutorPopupProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize with AI explanation on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessage: Message = {
        id: '0',
        role: 'assistant',
        content: `Analysoin vastaustasi aiheeseen "${context.topicName}".\n\nOikea vastaus oli: ${context.correctAnswer}\n\nSelitys: ${context.explanation}\n\nMikä sinulle jäi epäselväksi? Voin auttaa sinua ymmärtämään aihetta paremmin!`,
      }
      setMessages([initialMessage])
    }
  }, [isOpen, context])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
    }

    setMessages((prev) => [...prev, userMessage])
    setUserInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          context: context,
          conversationHistory: messages,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from tutor')
      }

      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        // Handle SSE response
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let assistantMessage = ''
        let messageId = Date.now().toString()

        setMessages((prev) => [
          ...prev,
          {
            id: messageId,
            role: 'assistant',
            content: '',
          },
        ])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  assistantMessage += data.content
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === messageId ? { ...msg, content: assistantMessage } : msg
                    )
                  )
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      } else {
        // Handle regular JSON response
        const data = await response.json()
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.content || 'Jokin meni pieleen. Yritä uudelleen.',
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Pahoittelut, en pystynyt vastaamaan juuri nyt. Yritä uudelleen hetken kuluttua.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full sm:w-96 max-h-[90vh] sm:max-h-[600px] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Tekoälytuutori</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Sulje"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 max-w-xs px-4 py-3 rounded-lg rounded-bl-none">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-gray-200 p-6 flex gap-3"
        >
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Kysy mitä tahansa..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            Lähetä
          </button>
        </form>
      </div>
    </div>
  )
}
