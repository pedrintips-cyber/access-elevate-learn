import { User, Crown, Settings, LogOut, ChevronRight, Bell, HelpCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

const menuItems = [
  { icon: Bell, label: "Notificações", path: "/settings/notifications" },
  { icon: HelpCircle, label: "Ajuda e Suporte", path: "/support" },
  { icon: Shield, label: "Privacidade", path: "/privacy" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

const ProfilePage = () => {
  const isLoggedIn = false; // TODO: Check from auth
  const isVIP = false; // TODO: Check from auth

  return (
    <Layout>
      <div className="page-container">
        <div className="content-container">
          {!isLoggedIn ? (
            /* Not Logged In State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-2">
                Entre na sua conta
              </h1>
              <p className="text-muted-foreground mb-8">
                Faça login para acessar seu perfil e conteúdos
              </p>

              <div className="space-y-3">
                <Link
                  to="/login"
                  className="btn-vip w-full flex items-center justify-center"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-6 py-3 bg-secondary text-foreground font-semibold rounded-xl text-center hover:bg-secondary/80 transition-colors"
                >
                  Criar Conta
                </Link>
              </div>
            </motion.div>
          ) : (
            /* Logged In State */
            <>
              {/* Profile Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 mb-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-warning flex items-center justify-center">
                    <User className="w-8 h-8 text-background" />
                  </div>
                  <div className="flex-1">
                    <h1 className="font-display text-xl font-bold">João Silva</h1>
                    <p className="text-sm text-muted-foreground">joao@email.com</p>
                    <div className="flex items-center gap-2 mt-2">
                      {isVIP ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                          <Crown className="w-3 h-3" />
                          Membro VIP
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-muted-foreground text-xs font-medium rounded-full">
                          Plano Free
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* VIP CTA for Free Users */}
              {!isVIP && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-4 vip-glow mb-6"
                >
                  <div className="flex items-center gap-4">
                    <Crown className="w-10 h-10 text-primary" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Upgrade para VIP</p>
                      <p className="text-xs text-muted-foreground">
                        Desbloqueie todo o conteúdo
                      </p>
                    </div>
                    <Link to="/vip" className="btn-vip text-sm px-4 py-2">
                      Ver planos
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Menu Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card overflow-hidden mb-6"
              >
                {menuItems.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors ${
                      index !== menuItems.length - 1 ? "border-b border-border/50" : ""
                    }`}
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                ))}
              </motion.div>

              {/* Logout Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full flex items-center justify-center gap-2 p-4 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sair da conta
              </motion.button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
