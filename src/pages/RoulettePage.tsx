import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Trophy, X, Sparkles } from "lucide-react";

const ROULETTE_PRICE_CENTS = 1000; // R$ 10,00
const VIP_DAYS_PRIZE = 30;

const RouletteWheel = ({ 
  isSpinning, 
  result, 
  onSpinEnd 
}: { 
  isSpinning: boolean; 
  result: "win" | "lose" | null;
  onSpinEnd: () => void;
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isSpinning && result) {
      // Calculate final rotation based on result
      // Win = lands on gold segment, Lose = lands on dark segment
      const baseRotations = 5; // Number of full rotations
      const segmentAngle = 45; // 8 segments, 45 degrees each
      
      // Segments: 0=win, 1=lose, 2=win, 3=lose, 4=win, 5=lose, 6=win, 7=lose
      const winSegments = [0, 2, 4, 6];
      const loseSegments = [1, 3, 5, 7];
      
      const targetSegments = result === "win" ? winSegments : loseSegments;
      const randomSegment = targetSegments[Math.floor(Math.random() * targetSegments.length)];
      
      // Calculate rotation to land on the target segment
      const targetAngle = randomSegment * segmentAngle + segmentAngle / 2;
      const finalRotation = baseRotations * 360 + (360 - targetAngle);
      
      setRotation(finalRotation);
      
      // Trigger end after animation
      setTimeout(onSpinEnd, 4000);
    }
  }, [isSpinning, result, onSpinEnd]);

  return (
    <div className="relative w-72 h-72 mx-auto">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
        <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
      </div>
      
      {/* Wheel */}
      <motion.div
        ref={wheelRef}
        className="w-full h-full rounded-full border-4 border-primary shadow-2xl overflow-hidden"
        animate={{ rotate: rotation }}
        transition={{ 
          duration: 4, 
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{ transformOrigin: "center center" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = i * 45;
            const isWin = i % 2 === 0;
            const startAngle = (angle - 90) * (Math.PI / 180);
            const endAngle = (angle + 45 - 90) * (Math.PI / 180);
            
            const x1 = 50 + 50 * Math.cos(startAngle);
            const y1 = 50 + 50 * Math.sin(startAngle);
            const x2 = 50 + 50 * Math.cos(endAngle);
            const y2 = 50 + 50 * Math.sin(endAngle);
            
            return (
              <path
                key={i}
                d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                fill={isWin ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
              />
            );
          })}
          {/* Center circle */}
          <circle cx="50" cy="50" r="12" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="2" />
          <text x="50" y="54" textAnchor="middle" fontSize="8" fill="hsl(var(--primary))" fontWeight="bold">
            GIRE
          </text>
        </svg>
      </motion.div>
      
      {/* Labels on segments */}
      <div className="absolute inset-0 pointer-events-none">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = i * 45 + 22.5 - 90;
          const radius = 100;
          const x = 50 + radius * Math.cos(angle * Math.PI / 180);
          const y = 50 + radius * Math.sin(angle * Math.PI / 180);
          const isWin = i % 2 === 0;
          
          return (
            <div
              key={i}
              className="absolute text-xs font-bold"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                color: isWin ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
              }}
            >
              {isWin ? "🏆" : "❌"}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function RoulettePage() {
  const { user, isVIP } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<"form" | "payment" | "spinning" | "result">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    pixCode: string;
    externalId: string;
  } | null>(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  
  const [spinResult, setSpinResult] = useState<"win" | "lose" | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, "");
    return numbers.length === 11;
  };

  const generatePixPayment = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para girar a roleta");
      navigate("/login");
      return;
    }

    if (!name.trim() || !email.trim() || !validateCPF(cpf)) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-pix-payment", {
        body: {
          amount: ROULETTE_PRICE_CENTS,
          payer: {
            name: name.trim(),
            email: email.trim(),
            document: cpf.replace(/\D/g, ""),
          },
        },
      });

      if (error) throw error;

      setPaymentData({
        pixCode: data.pix_code,
        externalId: data.external_id,
      });
      setStep("payment");
      toast.success("PIX gerado com sucesso!");
    } catch (error: any) {
      console.error("Error generating PIX:", error);
      toast.error(error.message || "Erro ao gerar pagamento PIX");
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentAndSpin = async () => {
    if (!paymentData?.externalId || !user) return;

    setIsCheckingStatus(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-payment-status", {
        body: { externalId: paymentData.externalId },
      });

      if (error) throw error;

      if (data.status === "completed" || data.status === "paid") {
        // Payment confirmed, now spin the wheel
        toast.success("Pagamento confirmado! Girando a roleta...");
        
        // Call edge function to process the spin
        const { data: spinData, error: spinError } = await supabase.functions.invoke("process-roulette-spin", {
          body: { 
            transactionExternalId: paymentData.externalId,
            amount: ROULETTE_PRICE_CENTS,
          },
        });

        if (spinError) throw spinError;

        setSpinResult(spinData.result);
        setStep("spinning");
        setIsSpinning(true);
      } else {
        toast.info("Pagamento ainda não confirmado. Tente novamente em alguns segundos.");
      }
    } catch (error: any) {
      console.error("Error checking payment:", error);
      toast.error(error.message || "Erro ao verificar pagamento");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSpinEnd = () => {
    setIsSpinning(false);
    setShowResultModal(true);
    setStep("result");
  };

  const copyToClipboard = () => {
    if (paymentData?.pixCode) {
      navigator.clipboard.writeText(paymentData.pixCode);
      toast.success("Código PIX copiado!");
    }
  };

  const resetGame = () => {
    setStep("form");
    setPaymentData(null);
    setSpinResult(null);
    setShowResultModal(false);
  };

  return (
    <Layout>
      <div className="container max-w-lg mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-primary mb-2">🎰 Roleta da Sorte</h1>
          <p className="text-muted-foreground">
            Pague R$ {(ROULETTE_PRICE_CENTS / 100).toFixed(2).replace(".", ",")} e tente ganhar {VIP_DAYS_PRIZE} dias de VIP!
          </p>
          <p className="text-sm text-muted-foreground mt-1">Chance de 50%!</p>
        </motion.div>

        {/* Form Step */}
        {step === "form" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-lg"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
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
                  placeholder="seu@email.com"
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

              <Button
                onClick={generatePixPayment}
                disabled={isLoading || !user}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando PIX...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Pagar R$ {(ROULETTE_PRICE_CENTS / 100).toFixed(2).replace(".", ",")} e Girar
                  </>
                )}
              </Button>

              {!user && (
                <p className="text-center text-sm text-muted-foreground">
                  <button 
                    onClick={() => navigate("/login")} 
                    className="text-primary hover:underline"
                  >
                    Faça login
                  </button>
                  {" "}para participar da roleta
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Payment Step */}
        {step === "payment" && paymentData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-lg"
          >
            <div className="text-center space-y-4">
              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-2">Código PIX Copia e Cola:</p>
                <div className="bg-background rounded-lg p-3 break-all text-xs font-mono">
                  {paymentData.pixCode.substring(0, 50)}...
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                  Copiar Código
                </Button>
                <Button 
                  onClick={checkPaymentAndSpin} 
                  disabled={isCheckingStatus}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isCheckingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Paguei! Girar"
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Após o pagamento, clique em "Paguei! Girar" para verificar e girar a roleta
              </p>
            </div>
          </motion.div>
        )}

        {/* Spinning Step */}
        {(step === "spinning" || step === "result") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8"
          >
            <RouletteWheel
              isSpinning={isSpinning}
              result={spinResult}
              onSpinEnd={handleSpinEnd}
            />
          </motion.div>
        )}

        {/* Result Modal */}
        <AnimatePresence>
          {showResultModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`bg-card rounded-2xl p-8 max-w-sm w-full text-center border-2 ${
                  spinResult === "win" ? "border-primary" : "border-muted"
                }`}
              >
                {spinResult === "win" ? (
                  <>
                    <div className="w-20 h-20 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                      <Trophy className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-primary mb-2">Parabéns! 🎉</h2>
                    <p className="text-muted-foreground mb-6">
                      Você ganhou <span className="font-bold text-foreground">{VIP_DAYS_PRIZE} dias de VIP</span>!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <X className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Não foi dessa vez! 😔</h2>
                    <p className="text-muted-foreground mb-6">
                      Que tal tentar novamente? A sorte pode estar do seu lado!
                    </p>
                  </>
                )}

                <div className="space-y-2">
                  <Button onClick={resetGame} className="w-full" variant={spinResult === "win" ? "default" : "outline"}>
                    {spinResult === "win" ? "Fechar" : "Tentar Novamente"}
                  </Button>
                  {spinResult === "win" && (
                    <Button onClick={() => navigate("/vip")} variant="outline" className="w-full">
                      Acessar Área VIP
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Section */}
        {user && <SpinHistory userId={user.id} />}
      </div>
    </Layout>
  );
}

function SpinHistory({ userId }: { userId: string }) {
  const [spins, setSpins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpins = async () => {
      const { data, error } = await supabase
        .from("roulette_spins")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setSpins(data);
      }
      setLoading(false);
    };

    fetchSpins();
  }, [userId]);

  if (loading || spins.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <h3 className="text-lg font-semibold mb-4">Seus últimos giros</h3>
      <div className="space-y-2">
        {spins.map((spin) => (
          <div
            key={spin.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              spin.result === "win" 
                ? "bg-primary/10 border-primary/30" 
                : "bg-muted/50 border-border"
            }`}
          >
            <div className="flex items-center gap-2">
              {spin.result === "win" ? (
                <Trophy className="w-4 h-4 text-primary" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm">
                {spin.result === "win" ? `Ganhou ${spin.vip_days_won} dias VIP` : "Não ganhou"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(spin.created_at).toLocaleDateString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
