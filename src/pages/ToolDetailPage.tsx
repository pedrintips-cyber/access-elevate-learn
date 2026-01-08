import { ArrowLeft, Download, Copy, ExternalLink, Check, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Tool {
  id: string;
  title: string;
  description: string | null;
  type: string;
  content: string | null;
  file_url: string | null;
  external_url: string | null;
  file_type: string | null;
  instructions: string | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

const ToolDetailPage = () => {
  const { id } = useParams();
  const { isVIP } = useAuth();
  const navigate = useNavigate();
  const [tool, setTool] = useState<Tool | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isVIP) {
      navigate('/tools');
      return;
    }

    const fetchData = async () => {
      if (!id) return;

      const { data: toolData } = await supabase
        .from('tools')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (toolData) {
        setTool(toolData);
        
        if (toolData.category_id) {
          const { data: catData } = await supabase
            .from('categories')
            .select('id, name')
            .eq('id', toolData.category_id)
            .maybeSingle();
          
          if (catData) setCategory(catData);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [id, isVIP, navigate]);

  const handleCopy = () => {
    if (tool?.content) {
      navigator.clipboard.writeText(tool.content);
      setCopied(true);
      toast.success("Copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (tool?.file_url) {
      window.open(tool.file_url, "_blank");
      toast.success("Download iniciado!");
    }
  };

  const handleExternalLink = () => {
    if (tool?.external_url) {
      window.open(tool.external_url, "_blank");
    }
  };

  if (!isVIP) return null;

  if (loading) {
    return (
      <Layout>
        <div className="page-container">
          <div className="content-container">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-64" />
              <div className="h-32 bg-muted rounded mt-8" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!tool) {
    return (
      <Layout>
        <div className="page-container">
          <div className="content-container">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Ferramenta não encontrada.</p>
              <Link to="/tools" className="text-primary hover:underline mt-4 inline-block">
                Voltar para ferramentas
              </Link>
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
            to={category ? `/tools/category/${category.id}` : "/tools"}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-warning/30 flex items-center justify-center shadow-glow-gold">
                {tool.type === "file" && <Download className="w-7 h-7 text-primary" />}
                {tool.type === "script" && <Copy className="w-7 h-7 text-primary" />}
                {tool.type === "link" && <ExternalLink className="w-7 h-7 text-primary" />}
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">{tool.title}</h1>
                {tool.file_type && (
                  <span className="text-sm text-muted-foreground">{tool.file_type}</span>
                )}
              </div>
            </div>
            {tool.description && (
              <p className="text-muted-foreground">{tool.description}</p>
            )}
          </motion.div>

          {/* Instructions Section */}
          {tool.instructions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-5 mb-6"
            >
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Como usar
              </h2>
              <div className="prose prose-sm prose-invert max-w-none">
                <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {tool.instructions}
                </div>
              </div>
            </motion.div>
          )}

          {/* Script Preview */}
          {tool.type === "script" && tool.content && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card p-5 mb-6"
            >
              <h2 className="font-semibold text-lg mb-4">Script</h2>
              <div className="bg-muted rounded-lg p-4 border border-border/50 max-h-64 overflow-y-auto">
                <pre className="text-sm text-foreground/80 whitespace-pre-wrap break-words font-mono leading-relaxed">
                  {tool.content}
                </pre>
              </div>
            </motion.div>
          )}

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {tool.type === "file" && tool.file_url && (
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-xl text-base font-semibold hover:opacity-90 transition-opacity"
              >
                <Download className="w-5 h-5" />
                Baixar Arquivo
              </button>
            )}

            {tool.type === "script" && tool.content && (
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-xl text-base font-semibold hover:opacity-90 transition-opacity"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar Script
                  </>
                )}
              </button>
            )}

            {tool.type === "link" && tool.external_url && (
              <button
                onClick={handleExternalLink}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-accent text-accent-foreground rounded-xl text-base font-semibold hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-5 h-5" />
                Acessar Link
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ToolDetailPage;
