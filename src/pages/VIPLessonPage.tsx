import { ArrowLeft, Play, ChevronLeft, ChevronRight, Download, ExternalLink, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const lessonsData: Record<
  string,
  {
    title: string;
    description: string;
    content: string;
    moduleId: string;
    moduleName: string;
    prevLesson?: string;
    nextLesson?: string;
    links?: { label: string; url: string }[];
  }
> = {
  "1-1": {
    title: "Introdução ao Módulo",
    description: "Visão geral do que você vai aprender",
    content: `Bem-vindo ao Módulo 1 - Fundamentos Completos!

Este módulo foi cuidadosamente estruturado para dar a você toda a base necessária para começar sua jornada com o pé direito.

Ao longo das próximas aulas, você vai:

1. Entender os conceitos fundamentais que sustentam todo o método
2. Fazer um diagnóstico completo da sua situação atual
3. Definir objetivos claros e alcançáveis
4. Criar seu primeiro plano de ação
5. Conhecer as ferramentas essenciais
6. Aprender a evitar os erros mais comuns

Cada aula foi pensada para ser prática e aplicável. Você não vai apenas aprender teoria - vai sair de cada aula com algo concreto para implementar.

Vamos começar!`,
    moduleId: "1",
    moduleName: "Fundamentos Completos",
    nextLesson: "1-2",
  },
  "1-2": {
    title: "Conceitos Fundamentais",
    description: "Os pilares que sustentam todo o método",
    content: `Os 3 Pilares Fundamentais

Todo o nosso método se sustenta sobre três pilares essenciais. Entendê-los profundamente é o primeiro passo para o sucesso.

**Pilar 1: Clareza**
Saber exatamente onde você está e onde quer chegar. Sem clareza, qualquer caminho parece válido - e isso é uma armadilha.

**Pilar 2: Consistência**
Resultados extraordinários vêm de ações ordinárias feitas de forma extraordinariamente consistente.

**Pilar 3: Correção**
A capacidade de ajustar a rota quando necessário. Flexibilidade estratégica com firmeza nos objetivos.

Nas próximas aulas, vamos mergulhar em cada um desses pilares com exercícios práticos.`,
    moduleId: "1",
    moduleName: "Fundamentos Completos",
    prevLesson: "1-1",
    nextLesson: "1-3",
    links: [
      { label: "Material de Apoio", url: "#" },
      { label: "Grupo no Telegram", url: "#" },
    ],
  },
};

const VIPLessonPage = () => {
  const { id } = useParams();
  const lesson = lessonsData[id || "1-1"];

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

  return (
    <Layout>
      <div className="page-container">
        <div className="content-container">
          {/* Back Button */}
          <Link
            to={`/vip/module/${lesson.moduleId}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {lesson.moduleName}
          </Link>

          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aspect-video bg-muted rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-full bg-foreground/20 flex items-center justify-center mb-4 mx-auto backdrop-blur-sm cursor-pointer hover:bg-foreground/30 transition-colors">
                <Play className="w-8 h-8 text-foreground ml-1" />
              </div>
              <p className="text-sm text-muted-foreground">Clique para reproduzir</p>
            </div>
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
            <div className="glass-card p-6 mb-6">
              <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                {lesson.content}
              </div>
            </div>

            {/* Links */}
            {lesson.links && lesson.links.length > 0 && (
              <div className="glass-card p-4 mb-6">
                <h3 className="font-semibold text-sm mb-3">Materiais da Aula</h3>
                <div className="space-y-2">
                  {lesson.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-primary" />
                      <span className="text-sm">{link.label}</span>
                    </a>
                  ))}
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
              {lesson.prevLesson ? (
                <Link
                  to={`/vip/lesson/${lesson.prevLesson}`}
                  className="flex-1 flex items-center justify-center gap-2 p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm">Anterior</span>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              
              {lesson.nextLesson && (
                <Link
                  to={`/vip/lesson/${lesson.nextLesson}`}
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
