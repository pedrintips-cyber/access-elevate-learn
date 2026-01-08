import { ArrowLeft, Play, Crown, Loader2, Wrench, BookOpen, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface RelatedLink {
  type: "tool" | "lesson";
  id: string;
  label?: string;
}

const FreeLessonPage = () => {
  const { id } = useParams();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['free-lesson', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          category:categories(id, name, type)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch related tools and lessons
  const relatedLinks = (lesson?.related_links as unknown as RelatedLink[] | null) || [];
  
  const { data: relatedTools } = useQuery({
    queryKey: ['related-tools-free', relatedLinks],
    queryFn: async () => {
      const toolIds = relatedLinks.filter(l => l.type === 'tool').map(l => l.id);
      if (toolIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('tools')
        .select('id, title')
        .in('id', toolIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: relatedLinks.some(l => l.type === 'tool'),
  });

  const { data: relatedLessons } = useQuery({
    queryKey: ['related-lessons-free', relatedLinks],
    queryFn: async () => {
      const lessonIds = relatedLinks.filter(l => l.type === 'lesson').map(l => l.id);
      if (lessonIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title')
        .in('id', lessonIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: relatedLinks.some(l => l.type === 'lesson'),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="page-container content-container flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout>
        <div className="page-container content-container text-center py-12">
          <p className="text-muted-foreground">Aula não encontrada</p>
          <Link to="/free" className="text-primary mt-4 inline-block">
            Voltar para aulas
          </Link>
        </div>
      </Layout>
    );
  }

  // Get video embed URL
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return url;
  };

  const embedUrl = getEmbedUrl(lesson.video_url);

  return (
    <Layout>
      <div className="page-container">
        <div className="content-container">
          {/* Back Button */}
          <Link
            to={`/free/category/${lesson.category_id}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {lesson.category?.name || 'Voltar'}
          </Link>

          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aspect-video bg-muted rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative"
          >
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20" />
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-foreground/20 flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                    <Play className="w-8 h-8 text-foreground ml-1" />
                  </div>
                  <p className="text-sm text-muted-foreground">Vídeo não disponível</p>
                </div>
              </>
            )}
          </motion.div>

          {/* Lesson Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="font-display text-2xl font-bold mb-2">{lesson.title}</h1>
            <p className="text-muted-foreground mb-6">{lesson.description}</p>

            {/* Content */}
            {lesson.content && (
              <div className="glass-card p-6 mb-6">
                <h2 className="font-semibold mb-4">Sobre esta aula</h2>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {lesson.content}
                </div>
              </div>
            )}

            {/* Related Links */}
            {relatedLinks.length > 0 && (
              <div className="glass-card p-4 mb-6">
                <h3 className="font-semibold text-sm mb-3">Links Relacionados</h3>
                <div className="space-y-2">
                  {relatedLinks.map((link, index) => {
                    const item = link.type === 'tool' 
                      ? relatedTools?.find(t => t.id === link.id)
                      : relatedLessons?.find(l => l.id === link.id);
                    
                    if (!item) return null;
                    
                    const path = link.type === 'tool' ? `/tools/${link.id}` : `/free/lesson/${link.id}`;
                    const Icon = link.type === 'tool' ? Wrench : BookOpen;
                    
                    return (
                      <Link
                        key={index}
                        to={path}
                        className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm">{link.label || item.title}</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* VIP CTA - Fixed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 vip-glow sticky bottom-20 md:bottom-4"
          >
            <div className="flex items-center gap-4">
              <Crown className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Conteúdo completo no VIP</p>
                <p className="text-xs text-muted-foreground">
                  Desbloqueie todas as aulas e ferramentas
                </p>
              </div>
              <Link
                to="/vip"
                className="btn-vip text-sm px-4 py-2 flex-shrink-0"
              >
                Ver VIP
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default FreeLessonPage;
