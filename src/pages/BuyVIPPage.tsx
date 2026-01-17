import { useState } from "react";
import { Crown, CreditCard, Check, Loader2, Copy, CheckCircle, ArrowLeft, Sparkles, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VIP_PRICE = 250; // R$ 250,00

const benefits = [
  { icon: Crown, text: "Acesso a todo conteúdo exclusivo" },
  { icon: Zap, text: "Atualizações em primeira mão" },
  { icon: Shield, text: "Suporte prioritário" },
  { icon: Sparkles, text: "30 dias de acesso VIP" },
];

const BuyVIPPage = () => {
  const { user, isVIP, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeImage: string;
    transactionId: string;
  } | null>(null);
  const [earnedToken, setEarnedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleBuyVIP = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para comprar");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setIsPaymentModalOpen(true);

    try {
      // Chamar edge function para gerar PIX
      const { data, error } = await supabase.functions.invoke('create-pix-payment', {
        body: {
          amount: VIP_PRICE,
          userId: user.id,
        }
      });

      if (error) {
        console.error("Erro ao criar pagamento:", error);
        toast.error("Erro ao gerar pagamento PIX");
        setIsPaymentModalOpen(false);
        setIsLoading(false);
        return;
      }

      setPixData({
        qrCode: data.qrCode,
        qrCodeImage: data.qrCodeImage,
        transactionId: data.transactionId,
      });

      // Simular verificação de pagamento (polling)
      pollPaymentStatus(data.transactionId);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao processar pagamento");
      setIsPaymentModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const pollPaymentStatus = async (transactionId: string) => {
    // Poll a cada 5 segundos por até 10 minutos
    const maxAttempts = 120;
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-pix-payment', {
          body: { transactionId }
        });

        if (error) {
          console.error("Erro ao verificar pagamento:", error);
          return;
        }

        if (data.status === 'paid') {
          // Pagamento confirmado - buscar token disponível
          const token = await assignTokenToUser();
          if (token) {
            setEarnedToken(token);
            setIsPaymentModalOpen(false);
            setIsSuccessModalOpen(true);
          }
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        }
      } catch (error) {
        console.error("Erro no polling:", error);
      }
    };

    setTimeout(checkStatus, 5000);
  };

  const assignTokenToUser = async (): Promise<string | null> => {
    try {
      // Buscar um token disponível
      const { data: availableToken, error: fetchError } = await supabase
        .from('vip_tokens')
        .select('*')
        .eq('is_used', false)
        .limit(1)
        .single();

      if (fetchError || !availableToken) {
        toast.error("Nenhum token disponível. Entre em contato com o suporte.");
        return null;
      }

      return availableToken.token;
    } catch (error) {
      console.error("Erro ao atribuir token:", error);
      toast.error("Erro ao processar token");
      return null;
    }
  };

  const copyToken = () => {
    if (earnedToken) {
      navigator.clipboard.writeText(earnedToken);
      setCopied(true);
      toast.success("Token copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyPixCode = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      toast.success("Código PIX copiado!");
    }
  };

  const goToTokenPage = () => {
    setIsSuccessModalOpen(false);
    navigate("/token-vip");
  };

  if (isVIP) {
    return (
      <Layout>
        <div className="page-container">
          <div className="content-container text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-warning flex items-center justify-center mx-auto mb-6"
            >
              <Crown className="w-12 h-12 text-background" />
            </motion.div>
            <h1 className="font-display text-2xl font-bold mb-2">
              Você já é VIP! 🎉
            </h1>
            <p className="text-muted-foreground mb-6">
              Aproveite todo o conteúdo exclusivo
            </p>
            <Button onClick={() => navigate("/vip")} className="btn-vip gap-2">
              <Crown className="w-4 h-4" />
              Acessar Área VIP
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="content-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          </motion.div>

          {/* VIP Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-warning/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-warning/20 to-transparent rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-warning flex items-center justify-center">
                  <Crown className="w-8 h-8 text-background" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold">Plano VIP</h1>
                  <p className="text-muted-foreground">Acesso completo por 30 dias</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-display font-bold text-primary">
                  R$ {VIP_PRICE}
                </span>
                <span className="text-muted-foreground">/30 dias</span>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Buy Button */}
              <Button
                onClick={handleBuyVIP}
                disabled={isLoading}
                className="w-full btn-vip gap-2 h-14 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando pagamento...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pagar com PIX
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Pagamento seguro via PIX • Liberação instantânea
              </p>
            </div>
          </motion.div>

          {/* Already have token? */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground mb-2">
              Já possui um token VIP?
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/token-vip")}
              className="gap-2"
            >
              Ativar Token
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Payment Modal (PIX) */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Pagamento PIX
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {isLoading || !pixData ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Gerando QR Code PIX...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* QR Code Image */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-xl">
                    <img 
                      src={pixData.qrCodeImage} 
                      alt="QR Code PIX" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    R$ {VIP_PRICE.toFixed(2).replace('.', ',')}
                  </p>
                </div>

                {/* Copy Code */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    Ou copie o código PIX:
                  </p>
                  <Button
                    variant="outline"
                    onClick={copyPixCode}
                    className="w-full gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar Código PIX
                  </Button>
                </div>

                {/* Status */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Aguardando pagamento...
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal (Token) */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="max-w-md">
          <div className="py-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-warning flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-background" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-2xl font-bold mb-2"
            >
              Pagamento Confirmado! 🎉
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mb-6"
            >
              Copie seu token VIP abaixo e ative no seu perfil
            </motion.p>

            {/* Token Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="bg-secondary rounded-xl p-4 mb-3">
                <p className="text-xs text-muted-foreground mb-2">Seu Token VIP:</p>
                <p className="font-mono text-lg font-bold tracking-wider text-primary break-all">
                  {earnedToken}
                </p>
              </div>
              <Button
                onClick={copyToken}
                variant="outline"
                className="w-full gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-success" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Token
                  </>
                )}
              </Button>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button onClick={goToTokenPage} className="w-full btn-vip gap-2">
                <Crown className="w-4 h-4" />
                Ativar Token no Perfil
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default BuyVIPPage;
