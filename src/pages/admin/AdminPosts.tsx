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
  Loader2, 
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Image,
  MessageCircle,
  Heart,
  Send,
  PenLine
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

interface Post {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  is_approved: boolean | null;
  profile?: Profile;
  likes_count: number;
  comments_count: number;
}

export default function AdminPosts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data: postsData, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((postsData || []).map(p => p.user_id))];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const postsWithCounts = await Promise.all(
        (postsData || []).map(async (post) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase.from("post_likes").select("id", { count: "exact" }).eq("post_id", post.id),
            supabase.from("post_comments").select("id", { count: "exact" }).eq("post_id", post.id),
          ]);

          const profile = profilesMap.get(post.user_id);

          return {
            ...post,
            profile: profile ? { 
              full_name: profile.full_name, 
              avatar_url: profile.avatar_url,
              email: profile.email 
            } : undefined,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
          };
        })
      );

      return postsWithCounts as Post[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ postId, approved }: { postId: string; approved: boolean }) => {
      const { error } = await supabase
        .from("posts")
        .update({ is_approved: approved })
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success(approved ? "Post aprovado!" : "Post rejeitado!");
      setSelectedPost(null);
    },
    onError: () => toast.error("Erro ao atualizar post"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Post excluído!");
      setSelectedPost(null);
    },
    onError: () => toast.error("Erro ao excluir post"),
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      if (!newPostContent.trim()) throw new Error("Conteúdo vazio");

      const { error } = await supabase.from("posts").insert({
        content: newPostContent.trim(),
        user_id: user.id,
        is_approved: true, // Admin posts are auto-approved
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Post criado!");
      setNewPostContent("");
      setShowCreateModal(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const filteredPosts = posts?.filter((post) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      post.content?.toLowerCase().includes(searchLower) ||
      post.profile?.full_name?.toLowerCase().includes(searchLower) ||
      post.profile?.email?.toLowerCase().includes(searchLower);
    
    if (filter === "pending") return matchesSearch && !post.is_approved;
    if (filter === "approved") return matchesSearch && post.is_approved;
    return matchesSearch;
  });

  const pendingCount = posts?.filter(p => !p.is_approved).length || 0;

  return (
    <AdminLayout title="Posts">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            Gerencie e aprove os posts do feed
          </p>
          {pendingCount > 0 && (
            <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded-full font-medium">
              {pendingCount} pendentes
            </span>
          )}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar post..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="btn-vip gap-2">
            <PenLine className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Post</span>
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: "Todos" },
          { key: "pending", label: "Pendentes" },
          { key: "approved", label: "Aprovados" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
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
      ) : filteredPosts && filteredPosts.length > 0 ? (
        <div className="grid gap-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`glass-card p-4 border ${
                !post.is_approved ? "border-warning/30" : "border-border/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium truncate">
                      {post.profile?.full_name || "Usuário"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {post.profile?.email}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      post.is_approved 
                        ? "bg-success/20 text-success" 
                        : "bg-warning/20 text-warning"
                    }`}>
                      {post.is_approved ? "Aprovado" : "Pendente"}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {post.content || "(Sem texto)"}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {post.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {post.comments_count}
                    </span>
                    {post.image_url && (
                      <span className="flex items-center gap-1">
                        <Image className="w-3 h-3" /> Imagem
                      </span>
                    )}
                    <span>
                      {format(new Date(post.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPost(post)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {!post.is_approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-success border-success/30 hover:bg-success/10"
                      onClick={() => approveMutation.mutate({ postId: post.id, approved: true })}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(post.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum post encontrado
        </div>
      )}

      {/* View Post Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Post</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  {selectedPost.profile?.full_name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-semibold">{selectedPost.profile?.full_name || "Usuário"}</p>
                  <p className="text-sm text-muted-foreground">{selectedPost.profile?.email}</p>
                </div>
              </div>

              {selectedPost.content && (
                <p className="text-foreground whitespace-pre-wrap">{selectedPost.content}</p>
              )}

              {selectedPost.image_url && (
                <img
                  src={selectedPost.image_url}
                  alt="Post"
                  className="rounded-xl w-full max-h-[300px] object-cover"
                />
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" /> {selectedPost.likes_count} curtidas
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" /> {selectedPost.comments_count} comentários
                </span>
              </div>

              <div className="flex gap-2 pt-4">
                {!selectedPost.is_approved && (
                  <Button
                    onClick={() => approveMutation.mutate({ postId: selectedPost.id, approved: true })}
                    disabled={approveMutation.isPending}
                    className="flex-1 gap-2"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Aprovar
                  </Button>
                )}
                {selectedPost.is_approved && (
                  <Button
                    variant="outline"
                    onClick={() => approveMutation.mutate({ postId: selectedPost.id, approved: false })}
                    disabled={approveMutation.isPending}
                    className="flex-1 gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Desaprovar
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(selectedPost.id)}
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

      {/* Create Post Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="O que você quer compartilhar?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[150px]"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => createPostMutation.mutate()}
                disabled={createPostMutation.isPending || !newPostContent.trim()}
                className="gap-2"
              >
                {createPostMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Publicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
