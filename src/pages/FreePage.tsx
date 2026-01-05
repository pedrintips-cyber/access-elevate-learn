import { BookOpen, Crown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { LessonCard } from "@/components/ui/LessonCard";

const freeLessons = [
  {
    id: "1",
    title: "Introdução ao Método VIP",
    description: "Descubra os fundamentos que transformam resultados e prepare-se para a jornada.",
    duration: "12 min",
  },
  {
    id: "2",
    title: "Os 3 Pilares do Sucesso",
    description: "Conheça a base sólida que sustenta todo o método e entenda por que funciona.",
    duration: "18 min",
  },
  {
    id: "3",
    title: "Primeiros Passos Práticos",
    description: "Comece a aplicar os conceitos básicos com ações simples e efetivas.",
    duration: "15 min",
  },
  {
    id: "4",
    title: "Mindset de Alta Performance",
    description: "Desenvolva a mentalidade necessária para alcançar resultados extraordinários.",
    duration: "20 min",
  },
  {
    id: "5",
    title: "Preview: Estratégias Avançadas",
    description: "Uma amostra do que você encontrará na área VIP com técnicas exclusivas.",
    duration: "10 min",
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-free flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Conteúdo Gratuito</h1>
                <p className="text-sm text-muted-foreground">Comece sua jornada aqui</p>
              </div>
            </div>
          </motion.div>

          {/* Lessons List */}
          <div className="space-y-3 mb-8">
            {freeLessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <LessonCard {...lesson} type="free" />
              </motion.div>
            ))}
          </div>

          {/* VIP CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 vip-glow"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-warning flex items-center justify-center flex-shrink-0">
                <Crown className="w-7 h-7 text-background" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg mb-1">
                  Quer acesso completo?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Desbloqueie todas as aulas, módulos avançados, scripts exclusivos e muito mais!
                </p>
                <Link
                  to="/vip"
                  className="btn-vip inline-flex items-center gap-2 text-sm"
                >
                  Desbloquear VIP
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default FreePage;
