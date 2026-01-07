import { Shield, Lock, Eye, Database } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";

const privacySections = [
  {
    icon: Lock,
    title: "Segurança dos Dados",
    description: "Seus dados são protegidos com criptografia de ponta e armazenados em servidores seguros.",
  },
  {
    icon: Eye,
    title: "Privacidade",
    description: "Não compartilhamos suas informações pessoais com terceiros sem seu consentimento.",
  },
  {
    icon: Database,
    title: "Coleta de Dados",
    description: "Coletamos apenas os dados necessários para fornecer nossos serviços e melhorar sua experiência.",
  },
];

const PrivacyPage = () => {
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
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Privacidade</h1>
                <p className="text-sm text-muted-foreground">Como protegemos seus dados</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 mb-8"
          >
            {privacySections.map((section, index) => (
              <div key={index} className="glass-card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <h3 className="font-semibold mb-3">Seus Direitos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Acesso aos seus dados pessoais armazenados
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Correção de dados incorretos ou desatualizados
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Exclusão dos seus dados mediante solicitação
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Portabilidade dos dados para outro serviço
              </li>
            </ul>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground text-center mt-6"
          >
            Última atualização: Janeiro de 2026
          </motion.p>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
