import { Settings, User, Bell, Moon, Sun, Globe, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

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
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Configurações</h1>
                <p className="text-sm text-muted-foreground">Personalize sua experiência</p>
              </div>
            </div>
          </motion.div>

          {/* Account Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <p className="text-sm font-medium text-muted-foreground px-1 mb-3">Conta</p>
            <div className="glass-card overflow-hidden">
              <Link
                to="/profile"
                className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors border-b border-border/50"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Perfil</p>
                  <p className="text-sm text-muted-foreground">Editar informações da conta</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
              <Link
                to="/settings/notifications"
                className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Notificações</p>
                  <p className="text-sm text-muted-foreground">Gerenciar alertas</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            </div>
          </motion.div>

          {/* Preferences Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <p className="text-sm font-medium text-muted-foreground px-1 mb-3">Preferências</p>
            <div className="glass-card overflow-hidden">
              <div className="flex items-center gap-4 p-4 border-b border-border/50">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  {darkMode ? (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">Modo Escuro</p>
                  <p className="text-sm text-muted-foreground">Tema da interface</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Notificações Push</p>
                  <p className="text-sm text-muted-foreground">Receber alertas</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
          </motion.div>

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm font-medium text-muted-foreground px-1 mb-3">Sobre</p>
            <div className="glass-card p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-warning flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Pedro Tips</p>
                  <p className="text-sm text-muted-foreground">Versão 1.0.0</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
