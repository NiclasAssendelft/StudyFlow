'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/db/supabase-browser';
import { useLanguage } from '@/lib/i18n/useLanguage';

interface Topic {
  id: string;
  name_fi: string;
  name_sv?: string;
  color: string;
  icon: string;
  lessonCount: number;
  completedLessons: number;
  questionCount: number;
}

const areaConfig = {
  microeconomics: {
    fi: 'Mikrotaloustiede',
    sv: 'Mikroekonomi',
    icon: '📈',
    color: '#2563eb',
    prefix: '1.',
  },
  macroeconomics: {
    fi: 'Makrotaloustiede',
    sv: 'Makroekonomi',
    icon: '🌍',
    color: '#7c3aed',
    prefix: '2.',
  },
  statistics: {
    fi: 'Tilastotiede',
    sv: 'Statistik',
    icon: '📊',
    color: '#059669',
    prefix: '3.',
  },
  business: {
    fi: 'Liiketalous',
    sv: 'Företagsekonomi',
    icon: '💼',
    color: '#d97706',
    prefix: '4.',
  },
};

export default function AreaPage() {
  const params = useParams();
  const router = useRouter();
  const area = params.area as string;
  const { lang, t, loading: langLoading } = useLanguage();

  const config = areaConfig[area as keyof typeof areaConfig];

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config) {
      router.push('/study/subjects');
      return;
    }

    const fetchTopics = async () => {
      try {
        const supabase = createSupabaseBrowser();
        const { data: user } = await supabase.auth.getUser();

        // Fetch all topics for this area
        const { data: topicsData } = await supabase
          .from('topics')
          .select('id, name_fi, name_sv, area')
          .eq('area', area)
          .order('id');

        if (!topicsData) {
          setLoading(false);
          return;
        }

        // Fetch lessons for all these topics
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('id, topic_id')
          .in(
            'topic_id',
            topicsData.map((t) => t.id)
          );

        // Fetch questions for all these topics
        const { data: questionsData } = await supabase
          .from('questions')
          .select('id, topic_id')
          .in(
            'topic_id',
            topicsData.map((t) => t.id)
          );

        // Fetch progress if user is logged in
        let progressData = [];
        if (user?.user) {
          const { data } = await supabase
            .from('lesson_progress')
            .select('lesson_id')
            .eq('student_id', user.user.id)
            .eq('completed', true);
          progressData = data || [];
        }

        // Build topics with metadata
        const enrichedTopics: Topic[] = topicsData.map((topic) => {
          const topicLessons = lessonsData?.filter((l) => l.topic_id === topic.id) || [];
          const topicQuestions = questionsData?.filter((q) => q.topic_id === topic.id) || [];
          const completedLessons = progressData.filter((p) =>
            topicLessons.some((l) => l.id === p.lesson_id)
          ).length;

          return {
            id: topic.id,
            name_fi: topic.name_fi,
            name_sv: topic.name_sv,
            color: config.color,
            icon: config.icon,
            lessonCount: topicLessons.length,
            completedLessons,
            questionCount: topicQuestions.length,
          };
        });

        setTopics(enrichedTopics);
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [area, config, router, lang]);

  if (!config) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/study/subjects"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 mb-4 inline-block"
          >
            ← {t('backToSubjects')}
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{config.icon}</span>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">{config[lang as 'fi' | 'sv']}</h1>
              <p className="text-slate-600">{topics.length} {t('topics')}</p>
            </div>
          </div>
        </div>

        {loading || langLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">{t('loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {topics.map((topic) => {
              const progress = topic.lessonCount > 0
                ? Math.round((topic.completedLessons / topic.lessonCount) * 100)
                : 0;

              return (
                <Link key={topic.id} href={`/study/subjects/${area}/${topic.id}`}>
                  <div
                    className="p-6 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-all duration-300 cursor-pointer"
                    style={{
                      borderLeftColor: config.color,
                      borderLeftWidth: '4px',
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {topic.id}. {lang === 'sv' && topic.name_sv ? topic.name_sv : topic.name_fi}
                        </h3>
                        <div className="flex gap-6 text-sm text-slate-600">
                          <span>📚 {topic.lessonCount} {t('lessons')}</span>
                          <span>❓ {topic.questionCount} {t('questions')}</span>
                        </div>
                      </div>
                      <span
                        className="text-sm font-semibold px-3 py-1 rounded-full text-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {progress}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: config.color,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
