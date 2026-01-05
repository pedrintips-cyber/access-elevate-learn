import { Crown, CreditCard, Shield, CheckCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { toast } from "sonner";

const benefits = [
  "Acesso vitalício a todos os módulos",
  "50+ aulas exclusivas",
  "Scripts e templates prontos",
  "Comunidade privada",
  "Suporte prioritário",
  "Atualizações gratuitas",
];

const CheckoutPage = () => {
  const handlePayment = () => {
    toast.info("Sistema de pagamento será configurado com Stripe");
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="content-container">
          {/* Back Button */}
          <Link
            to="/vip"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-warning flex items-center justify-center mx-auto mb-4">
              <Crown className="w-10 h-10 text-background" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Finalizar Compra
            </h1>
            <p className="text-muted-foreground">
              Você está a um passo do acesso VIP
            </p>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-6"
          >
            <h2 className="font-semibold mb-4">Resumo do pedido</h2>
            
            <div className="space-y-3 mb-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="line-through text-muted-foreground">R$ 497,00</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Desconto</span>
                <span className="text-success">-80%</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="gradient-text-vip">R$ 97,00</span>
              </div>
            </div>
          </motion.div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 mb-6"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Forma de Pagamento
            </h2>

            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-4 bg-secondary rounded-xl cursor-pointer border-2 border-primary">
                <input
                  type="radio"
                  name="payment"
                  defaultChecked
                  className="w-4 h-4 accent-primary"
                />
                <div className="flex-1">
                  <p className="font-medium">PIX</p>
                  <p className="text-xs text-muted-foreground">
                    Aprovação instantânea
                  </p>
                </div>
                <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">
                  5% OFF
                </span>
              </label>

              <label className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl cursor-pointer border-2 border-transparent hover:border-border transition-colors">
                <input
                  type="radio"
                  name="payment"
                  className="w-4 h-4 accent-primary"
                />
                <div className="flex-1">
                  <p className="font-medium">Cartão de Crédito</p>
                  <p className="text-xs text-muted-foreground">
                    Até 12x sem juros
                  </p>
                </div>
              </label>
            </div>

            <button
              onClick={handlePayment}
              className="btn-vip w-full flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Finalizar Pagamento
            </button>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 text-muted-foreground text-sm"
          >
            <Shield className="w-5 h-5" />
            <span>Pagamento 100% seguro e criptografado</span>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
