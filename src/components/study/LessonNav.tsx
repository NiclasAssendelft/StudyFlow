'use client'

import Link from 'next/link'

interface Lesson {
  id: string
  title_fi: string
  lesson_order: number
  completed?: boolean
}

interface LessonNavProps {
  lessons: Lesson[]
  currentLessonId: string
  topicId: string
  area: string
}

export function LessonNav({
  lessons,
  currentLessonId,
  topicId,
  area,
}: LessonNavProps) {
  const sortedLessons = [...lessons].sort(
    (a, b) => a.lesson_order - b.lesson_order
  )

  return (
    <div className="bg-white rounded-2xl p-6 mb-8">
      {/* Mobile view - vertical */}
      <div className="md:hidden">
        <div className="space-y-2">
          {sortedLessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/study/subjects/${area}/${topicId}/${lesson.id}`}
              className={`block px-4 py-3 rounded-lg font-medium transition-all ${
                lesson.id === currentLessonId
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold bg-gray-200">
                  {lesson.completed ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-600">{index + 1}</span>
                  )}
                </div>
                <span className="text-sm">{lesson.title_fi}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop view - horizontal */}
      <div className="hidden md:block">
        <div className="flex items-center gap-2">
          {sortedLessons.map((lesson, index) => (
            <div key={lesson.id} className="flex items-center gap-2 min-w-0">
              <Link
                href={`/study/subjects/${area}/${topicId}/${lesson.id}`}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm flex items-center gap-2 ${
                  lesson.id === currentLessonId
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                  {lesson.completed ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span>{lesson.title_fi}</span>
              </Link>
              {index < sortedLessons.length - 1 && (
                <div className="flex-shrink-0 text-gray-300">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Edistyminen</span>
          <span className="font-semibold text-gray-900">
            {sortedLessons.filter((l) => l.completed).length}/{sortedLessons.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                (sortedLessons.filter((l) => l.completed).length /
                  sortedLessons.length) *
                100
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
