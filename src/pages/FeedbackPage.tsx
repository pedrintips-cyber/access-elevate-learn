import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquarePlus, 
  Send, 
  Loader2, 
  Bug, 
  Lightbulb, 
  HelpCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Sparkles,
  ChevronDown,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

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
  };
}

const typeConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  suggestion: { 
    icon: <Lightbulb className="w-4 h-4" />, 
    label: "Sugestão", 
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30"
  },
  bug: { 
    icon: <Bug className="w-4 h-4" />, 
    label: "Bug", 
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30"
  },
  question: { 
    icon: <HelpCircle className="w-4 h-4" />, 
    label: "Dúvida", 
    color: "text-accent",
    bg: "bg-accent/10 border-accent/30"
  },
};

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  pending: { 
    icon: <Clock className="w-3.5 h-3.5" />, 
    label: "Pendente", 
    color: "text-warning",
    bg: "bg-warning/10 border-warning/30"
  },
  reviewed: { 
    icon: <CheckCircle className="w-3.5 h-3.5" />, 
    label: "Analisado", 
    color: "text-accent",
    bg: "bg-accent/10 border-accent/30"
  },
  resolved: { 
    icon: <CheckCircle className="w-3.5 h-3.5" />, 
    label: "Resolvido", 
    color: "text-success",
    bg: "bg-success/10 border-success/30"
  },
  rejected: { 
    icon: <XCircle className="w-3.5 h-3.5" />, 
    label: "Rejeitado", 
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30"
  },
};

const FeedbackPage = () => {
  const { user, isVIP, isLoading: authLoading } = useAuth();
  const canSubmit = user && isVIP; // Apenas VIP pode enviar feedback
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("suggestion");
  const [showForm, setShowForm] = useState(false);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch feedbacks
  const { data: feedbacks, isLoading: feedbacksLoading } = useQuery({
    queryKey: ["feedbacks"],
    queryFn: async () => {
      const { data: feedbacksData, error } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((feedbacksData || []).map(f => f.user_id))];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return (feedbacksData || []).map(feedback => ({
        ...feedback,
        profile: profilesMap.get(feedback.user_id) ? {
          full_name: profilesMap.get(feedback.user_id)?.full_name || null,
        } : undefined,
      })) as Feedback[];
    },
  });

  // Create feedback mutation
  const createFeedbackMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");
      if (!title.trim()) throw new Error("Adicione um título");
      if (!content.trim()) throw new Error("Adicione uma descrição");

      const { error } = await supabase.from("feedbacks").insert({
        title: title.trim(),
        content: content.trim(),
        type,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Feedback enviado com sucesso!");
      setTitle("");
      setContent("");
      setType("suggestion");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="page-container">
          <div className="content-container flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-warning/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold gradient-text-vip">
                  Feedback
                </h1>
                <p className="text-sm text-muted-foreground">Sua opinião importa</p>
              </div>
            </div>
            {canSubmit && !showForm && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="btn-vip flex items-center gap-2 px-4 py-2"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Novo
              </motion.button>
            )}
          </motion.div>

          {/* Create Feedback Form */}
          <AnimatePresence>
            {showForm && canSubmit && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="glass-card p-5 mb-6 border border-primary/20 overflow-hidden"
              >
                <h3 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Enviar Feedback
                </h3>

                {/* Type Selection */}
                <div className="mb-5">
                  <label className="text-sm text-muted-foreground mb-3 block">Tipo de feedback</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setType(key)}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          type === key 
                            ? `${config.bg} border-current ${config.color}` 
                            : "bg-secondary/30 border-border/50 text-muted-foreground hover:border-border"
                        }`}
                      >
                        {config.icon}
                        <span className="text-xs font-medium">{config.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Título</label>
                    <Input
                      placeholder="Resumo do seu feedback"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-secondary/50 border-border/50 focus:border-primary/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Descrição</label>
                    <Textarea
                      placeholder="Descreva em detalhes..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[120px] bg-secondary/50 border-border/50 focus:border-primary/50 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setTitle("");
                        setContent("");
                      }}
                      className="border-border/50"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => createFeedbackMutation.mutate()}
                      disabled={createFeedbackMutation.isPending || !title.trim() || !content.trim()}
                      className="btn-vip"
                    >
                      {createFeedbackMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Enviar
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VIP prompt - Apenas mostra se não é VIP */}
          {!canSubmit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 mb-6 text-center border border-primary/20"
            >
              <MessageCircle className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-display font-semibold text-lg mb-2 gradient-text-vip">
                Quer enviar feedback?
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Torne-se VIP para compartilhar sua opinião
              </p>
              <Link to="/checkout">
                <Button className="btn-vip">Quero ser VIP</Button>
              </Link>
            </motion.div>
          )}

          {/* Feedbacks List */}
          {feedbacksLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : feedbacks && feedbacks.length > 0 ? (
            <div className="space-y-3">
              {feedbacks.map((feedback, index) => {
                const typeInfo = typeConfig[feedback.type] || typeConfig.suggestion;
                const statusInfo = statusConfig[feedback.status] || statusConfig.pending;
                const isExpanded = expandedFeedback === feedback.id;

                return (
                  <motion.div
                    key={feedback.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card border border-border/50 overflow-hidden"
                  >
                    {/* Header - Always visible */}
                    <button
                      onClick={() => setExpandedFeedback(isExpanded ? null : feedback.id)}
                      className="w-full p-4 text-left hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl ${typeInfo.bg} border flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
                          {typeInfo.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="outline" className={`${statusInfo.bg} ${statusInfo.color} border text-xs`}>
                              {statusInfo.icon}
                              <span className="ml-1">{statusInfo.label}</span>
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-foreground truncate pr-8">
                            {feedback.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {feedback.profile?.full_name || "Anônimo"} • {formatDistanceToNow(new Date(feedback.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          className="text-muted-foreground"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </motion.div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0 border-t border-border/50">
                            <p className="text-foreground whitespace-pre-wrap py-4 leading-relaxed">
                              {feedback.content}
                            </p>

                            {/* Admin Response */}
                            {feedback.admin_response && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-2"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-primary" />
                                  </div>
                                  <p className="text-xs font-semibold text-primary">Resposta da Equipe</p>
                                </div>
                                <p className="text-sm text-foreground/90 leading-relaxed">{feedback.admin_response}</p>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-primary/50" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                Nenhum feedback ainda
              </h3>
              <p className="text-muted-foreground">
                Seja o primeiro a compartilhar sua opinião!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FeedbackPage;
