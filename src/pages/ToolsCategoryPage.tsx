import { ArrowLeft, Wrench, Download, Copy, ExternalLink, Check, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopy = (toolId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(toolId);
    toast.success("Copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (url: string) => {
    window.open(url, "_blank");
    toast.success("Download iniciado!");
  };

  const handleExternalLink = (url: string) => {
    window.open(url, "_blank");
  };

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
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="glass-card overflow-hidden"
                >
                  {/* Header com gradiente */}
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        {tool.type === "file" && <Download className="w-5 h-5 text-primary" />}
                        {tool.type === "script" && <Copy className="w-5 h-5 text-primary" />}
                        {tool.type === "link" && <ExternalLink className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{tool.title}</h3>
                        {tool.file_type && (
                          <span className="text-xs text-muted-foreground">{tool.file_type}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {tool.description && (
                      <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                    )}

                    {tool.type === "script" && tool.content && (
                      <div className="bg-muted rounded-lg p-3 mb-4 border border-border/50">
                        <pre className="text-xs text-foreground/80 whitespace-pre-wrap break-words font-mono leading-relaxed">
                          {tool.content.length > 200 ? `${tool.content.slice(0, 200)}...` : tool.content}
                        </pre>
                      </div>
                    )}

                    {/* Action Button */}
                    {tool.type === "file" && tool.file_url && (
                      <button
                        onClick={() => handleDownload(tool.file_url!)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        <Download className="w-4 h-4" />
                        Baixar Arquivo
                      </button>
                    )}

                    {tool.type === "script" && tool.content && (
                      <button
                        onClick={() => handleCopy(tool.id, tool.content!)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        {copiedId === tool.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copiar Script
                          </>
                        )}
                      </button>
                    )}

                    {tool.type === "link" && tool.external_url && (
                      <button
                        onClick={() => handleExternalLink(tool.external_url!)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-accent-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Acessar Link
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ToolsCategoryPage;
