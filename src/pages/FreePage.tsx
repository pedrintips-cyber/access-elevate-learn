import { BookOpen, Crown, ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { CategoryCard } from "@/components/ui/CategoryCard";
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

const FreePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'free')
        .order('order_index');

      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  // Separar categorias principais e subcategorias
  const mainCategories = categories.filter(c => !c.parent_id);
  const getSubcategories = (parentId: string) => 
    categories.filter(c => c.parent_id === parentId);

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
                <p className="text-muted-foreground">Explore por categoria</p>
              </div>
            </div>
          </motion.div>

          {/* Categories Grid */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
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
            <div className="space-y-4 mb-8">
              {mainCategories.map((category, index) => {
                const subcategories = getSubcategories(category.id);
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <CategoryCard {...category} />
                    
                    {/* Subcategorias */}
                    {subcategories.length > 0 && (
                      <div className="ml-6 mt-2 space-y-2 border-l-2 border-border/50 pl-4">
                        {subcategories.map((sub, subIndex) => (
                          <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.08 + subIndex * 0.05 }}
                          >
                            <Link
                              to={`/free/category/${sub.id}`}
                              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                            >
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              <div>
                                <p className="font-medium text-sm group-hover:text-primary transition-colors">{sub.name}</p>
                                {sub.description && (
                                  <p className="text-xs text-muted-foreground">{sub.description}</p>
                                )}
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

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