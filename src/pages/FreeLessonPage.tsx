import { ArrowLeft, Play, Crown, Download, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

const lessonsData: Record<string, { title: string; description: string; videoUrl?: string; content: string }> = {
  "1": {
    title: "Introdução ao Método VIP",
    description: "Descubra os fundamentos que transformam resultados",
    content: `Bem-vindo à primeira aula do Método VIP!

Nesta aula introdutória, você vai descobrir os princípios fundamentais que sustentam todo o nosso método. 

Prepare-se para uma jornada de transformação onde você aprenderá:
- Os conceitos base que guiam nosso método
- Por que a maioria falha e como evitar os mesmos erros
- O que diferencia resultados medianos de extraordinários

Esta é apenas uma amostra do que você encontrará na versão completa. O conteúdo VIP vai muito além, com estratégias avançadas, casos práticos e suporte direto.`,
  },
  "2": {
    title: "Os 3 Pilares do Sucesso",
    description: "A base sólida que sustenta todo o método",
    content: `Os 3 Pilares são a fundação de tudo que ensinamos.

Pilar 1: Mentalidade
A forma como você pensa determina seus resultados. Nesta seção você aprenderá a reprogramar padrões limitantes.

Pilar 2: Estratégia
Ter as ferramentas certas e saber quando usá-las. Revelamos as técnicas que realmente funcionam.

Pilar 3: Ação Consistente
Resultados vêm da execução diária. Mostramos como criar rotinas que geram resultados.

No VIP, você terá acesso ao detalhamento completo de cada pilar com exercícios práticos e acompanhamento.`,
  },
  "3": {
    title: "Primeiros Passos Práticos",
    description: "Comece a aplicar os conceitos básicos",
    content: `Hora de colocar em prática!

Esta aula é sobre ação. Você vai aprender os primeiros passos para começar a ver resultados:

1. Defina seu objetivo principal
2. Mapeie sua situação atual
3. Identifique as principais barreiras
4. Crie seu primeiro plano de ação

Lembre-se: o conhecimento sem ação não gera resultados. Use o que aprendeu aqui como ponto de partida.

Na área VIP, você terá templates prontos, scripts e ferramentas para acelerar esse processo.`,
  },
  "4": {
    title: "Mindset de Alta Performance",
    description: "Desenvolva a mentalidade necessária",
    content: `Sua mentalidade é seu maior ativo.

Nesta aula exploramos:
- Como os top performers pensam
- Técnicas para eliminar crenças limitantes
- Rituais matinais de sucesso
- A importância do ambiente

Pessoas de alta performance não nasceram assim. Elas desenvolveram hábitos e mentalidades específicas que qualquer um pode aprender.

O módulo completo de Mindset no VIP inclui meditações guiadas, exercícios diários e técnicas avançadas de reprogramação mental.`,
  },
  "5": {
    title: "Preview: Estratégias Avançadas",
    description: "Uma amostra do conteúdo VIP",
    content: `Bem-vindo ao preview exclusivo!

Esta é uma pequena amostra do que você encontrará na área VIP:

Estratégia #1: O Método 4-7-8
Uma técnica poderosa para tomar decisões rápidas e assertivas.

Estratégia #2: Alavancagem Inteligente
Como multiplicar seus resultados com menos esforço.

Estratégia #3: O Círculo de Ouro
A estrutura que os líderes de mercado usam para se destacar.

Estas são apenas 3 das mais de 50 estratégias disponíveis na área VIP. Cada uma vem com exemplos práticos, templates e suporte.

Pronto para desbloquear tudo?`,
  },
};

const FreeLessonPage = () => {
  const { id } = useParams();
  const lesson = lessonsData[id || "1"];

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

          {/* Video Player Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aspect-video bg-muted rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20" />
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-full bg-foreground/20 flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
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

            <div className="glass-card p-6 mb-6">
              <h2 className="font-semibold mb-4">Sobre esta aula</h2>
              <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {lesson.content}
              </div>
            </div>
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
