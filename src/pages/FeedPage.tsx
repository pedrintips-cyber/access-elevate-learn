import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send, Image, X, Crown, Loader2, Sparkles, PenLine } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

interface Post {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profile?: Profile;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: Profile;
}

const FeedPage = () => {
  const { user, isVIP, isLoading: authLoading } = useAuth();
  const canPost = user && isVIP; // Apenas VIP pode postar
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["feed-posts"],
    queryFn: async () => {
      const { data: postsData, error } = await supabase
        .from("posts")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((postsData || []).map(p => p.user_id))];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const postsWithCounts = await Promise.all(
        (postsData || []).map(async (post) => {
          const [likesResult, commentsResult, userLikeResult] = await Promise.all([
            supabase.from("post_likes").select("id", { count: "exact" }).eq("post_id", post.id),
            supabase.from("post_comments").select("id", { count: "exact" }).eq("post_id", post.id),
            user ? supabase.from("post_likes").select("id").eq("post_id", post.id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
          ]);

          const profile = profilesMap.get(post.user_id);

          return {
            ...post,
            profile: profile ? { full_name: profile.full_name, avatar_url: profile.avatar_url } : undefined,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
            user_has_liked: !!userLikeResult.data,
          };
        })
      );

      return postsWithCounts as Post[];
    },
  });

  // Fetch comments for expanded post
  const { data: comments } = useQuery({
    queryKey: ["post-comments", expandedComments],
    queryFn: async () => {
      if (!expandedComments) return [];
      
      const { data: commentsData, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", expandedComments)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const userIds = [...new Set((commentsData || []).map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return (commentsData || []).map(comment => ({
        ...comment,
        profile: profilesMap.get(comment.user_id) ? {
          full_name: profilesMap.get(comment.user_id)?.full_name || null,
          avatar_url: profilesMap.get(comment.user_id)?.avatar_url || null,
        } : undefined,
      })) as Comment[];
    },
    enabled: !!expandedComments,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");
      if (!newPost.trim() && !selectedImage) throw new Error("Adicione conteúdo ao post");

      let imageUrl: string | null = null;

      if (selectedImage) {
        const fileExt = selectedImage.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("posts").insert({
        content: newPost.trim(),
        image_url: imageUrl,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post publicado!");
      setNewPost("");
      setSelectedImage(null);
      setImagePreview(null);
      setIsComposing(false);
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async ({ postId, hasLiked }: { postId: string; hasLiked: boolean }) => {
      if (!canPost) throw new Error("Torne-se VIP para curtir");

      if (hasLiked) {
        await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user!.id);
      } else {
        await supabase.from("post_likes").insert({ post_id: postId, user_id: user!.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!canPost) throw new Error("Torne-se VIP para comentar");

      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: user!.id,
        content: content.trim(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["post-comments", expandedComments] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem deve ter no máximo 5MB");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("feed-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "post_comments" }, () => {
        queryClient.invalidateQueries({ queryKey: ["post-comments", expandedComments] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, expandedComments]);

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
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold gradient-text-vip">
                  Feed VIP
                </h1>
                <p className="text-sm text-muted-foreground">Alta Cúpula</p>
              </div>
            </div>
            {canPost && !isComposing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsComposing(true)}
                className="btn-vip flex items-center gap-2 px-4 py-2"
              >
                <PenLine className="w-4 h-4" />
                Postar
              </motion.button>
            )}
          </motion.div>

          {/* Create Post Section - Only for VIP users */}
          <AnimatePresence>
            {isComposing && canPost && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="glass-card p-5 mb-6 border border-primary/20 overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-10 h-10 border-2 border-primary/30">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium flex items-center gap-2">
                    Criar novo post
                    <Crown className="w-4 h-4 text-primary" />
                  </span>
                </div>

                <Textarea
                  placeholder="O que você quer compartilhar com a comunidade?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[120px] mb-4 bg-secondary/50 border-border/50 focus:border-primary/50 resize-none text-base"
                  autoFocus
                />

                {imagePreview && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative mb-4 inline-block"
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 rounded-xl border border-border/50"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <label className="cursor-pointer flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/10">
                    <Image className="w-5 h-5" />
                    <span className="text-sm font-medium">Imagem</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsComposing(false);
                        setNewPost("");
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      className="border-border/50"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => createPostMutation.mutate()}
                      disabled={createPostMutation.isPending || (!newPost.trim() && !selectedImage)}
                      className="btn-vip"
                    >
                      {createPostMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Publicar
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VIP prompt - Apenas mostra se não é VIP */}
          {!canPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 mb-6 text-center border border-primary/20"
            >
              <Crown className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-display font-semibold text-lg mb-2 gradient-text-vip">
                Quer publicar no Feed?
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Torne-se VIP para postar, curtir e comentar
              </p>
              <Link to="/checkout">
                <Button className="btn-vip">Quero ser VIP</Button>
              </Link>
            </motion.div>
          )}

          {/* Posts Feed */}
          {postsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-5 border border-border/50 hover:border-primary/20 transition-colors"
                  >
                    {/* Post Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-12 h-12 border-2 border-primary/30">
                        <AvatarImage src={post.profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                          {post.profile?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold flex items-center gap-2">
                          {post.profile?.full_name || "Membro VIP"}
                          <Crown className="w-4 h-4 text-primary" />
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Post Content */}
                    {post.content && (
                      <p className="text-foreground mb-4 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>
                    )}

                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="Post"
                        className="rounded-xl w-full max-h-[500px] object-cover mb-4 border border-border/30"
                      />
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          user && likeMutation.mutate({ postId: post.id, hasLiked: post.user_has_liked })
                        }
                        disabled={!user || likeMutation.isPending}
                        className={`flex items-center gap-2 transition-colors ${
                          post.user_has_liked
                            ? "text-destructive"
                            : "text-muted-foreground hover:text-destructive"
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 ${post.user_has_liked ? "fill-current" : ""}`}
                        />
                        <span className="text-sm font-medium">{post.likes_count}</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setExpandedComments(
                            expandedComments === post.id ? null : post.id
                          )
                        }
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.comments_count}</span>
                      </motion.button>
                    </div>

                    {/* Comments Section */}
                    <AnimatePresence>
                      {expandedComments === post.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-border/50 overflow-hidden"
                        >
                          {/* Comments List */}
                          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                            {comments?.map((comment) => (
                              <motion.div 
                                key={comment.id} 
                                className="flex gap-3"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                              >
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={comment.profile?.avatar_url || ""} />
                                  <AvatarFallback className="bg-secondary text-xs">
                                    {comment.profile?.full_name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-secondary/50 rounded-xl p-3">
                                  <p className="text-sm font-medium mb-1">
                                    {comment.profile?.full_name || "Usuário"}
                                  </p>
                                  <p className="text-sm text-foreground/90">{comment.content}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(comment.created_at), {
                                      addSuffix: true,
                                      locale: ptBR,
                                    })}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                            {(!comments || comments.length === 0) && (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhum comentário ainda. Seja o primeiro!
                              </p>
                            )}
                          </div>

                          {/* Add Comment - Only for VIP */}
                          {canPost ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Escreva um comentário..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && newComment.trim()) {
                                    commentMutation.mutate({
                                      postId: post.id,
                                      content: newComment,
                                    });
                                  }
                                }}
                                className="flex-1 bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                              />
                              <Button
                                onClick={() =>
                                  commentMutation.mutate({
                                    postId: post.id,
                                    content: newComment,
                                  })
                                }
                                disabled={!newComment.trim() || commentMutation.isPending}
                                size="icon"
                                className="btn-vip h-10 w-10"
                              >
                                {commentMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              <Link to="/checkout" className="text-primary hover:underline">
                                Seja VIP
                              </Link>{" "}
                              para comentar
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-primary/50" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                Feed vazio
              </h3>
              <p className="text-muted-foreground">
                Seja o primeiro a publicar na Alta Cúpula!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FeedPage;
