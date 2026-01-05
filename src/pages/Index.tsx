import { Crown, Play, Star, Users, Zap, ArrowRight, CheckCircle, MessageCircle, Headphones, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import heroBg from "@/assets/hero-bg.jpg";

const benefits = [
  { icon: Play, text: "Acesso a todas as aulas VIP", color: "from-primary to-cartoon-pink" },
  { icon: Zap, text: "Scripts e ferramentas exclusivas", color: "from-warning to-cartoon-orange" },
  { icon: Users, text: "Comunidade privada", color: "from-secondary to-cartoon-teal" },
  { icon: Star, text: "Suporte prioritário", color: "from-cartoon-purple to-primary" },
];

const stats = [
  { number: "500+", label: "Alunos VIP", emoji: "🎓" },
  { number: "50+", label: "Aulas exclusivas", emoji: "📚" },
  { number: "24/7", label: "Suporte", emoji: "💬" },
];

const communityLinks = [
  {
    icon: MessageCircle,
    title: "Grupo WhatsApp",
    description: "Network e troca de experiências",
    color: "from-accent to-cartoon-lime",
    url: "#",
  },
  {
    icon: Headphones,
    title: "Servidor Discord",
    description: "Comunidade ativa e suporte",
    color: "from-cartoon-purple to-primary",
    url: "#",
  },
];

const Home = () => {
  return (
    <Layout>
      <div className="page-container relative overflow-hidden">
        {/* Decorative floating elements */}
        <div className="float-decoration top-32 right-4 w-16 h-16 bg-warning/20 rounded-full animate-float" />
        <div className="float-decoration top-64 left-2 w-12 h-12 bg-primary/20 rounded-2xl rotate-12 animate-float" style={{ animationDelay: '1s' }} />
        <div className="float-decoration top-96 right-8 w-8 h-8 bg-accent/30 rounded-lg animate-float" style={{ animationDelay: '0.5s' }} />

        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-[88vh] flex items-center">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={heroBg} 
              alt="" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/75 to-background" />
          </div>
          
          <div className="content-container relative z-10 py-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border-4 border-foreground rounded-full mb-8"
                style={{ boxShadow: 'var(--shadow-cartoon-sm)' }}
              >
                <Sparkles className="w-5 h-5 text-warning animate-pulse" />
                <span className="text-sm font-bold text-foreground uppercase tracking-wide" style={{ fontFamily: 'Fredoka' }}>
                  Método Exclusivo
                </span>
                <Crown className="w-5 h-5 text-warning" />
              </motion.div>

              {/* Title */}
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <span className="block text-foreground">Domine o</span>
                <span className="relative inline-block">
                  <span className="gradient-text-vip text-stroke-sm">Método VIP</span>
                  <motion.span 
                    className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-primary via-warning to-cartoon-orange rounded-full border-2 border-foreground"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  />
                </span>
              </motion.h1>

              <motion.p 
                className="text-muted-foreground text-lg md:text-xl mb-10 max-w-md mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ fontFamily: 'Fredoka' }}
              >
                Acesse conteúdo exclusivo, ferramentas poderosas e uma comunidade 
                focada em <span className="text-foreground font-bold">resultados reais</span> 🚀
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.03, rotate: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link to="/free" className="btn-accent flex items-center justify-center gap-3 text-lg px-8 py-4">
                    <Play className="w-6 h-6" />
                    Conteúdo Grátis
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03, rotate: 1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link to="/vip" className="btn-vip flex items-center justify-center gap-3 text-lg px-8 py-4">
                    <Crown className="w-6 h-6" />
                    Quero ser VIP
                  </Link>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="grid grid-cols-3 gap-3 md:gap-5 max-w-md mx-auto"
              >
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index} 
                    className="stats-card"
                    whileHover={{ y: -8, rotate: index % 2 === 0 ? -2 : 2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                  >
                    <span className="text-2xl mb-1 block">{stat.emoji}</span>
                    <p className="font-display text-2xl md:text-3xl font-bold gradient-text-vip">
                      {stat.number}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Community Section */}
        <section className="content-container py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-3"
                whileInView={{ scale: [0.9, 1.02, 1] }}
                viewport={{ once: true }}
              >
                Faça Parte da{" "}
                <span className="gradient-text-fun">Comunidade</span> 🎉
              </motion.h2>
              <p className="text-muted-foreground font-medium" style={{ fontFamily: 'Fredoka' }}>
                Conecte-se com outros membros e amplie seu network
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {communityLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  whileHover={{ y: -6, rotate: index === 0 ? -1 : 1 }}
                  className="cartoon-card flex items-center gap-4 group cursor-pointer"
                >
                  <div className={`icon-cartoon w-16 h-16 bg-gradient-to-br ${link.color} flex-shrink-0`}>
                    <link.icon className="w-8 h-8 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors tracking-wide">
                      {link.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">{link.description}</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
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
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-3"
                whileInView={{ scale: [0.9, 1.02, 1] }}
                viewport={{ once: true }}
              >
                O que você vai receber ✨
              </motion.h2>
              <p className="text-muted-foreground font-medium" style={{ fontFamily: 'Fredoka' }}>
                Benefícios exclusivos para membros VIP
              </p>
            </div>

            <div className="grid gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ x: 8, rotate: 0.5 }}
                  className="cartoon-card flex items-center gap-5"
                >
                  <div className={`icon-cartoon w-14 h-14 bg-gradient-to-br ${benefit.color} flex-shrink-0`}>
                    <benefit.icon className="w-7 h-7 text-foreground" />
                  </div>
                  <span className="font-bold text-foreground flex-1 text-lg" style={{ fontFamily: 'Fredoka' }}>
                    {benefit.text}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-accent/20 border-3 border-accent flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="content-container py-10 pb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="cartoon-card p-8 md:p-12 vip-glow text-center relative overflow-hidden"
          >
            {/* Rainbow top bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-warning to-accent" />
            
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-warning/10 via-transparent to-primary/10" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-warning/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-warning to-cartoon-orange border-4 border-foreground flex items-center justify-center"
                  style={{ boxShadow: 'var(--shadow-cartoon)' }}>
                  <Crown className="w-12 h-12 text-foreground" />
                </div>
              </motion.div>

              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Pronto para começar? 🚀
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-medium text-lg" style={{ fontFamily: 'Fredoka' }}>
                Acesse agora o conteúdo gratuito e descubra o poder do Método VIP
              </p>
              <motion.div
                whileHover={{ scale: 1.05, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/free"
                  className="btn-vip inline-flex items-center gap-3 text-lg px-10 py-5"
                >
                  Começar Agora
                  <ArrowRight className="w-6 h-6" />
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