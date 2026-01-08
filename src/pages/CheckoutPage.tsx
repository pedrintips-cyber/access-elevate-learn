import { useState, useEffect } from "react";
import { Crown, Shield, CheckCircle, ArrowLeft, Copy, Loader2, RefreshCw, Zap, Users, Headphones, BookOpen } from "lucide-react";
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
  { icon: BookOpen, text: "50+ aulas exclusivas" },
  { icon: Zap, text: "Scripts e templates" },
  { icon: Users, text: "Comunidade privada" },
  { icon: Headphones, text: "Suporte prioritário" },
];

const VIP_PRICE_CENTS = 9700;

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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

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
      toast.success("Código PIX copiado!");
    }
  };

  const showQRCode = paymentData && paymentData.status !== 'paid';
  const showSuccess = paymentData?.status === 'paid';

  return (
    <Layout>
      <div className="min-h-screen py-6 px-4">
        <div className="max-w-lg mx-auto">
          {/* Back */}
          <Link
            to="/vip"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-warning flex items-center justify-center mx-auto mb-3">
              <Crown className="w-5 h-5 text-background" />
            </div>
            <h1 className="text-lg font-bold">
              {showSuccess ? "Pagamento Confirmado!" : showQRCode ? "Pague com PIX" : "Acesso VIP"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {showSuccess 
                ? "Bem-vindo à área VIP!" 
                : showQRCode 
                  ? "Escaneie ou copie o código"
                  : "Pagamento único • Acesso imediato"}
            </p>
          </motion.div>

          {/* Success */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <h2 className="font-bold mb-1">Acesso Liberado!</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Você já pode acessar todo o conteúdo exclusivo.
              </p>
              <Link to="/vip">
                <Button className="btn-vip w-full">
                  <Crown className="w-4 h-4 mr-2" />
                  Acessar Área VIP
                </Button>
              </Link>
            </motion.div>
          )}

          {/* QR Code */}
          {showQRCode && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              {/* Price */}
              <div className="text-center mb-4">
                <span className="text-2xl font-bold text-primary">R$ 97,00</span>
              </div>

              {/* QR Image */}
              {paymentData.qrCodeImage && (
                <div className="bg-white rounded-lg p-3 w-fit mx-auto mb-4">
                  <img
                    src={`data:image/png;base64,${paymentData.qrCodeImage}`}
                    alt="QR Code PIX"
                    className="w-32 h-32 sm:w-40 sm:h-40"
                  />
                </div>
              )}

              {/* Code + Copy */}
              <div className="space-y-2 mb-4">
                <div className="bg-muted/50 rounded-lg p-2.5 text-[10px] font-mono text-muted-foreground break-all leading-relaxed">
                  {paymentData.qrCode?.substring(0, 80)}...
                </div>
                <Button onClick={copyToClipboard} variant="outline" className="w-full h-9 text-xs">
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copiar código PIX
                </Button>
              </div>

              {/* Check Status */}
              <Button
                onClick={checkPaymentStatus}
                disabled={isCheckingStatus}
                variant="secondary"
                className="w-full h-9 text-xs"
              >
                {isCheckingStatus ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Verificar pagamento
                  </>
                )}
              </Button>

              <p className="text-[10px] text-center text-muted-foreground mt-3">
                Status atualiza automaticamente após pagar
              </p>
            </motion.div>
          )}

          {/* Form */}
          {!showQRCode && !showSuccess && (
            <div className="space-y-4">
              {/* Price Card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary/10 to-warning/10 border border-primary/20 rounded-xl p-4 text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground line-through">R$ 497</span>
                  <span className="text-[10px] bg-success/20 text-success px-1.5 py-0.5 rounded font-medium">-80%</span>
                </div>
                <span className="text-3xl font-bold text-primary">R$ 97</span>
                <p className="text-[10px] text-muted-foreground mt-1">Pagamento único via PIX</p>
              </motion.div>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-2 gap-2"
              >
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-lg p-2.5">
                    <b.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-[11px]">{b.text}</span>
                  </div>
                ))}
              </motion.div>

              {/* Form Card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <h2 className="font-semibold text-sm mb-3">Seus dados</h2>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-xs text-muted-foreground">Nome completo</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="João da Silva"
                      className="mt-1 h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs text-muted-foreground">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="joao@email.com"
                      className="mt-1 h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cpf" className="text-xs text-muted-foreground">CPF</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={handleCPFChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="mt-1 h-10"
                    />
                  </div>
                </div>

                <Button
                  onClick={generatePixPayment}
                  disabled={isLoading}
                  className="btn-vip w-full mt-4 h-11"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Gerar PIX
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Security */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground"
              >
                <Shield className="w-3 h-3" />
                <span>Pagamento seguro via TriboPay</span>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
