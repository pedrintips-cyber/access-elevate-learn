import { useState, useEffect } from "react";
import { Crown, Shield, CheckCircle, ArrowLeft, Copy, Loader2, RefreshCw, Check, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const benefits = [
  "Todos os módulos VIP",
  "50+ aulas exclusivas",
  "Scripts e templates",
  "Comunidade privada",
];

const VIP_PRICE_CENTS = 25000;

const CheckoutPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    qrCode: string;
    qrCodeImage: string;
    externalId: string;
    status: string;
  } | null>(null);

  // Auto-generate payment when user is logged in
  useEffect(() => {
    if (user && !paymentData && !isLoading) {
      generatePixPayment();
    }
  }, [user]);

  const generatePixPayment = async () => {
    if (!user) {
      toast.error("Faça login para continuar");
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      const externalId = `vip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabase.functions.invoke('create-pix-payment', {
        body: {
          amount: VIP_PRICE_CENTS,
          externalId,
          payer: {
            name: profile?.full_name || user.email?.split('@')[0] || 'Cliente',
            email: user.email || '',
          },
          userId: user.id,
        },
      });

      if (error) {
        console.error('Error creating PIX:', error);
        toast.error("Erro ao gerar PIX. Tente novamente.");
        return;
      }

      if (data.error) {
        console.error('API Error:', data.error, data.details);
        toast.error(data.error);
        return;
      }

      setPaymentData({
        qrCode: data.qrCode,
        qrCodeImage: data.qrCodeImage,
        externalId: data.externalId,
        status: data.status,
      });

      toast.success("PIX gerado!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao processar pagamento");
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.externalId) return;

    setIsCheckingStatus(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-payment-status?externalId=${paymentData.externalId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      const statusData = await response.json();

      if (statusData.status === 'paid') {
        toast.success("Pagamento confirmado! Seu VIP foi ativado!");
        setPaymentData(prev => prev ? { ...prev, status: 'paid' } : null);
      } else if (statusData.status === 'failed' || statusData.status === 'cancelled') {
        toast.error("Pagamento falhou ou foi cancelado");
        setPaymentData(null);
      } else {
        toast.info("Aguardando pagamento...");
      }
    } catch (error) {
      console.error('Error checking status:', error);
      toast.error("Erro ao verificar status");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const copyToClipboard = () => {
    if (paymentData?.qrCode) {
      navigator.clipboard.writeText(paymentData.qrCode);
      setCopied(true);
      toast.success("Chave PIX copiada!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const showQRCode = paymentData && paymentData.status !== 'paid';
  const showSuccess = paymentData?.status === 'paid';

  return (
    <Layout>
      <div className="min-h-screen py-6 px-4">
        <div className="max-w-md mx-auto">
          {/* Back */}
          <Link
            to="/vip"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          {/* Success */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-3">Pagamento Confirmado!</h1>
              <p className="text-muted-foreground mb-8">
                Parabéns! Seu acesso VIP está liberado por 30 dias.
              </p>
              <Link to="/vip">
                <Button className="btn-vip px-8">
                  <Crown className="w-4 h-4 mr-2" />
                  Acessar Área VIP
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && !paymentData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Gerando pagamento...</p>
            </motion.div>
          )}

          {/* QR Code Payment Screen */}
          {showQRCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                  <Crown className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-xl font-bold mb-1">Acesso VIP</h1>
                <p className="text-muted-foreground text-sm">Escaneie o QR Code ou copie a chave PIX</p>
              </div>

              {/* Price Card */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 mb-6 text-center border border-primary/20">
                <span className="text-sm text-muted-foreground">Valor único</span>
                <div className="text-4xl font-bold text-primary mt-1">R$ 250,00</div>
                <span className="text-xs text-muted-foreground">30 dias de acesso</span>
              </div>

              {/* QR Code */}
              <div className="bg-card rounded-2xl p-6 mb-4 border">
                <div className="flex items-center gap-2 mb-4">
                  <QrCode className="w-5 h-5 text-primary" />
                  <span className="font-medium">QR Code PIX</span>
                </div>
                
                {paymentData.qrCodeImage && (
                  <div className="bg-white rounded-xl p-4 w-fit mx-auto mb-4 shadow-sm">
                    <img
                      src={`data:image/png;base64,${paymentData.qrCodeImage}`}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  Abra o app do seu banco e escaneie o código
                </p>
              </div>

              {/* Copy Key Section */}
              <div className="bg-card rounded-2xl p-4 mb-4 border">
                <div className="flex items-center gap-2 mb-3">
                  <Copy className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Chave Copia e Cola</span>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-mono text-muted-foreground break-all leading-relaxed">
                    {paymentData.qrCode}
                  </p>
                </div>

                <Button 
                  onClick={copyToClipboard} 
                  variant={copied ? "default" : "outline"}
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Chave PIX
                    </>
                  )}
                </Button>
              </div>

              {/* Verify Payment */}
              <Button
                onClick={checkPaymentStatus}
                disabled={isCheckingStatus}
                className="w-full btn-vip h-12"
              >
                {isCheckingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Já Paguei - Verificar
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3" />
                O VIP é ativado automaticamente após o pagamento
              </p>
            </motion.div>
          )}

          {/* Not logged in */}
          {!user && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Acesso VIP</h1>
              <p className="text-muted-foreground mb-6">
                Faça login para adquirir o acesso VIP
              </p>
              
              <div className="bg-card rounded-2xl p-6 mb-6 border">
                <div className="text-3xl font-bold text-primary mb-2">R$ 250,00</div>
                <span className="text-sm text-muted-foreground">30 dias de acesso</span>
                
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/login">
                <Button className="btn-vip w-full">
                  Fazer Login
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
