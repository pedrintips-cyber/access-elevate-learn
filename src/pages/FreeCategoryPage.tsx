import { ArrowLeft, BookOpen, Play, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration: string | null;
}

const FreeCategoryPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const [categoryRes, lessonsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('id', id).maybeSingle(),
        supabase.from('lessons').select('*').eq('category_id', id).order('order_index'),
      ]);

      if (categoryRes.data) setCategory(categoryRes.data);
      if (lessonsRes.data) setLessons(lessonsRes.data);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="page-container">
          <div className="content-container">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-64" />
              <div className="space-y-4 mt-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card p-4">
                    <div className="flex gap-4">
                      <div className="w-28 h-20 bg-muted rounded-xl" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-32 mb-2" />
                        <div className="h-3 bg-muted rounded w-48" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="content-container">
          {/* Back Button */}
          <Link
            to="/free"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-free flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">{category?.name}</h1>
                {category?.description && (
                  <p className="text-muted-foreground">{category.description}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Lessons List */}
          {lessons.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground">Nenhuma aula disponível nesta categoria ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link
                    to={`/free/${lesson.id}`}
                    className="glass-card block overflow-hidden group hover:border-accent/30 transition-all duration-300"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="relative w-28 h-20 md:w-36 md:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                        {lesson.thumbnail_url ? (
                          <img
                            src={lesson.thumbnail_url}
                            alt={lesson.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-free/20">
                            <Play className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-foreground/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all">
                            <Play className="w-4 h-4 text-foreground ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 py-1">
                        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1 mb-1">
                          {lesson.title}
                        </h3>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {lesson.description}
                          </p>
                        )}
                        {lesson.duration && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{lesson.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FreeCategoryPage;
