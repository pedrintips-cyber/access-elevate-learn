import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, FolderOpen, Video, Wrench, Crown, MessageSquare, MessageCircle, Clock, TrendingUp, Eye, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [usersRes, categoriesRes, lessonsRes, toolsRes, vipRes, postsRes, pendingPostsRes, feedbacksRes, pendingFeedbacksRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        supabase.from("tools").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_vip", true),
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("is_approved", false),
        supabase.from("feedbacks").select("id", { count: "exact", head: true }),
        supabase.from("feedbacks").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      return {
        users: usersRes.count || 0,
        categories: categoriesRes.count || 0,
        lessons: lessonsRes.count || 0,
        tools: toolsRes.count || 0,
        vipUsers: vipRes.count || 0,
        posts: postsRes.count || 0,
        pendingPosts: pendingPostsRes.count || 0,
        feedbacks: feedbacksRes.count || 0,
        pendingFeedbacks: pendingFeedbacksRes.count || 0,
      };
    },
  });

  const statCards = [
    { label: "Total de Usuários", value: stats?.users || 0, icon: Users, gradient: "from-blue-500 to-cyan-400", path: "/admin/users" },
    { label: "Usuários VIP", value: stats?.vipUsers || 0, icon: Crown, gradient: "from-primary to-warning", path: "/admin/users" },
    { label: "Categorias", value: stats?.categories || 0, icon: FolderOpen, gradient: "from-violet-500 to-purple-400", path: "/admin/categories" },
    { label: "Aulas", value: stats?.lessons || 0, icon: Video, gradient: "from-emerald-500 to-green-400", path: "/admin/lessons" },
    { label: "Ferramentas", value: stats?.tools || 0, icon: Wrench, gradient: "from-orange-500 to-amber-400", path: "/admin/tools" },
    { label: "Posts", value: stats?.posts || 0, icon: MessageSquare, gradient: "from-pink-500 to-rose-400", path: "/admin/posts", pending: stats?.pendingPosts },
    { label: "Feedbacks", value: stats?.feedbacks || 0, icon: MessageCircle, gradient: "from-indigo-500 to-blue-400", path: "/admin/feedback", pending: stats?.pendingFeedbacks },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-warning p-6 mb-8"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48cGF0aCBkPSJNMCAyMGgyMHYyMEgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-background/20 backdrop-blur-sm flex items-center justify-center">
              <Crown className="w-6 h-6 text-background" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-background">Painel Administrativo</h2>
              <p className="text-background/80 text-sm">Bem-vindo de volta, Admin!</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={stat.path}
                className="block relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
              >
                {stat.pending && stat.pending > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-warning text-warning-foreground text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg"
                  >
                    <Clock className="w-3 h-3" />
                    {stat.pending}
                  </motion.span>
                )}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-bold font-display">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card border border-border/50 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning to-orange-400 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg">Aguardando Aprovação</h2>
              <p className="text-sm text-muted-foreground">Itens pendentes de revisão</p>
            </div>
          </div>
          <div className="space-y-3">
            <Link
              to="/admin/posts"
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-pink-500" />
                </div>
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors">Posts do Feed</p>
                  <p className="text-xs text-muted-foreground">Aprovar publicações</p>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                (stats?.pendingPosts || 0) > 0 
                  ? "bg-warning/20 text-warning" 
                  : "bg-secondary text-muted-foreground"
              }`}>
                {stats?.pendingPosts || 0}
              </span>
            </Link>
            <Link
              to="/admin/feedback"
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors">Feedbacks</p>
                  <p className="text-xs text-muted-foreground">Responder usuários</p>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                (stats?.pendingFeedbacks || 0) > 0 
                  ? "bg-warning/20 text-warning" 
                  : "bg-secondary text-muted-foreground"
              }`}>
                {stats?.pendingFeedbacks || 0}
              </span>
            </Link>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-card border border-border/50 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-warning flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg">Ações Rápidas</h2>
              <p className="text-sm text-muted-foreground">Acesso rápido às principais funções</p>
            </div>
          </div>
          <div className="space-y-3">
            <Link
              to="/admin/categories"
              className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/30 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <FolderOpen className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <p className="font-medium group-hover:text-primary transition-colors">Gerenciar Categorias</p>
                <p className="text-xs text-muted-foreground">Criar e organizar conteúdo</p>
              </div>
            </Link>
            <Link
              to="/admin/lessons"
              className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/30 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Video className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium group-hover:text-primary transition-colors">Adicionar Aula</p>
                <p className="text-xs text-muted-foreground">Nova aula com vídeo</p>
              </div>
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/30 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Crown className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium group-hover:text-primary transition-colors">Gerenciar VIP</p>
                <p className="text-xs text-muted-foreground">Adicionar ou remover VIP</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
