import { Crown, Star, Users, Zap, ArrowRight, CheckCircle, MessageCircle, Headphones, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

const benefits = [
  { icon: Shield, text: "Acesso exclusivo à comunidade Alta Cúpula" },
  { icon: Zap, text: "Conteúdos e estratégias premium" },
  { icon: Users, text: "Networking com membros de elite" },
  { icon: Star, text: "Suporte direto e prioritário" },
];

const stats = [
  { number: "500+", label: "Membros VIP" },
  { number: "24/7", label: "Suporte" },
  { number: "100%", label: "Exclusivo" },
];

const communityLinks = [
  {
    icon: MessageCircle,
    title: "Grupo WhatsApp",
    description: "Entre no nosso canal gratuito",
    color: "from-green-500 to-green-600",
    url: "#", // Substituir pelo link real do WhatsApp
  },
  {
    icon: Headphones,
    title: "Servidor Discord",
    description: "Comunidade ativa e suporte",
    color: "from-indigo-500 to-purple-600",
    url: "#", // Substituir pelo link real do Discord
  },
];

const Home = () => {
  return (
    <Layout>
      <div className="page-container">
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-[90vh] flex items-center">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-50" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
          </div>
          
          <div className="content-container relative z-10 py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 border border-primary/30 rounded-full mb-8"
              >
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">Comunidade Exclusiva</span>
              </motion.div>

              {/* Main Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <Crown className="w-20 h-20 text-primary mx-auto mb-6 animate-pulse-glow" />
                <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 leading-tight">
                  <span className="gradient-text-vip">Alta Cúpula</span>
                </h1>
                <p className="text-xl md:text-2xl text-foreground/80 font-medium">
                  A Comunidade VIP de Elite
                </p>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed"
              >
                Faça parte de um grupo seleto com acesso a conteúdos exclusivos, 
                networking de alto nível e suporte dedicado.
              </motion.p>

              {/* Community Links - Destaque */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto mb-10"
              >
                {communityLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-card p-5 flex items-center gap-4 group cursor-pointer border border-primary/20 hover:border-primary/50 transition-all vip-glow"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <link.icon className="w-7 h-7 text-foreground" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </motion.a>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-12"
              >
                <Link to="/checkout">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-vip inline-flex items-center gap-3 text-lg px-10 py-5"
                  >
                    <Crown className="w-6 h-6" />
                    Quero ser VIP
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="grid grid-cols-3 gap-3 md:gap-6 max-w-md mx-auto"
              >
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index} 
                    className="glass-card p-4 md:p-5 text-center border border-primary/10"
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="font-display text-2xl md:text-3xl font-bold gradient-text-vip">
                      {stat.number}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </motion.div>
                ))}
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
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                Por que a <span className="gradient-text-vip">Alta Cúpula</span>?
              </h2>
              <p className="text-muted-foreground">
                Benefícios exclusivos para membros VIP
              </p>
            </div>

            <div className="grid gap-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="glass-card p-4 md:p-5 flex items-center gap-4 border border-primary/10 hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-warning/20 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-medium text-foreground flex-1">{benefit.text}</span>
                  <CheckCircle className="w-5 h-5 text-success" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Final CTA Section */}
        <section className="content-container py-10 pb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-10 vip-glow text-center relative overflow-hidden border border-primary/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-warning/5" />
            <div className="relative z-10">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Crown className="w-16 h-16 text-primary mx-auto mb-6" />
              </motion.div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
                Entre para a <span className="gradient-text-vip">Alta Cúpula</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Faça parte da comunidade VIP mais exclusiva e transforme seus resultados
              </p>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/checkout"
                  className="btn-vip inline-flex items-center gap-2 text-base px-8 py-4"
                >
                  Tornar-se VIP
                  <ArrowRight className="w-5 h-5" />
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
