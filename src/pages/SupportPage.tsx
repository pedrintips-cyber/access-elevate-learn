import { HelpCircle, MessageCircle, Headphones, Mail, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";

const supportOptions = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Fale conosco pelo WhatsApp",
    color: "from-green-500 to-green-600",
    url: "#",
  },
  {
    icon: Headphones,
    title: "Discord",
    description: "Entre no nosso servidor",
    color: "from-indigo-500 to-purple-600",
    url: "#",
  },
  {
    icon: Mail,
    title: "Email",
    description: "contato@pedrotips.com",
    color: "from-blue-500 to-cyan-500",
    url: "mailto:contato@pedrotips.com",
  },
];

const faqItems = [
  {
    question: "Como faço para acessar o conteúdo VIP?",
    answer: "Após adquirir o plano VIP, todo o conteúdo será liberado automaticamente na sua conta.",
  },
  {
    question: "Posso cancelar meu plano a qualquer momento?",
    answer: "O plano VIP não possui renovação automática. Após o período contratado, você pode renovar se desejar.",
  },
  {
    question: "Como recupero minha senha?",
    answer: "Na tela de login, clique em 'Esqueci minha senha' e siga as instruções enviadas para seu email.",
  },
];

const SupportPage = () => {
  return (
    <Layout>
      <div className="page-container">
        <div className="content-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Ajuda e Suporte</h1>
                <p className="text-sm text-muted-foreground">Como podemos ajudar?</p>
              </div>
            </div>
          </motion.div>

          {/* Support Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3 mb-8"
          >
            <p className="text-sm font-medium text-muted-foreground px-1">Fale Conosco</p>
            {supportOptions.map((option, index) => (
              <a
                key={index}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{option.title}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </a>
            ))}
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm font-medium text-muted-foreground px-1 mb-3">Perguntas Frequentes</p>
            <div className="glass-card overflow-hidden">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 ${index !== faqItems.length - 1 ? "border-b border-border/50" : ""}`}
                >
                  <p className="font-medium mb-2">{item.question}</p>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Feedback Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Link
              to="/feedback"
              className="glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-warning flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Enviar Feedback</p>
                <p className="text-sm text-muted-foreground">Sugestões, bugs ou elogios</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default SupportPage;
