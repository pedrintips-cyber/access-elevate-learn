import { Wrench, Lock, Crown, Sparkles, ChevronRight } from "lucide-react";
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

const ToolsPage = () => {
  const { isVIP } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'tools')
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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-warning/30 flex items-center justify-center shadow-glow-gold">
                <Wrench className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">Ferramentas</h1>
                <p className="text-muted-foreground">Scripts e materiais exclusivos</p>
              </div>
            </div>
          </motion.div>

          {!isVIP ? (
            <>
              {/* Locked State */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 md:p-10 text-center mb-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-warning/5" />
                <div className="relative">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6"
                  >
                    <Lock className="w-10 h-10 text-muted-foreground" />
                  </motion.div>
                  <h2 className="font-display text-2xl font-bold mb-3">
                    Conteúdo Exclusivo VIP
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    Scripts, templates, planilhas e acesso à comunidade. Tudo para acelerar seus resultados.
                  </p>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/vip" className="btn-vip inline-flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Desbloquear Acesso
                    </Link>
                  </motion.div>
                </div>
              </motion.div>

              {/* Preview Categories */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Categorias disponíveis:
                </p>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="glass-card p-4 animate-pulse opacity-60">
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
                  mainCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <CategoryCard {...category} isLocked />
                    </motion.div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
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
                mainCategories.map((category, index) => {
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
                        <div className="ml-6 mt-2 space-y-2 border-l-2 border-primary/30 pl-4">
                          {subcategories.map((sub, subIndex) => (
                            <motion.div
                              key={sub.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.08 + subIndex * 0.05 }}
                            >
                              <Link
                                to={`/tools/category/${sub.id}`}
                                className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group"
                              >
                                <ChevronRight className="w-4 h-4 text-primary" />
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
                })
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ToolsPage;