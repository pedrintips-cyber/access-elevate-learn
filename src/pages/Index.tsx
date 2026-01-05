import { Crown, Play, Star, Users, Zap, ArrowRight, CheckCircle, MessageCircle, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import heroBg from "@/assets/hero-bg.jpg";

const benefits = [
  { icon: Play, text: "Acesso a todas as aulas VIP" },
  { icon: Zap, text: "Scripts e ferramentas exclusivas" },
  { icon: Users, text: "Comunidade privada" },
  { icon: Star, text: "Suporte prioritário" },
];

const stats = [
  { number: "500+", label: "Alunos VIP" },
  { number: "50+", label: "Aulas exclusivas" },
  { number: "24/7", label: "Suporte" },
];

const communityLinks = [
  {
    icon: MessageCircle,
    title: "Grupo WhatsApp",
    description: "Network e troca de experiências",
    color: "from-green-500 to-green-600",
    url: "#", // Substituir pelo link real
  },
  {
    icon: Headphones,
    title: "Servidor Discord",
    description: "Comunidade ativa e suporte",
    color: "from-indigo-500 to-purple-600",
    url: "#", // Substituir pelo link real
  },
];

const Home = () => {
  return (
    <Layout>
      <div className="page-container">
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-[85vh] flex items-center">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={heroBg} 
              alt="" 
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>
          
          <div className="content-container relative z-10 py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/15 border border-primary/30 rounded-full mb-8"
              >
                <Crown className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">Método Exclusivo</span>
              </motion.div>

              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Domine o{" "}
                <span className="relative">
                  <span className="gradient-text-vip">Método VIP</span>
                  <motion.span 
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-warning rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  />
                </span>
                <br />
                <span className="text-foreground/90">e Transforme Resultados</span>
              </h1>

              <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
                Acesse conteúdo exclusivo, ferramentas poderosas e uma comunidade 
                focada em <span className="text-foreground font-medium">resultados reais</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link to="/free" className="btn-accent flex items-center justify-center gap-2 text-base px-8 py-4">
                    <Play className="w-5 h-5" />
                    Acessar Conteúdo Grátis
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link to="/vip" className="btn-vip flex items-center justify-center gap-2 text-base px-8 py-4">
                    <Crown className="w-5 h-5" />
                    Quero ser VIP
                  </Link>
                </motion.div>
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-3 gap-3 md:gap-6 max-w-md mx-auto"
              >
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index} 
                    className="glass-card p-4 md:p-5 text-center"
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

        {/* Community Section - NOVO */}
        <section className="content-container py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                Faça Parte da <span className="gradient-text-vip">Comunidade</span>
              </h2>
              <p className="text-muted-foreground">
                Conecte-se com outros membros e amplie seu network
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {communityLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="glass-card p-5 flex items-center gap-4 group cursor-pointer border border-transparent hover:border-primary/30"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <link.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </motion.a>
              ))}
            </div>
          </motion.div>
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
                O que você vai receber
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
                  className="glass-card p-4 md:p-5 flex items-center gap-4"
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

        {/* CTA Section */}
        <section className="content-container py-10 pb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-10 vip-glow text-center relative overflow-hidden"
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
                Pronto para começar?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Acesse agora o conteúdo gratuito e descubra o poder do Método VIP
              </p>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/free"
                  className="btn-vip inline-flex items-center gap-2 text-base px-8 py-4"
                >
                  Começar Agora
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
