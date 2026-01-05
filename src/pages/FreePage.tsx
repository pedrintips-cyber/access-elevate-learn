import { BookOpen, Crown, ArrowRight, Play, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

const freeLessons = [
  {
    id: "1",
    title: "Introdução ao Método VIP",
    description: "Descubra os fundamentos que transformam resultados e prepare-se para a jornada.",
    duration: "12 min",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop"
  },
  {
    id: "2",
    title: "Os 3 Pilares do Sucesso",
    description: "Conheça a base sólida que sustenta todo o método e entenda por que funciona.",
    duration: "18 min",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop"
  },
  {
    id: "3",
    title: "Primeiros Passos Práticos",
    description: "Comece a aplicar os conceitos básicos com ações simples e efetivas.",
    duration: "15 min",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=225&fit=crop"
  },
  {
    id: "4",
    title: "Mindset de Alta Performance",
    description: "Desenvolva a mentalidade necessária para alcançar resultados extraordinários.",
    duration: "20 min",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop"
  },
  {
    id: "5",
    title: "Preview: Estratégias Avançadas",
    description: "Uma amostra do que você encontrará na área VIP com técnicas exclusivas.",
    duration: "10 min",
    thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop"
  },
];

const FreePage = () => {
  return (
    <Layout>
      <div className="page-container">
        <div className="content-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-free flex items-center justify-center shadow-glow-accent">
                <BookOpen className="w-7 h-7 text-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">Conteúdo Gratuito</h1>
                <p className="text-muted-foreground">Comece sua jornada aqui</p>
              </div>
            </div>
          </motion.div>

          {/* Lessons Grid */}
          <div className="space-y-4 mb-8">
            {freeLessons.map((lesson, index) => (
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
                    <div className="relative w-28 h-20 md:w-36 md:h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={lesson.thumbnail}
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
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
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {lesson.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* VIP CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 vip-glow relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
            <div className="relative flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-warning flex items-center justify-center flex-shrink-0 shadow-lg">
                <Crown className="w-8 h-8 text-background" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Exclusivo</span>
                </div>
                <h3 className="font-display font-bold text-xl mb-2">
                  Quer acesso completo?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Desbloqueie todas as aulas, módulos avançados, scripts exclusivos e muito mais!
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/vip"
                    className="btn-vip inline-flex items-center gap-2"
                  >
                    Desbloquear VIP
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default FreePage;
