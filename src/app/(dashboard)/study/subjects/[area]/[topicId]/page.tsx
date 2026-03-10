'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/db/supabase-browser';

interface Lesson {
  id: string;
  title_fi: string;
  estimated_minutes: number;
  video_url?: string;
  completed: boolean;
}

interface TopicHeader {
  id: string;
  name_fi: string;
  icon: string;
  color: string;
  label: string;
}

const areaConfig = {
  microeconomics: {
    label: 'Mikrotaloustiede',
    icon: '📈',
    color: '#2563eb',
  },
  macroeconomics: {
    label: 'Makrotaloustiede',
    icon: '🌍',
    color: '#7c3aed',
  },
  statistics: {
    label: 'Tilastotiede',
    icon: '📊',
    color: '#059669',
  },
  business: {
    label: 'Liiketalous',
    icon: '💼',
    color: '#d97706',
  },
};

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const area = params.area as string;
  const topicId = params.topicId as string;

  const config = areaConfig[area as keyof typeof areaConfig];

  const [topic, setTopic] = useState<TopicHeader | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config) {
      router.push('/study/subjects');
      return;
    }

    const fetchData = async () => {
      try {
        const supabase = createSupabaseBrowser();
        const { data: user } = await supabase.auth.getUser();

        // Fetch topic
        const { data: topicData } = await supabase
          .from('topics')
          .select('id, name_fi')
          .eq('id', topicId)
          .single();

        if (!topicData) {
          router.push(`/study/subjects/${area}`);
          return;
        }

        setTopic({
          id: topicData.id,
          name_fi: topicData.name_fi,
          icon: config.icon,
          color: config.color,
          label: config.label,
        });

        // Fetch lessons for this topic
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('id, title_fi, estimated_minutes, video_url')
          .eq('topic_id', topicId)
          .order('lesson_order');

        if (!lessonsData) {
          setLoading(false);
          return;
        }

        // Fetch progress if user is logged in
        let progressData = [];
        if (user?.user) {
          const { data } = await supabase
            .from('lesson_progress')
            .select('lesson_id')
            .eq('student_id', user.user.id)
            .eq('completed', true)
            .in(
              'lesson_id',
              lessonsData.map((l) => l.id)
            );
          progressData = data || [];
        }

        // Build lessons with completion status
        const enrichedLessons: Lesson[] = lessonsData.map((lesson) => ({
          id: lesson.id,
          title_fi: lesson.title_fi,
          estimated_minutes: lesson.estimated_minutes,
          video_url: lesson.video_url,
          completed: progressData.some((p) => p.lesson_id === lesson.id),
        }));

        setLessons(enrichedLessons);
      } catch (error) {
        console.error('Error fetching topic data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [area, topicId, config, router]);

  if (!config || !topic) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/study/subjects/${area}`}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 mb-4 inline-block"
          >
            ← Takaisin aiheisiin
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {topic.id}. {topic.name_fi}
            </h1>
            <p className="text-slate-600">{lessons.length} oppituntia</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Ladataan...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                href={`/study/subjects/${area}/${topicId}/${lesson.id}`}
              >
                <div className="p-6 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <div className="flex items-start gap-6">
                    {/* Video thumbnail placeholder */}
                    {lesson.video_url && (
                      <div className="flex-shrink-0 w-24 h-24 rounded bg-slate-200 overflow-hidden">
                        <img
                          src={`https://img.youtube.com/vi/${
                            lesson.video_url.split('v=')[1]?.split('&')[0] || ''
                          }/default.jpg`}
                          alt={lesson.title_fi}
                          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {index + 1}. {lesson.title_fi}
                        </h3>
                        {lesson.completed && (
                          <span className="text-green-600 text-sm font-medium">✓ Valmis</span>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm">
                        ⏱️ {lesson.estimated_minutes} minuuttia
                      </p>
                    </div>

                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: config.color }}
                    >
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
