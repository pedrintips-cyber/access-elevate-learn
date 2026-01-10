import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Key, 
  CheckCircle, 
  XCircle,
  Search,
  Download,
  Copy,
  Trash2,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VipToken {
  id: string;
  token: string;
  is_used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
}

export default function AdminTokens() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [tokensToGenerate, setTokensToGenerate] = useState(100);

  const { data: tokens, isLoading } = useQuery({
    queryKey: ["admin-tokens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vip_tokens")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as VipToken[];
    },
  });

  const generateTokensMutation = useMutation({
    mutationFn: async (count: number) => {
      const newTokens = [];
      for (let i = 0; i < count; i++) {
        const token = `VIP-${generateRandomPart()}-${generateRandomPart()}-${generateRandomPart()}`;
        newTokens.push({ token });
      }

      const { error } = await supabase.from("vip_tokens").insert(newTokens);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tokens"] });
      toast.success(`${tokensToGenerate} tokens gerados com sucesso!`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteTokenMutation = useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await supabase
        .from("vip_tokens")
        .delete()
        .eq("id", tokenId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tokens"] });
      toast.success("Token deletado!");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const generateRandomPart = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Token copiado!");
  };

  const downloadUnusedTokens = () => {
    const unusedTokens = tokens?.filter((t) => !t.is_used) || [];
    if (unusedTokens.length === 0) {
      toast.error("Nenhum token disponível para download");
      return;
    }

    const content = unusedTokens.map((t) => t.token).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tokens-vip-${format(new Date(), "yyyy-MM-dd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${unusedTokens.length} tokens baixados!`);
  };

  const filteredTokens = tokens?.filter((token) =>
    token.token.toLowerCase().includes(search.toLowerCase())
  );

  const availableTokens = filteredTokens?.filter((t) => !t.is_used) || [];
  const usedTokens = filteredTokens?.filter((t) => t.is_used) || [];

  const TokenRow = ({ token }: { token: VipToken }) => (
    <tr className="border-t border-border">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              token.is_used ? "bg-secondary" : "bg-primary/20"
            }`}
          >
            {token.is_used ? (
              <XCircle className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Key className="w-4 h-4 text-primary" />
            )}
          </div>
          <code className="font-mono text-sm">{token.token}</code>
        </div>
      </td>
      <td className="p-4 text-center">
        {token.is_used ? (
          <span className="px-2 py-1 rounded text-xs font-medium bg-secondary text-muted-foreground">
            Usado
          </span>
        ) : (
          <span className="px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary">
            Disponível
          </span>
        )}
      </td>
      <td className="p-4 hidden md:table-cell text-muted-foreground text-sm">
        {token.used_at
          ? format(new Date(token.used_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
          : "-"}
      </td>
      <td className="p-4">
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToken(token.token)}
          >
            <Copy className="w-4 h-4" />
          </Button>
          {!token.is_used && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => deleteTokenMutation.mutate(token.id)}
              disabled={deleteTokenMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );

  const TokenTable = ({ tokens }: { tokens: VipToken[] }) => (
    <div className="glass-card overflow-hidden">
      <table className="w-full">
        <thead className="bg-secondary/50">
          <tr>
            <th className="text-left p-4 font-medium">Token</th>
            <th className="text-center p-4 font-medium">Status</th>
            <th className="text-left p-4 font-medium hidden md:table-cell">
              Usado em
            </th>
            <th className="text-right p-4 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {tokens.length > 0 ? (
            tokens.map((token) => <TokenRow key={token.id} token={token} />)
          ) : (
            <tr>
              <td colSpan={4} className="p-8 text-center text-muted-foreground">
                Nenhum token encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <AdminLayout title="Tokens VIP">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <p className="text-muted-foreground">
          Gerencie os tokens de acesso VIP
        </p>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar token..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Input
            type="number"
            value={tokensToGenerate}
            onChange={(e) => setTokensToGenerate(parseInt(e.target.value) || 10)}
            className="w-24"
            min={1}
            max={1000}
          />
          <Button
            onClick={() => generateTokensMutation.mutate(tokensToGenerate)}
            disabled={generateTokensMutation.isPending}
            className="gap-2"
          >
            {generateTokensMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Gerar Tokens
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={downloadUnusedTokens}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Baixar Disponíveis ({availableTokens.length})
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{tokens?.length || 0}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Disponíveis</p>
          <p className="text-2xl font-bold text-primary">
            {availableTokens.length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Usados</p>
          <p className="text-2xl font-bold text-muted-foreground">
            {usedTokens.length}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="available" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Disponíveis ({availableTokens.length})
            </TabsTrigger>
            <TabsTrigger value="used" className="gap-2">
              <XCircle className="w-4 h-4" />
              Usados ({usedTokens.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              Todos ({filteredTokens?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <TokenTable tokens={availableTokens} />
          </TabsContent>

          <TabsContent value="used">
            <TokenTable tokens={usedTokens} />
          </TabsContent>

          <TabsContent value="all">
            <TokenTable tokens={filteredTokens || []} />
          </TabsContent>
        </Tabs>
      )}
    </AdminLayout>
  );
}
