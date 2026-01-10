import { useState, useEffect } from "react";
import { Crown, Shield, CheckCircle, ArrowLeft, Copy, Loader2, RefreshCw, Check } from "lucide-react";
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
  "Todos os módulos VIP",
  "50+ aulas exclusivas",
  "Scripts e templates",
  "Comunidade privada",
];

const VIP_PRICE_CENTS = 25000;

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
      const { data, error } = await supabase.functions.invoke('create-pix-payment', {
        body: {
          amount: VIP_PRICE_CENTS,
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
        qrCode: data.pixCode,
        qrCodeImage: data.qrCodeImage,
        externalId: data.externalId,
        status: 'waiting_payment',
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
      toast.success("Código copiado!");
    }
  };

  const showQRCode = paymentData && paymentData.status !== 'paid';
  const showSuccess = paymentData?.status === 'paid';

  return (
    <Layout>
      <div className="min-h-screen py-6 px-4">
        <div className="max-w-sm mx-auto">
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
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-xl font-bold mb-2">Pagamento Confirmado!</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Seu acesso VIP já está liberado.
              </p>
              <Link to="/vip">
                <Button className="btn-vip">
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
              className="text-center"
            >
              <h1 className="text-lg font-bold mb-1">Pague com PIX</h1>
              <p className="text-xs text-muted-foreground mb-4">Escaneie o QR Code ou copie o código</p>

              <div className="text-2xl font-bold text-primary mb-4">R$ 250,00</div>

              {paymentData.qrCodeImage && (
                <div className="bg-white rounded-xl p-4 w-fit mx-auto mb-4">
                  <img
                    src={paymentData.qrCodeImage}
                    alt="QR Code"
                    className="w-40 h-40"
                  />
                </div>
              )}

              <div className="bg-muted/30 rounded-lg p-3 mb-3">
                <p className="text-[10px] font-mono text-muted-foreground break-all">
                  {paymentData.qrCode?.substring(0, 60)}...
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  onClick={checkPaymentStatus}
                  disabled={isCheckingStatus}
                  className="flex-1"
                >
                  {isCheckingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Verificar
                    </>
                  )}
                </Button>
              </div>

              <p className="text-[10px] text-muted-foreground mt-4">
                O acesso é liberado automaticamente após o pagamento
              </p>
            </motion.div>
          )}

          {/* Form */}
          {!showQRCode && !showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header + Price */}
              <div className="text-center mb-4">
                <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
                <h1 className="text-lg font-bold">Acesso VIP</h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground line-through">R$ 497</span>
                  <span className="text-2xl font-bold text-primary">R$ 250</span>
                </div>
              </div>

              {/* Benefits - 2 cols */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-4 text-xs">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="space-y-3 mb-4">
                <div>
                  <Label htmlFor="name" className="text-xs">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
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
                    placeholder="seu@email.com"
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
                className="btn-vip w-full h-10"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Gerar PIX"
                )}
              </Button>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-muted-foreground">
                <Shield className="w-3 h-3" />
                <span>Pagamento seguro</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
