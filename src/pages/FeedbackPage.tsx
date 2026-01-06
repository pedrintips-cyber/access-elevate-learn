import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Loader2, Bug, Lightbulb, HelpCircle, CheckCircle, Clock, XCircle } from "lucide-react";
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

const typeIcons: Record<string, React.ReactNode> = {
  suggestion: <Lightbulb className="w-4 h-4" />,
  bug: <Bug className="w-4 h-4" />,
  question: <HelpCircle className="w-4 h-4" />,
};

const typeLabels: Record<string, string> = {
  suggestion: "Sugestão",
  bug: "Bug",
  question: "Dúvida",
};

const typeColors: Record<string, string> = {
  suggestion: "bg-accent/20 text-accent border-accent/30",
  bug: "bg-destructive/20 text-destructive border-destructive/30",
  question: "bg-primary/20 text-primary border-primary/30",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  reviewed: <CheckCircle className="w-4 h-4" />,
  resolved: <CheckCircle className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  reviewed: "Analisado",
  resolved: "Resolvido",
  rejected: "Rejeitado",
};

const statusColors: Record<string, string> = {
  pending: "bg-warning/20 text-warning border-warning/30",
  reviewed: "bg-accent/20 text-accent border-accent/30",
  resolved: "bg-success/20 text-success border-success/30",
  rejected: "bg-destructive/20 text-destructive border-destructive/30",
};

const FeedbackPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("suggestion");
  const [showForm, setShowForm] = useState(false);
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

      // Get all unique user IDs
      const userIds = [...new Set((feedbacksData || []).map(f => f.user_id))];
      
      // Fetch profiles for all users
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
              <MessageSquare className="w-8 h-8 text-accent" />
              <h1 className="text-2xl font-display font-bold gradient-text-accent">
                Feedback
              </h1>
            </div>
            {user && !showForm && (
              <Button onClick={() => setShowForm(true)} className="btn-accent">
                Novo Feedback
              </Button>
            )}
          </motion.div>

          {/* Create Feedback Form */}
          <AnimatePresence>
            {showForm && user && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-4 mb-6 overflow-hidden"
              >
                <h3 className="font-display font-semibold text-lg mb-4">
                  Enviar Feedback
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Tipo
                    </label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suggestion">
                          <span className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" /> Sugestão
                          </span>
                        </SelectItem>
                        <SelectItem value="bug">
                          <span className="flex items-center gap-2">
                            <Bug className="w-4 h-4" /> Reportar Bug
                          </span>
                        </SelectItem>
                        <SelectItem value="question">
                          <span className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" /> Dúvida
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Título
                    </label>
                    <Input
                      placeholder="Resumo do feedback"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Descrição
                    </label>
                    <Textarea
                      placeholder="Descreva em detalhes..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[120px] bg-secondary/50"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => createFeedbackMutation.mutate()}
                      disabled={createFeedbackMutation.isPending || !title.trim() || !content.trim()}
                      className="btn-accent"
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

          {/* Login prompt */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 mb-6 text-center"
            >
              <p className="text-muted-foreground mb-4">
                Faça login para enviar feedback
              </p>
              <Link to="/login">
                <Button className="btn-accent">Fazer Login</Button>
              </Link>
            </motion.div>
          )}

          {/* Feedbacks List */}
          {feedbacksLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : feedbacks && feedbacks.length > 0 ? (
            <div className="space-y-4">
              {feedbacks.map((feedback, index) => (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-4"
                >
                  {/* Feedback Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`${typeColors[feedback.type]} flex items-center gap-1`}
                        >
                          {typeIcons[feedback.type]}
                          {typeLabels[feedback.type]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${statusColors[feedback.status]} flex items-center gap-1`}
                        >
                          {statusIcons[feedback.status]}
                          {statusLabels[feedback.status]}
                        </Badge>
                      </div>
                      <h3 className="font-display font-semibold text-lg">
                        {feedback.title}
                      </h3>
                    </div>
                  </div>

                  {/* Feedback Content */}
                  <p className="text-foreground mb-3 whitespace-pre-wrap">
                    {feedback.content}
                  </p>

                  {/* Admin Response */}
                  {feedback.admin_response && (
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-primary mb-1">
                        Resposta da Equipe:
                      </p>
                      <p className="text-sm">{feedback.admin_response}</p>
                    </div>
                  )}

                  {/* Feedback Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                    <span>Por {feedback.profile?.full_name || "Anônimo"}</span>
                    <span>
                      {formatDistanceToNow(new Date(feedback.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-display font-semibold text-lg mb-2">
                Nenhum feedback ainda
              </h3>
              <p className="text-muted-foreground">
                Seja o primeiro a enviar um feedback!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FeedbackPage;
