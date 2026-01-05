import { Crown, Play, Star, Users, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

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

const Home = () => {
  return (
    <Layout>
      <div className="page-container">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="content-container relative pt-8 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Método Exclusivo</span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Domine o <span className="gradient-text-vip">Método VIP</span>
                <br />
                e Transforme Resultados
              </h1>

              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Acesse conteúdo exclusivo, ferramentas poderosas e uma comunidade 
                focada em resultados reais.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/free" className="btn-accent flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Acessar Conteúdo Grátis
                </Link>
                <Link to="/vip" className="btn-vip flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5" />
                  Quero ser VIP
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-3 gap-4 mt-12"
            >
              {stats.map((stat, index) => (
                <div key={index} className="glass-card p-4 text-center">
                  <p className="font-display text-2xl md:text-3xl font-bold gradient-text-vip">
                    {stat.number}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="content-container py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-2xl font-bold text-center mb-2">
              O que você vai receber
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              Benefícios exclusivos para membros VIP
            </p>

            <div className="grid gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-warning/20 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-medium">{benefit.text}</span>
                  <CheckCircle className="w-5 h-5 text-success ml-auto" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="content-container py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-6 md:p-8 vip-glow text-center"
          >
            <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">
              Pronto para começar?
            </h2>
            <p className="text-muted-foreground mb-6">
              Acesse agora o conteúdo gratuito e descubra o poder do Método VIP
            </p>
            <Link
              to="/free"
              className="btn-vip inline-flex items-center gap-2"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
