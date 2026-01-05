import { Wrench, Lock, Crown, Download, FileText, Code, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ToolCard } from "@/components/ui/ToolCard";

const tools = [
  {
    id: "1",
    title: "Script de Prospecção 1.0",
    description: "Modelo pronto para abordar leads frios com alta conversão.",
    type: "script" as const,
    content: "Olá [NOME], tudo bem?\n\nVi que você [CONTEXTO] e isso me chamou atenção porque...",
  },
  {
    id: "2",
    title: "Template de Follow-up",
    description: "Sequência de mensagens para manter o lead engajado.",
    type: "script" as const,
    content: "Dia 1: [MENSAGEM INICIAL]\nDia 3: [SEGUNDO CONTATO]\nDia 7: [OFERTA]...",
  },
  {
    id: "3",
    title: "Planilha de Controle",
    description: "Organize seus leads e acompanhe resultados.",
    type: "file" as const,
    fileUrl: "#",
    fileType: ".xlsx",
  },
  {
    id: "4",
    title: "Pack de Artes para Stories",
    description: "Templates editáveis para aumentar engajamento.",
    type: "file" as const,
    fileUrl: "#",
    fileType: ".zip",
  },
  {
    id: "5",
    title: "Grupo VIP no Telegram",
    description: "Acesso à comunidade exclusiva de membros.",
    type: "link" as const,
    externalUrl: "https://t.me",
  },
  {
    id: "6",
    title: "Suporte via WhatsApp",
    description: "Tire dúvidas diretamente com nossa equipe.",
    type: "link" as const,
    externalUrl: "https://wa.me",
  },
];

const previewTools = [
  { title: "Script de Prospecção", type: "Script" },
  { title: "Template de Follow-up", type: "Script" },
  { title: "Planilha de Controle", type: "Arquivo" },
  { title: "Pack de Artes", type: "Arquivo" },
  { title: "Grupo VIP", type: "Link" },
];

const ToolsPage = () => {
  const isVIP = false;

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

              {/* Preview Cards */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  O que você vai receber:
                </p>
                {previewTools.map((tool, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="glass-card p-4 flex items-center gap-4 opacity-60"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{tool.title}</p>
                      <p className="text-xs text-muted-foreground">{tool.type}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Scripts e Templates</h2>
                </div>
                <div className="space-y-3">
                  {tools
                    .filter((t) => t.type === "script")
                    .map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ToolCard {...tool} />
                      </motion.div>
                    ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Download className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Arquivos para Download</h2>
                </div>
                <div className="space-y-3">
                  {tools
                    .filter((t) => t.type === "file")
                    .map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ToolCard {...tool} />
                      </motion.div>
                    ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Links Úteis</h2>
                </div>
                <div className="space-y-3">
                  {tools
                    .filter((t) => t.type === "link")
                    .map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ToolCard {...tool} />
                      </motion.div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ToolsPage;
