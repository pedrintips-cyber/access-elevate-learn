import { Crown, Star, CheckCircle, Sparkles, Shield, Zap, Key } from "lucide-react";
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
  parent_id: string | null;
}

const vipBenefits = [
  { icon: Zap, text: "Acesso a todos os módulos" },
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

  // Apenas categorias principais (sem parent_id)
  const mainCategories = categories.filter(c => !c.parent_id);

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
              {/* Categories - apenas categorias principais */}
              <div className="space-y-4 mb-10">
                {mainCategories.map((category, index) => (
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

              {/* CTA simples para não-VIP */}
              {!isVIP && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <Link
                    to="/token-vip"
                    className="btn-vip inline-flex items-center gap-2"
                  >
                    <Key className="w-5 h-5" />
                    Ativar meu Token VIP
                  </Link>
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