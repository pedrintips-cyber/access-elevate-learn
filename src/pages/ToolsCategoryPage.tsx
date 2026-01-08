import { ArrowLeft, Wrench, Download, Copy, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Tool {
  id: string;
  title: string;
  description: string | null;
  type: string;
  content: string | null;
  file_url: string | null;
  external_url: string | null;
  file_type: string | null;
}

const ToolsCategoryPage = () => {
  const { id } = useParams();
  const { isVIP } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isVIP) {
      navigate('/tools');
      return;
    }

    const fetchData = async () => {
      if (!id) return;

      const [categoryRes, toolsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('id', id).maybeSingle(),
        supabase.from('tools').select('*').eq('category_id', id).order('order_index'),
      ]);

      if (categoryRes.data) setCategory(categoryRes.data);
      if (toolsRes.data) setTools(toolsRes.data);
      setLoading(false);
    };

    fetchData();
  }, [id, isVIP, navigate]);

  if (!isVIP) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="page-container">
          <div className="content-container">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-64" />
              <div className="space-y-4 mt-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card p-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-muted rounded-xl" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-32 mb-2" />
                        <div className="h-3 bg-muted rounded w-48" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
            to="/tools"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

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
                <h1 className="font-display text-2xl md:text-3xl font-bold">{category?.name}</h1>
                {category?.description && (
                  <p className="text-muted-foreground">{category.description}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tools List */}
          {tools.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground">Nenhuma ferramenta disponível nesta categoria ainda.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tools.map((tool, index) => (
                <Link to={`/tools/${tool.id}`} key={tool.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="glass-card p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                        {tool.type === "file" && <Download className="w-6 h-6 text-primary" />}
                        {tool.type === "script" && <Copy className="w-6 h-6 text-primary" />}
                        {tool.type === "link" && <ExternalLink className="w-6 h-6 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">{tool.title}</h3>
                        {tool.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
                        )}
                      </div>
                      <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180 flex-shrink-0" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ToolsCategoryPage;
