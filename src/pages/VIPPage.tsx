import { Crown, Star, CheckCircle, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  type: string;
  order_index: number;
}

const vipBenefits = [
  { icon: Zap, text: "Acesso vitalício a todos os módulos" },
  { icon: Star, text: "50+ aulas exclusivas" },
  { icon: Shield, text: "Scripts e templates prontos" },
  { icon: CheckCircle, text: "Comunidade privada" },
  { icon: CheckCircle, text: "Suporte prioritário" },
  { icon: CheckCircle, text: "Atualizações gratuitas" },
];

const VIPPage = () => {
  const { isVIP } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'vip')
        .order('order_index');

      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

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
                ? "Bem-vindo de volta! Explore as categorias."
                : "Desbloqueie todo o potencial do método"}
            </p>
          </motion.div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-32 mb-2" />
                      <div className="h-3 bg-muted rounded w-48" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Categories */}
              <div className="space-y-4 mb-10">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <CategoryCard {...category} isLocked={!isVIP} />
                  </motion.div>
                ))}
              </div>

              {/* VIP Purchase Card - Only show if not VIP */}
              {!isVIP && (
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
                          R$ 250
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
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VIPPage;
