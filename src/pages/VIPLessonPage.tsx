import { ArrowLeft, Play, ChevronLeft, ChevronRight, ExternalLink, CheckCircle, Loader2, Wrench, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface RelatedLink {
  type: "tool" | "lesson";
  id: string;
  label?: string;
}

const VIPLessonPage = () => {
  const { id } = useParams();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['vip-lesson', id],
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
    queryKey: ['related-tools', relatedLinks],
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
    queryKey: ['related-lessons', relatedLinks],
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

  // Fetch adjacent lessons for navigation
  const { data: adjacentLessons } = useQuery({
    queryKey: ['adjacent-lessons', lesson?.category_id, lesson?.order_index],
    queryFn: async () => {
      if (!lesson?.category_id) return { prev: null, next: null };

      const [prevResult, nextResult] = await Promise.all([
        supabase
          .from('lessons')
          .select('id')
          .eq('category_id', lesson.category_id)
          .lt('order_index', lesson.order_index || 0)
          .order('order_index', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('lessons')
          .select('id')
          .eq('category_id', lesson.category_id)
          .gt('order_index', lesson.order_index || 0)
          .order('order_index', { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      return {
        prev: prevResult.data?.id || null,
        next: nextResult.data?.id || null,
      };
    },
    enabled: !!lesson?.category_id,
  });

  const isVipCategory = lesson?.category?.type === 'vip';

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
          <Link to="/vip" className="text-primary mt-4 inline-block">
            Voltar para VIP
          </Link>
        </div>
      </Layout>
    );
  }

  // Check if URL is a direct video file
  const isDirectVideo = (url: string | null) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|mov|avi|mpeg)(\?.*)?$/i) !== null;
  };

  // Get video embed URL
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    
    // If it's a direct video file, return null (we'll use <video> instead)
    if (isDirectVideo(url)) return null;
    
    // YouTube (includes m.youtube.com, www.youtube.com, youtube.com, youtu.be)
    const youtubeMatch = url.match(/(?:(?:m\.|www\.)?youtube\.com\/watch\?v=|youtu\.be\/|(?:m\.|www\.)?youtube\.com\/embed\/)([^&\n?#]+)/);
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
  const showDirectVideo = isDirectVideo(lesson.video_url);

  return (
    <Layout>
      <div className="page-container">
        <div className="content-container">
          {/* Back Button */}
          <Link
            to={isVipCategory ? `/vip/category/${lesson.category_id}` : `/free/category/${lesson.category_id}`}
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
            {showDirectVideo && lesson.video_url ? (
              <video
                src={lesson.video_url}
                controls
                className="w-full h-full object-contain bg-black"
                controlsList="nodownload"
                playsInline
              >
                Seu navegador não suporta a reprodução de vídeo.
              </video>
            ) : embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-foreground/20 flex items-center justify-center mb-4 mx-auto backdrop-blur-sm cursor-pointer hover:bg-foreground/30 transition-colors">
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
                <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
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
                    
                    const path = link.type === 'tool' ? `/tools/${link.id}` : `/vip/lesson/${link.id}`;
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

            {/* Mark as Complete */}
            <Button className="w-full mb-6 bg-success hover:bg-success/90 text-foreground">
              <CheckCircle className="w-5 h-5 mr-2" />
              Marcar como concluída
            </Button>

            {/* Navigation */}
            <div className="flex gap-4">
              {adjacentLessons?.prev ? (
                <Link
                  to={`/vip/lesson/${adjacentLessons.prev}`}
                  className="flex-1 flex items-center justify-center gap-2 p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm">Anterior</span>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              
              {adjacentLessons?.next && (
                <Link
                  to={`/vip/lesson/${adjacentLessons.next}`}
                  className="flex-1 flex items-center justify-center gap-2 p-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
                >
                  <span className="text-sm">Próxima</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default VIPLessonPage;
