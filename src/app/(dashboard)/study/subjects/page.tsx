'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/db/supabase-browser';
import { useLanguage } from '@/lib/i18n/useLanguage';

interface AreaCard {
  slug: string;
  label: string;
  icon: string;
  color: string;
  topicCount: number;
  progress: number;
}

const areaConfig: Record<string, { fi: string; sv: string; icon: string; color: string }> = {
  microeconomics: { fi: 'Mikrotaloustiede', sv: 'Mikroekonomi', icon: '📈', color: '#2563eb' },
  macroeconomics: { fi: 'Makrataloustiede', sv: 'Makroekonomi', icon: '🌍', color: '#7c3aed' },
  statistics: { fi: 'Tilastotiede', sv: 'Statistik', icon: '📊', color: '#059669' },
  business: { fi: 'Liiketalous', sv: 'Företagsekonomi', icon: '💼', color: '#d97706' },
};

const colorMap: Record<string, string> = {
  '#2563eb': 'from-blue-400 to-blue-600',
  '#7c3aed': 'from-purple-400 to-purple-600',
  '#059669': 'from-emerald-400 to-emerald-600',
  '#d97706': 'from-amber-400 to-amber-600',
};

// Shimmer skeleton component
function SkeletonCard() {
  return (
    <div className="card-interactive rounded-2xl p-8 h-full bg-gradient-to-br from-slate-200/50 to-slate-300/50 animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div className="w-16 h-16 rounded-full bg-slate-300/50"></div>
        <div className="w-24 h-6 rounded-full bg-slate-300/50"></div>
      </div>
      <div className="w-3/4 h-6 rounded bg-slate-300/50 mb-4"></div>
      <div className="w-1/2 h-4 rounded bg-slate-300/50 mb-6"></div>
      <div className="w-full h-2 rounded-full bg-slate-300/50"></div>
    </div>
  );
}

export default function SubjectsPage() {
  const { lang, t, loading: langLoading } = useLanguage();
  const [areas, setAreas] = useState<AreaCard[]>([
    {
      slug: 'microeconomics',
      label: areaConfig.microeconomics[lang as 'fi' | 'sv'],
      icon: '📈',
      color: '#2563eb',
      topicCount: 7,
      progress: 0,
    },
    {
      slug: 'macroeconomics',
      label: areaConfig.macroeconomics[lang as 'fi' | 'sv'],
      icon: '🌍',
      color: '#7c3aed',
      topicCount: 7,
      progress: 0,
    },
    {
      slug: 'statistics',
      label: areaConfig.statistics[lang as 'fi' | 'sv'],
      icon: '📊',
      color: '#059669',
      topicCount: 7,
      progress: 0,
    },
    {
      slug: 'business',
      label: areaConfig.business[lang as 'fi' | 'sv'],
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

  useEffect(() => {
    if (lang) {
      setAreas((prevAreas) =>
        prevAreas.map((area) => ({
          ...area,
          label: areaConfig[area.slug][lang as 'fi' | 'sv'],
        }))
      );
    }
  }, [lang]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-2 text-gradient">{t('subjects')}</h1>
          <p className="text-lg text-surface-600">{t('selectSubjectToStart')}</p>
        </div>

        {loading || langLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {areas.map((area, index) => (
              <Link key={area.slug} href={`/study/subjects/${area.slug}`}>
                <div
                  className="card-interactive group h-full rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden animate-slide-up"
                  style={{
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${colorMap[area.color]}`}
                  ></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      {/* Icon in colored circle */}
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg"
                        style={{
                          backgroundColor: area.color,
                          boxShadow: `0 8px 24px ${area.color}40`,
                        }}
                      >
                        {area.icon}
                      </div>
                      <div
                        className="chip-brand text-white text-sm font-semibold"
                        style={{ backgroundColor: area.color }}
                      >
                        {area.progress}%
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-surface-900 mb-1">
                      {area.label}
                    </h2>
                    <p className="text-surface-600 mb-6">{area.topicCount} {t('topics')}</p>

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="progress-bar">
                        <div
                          className="progress-fill transition-all duration-500"
                          style={{
                            width: `${area.progress}%`,
                            backgroundColor: area.color,
                          }}
                        />
                      </div>
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
