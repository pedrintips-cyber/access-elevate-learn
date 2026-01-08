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
      <div className="page-container py-4">
        <div className="content-container max-w-md mx-auto px-4">
          {/* Back Button */}
          <Link
            to="/vip"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-5"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-warning flex items-center justify-center mx-auto mb-2">
              <Crown className="w-6 h-6 text-background" />
            </div>
            <h1 className="font-display text-xl font-bold mb-1">
              {showSuccess ? "Pagamento Confirmado!" : "Finalizar Compra"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {showSuccess 
                ? "Bem-vindo à área VIP!" 
                : showQRCode 
                  ? "Escaneie o QR Code ou copie o código"
                  : "Preencha seus dados para gerar o PIX"}
            </p>
          </motion.div>

          {/* Success State */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-5 text-center mb-4"
            >
              <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
              <h2 className="text-base font-bold mb-1">Acesso VIP Liberado!</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Seu pagamento foi confirmado e você já tem acesso a todo o conteúdo exclusivo.
              </p>
              <Link to="/vip">
                <Button className="btn-vip" size="sm">
                  <Crown className="w-3.5 h-3.5 mr-1.5" />
                  Acessar Área VIP
                </Button>
              </Link>
            </motion.div>
          )}

          {/* QR Code Display */}
          {showQRCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 mb-4"
            >
              <div className="text-center mb-4">
                <p className="text-xl font-bold gradient-text-vip">R$ 97,00</p>
                <p className="text-xs text-muted-foreground">Pagamento via PIX</p>
              </div>

              {/* QR Code Image */}
              {paymentData.qrCodeImage && (
                <div className="flex justify-center mb-4">
                  <img
                    src={`data:image/png;base64,${paymentData.qrCodeImage}`}
                    alt="QR Code PIX"
                    className="w-36 h-36 sm:w-44 sm:h-44 rounded-lg bg-white p-1.5"
                  />
                </div>
              )}

              {/* Copy Code Button */}
              <div className="space-y-2">
                <div className="p-2 bg-secondary rounded-lg break-all text-[10px] font-mono text-muted-foreground leading-tight">
                  {paymentData.qrCode?.substring(0, 60)}...
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copiar Código PIX
                </Button>
              </div>

              {/* Check Status Button */}
              <Button
                onClick={checkPaymentStatus}
                disabled={isCheckingStatus}
                className="w-full mt-3"
                variant="secondary"
                size="sm"
              >
                {isCheckingStatus ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                )}
                Verificar Pagamento
              </Button>

              <p className="text-[10px] text-muted-foreground text-center mt-3">
                O status será atualizado automaticamente após o pagamento
              </p>
            </motion.div>
          )}

          {/* Payment Form */}
          {!showQRCode && !showSuccess && (
            <>
              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-4 mb-4"
              >
                <h2 className="font-semibold text-sm mb-3">Resumo do pedido</h2>
                
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
                      <span className="text-xs">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-3 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="line-through text-muted-foreground">R$ 497,00</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Desconto</span>
                    <span className="text-success">-80%</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-bold pt-1">
                    <span>Total</span>
                    <span className="gradient-text-vip">R$ 97,00</span>
                  </div>
                </div>
              </motion.div>

              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-4 mb-4"
              >
                <h2 className="font-semibold text-sm mb-3">Seus Dados</h2>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-xs">Nome completo</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="João da Silva"
                      className="mt-1 h-9 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="joao@email.com"
                      className="mt-1 h-9 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cpf" className="text-xs">CPF</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={handleCPFChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={generatePixPayment}
                  disabled={isLoading}
                  className="btn-vip w-full mt-4"
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-1.5" />
                      Gerar PIX
                    </>
                  )}
                </Button>
              </motion.div>
            </>
          )}

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 text-muted-foreground text-xs"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Pagamento 100% seguro via TriboPay</span>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
