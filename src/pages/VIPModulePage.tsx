import { ArrowLeft, Play, CheckCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { LessonCard } from "@/components/ui/LessonCard";

const modulesData: Record<
  string,
  {
    number: number;
    title: string;
    description: string;
    lessons: { id: string; title: string; description: string; duration: string; isCompleted: boolean }[];
  }
> = {
  "1": {
    number: 1,
    title: "Fundamentos Completos",
    description: "A base sólida para construir resultados consistentes e duradouros.",
    lessons: [
      { id: "1-1", title: "Introdução ao Módulo", description: "Visão geral do que você vai aprender", duration: "8 min", isCompleted: false },
      { id: "1-2", title: "Conceitos Fundamentais", description: "Os pilares que sustentam todo o método", duration: "15 min", isCompleted: false },
      { id: "1-3", title: "Mapeando sua Situação Atual", description: "Diagnóstico completo do seu cenário", duration: "20 min", isCompleted: false },
      { id: "1-4", title: "Definindo Objetivos Claros", description: "Como criar metas alcançáveis e mensuráveis", duration: "12 min", isCompleted: false },
      { id: "1-5", title: "Plano de Ação Inicial", description: "Seus primeiros passos práticos", duration: "18 min", isCompleted: false },
      { id: "1-6", title: "Ferramentas Essenciais", description: "O que você precisa ter à mão", duration: "10 min", isCompleted: false },
      { id: "1-7", title: "Erros Comuns a Evitar", description: "Armadilhas que travam seu progresso", duration: "14 min", isCompleted: false },
      { id: "1-8", title: "Revisão e Próximos Passos", description: "Consolidando o aprendizado", duration: "8 min", isCompleted: false },
    ],
  },
  "2": {
    number: 2,
    title: "Estratégias Avançadas",
    description: "Técnicas exclusivas utilizadas pelos top performers do mercado.",
    lessons: [
      { id: "2-1", title: "Além do Básico", description: "Técnicas que fazem a diferença", duration: "15 min", isCompleted: false },
      { id: "2-2", title: "O Método 4-7-8", description: "Decisões rápidas e assertivas", duration: "20 min", isCompleted: false },
      { id: "2-3", title: "Alavancagem Inteligente", description: "Multiplique resultados com menos esforço", duration: "25 min", isCompleted: false },
    ],
  },
};

const VIPModulePage = () => {
  const { id } = useParams();
  const moduleData = modulesData[id || "1"];

  if (!moduleData) {
    return (
      <Layout>
        <div className="page-container content-container text-center py-12">
          <p className="text-muted-foreground">Módulo não encontrado</p>
          <Link to="/vip" className="text-primary mt-4 inline-block">
            Voltar para VIP
          </Link>
        </div>
      </Layout>
    );
  }

  const completedCount = moduleData.lessons.filter((l) => l.isCompleted).length;
  const progress = (completedCount / moduleData.lessons.length) * 100;

  return (
    <Layout>
      <div className="page-container">
        <div className="content-container">
          {/* Back Button */}
          <Link
            to="/vip"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Área VIP
          </Link>

          {/* Module Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-6"
          >
            <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-lg mb-3">
              Módulo {moduleData.number}
            </span>
            <h1 className="font-display text-2xl font-bold mb-2">
              {moduleData.title}
            </h1>
            <p className="text-muted-foreground text-sm mb-4">
              {moduleData.description}
            </p>

            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>{completedCount}/{moduleData.lessons.length} aulas concluídas</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-primary to-warning rounded-full"
              />
            </div>
          </motion.div>

          {/* Lessons List */}
          <div className="space-y-3">
            {moduleData.lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <LessonCard
                  {...lesson}
                  type="vip"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VIPModulePage;
