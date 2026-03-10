'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/db/supabase-browser';

interface AreaCard {
  slug: string;
  label: string;
  icon: string;
  color: string;
  topicCount: number;
  progress: number;
}

export default function SubjectsPage() {
  const [areas, setAreas] = useState<AreaCard[]>([
    {
      slug: 'microeconomics',
      label: 'Mikrotaloustiede',
      icon: '📈',
      color: '#2563eb',
      topicCount: 7,
      progress: 0,
    },
    {
      slug: 'macroeconomics',
      label: 'Makrotaloustiede',
      icon: '🌍',
      color: '#7c3aed',
      topicCount: 7,
      progress: 0,
    },
    {
      slug: 'statistics',
      label: 'Tilastotiede',
      icon: '📊',
      color: '#059669',
      topicCount: 7,
      progress: 0,
    },
    {
      slug: 'business',
      label: 'Liiketalous',
      icon: '💼',
      color: '#d97706',
      topicCount: 6,
      progress: 0,
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const supabase = createSupabaseBrowser();
        const { data: user } = await supabase.auth.getUser();

        if (!user?.user) {
          setLoading(false);
          return;
        }

        // Get all topics and calculate progress per area
        const { data: topics } = await supabase
          .from('topics')
          .select('id, area');

        if (!topics) {
          setLoading(false);
          return;
        }

        // Get lesson progress for this user
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id, topic_id');

        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('student_id', user.user.id)
          .eq('completed', true);

        // Calculate progress per area
        const progressMap = new Map<string, { completed: number; total: number }>();

        areas.forEach((area) => {
          const areaTopics = topics.filter((t) => t.area === area.slug);
          const areaLessons = lessons?.filter((l) =>
            areaTopics.some((t) => t.id === l.topic_id)
          ) || [];
          const completedCount = progress?.filter((p) =>
            areaLessons.some((l) => l.id === p.lesson_id)
          ).length || 0;

          progressMap.set(area.slug, {
            completed: completedCount,
            total: areaLessons.length,
          });
        });

        // Update areas with progress percentages
        const updatedAreas = areas.map((area) => {
          const areaProgress = progressMap.get(area.slug);
          const percentage = areaProgress
            ? Math.round((areaProgress.completed / areaProgress.total) * 100) || 0
            : 0;
          return { ...area, progress: percentage };
        });

        setAreas(updatedAreas);
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Oppiaineet</h1>
          <p className="text-lg text-slate-600">Valitse oppiaine aloittaaksesi opiskelun</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Ladataan...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {areas.map((area) => (
              <Link key={area.slug} href={`/study/subjects/${area.slug}`}>
                <div
                  className="h-full rounded-lg border-2 p-8 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white"
                  style={{ borderColor: area.color }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-5xl">{area.icon}</div>
                    <span
                      className="text-sm font-semibold px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: area.color }}
                    >
                      {area.progress}%
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {area.label}
                  </h2>
                  <p className="text-slate-600 mb-6">{area.topicCount} aihetta</p>

                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${area.progress}%`,
                        backgroundColor: area.color,
                      }}
                    />
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
