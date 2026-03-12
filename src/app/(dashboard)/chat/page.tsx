import { TutorChat } from '@/components/chat/TutorChat'

export default function ChatPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tekoälytuutori</h1>
        <p className="text-gray-600 mt-1">
          Kysy mitä tahansa Valintakoe F:ään liittyvää — saatavilla 24/7.
        </p>
      </div>
      <TutorChat />
    </div>
  )
}
