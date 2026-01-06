import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Loader2, 
  Crown, 
  User, 
  Search,
  Calendar,
  Shield,
  ShieldOff
} from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  is_vip: boolean | null;
  vip_expires_at: string | null;
  created_at: string | null;
}

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [vipDays, setVipDays] = useState(30);
  const [userIdInput, setUserIdInput] = useState("");
  const [quickVipDays, setQuickVipDays] = useState(30);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const updateVipMutation = useMutation({
    mutationFn: async ({ userId, isVip, days }: { userId: string; isVip: boolean; days?: number }) => {
      const updateData: any = { is_vip: isVip };
      
      if (isVip && days) {
        updateData.vip_expires_at = addDays(new Date(), days).toISOString();
      } else if (!isVip) {
        updateData.vip_expires_at = null;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Status VIP atualizado!");
      setSelectedUser(null);
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const filteredUsers = users?.filter((user) => {
    const searchLower = search.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    );
  });

  const getDaysRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const days = differenceInDays(new Date(expiresAt), new Date());
    return days > 0 ? days : 0;
  };

  const handleGiveVip = () => {
    if (selectedUser) {
      updateVipMutation.mutate({ userId: selectedUser.id, isVip: true, days: vipDays });
    }
  };

  const handleRemoveVip = () => {
    if (selectedUser) {
      updateVipMutation.mutate({ userId: selectedUser.id, isVip: false });
    }
  };

  const handleQuickVip = () => {
    if (userIdInput.trim()) {
      updateVipMutation.mutate({ userId: userIdInput.trim(), isVip: true, days: quickVipDays });
      setUserIdInput("");
    }
  };

  return (
    <AdminLayout title="Usuários">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <p className="text-muted-foreground">
          Gerencie os usuários e acessos VIP
        </p>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Quick VIP by ID */}
      <div className="glass-card p-4 mb-6 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Dar VIP por ID</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Cole o ID do usuário aqui..."
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            className="flex-1 font-mono text-sm"
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={quickVipDays}
              onChange={(e) => setQuickVipDays(parseInt(e.target.value) || 30)}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">dias</span>
          </div>
          <Button
            onClick={handleQuickVip}
            disabled={!userIdInput.trim() || updateVipMutation.isPending}
            className="gap-2"
          >
            {updateVipMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            Ativar VIP
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Use esta opção para dar VIP rapidamente a um usuário que comprou via WhatsApp
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 font-medium">Usuário</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Cadastro</th>
                <th className="text-center p-4 font-medium">Status</th>
                <th className="text-center p-4 font-medium hidden md:table-cell">Dias VIP</th>
                <th className="text-right p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.map((user) => {
                const daysRemaining = getDaysRemaining(user.vip_expires_at);
                const isExpired = user.is_vip && daysRemaining === 0;
                
                return (
                  <tr key={user.id} className="border-t border-border">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.is_vip ? "bg-primary/20" : "bg-secondary"
                        }`}>
                          {user.is_vip ? (
                            <Crown className="w-5 h-5 text-primary" />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || "Sem nome"}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground font-mono">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">
                      {user.created_at 
                        ? format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })
                        : "-"
                      }
                    </td>
                    <td className="p-4 text-center">
                      {user.is_vip ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          isExpired 
                            ? "bg-destructive/20 text-destructive"
                            : "bg-primary/20 text-primary"
                        }`}>
                          {isExpired ? "Expirado" : "VIP"}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-secondary text-muted-foreground">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center hidden md:table-cell">
                      {user.is_vip && daysRemaining !== null ? (
                        <span className={`font-medium ${
                          daysRemaining <= 7 ? "text-warning" : "text-foreground"
                        }`}>
                          {daysRemaining} dias
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                        >
                          Gerenciar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedUser.is_vip ? "bg-primary/20" : "bg-secondary"
                }`}>
                  {selectedUser.is_vip ? (
                    <Crown className="w-8 h-8 text-primary" />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedUser.full_name || "Sem nome"}</p>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">ID: {selectedUser.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Cadastro</span>
                  </div>
                  <p className="font-medium">
                    {selectedUser.created_at 
                      ? format(new Date(selectedUser.created_at), "dd/MM/yyyy", { locale: ptBR })
                      : "-"
                    }
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Status</span>
                  </div>
                  <p className="font-medium">
                    {selectedUser.is_vip ? "VIP" : "Free"}
                  </p>
                </div>
              </div>

              {selectedUser.is_vip && selectedUser.vip_expires_at && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">VIP expira em:</p>
                  <p className="font-semibold text-primary">
                    {format(new Date(selectedUser.vip_expires_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    {" "}
                    <span className="text-foreground">
                      ({getDaysRemaining(selectedUser.vip_expires_at)} dias restantes)
                    </span>
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {!selectedUser.is_vip && (
                  <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                    <p className="font-medium">Dar acesso VIP</p>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={vipDays}
                        onChange={(e) => setVipDays(parseInt(e.target.value) || 30)}
                        className="w-24"
                      />
                      <span className="text-muted-foreground">dias</span>
                    </div>
                    <Button 
                      onClick={handleGiveVip}
                      className="w-full gap-2"
                      disabled={updateVipMutation.isPending}
                    >
                      {updateVipMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      Ativar VIP
                    </Button>
                  </div>
                )}

                {selectedUser.is_vip && (
                  <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                    <p className="font-medium">Renovar VIP</p>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={vipDays}
                        onChange={(e) => setVipDays(parseInt(e.target.value) || 30)}
                        className="w-24"
                      />
                      <span className="text-muted-foreground">dias (a partir de hoje)</span>
                    </div>
                    <Button 
                      onClick={handleGiveVip}
                      className="w-full gap-2"
                      disabled={updateVipMutation.isPending}
                    >
                      {updateVipMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      Renovar VIP
                    </Button>
                  </div>
                )}

                {selectedUser.is_vip && (
                  <Button 
                    variant="destructive"
                    onClick={handleRemoveVip}
                    className="w-full gap-2"
                    disabled={updateVipMutation.isPending}
                  >
                    {updateVipMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldOff className="w-4 h-4" />
                    )}
                    Remover VIP
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
