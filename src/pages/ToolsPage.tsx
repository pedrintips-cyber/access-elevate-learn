import { Wrench, Lock, Crown, Download, FileText, Code } from "lucide-react";
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

const ToolsPage = () => {
  const isVIP = false; // TODO: Check from auth

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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-warning/20 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Ferramentas</h1>
                <p className="text-sm text-muted-foreground">Scripts e materiais exclusivos</p>
              </div>
            </div>
          </motion.div>

          {!isVIP ? (
            <>
              {/* Locked State */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 text-center mb-8"
              >
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="font-display text-xl font-bold mb-2">
                  Conteúdo Exclusivo VIP
                </h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                  Scripts, templates, planilhas e acesso à comunidade. Tudo para acelerar seus resultados.
                </p>
                <Link to="/vip" className="btn-vip inline-flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Desbloquear Acesso
                </Link>
              </motion.div>

              {/* Preview Cards (blurred) */}
              <div className="space-y-4 relative">
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
                {tools.slice(0, 3).map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="blur-sm pointer-events-none"
                  >
                    <ToolCard {...tool} />
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            /* VIP User View */
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Scripts e Templates</h2>
              </div>
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

              <div className="flex items-center gap-2 mb-4 mt-8">
                <Download className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Arquivos para Download</h2>
              </div>
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

              <div className="flex items-center gap-2 mb-4 mt-8">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Links Úteis</h2>
              </div>
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ToolsPage;
