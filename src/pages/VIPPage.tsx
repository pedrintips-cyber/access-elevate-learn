import { Crown, Lock, Star, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
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
  "Acesso vitalício a todos os módulos",
  "Atualizações constantes de conteúdo",
  "Scripts e templates prontos",
  "Comunidade privada no Telegram",
  "Suporte prioritário por WhatsApp",
  "Certificado de conclusão",
];

const VIPPage = () => {
  const isVIP = false; // TODO: Check from auth

  return (
    <Layout>
      <div className="page-container">
        <div className="content-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Área Exclusiva</span>
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Área <span className="gradient-text-vip">VIP</span>
            </h1>
            <p className="text-muted-foreground">
              {isVIP
                ? "Bem-vindo de volta! Continue sua jornada."
                : "Desbloqueie todo o potencial do método"}
            </p>
          </motion.div>

          {!isVIP ? (
            <>
              {/* Locked Modules Preview */}
              <div className="space-y-4 mb-8">
                {modules.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
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
                className="glass-card p-6 vip-glow animate-pulse-glow"
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-warning flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-10 h-10 text-background" />
                  </div>
                  <h2 className="font-display text-2xl font-bold mb-2">
                    Torne-se VIP Agora
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Acesso completo a todo o conteúdo premium
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {vipBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center mb-6">
                  <div className="text-muted-foreground text-sm line-through mb-1">
                    De R$ 497,00
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-muted-foreground">Por apenas</span>
                    <span className="font-display text-4xl font-bold gradient-text-vip">
                      R$ 97
                    </span>
                    <span className="text-muted-foreground text-sm">,00</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pagamento único • Acesso vitalício
                  </p>
                </div>

                <Link
                  to="/checkout"
                  className="btn-vip w-full flex items-center justify-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  Quero ser VIP agora
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  🔒 Pagamento 100% seguro • Satisfação garantida
                </p>
              </motion.div>
            </>
          ) : (
            /* VIP User View */
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
