import { useState, useEffect } from "react";
import { Crown, Shield, CheckCircle, ArrowLeft, Copy, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const benefits = [
  "Acesso vitalício a todos os módulos",
  "50+ aulas exclusivas",
  "Scripts e templates prontos",
  "Comunidade privada",
  "Suporte prioritário",
  "Atualizações gratuitas",
];

const VIP_PRICE_CENTS = 9700; // R$ 97,00

const CheckoutPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    qrCode: string;
    qrCodeImage: string;
    externalId: string;
    status: string;
  } | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  // Pre-fill email from user
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Format CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, "");
    if (numbers.length !== 11) return false;
    if (/^(\d)\1+$/.test(numbers)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[9])) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(numbers[10]);
  };

  const generatePixPayment = async () => {
    // Validations
    if (!name.trim() || name.trim().length < 3) {
      toast.error("Informe um nome válido");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Informe um e-mail válido");
      return;
    }

    if (!validateCPF(cpf)) {
      toast.error("CPF inválido");
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
            name: name.trim(),
            email: email.trim().toLowerCase(),
            document: cpf.replace(/\D/g, ""),
          },
          userId: user?.id || null,
        },
      });

      if (error) {
        console.error('Error creating PIX:', error);
        toast.error("Erro ao gerar PIX. Tente novamente.");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setPaymentData({
        qrCode: data.qrCode,
        qrCodeImage: data.qrCodeImage,
        externalId: data.externalId,
        status: data.status,
      });

      toast.success("PIX gerado com sucesso!");
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
      const { data, error } = await supabase.functions.invoke('get-payment-status', {
        body: {},
        method: 'GET',
      });

      // Use query params approach
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
        toast.success("Pagamento confirmado! Seu acesso VIP foi ativado!");
        setPaymentData(prev => prev ? { ...prev, status: 'paid' } : null);
      } else if (statusData.status === 'failed' || statusData.status === 'cancelled') {
        toast.error("Pagamento falhou ou foi cancelado");
        setPaymentData(null);
      } else {
        toast.info(`Status: ${statusData.status}. Aguardando pagamento...`);
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
      toast.success("Código PIX copiado!");
    }
  };

  // Show payment form or QR code
  const showQRCode = paymentData && paymentData.status !== 'paid';
  const showSuccess = paymentData?.status === 'paid';

  return (
    <Layout>
      <div className="page-container">
        <div className="content-container max-w-lg mx-auto">
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
              {showSuccess ? "Pagamento Confirmado!" : "Finalizar Compra"}
            </h1>
            <p className="text-muted-foreground">
              {showSuccess 
                ? "Bem-vindo à área VIP!" 
                : showQRCode 
                  ? "Escaneie o QR Code ou copie o código PIX"
                  : "Preencha seus dados para gerar o PIX"}
            </p>
          </motion.div>

          {/* Success State */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center mb-6"
            >
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Acesso VIP Liberado!</h2>
              <p className="text-muted-foreground mb-6">
                Seu pagamento foi confirmado e você já tem acesso a todo o conteúdo exclusivo.
              </p>
              <Link to="/vip">
                <Button className="btn-vip">
                  <Crown className="w-4 h-4 mr-2" />
                  Acessar Área VIP
                </Button>
              </Link>
            </motion.div>
          )}

          {/* QR Code Display */}
          {showQRCode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 mb-6"
            >
              <div className="text-center mb-6">
                <p className="text-2xl font-bold gradient-text-vip mb-1">R$ 97,00</p>
                <p className="text-sm text-muted-foreground">Pagamento via PIX</p>
              </div>

              {/* QR Code Image */}
              {paymentData.qrCodeImage && (
                <div className="flex justify-center mb-6">
                  <img
                    src={`data:image/png;base64,${paymentData.qrCodeImage}`}
                    alt="QR Code PIX"
                    className="w-48 h-48 rounded-lg bg-white p-2"
                  />
                </div>
              )}

              {/* Copy Code Button */}
              <div className="space-y-3">
                <div className="p-3 bg-secondary rounded-lg break-all text-xs font-mono text-muted-foreground">
                  {paymentData.qrCode?.substring(0, 80)}...
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Código PIX
                </Button>
              </div>

              {/* Check Status Button */}
              <Button
                onClick={checkPaymentStatus}
                disabled={isCheckingStatus}
                className="w-full mt-4"
                variant="secondary"
              >
                {isCheckingStatus ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Verificar Pagamento
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                O status será atualizado automaticamente após o pagamento
              </p>
            </motion.div>
          )}

          {/* Payment Form */}
          {!showQRCode && !showSuccess && (
            <>
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

              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 mb-6"
              >
                <h2 className="font-semibold mb-4">Seus Dados</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="João da Silva"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="joao@email.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={handleCPFChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button
                  onClick={generatePixPayment}
                  disabled={isLoading}
                  className="btn-vip w-full mt-6"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Crown className="w-5 h-5 mr-2" />
                      Gerar PIX
                    </>
                  )}
                </Button>
              </motion.div>
            </>
          )}

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 text-muted-foreground text-sm"
          >
            <Shield className="w-5 h-5" />
            <span>Pagamento 100% seguro via TriboPay</span>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
