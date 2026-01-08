import { User, Crown, Settings, LogOut, ChevronRight, Bell, HelpCircle, Shield, Sparkles, MessageCircle, Headphones, Copy, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";

const menuItems = [
  { icon: Bell, label: "Notificações", path: "/settings/notifications" },
  { icon: HelpCircle, label: "Ajuda e Suporte", path: "/support" },
  { icon: Shield, label: "Privacidade", path: "/privacy" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

const communityLinks = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    color: "from-green-500 to-green-600",
    url: "#",
  },
  {
    icon: Headphones,
    title: "Discord",
    color: "from-indigo-500 to-purple-600",
    url: "#",
  },
];

const ProfilePage = () => {
  const { user, profile, isVIP, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast.success("Você saiu da conta");
    navigate("/");
  };

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      toast.success("ID copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getVIPDaysRemaining = () => {
    if (!profile?.vip_expires_at) return null;
    const expiresAt = new Date(profile.vip_expires_at);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const vipDaysRemaining = getVIPDaysRemaining();

  if (isLoading) {
    return (
      <Layout>
        <div className="page-container">
          <div className="content-container">
            <div className="animate-pulse space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-5 bg-muted rounded w-32 mb-2" />
                    <div className="h-4 bg-muted rounded w-48" />
                  </div>
                </div>
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
          {!user ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-28 h-28 rounded-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center mx-auto mb-8"
              >
                <User className="w-14 h-14 text-muted-foreground" />
              </motion.div>
              
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">
                Entre na sua conta
              </h1>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Faça login para acessar seu perfil, acompanhar seu progresso e ver seus conteúdos
              </p>

              <div className="space-y-3 max-w-xs mx-auto">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/login"
                    className="btn-vip w-full flex items-center justify-center"
                  >
                    Entrar
                  </Link>
                </motion.div>
                <Link
                  to="/register"
                  className="block w-full px-6 py-3 bg-secondary text-foreground font-semibold rounded-xl text-center hover:bg-secondary/80 transition-colors"
                >
                  Criar Conta
                </Link>
              </div>

              {/* Community Links */}
              <div className="mt-12">
                <p className="text-sm text-muted-foreground mb-4">Junte-se à comunidade</p>
                <div className="flex justify-center gap-4">
                  {communityLinks.map((link, index) => (
                    <motion.a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg`}
                    >
                      <link.icon className="w-7 h-7 text-white" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Profile Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 mb-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
                <div className="relative flex items-center gap-4">
                  <div className="w-18 h-18 rounded-full bg-gradient-to-br from-primary to-warning flex items-center justify-center p-1">
                    <div className="w-full h-full rounded-full bg-card flex items-center justify-center w-16 h-16">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Avatar" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h1 className="font-display text-xl font-bold">
                      {profile?.full_name || 'Usuário'}
                    </h1>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {isVIP ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                          <Crown className="w-3.5 h-3.5" />
                          Membro VIP
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary text-muted-foreground text-xs font-medium rounded-full">
                          Plano Free
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* User ID */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Seu ID de usuário</p>
                  <button
                    onClick={copyUserId}
                    className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors w-full"
                  >
                    <code className="text-xs text-foreground/80 flex-1 text-left truncate font-mono">
                      {user.id}
                    </code>
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* VIP Status Card */}
              {isVIP && vipDaysRemaining !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`glass-card p-5 mb-6 relative overflow-hidden ${vipDaysRemaining <= 10 ? 'border-destructive/50' : ''}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${vipDaysRemaining <= 10 ? 'from-destructive/10 via-destructive/5' : 'from-primary/10 via-warning/5'} to-transparent`} />
                  <div className="relative flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${vipDaysRemaining <= 10 ? 'from-destructive to-destructive/70' : 'from-primary to-warning'} flex items-center justify-center flex-shrink-0`}>
                      <Crown className="w-7 h-7 text-background" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-lg">Status VIP Ativo</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className={`w-4 h-4 ${vipDaysRemaining <= 10 ? 'text-destructive' : 'text-muted-foreground'}`} />
                        <p className={`text-sm ${vipDaysRemaining <= 10 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                          {vipDaysRemaining === 0 
                            ? "Expira hoje!" 
                            : vipDaysRemaining === 1 
                              ? "Expira amanhã" 
                              : `${vipDaysRemaining} dias restantes`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-display font-bold ${vipDaysRemaining <= 10 ? 'text-destructive' : 'text-primary'}`}>{vipDaysRemaining}</p>
                      <p className="text-xs text-muted-foreground">dias</p>
                    </div>
                  </div>
                  {vipDaysRemaining <= 10 && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <Link 
                        to="/checkout" 
                        className="w-full flex items-center justify-center text-sm font-semibold py-3 px-4 rounded-xl bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground hover:opacity-90 transition-opacity"
                      >
                        🔥 Renovar VIP Agora
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {/* VIP CTA for Free Users */}
              {!isVIP && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-5 vip-glow mb-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-warning flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-background" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Upgrade para VIP</p>
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

              {/* Community Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-6"
              >
                <p className="text-sm font-medium text-muted-foreground mb-3 px-1">Comunidade</p>
                <div className="flex gap-3">
                  {communityLinks.map((link, index) => (
                    <motion.a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -4 }}
                      className={`flex-1 glass-card p-4 flex items-center gap-3 hover:border-primary/30 transition-colors`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center`}>
                        <link.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-sm">{link.title}</span>
                    </motion.a>
                  ))}
                </div>
              </motion.div>

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
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="flex-1 font-medium">{item.label}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                ))}
              </motion.div>

              {/* Logout Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleLogout}
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
