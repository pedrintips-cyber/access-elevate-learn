import { Crown, Star, Users, Zap, ArrowRight, CheckCircle, MessageCircle, Headphones, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const benefits = [
  { icon: Shield, text: "Acesso exclusivo à comunidade" },
  { icon: Zap, text: "Conteúdos e estratégias premium" },
  { icon: Users, text: "Networking com membros" },
  { icon: Star, text: "Suporte prioritário" },
];

const stats = [
  { number: "500+", label: "Membros" },
  { number: "24/7", label: "Suporte" },
  { number: "100%", label: "Exclusivo" },
];

const Home = () => {
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

  const communityLinks = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Canal gratuito",
      color: "from-green-500 to-green-600",
      url: settings?.whatsapp_link || "#",
    },
    {
      icon: Headphones,
      title: "Discord",
      description: "Comunidade ativa",
      color: "from-indigo-500 to-purple-600",
      url: settings?.discord_link || "#",
    },
  ];

  return (
    <Layout>
      <div className="page-container">
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-[80vh] flex items-center">
          {/* Background - Mais sutil */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-background" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
          </div>
          
          <div className="content-container relative z-10 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Badge - Menor */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-5"
              >
                <Crown className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Comunidade Exclusiva</span>
              </motion.div>

              {/* Main Title - Tamanhos menores */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <Crown className="w-12 h-12 md:w-14 md:h-14 text-primary mx-auto mb-4" />
                <h1 className="font-display text-3xl md:text-5xl font-bold mb-2 leading-tight">
                  <span className="gradient-text-vip">Alta Cúpula</span>
                </h1>
                <p className="text-base md:text-lg text-foreground/80 font-medium">
                  Comunidade VIP de Elite
                </p>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-sm md:text-base mb-6 max-w-sm mx-auto leading-relaxed px-4"
              >
                Faça parte de um grupo seleto com acesso a conteúdos exclusivos e suporte dedicado.
              </motion.p>

              {/* Community Links - Mais compactos */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6"
              >
                {communityLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-card p-3 flex flex-col items-center gap-2 group cursor-pointer border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center`}>
                      <link.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-sm text-foreground">
                        {link.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{link.description}</p>
                    </div>
                  </motion.a>
                ))}
              </motion.div>

              {/* CTA Button - Menor */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <Link to="/checkout">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-vip inline-flex items-center gap-2 text-sm px-6 py-3"
                  >
                    <Crown className="w-4 h-4" />
                    Quero ser VIP
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </motion.div>

              {/* Stats - Mais compactos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="grid grid-cols-3 gap-2 max-w-xs mx-auto"
              >
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="glass-card p-3 text-center border border-border/50"
                  >
                    <p className="font-display text-lg md:text-xl font-bold text-primary">
                      {stat.number}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="content-container py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-6">
              <h2 className="font-display text-xl md:text-2xl font-bold mb-1">
                Por que a <span className="text-primary">Alta Cúpula</span>?
              </h2>
              <p className="text-sm text-muted-foreground">
                Benefícios exclusivos para membros VIP
              </p>
            </div>

            <div className="grid gap-2">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="glass-card p-3 flex items-center gap-3 border border-border/50"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">{benefit.text}</span>
                  <CheckCircle className="w-4 h-4 text-success" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Final CTA Section */}
        <section className="content-container py-6 pb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-6 text-center relative overflow-hidden border border-primary/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative z-10">
              <Crown className="w-10 h-10 text-primary mx-auto mb-3" />
              <h2 className="font-display text-lg md:text-xl font-bold mb-2">
                Entre para a <span className="text-primary">Alta Cúpula</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                Faça parte da comunidade VIP mais exclusiva
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/checkout"
                  className="btn-vip inline-flex items-center gap-2 text-sm px-6 py-3"
                >
                  Tornar-se VIP
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
