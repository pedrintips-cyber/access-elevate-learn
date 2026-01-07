import { Bell, BellOff } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";

const NotificationsPage = () => {
  return (
    <Layout>
      <div className="page-container">
        <div className="content-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
              <BellOff className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-3">Notificações</h1>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Você não tem notificações no momento. Quando houver novidades, elas aparecerão aqui.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
