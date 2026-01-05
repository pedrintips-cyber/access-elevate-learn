import { Crown, Star, CheckCircle, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ModuleCard } from "@/components/ui/ModuleCard";

const modules = [
  {
    id: "1",
    number: 1,
    title: "Fundamentos Completos",
    description: "A base sólida para construir resultados consistentes e duradouros.",
    lessonsCount: 8,
    completedLessons: 0,
  },
  {
    id: "2",
    number: 2,
    title: "Estratégias Avançadas",
    description: "Técnicas exclusivas utilizadas pelos top performers do mercado.",
    lessonsCount: 12,
    completedLessons: 0,
  },
  {
    id: "3",
    number: 3,
    title: "Automação e Escala",
    description: "Como multiplicar resultados com sistemas inteligentes.",
    lessonsCount: 10,
    completedLessons: 0,
  },
  {
    id: "4",
    number: 4,
    title: "Cases de Sucesso",
    description: "Análises detalhadas de casos reais com resultados comprovados.",
    lessonsCount: 6,
    completedLessons: 0,
  },
  {
    id: "5",
    number: 5,
    title: "Masterclass Bônus",
    description: "Conteúdo exclusivo com especialistas convidados.",
    lessonsCount: 4,
    completedLessons: 0,
  },
];

const vipBenefits = [
  { icon: Zap, text: "Acesso vitalício a todos os módulos" },
  { icon: Star, text: "50+ aulas exclusivas" },
  { icon: Shield, text: "Scripts e templates prontos" },
  { icon: CheckCircle, text: "Comunidade privada" },
  { icon: CheckCircle, text: "Suporte prioritário" },
  { icon: CheckCircle, text: "Atualizações gratuitas" },
];

const VIPPage = () => {
  const isVIP = false;

  return (
    <Layout>
      <div className="page-container">
        <div className="content-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-warning flex items-center justify-center mx-auto mb-6 shadow-glow-gold"
            >
              <Crown className="w-10 h-10 text-background" />
            </motion.div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Área Exclusiva</span>
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Área <span className="gradient-text-vip">VIP</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {isVIP
                ? "Bem-vindo de volta! Continue sua jornada."
                : "Desbloqueie todo o potencial do método"}
            </p>
          </motion.div>

          {!isVIP ? (
            <>
              {/* Locked Modules Preview */}
              <div className="space-y-4 mb-10">
                {modules.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <ModuleCard {...module} isLocked />
                  </motion.div>
                ))}
              </div>

              {/* VIP Purchase Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6 md:p-8 vip-glow relative overflow-hidden"
              >
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-warning/20 to-transparent rounded-full blur-3xl" />
                
                <div className="relative">
                  <div className="text-center mb-8">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Crown className="w-16 h-16 text-primary mx-auto mb-4" />
                    </motion.div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                      Torne-se VIP Agora
                    </h2>
                    <p className="text-muted-foreground">
                      Acesso completo a todo o conteúdo premium
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mb-8">
                    {vipBenefits.map((benefit, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                      >
                        <benefit.icon className="w-5 h-5 text-success flex-shrink-0" />
                        <span className="text-sm font-medium">{benefit.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="text-center mb-8 p-6 bg-secondary/30 rounded-2xl">
                    <div className="text-muted-foreground text-sm line-through mb-1">
                      De R$ 497,00
                    </div>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-muted-foreground">Por apenas</span>
                      <span className="font-display text-5xl font-bold gradient-text-vip">
                        R$ 97
                      </span>
                      <span className="text-muted-foreground">,00</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pagamento único • Acesso vitalício
                    </p>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/checkout"
                      className="btn-vip w-full flex items-center justify-center gap-2 text-lg py-4"
                    >
                      <Crown className="w-5 h-5" />
                      Quero ser VIP agora
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </motion.div>

                  <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    Pagamento 100% seguro • Satisfação garantida
                  </p>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="space-y-4">
              {modules.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ModuleCard {...module} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VIPPage;
