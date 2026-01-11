import { useState } from "react";
import { Key, Loader2, CheckCircle, Crown, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TokenVIPPage = () => {
  const { user, isVIP, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmitToken = async () => {
    if (!token.trim()) {
      toast.error("Digite um token válido");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado");
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      // Usar função segura do banco de dados para validar e usar o token
      const { data: result, error: rpcError } = await supabase
        .rpc('use_vip_token', {
          token_input: token.trim().toUpperCase(),
          user_id_input: user.id
        });

      if (rpcError) {
        console.error("Erro RPC:", rpcError);
        throw new Error("Erro ao processar token");
      }

      if (!result || result.length === 0) {
        toast.error("Erro ao verificar token");
        setIsLoading(false);
        return;
      }

      const { success, message } = result[0];

      if (!success) {
        toast.error(message || "Token inválido");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      await refreshProfile();
      toast.success("VIP ativado com sucesso! 🎉");
    } catch (error: any) {
      console.error("Erro:", error);
      toast.error(error.message || "Erro ao processar token");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="page-container">
          <div className="content-container text-center py-12">
            <Key className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Token VIP</h1>
            <p className="text-muted-foreground mb-6">
              Você precisa estar logado para usar um token
            </p>
            <Button onClick={() => navigate("/login")} className="gap-2">
              Fazer Login
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (isSuccess) {
    return (
      <Layout>
        <div className="page-container">
          <div className="content-container text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-warning flex items-center justify-center mx-auto mb-6"
            >
              <Crown className="w-12 h-12 text-background" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl font-bold mb-2"
            >
              Bem-vindo ao VIP! 🎉
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mb-6"
            >
              Seu acesso VIP foi ativado com sucesso por 30 dias!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button onClick={() => navigate("/vip")} className="btn-vip gap-2">
                <Crown className="w-4 h-4" />
                Acessar Conteúdo VIP
              </Button>
            </motion.div>
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
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Perfil
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-warning flex items-center justify-center">
                <Key className="w-7 h-7 text-background" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Token VIP</h1>
                <p className="text-muted-foreground text-sm">
                  Ative seu acesso VIP com um token
                </p>
              </div>
            </div>
          </motion.div>

          {isVIP ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 text-center"
            >
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold mb-2">
                Você já é VIP!
              </h2>
              <p className="text-muted-foreground mb-4">
                Aproveite todo o conteúdo exclusivo
              </p>
              <Button onClick={() => navigate("/vip")} variant="outline">
                Ir para Área VIP
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Digite seu Token VIP
                  </label>
                  <Input
                    placeholder="Ex: VIP-XXXX-XXXX-XXXX"
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                    className="font-mono text-center text-lg tracking-wider"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  onClick={handleSubmitToken}
                  disabled={isLoading || !token.trim()}
                  className="w-full btn-vip gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      Ativar VIP
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Cada token pode ser usado apenas uma vez
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TokenVIPPage;
