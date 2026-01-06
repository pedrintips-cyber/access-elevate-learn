import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  Eye,
  Bug,
  Lightbulb,
  HelpCircle,
  Send,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Feedback {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  user_id: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

const typeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  suggestion: { 
    icon: <Lightbulb className="w-4 h-4" />, 
    label: "Sugestão", 
    color: "text-primary"
  },
  bug: { 
    icon: <Bug className="w-4 h-4" />, 
    label: "Bug", 
    color: "text-destructive"
  },
  question: { 
    icon: <HelpCircle className="w-4 h-4" />, 
    label: "Dúvida", 
    color: "text-accent"
  },
};

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  pending: { 
    icon: <Clock className="w-4 h-4" />, 
    label: "Pendente", 
    color: "text-warning",
    bg: "bg-warning/20"
  },
  reviewed: { 
    icon: <CheckCircle className="w-4 h-4" />, 
    label: "Analisado", 
    color: "text-accent",
    bg: "bg-accent/20"
  },
  resolved: { 
    icon: <CheckCircle className="w-4 h-4" />, 
    label: "Resolvido", 
    color: "text-success",
    bg: "bg-success/20"
  },
  rejected: { 
    icon: <XCircle className="w-4 h-4" />, 
    label: "Rejeitado", 
    color: "text-destructive",
    bg: "bg-destructive/20"
  },
};

export default function AdminFeedback() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ["admin-feedbacks"],
    queryFn: async () => {
      const { data: feedbacksData, error } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((feedbacksData || []).map(f => f.user_id))];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return (feedbacksData || []).map(feedback => ({
        ...feedback,
        profile: profilesMap.get(feedback.user_id) ? {
          full_name: profilesMap.get(feedback.user_id)?.full_name || null,
          email: profilesMap.get(feedback.user_id)?.email || null,
        } : undefined,
      })) as Feedback[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ feedbackId, status, response }: { feedbackId: string; status: string; response?: string }) => {
      const updateData: { status: string; admin_response?: string } = { status };
      if (response) updateData.admin_response = response;

      const { error } = await supabase
        .from("feedbacks")
        .update(updateData)
        .eq("id", feedbackId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedbacks"] });
      toast.success("Feedback atualizado!");
      setSelectedFeedback(null);
      setAdminResponse("");
      setNewStatus("");
    },
    onError: () => toast.error("Erro ao atualizar feedback"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (feedbackId: string) => {
      const { error } = await supabase
        .from("feedbacks")
        .delete()
        .eq("id", feedbackId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedbacks"] });
      toast.success("Feedback excluído!");
      setSelectedFeedback(null);
    },
    onError: () => toast.error("Erro ao excluir feedback"),
  });

  const filteredFeedbacks = feedbacks?.filter((feedback) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      feedback.title.toLowerCase().includes(searchLower) ||
      feedback.content.toLowerCase().includes(searchLower) ||
      feedback.profile?.full_name?.toLowerCase().includes(searchLower) ||
      feedback.profile?.email?.toLowerCase().includes(searchLower);
    
    if (filter === "all") return matchesSearch;
    return matchesSearch && feedback.status === filter;
  });

  const pendingCount = feedbacks?.filter(f => f.status === "pending").length || 0;

  const handleOpenFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setAdminResponse(feedback.admin_response || "");
    setNewStatus(feedback.status);
  };

  const handleSave = () => {
    if (selectedFeedback && newStatus) {
      updateMutation.mutate({
        feedbackId: selectedFeedback.id,
        status: newStatus,
        response: adminResponse.trim() || undefined,
      });
    }
  };

  return (
    <AdminLayout title="Feedback">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            Gerencie os feedbacks dos usuários
          </p>
          {pendingCount > 0 && (
            <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded-full font-medium">
              {pendingCount} pendentes
            </span>
          )}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar feedback..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "all", label: "Todos" },
          { key: "pending", label: "Pendentes" },
          { key: "reviewed", label: "Analisados" },
          { key: "resolved", label: "Resolvidos" },
          { key: "rejected", label: "Rejeitados" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredFeedbacks && filteredFeedbacks.length > 0 ? (
        <div className="grid gap-4">
          {filteredFeedbacks.map((feedback) => {
            const typeInfo = typeConfig[feedback.type] || typeConfig.suggestion;
            const statusInfo = statusConfig[feedback.status] || statusConfig.pending;

            return (
              <div
                key={feedback.id}
                className={`glass-card p-4 border ${
                  feedback.status === "pending" ? "border-warning/30" : "border-border/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeInfo.color} bg-secondary`}>
                    {typeInfo.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {typeInfo.label}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-foreground truncate">
                      {feedback.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {feedback.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{feedback.profile?.full_name || "Usuário"}</span>
                      <span>
                        {format(new Date(feedback.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                      {feedback.admin_response && (
                        <span className="flex items-center gap-1 text-primary">
                          <MessageSquare className="w-3 h-3" /> Respondido
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenFeedback(feedback)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(feedback.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum feedback encontrado
        </div>
      )}

      {/* View/Edit Feedback Modal */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Feedback</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeConfig[selectedFeedback.type]?.color || "text-primary"} bg-secondary`}>
                  {typeConfig[selectedFeedback.type]?.icon || <Lightbulb className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold">{selectedFeedback.profile?.full_name || "Usuário"}</p>
                  <p className="text-sm text-muted-foreground">{selectedFeedback.profile?.email}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedFeedback.title}</h3>
                <p className="text-foreground whitespace-pre-wrap">{selectedFeedback.content}</p>
              </div>

              <div className="pt-4 border-t border-border space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="reviewed">Analisado</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Resposta (opcional)</label>
                  <Textarea
                    placeholder="Escreva uma resposta para o usuário..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending || !newStatus}
                  className="flex-1 gap-2"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Salvar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(selectedFeedback.id)}
                  disabled={deleteMutation.isPending}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
