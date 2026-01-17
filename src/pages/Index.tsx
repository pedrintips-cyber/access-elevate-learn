import { Crown, Users, Zap, ArrowRight, MessageCircle, Headphones, Star, Shield, Sparkles, Gem } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const networkBenefits = [
  { icon: Users, text: "Networking com empreendedores de elite" },
  { icon: Zap, text: "Scripts e estratégias exclusivas" },
  { icon: Shield, text: "Suporte direto da equipe" },
  { icon: Star, text: "Acesso a conteúdos premium" },
  { icon: Sparkles, text: "Comunidade ativa 24/7" },
];

const Home = () => {
  const { isVIP } = useAuth();
  
  const { data: settings } = useQuery({
    queryKey: ["site-settings-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("whatsapp_link, discord_link")
        .single();
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <div className="page-container">
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-[85vh] flex items-center">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-0 w-[200px] h-[200px] bg-warning/10 rounded-full blur-[80px]" />
          </div>
          
          <div className="content-container relative z-10 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6"
              >
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Network de Elite</span>
              </motion.div>

              {/* Main Title */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary to-warning flex items-center justify-center shadow-lg shadow-primary/30">
                  <Crown className="w-10 h-10 text-background" />
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-bold mb-3 leading-tight">
                  <span className="gradient-text-vip">Alta Cúpula</span>
                </h1>
                <p className="text-lg md:text-xl text-foreground/80 font-medium">
                  O Network que vai mudar seu jogo
                </p>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-base md:text-lg mb-8 max-w-md mx-auto leading-relaxed px-4"
              >
                Faça parte do grupo mais exclusivo de empreendedores. Acesse scripts, estratégias e conecte-se com quem realmente faz acontecer.
              </motion.p>

              {/* Network Groups */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8"
              >
                {/* WhatsApp Group */}
                <motion.a
                  href={settings?.whatsapp_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-5 flex flex-col items-center gap-3 group cursor-pointer border border-green-500/30 hover:border-green-500/50 transition-all bg-gradient-to-br from-green-500/5 to-transparent"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-base text-foreground mb-1">
                      WhatsApp VIP
                    </h3>
                    <p className="text-xs text-muted-foreground">Grupo exclusivo</p>
                  </div>
                  <span className="text-xs font-medium text-green-500 flex items-center gap-1">
                    Entrar agora <ArrowRight className="w-3 h-3" />
                  </span>
                </motion.a>

                {/* Discord Group */}
                <motion.a
                  href={settings?.discord_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-5 flex flex-col items-center gap-3 group cursor-pointer border border-indigo-500/30 hover:border-indigo-500/50 transition-all bg-gradient-to-br from-indigo-500/5 to-transparent"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Headphones className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-base text-foreground mb-1">
                      Discord VIP
                    </h3>
                    <p className="text-xs text-muted-foreground">Comunidade ativa</p>
                  </div>
                  <span className="text-xs font-medium text-indigo-500 flex items-center gap-1">
                    Entrar agora <ArrowRight className="w-3 h-3" />
                  </span>
                </motion.a>
              </motion.div>

              {/* Buy VIP CTA - Only show for non-VIP users */}
              {!isVIP && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8"
                >
                  <Link to="/comprar-vip">
                    <Button variant="vip" size="lg" className="gap-2 text-base px-8">
                      <Gem className="w-5 h-5" />
                      Adquirir VIP Agora
                    </Button>
                  </Link>
                </motion.div>
              )}

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="grid grid-cols-3 gap-3 max-w-sm mx-auto"
              >
                <div className="glass-card p-4 text-center border border-border/50">
                  <p className="font-display text-2xl font-bold text-primary">500+</p>
                  <p className="text-xs text-muted-foreground">Membros</p>
                </div>
                <div className="glass-card p-4 text-center border border-border/50">
                  <p className="font-display text-2xl font-bold text-primary">24/7</p>
                  <p className="text-xs text-muted-foreground">Suporte</p>
                </div>
                <div className="glass-card p-4 text-center border border-border/50">
                  <p className="font-display text-2xl font-bold text-primary">VIP</p>
                  <p className="text-xs text-muted-foreground">Exclusivo</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="content-container py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                O que você ganha na <span className="text-primary">Alta Cúpula</span>
              </h2>
              <p className="text-muted-foreground">
                Regalias exclusivas para membros do network
              </p>
            </div>

            <div className="grid gap-3 max-w-lg mx-auto">
              {networkBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  className="glass-card p-4 flex items-center gap-4 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Buy VIP Section - Only for non-VIP */}
        {!isVIP && (
          <section className="content-container py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card p-8 text-center relative overflow-hidden border border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px]" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-warning/20 rounded-full blur-[50px]" />
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-warning flex items-center justify-center shadow-lg shadow-primary/40">
                  <Gem className="w-8 h-8 text-background" />
                </div>
                <h2 className="font-display text-xl md:text-2xl font-bold mb-3">
                  Desbloqueie o <span className="gradient-text-vip">Acesso VIP</span>
                </h2>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Tenha acesso a conteúdos exclusivos, ferramentas premium e muito mais.
                </p>
                <Link to="/comprar-vip">
                  <Button variant="vip" size="lg" className="gap-2">
                    <Gem className="w-5 h-5" />
                    Adquirir VIP - R$ 250
                  </Button>
                </Link>
              </div>
            </motion.div>
          </section>
        )}

        {/* CTA Section */}
        <section className="content-container py-8 pb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 text-center relative overflow-hidden border border-primary/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-warning/5" />
            <div className="relative z-10">
              <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="font-display text-xl md:text-2xl font-bold mb-3">
                Pronto para entrar na <span className="text-primary">Alta Cúpula</span>?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Escolha um dos grupos e faça parte do network que vai transformar seus resultados.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.a
                  href={settings?.whatsapp_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-vip inline-flex items-center justify-center gap-2 px-6 py-3"
                >
                  <MessageCircle className="w-4 h-4" />
                  Entrar no WhatsApp
                </motion.a>
                <motion.a
                  href={settings?.discord_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 transition-colors font-medium"
                >
                  <Headphones className="w-4 h-4" />
                  Entrar no Discord
                </motion.a>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
