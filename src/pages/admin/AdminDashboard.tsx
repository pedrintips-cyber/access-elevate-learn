import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, FolderOpen, Video, Wrench, Crown, MessageSquare, MessageCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

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
    { label: "Total de Usuários", value: stats?.users || 0, icon: Users, color: "text-accent", path: "/admin/users" },
    { label: "Usuários VIP", value: stats?.vipUsers || 0, icon: Crown, color: "text-primary", path: "/admin/users" },
    { label: "Categorias", value: stats?.categories || 0, icon: FolderOpen, color: "text-free-blue", path: "/admin/categories" },
    { label: "Aulas", value: stats?.lessons || 0, icon: Video, color: "text-success", path: "/admin/lessons" },
    { label: "Ferramentas", value: stats?.tools || 0, icon: Wrench, color: "text-warning", path: "/admin/tools" },
    { label: "Posts", value: stats?.posts || 0, icon: MessageSquare, color: "text-accent", path: "/admin/posts", pending: stats?.pendingPosts },
    { label: "Feedbacks", value: stats?.feedbacks || 0, icon: MessageCircle, color: "text-primary", path: "/admin/feedback", pending: stats?.pendingFeedbacks },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.path}
              className="glass-card p-4 hover:border-primary/30 transition-all relative"
            >
              {stat.pending && stat.pending > 0 && (
                <span className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {stat.pending}
                </span>
              )}
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-warning" />
            <h2 className="font-semibold">Pendentes</h2>
          </div>
          <div className="space-y-2">
            <Link
              to="/admin/posts"
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div>
                <p className="font-medium">Posts aguardando aprovação</p>
                <p className="text-sm text-muted-foreground">Aprovar posts do feed</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                (stats?.pendingPosts || 0) > 0 ? "bg-warning/20 text-warning" : "bg-secondary text-muted-foreground"
              }`}>
                {stats?.pendingPosts || 0}
              </span>
            </Link>
            <Link
              to="/admin/feedback"
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div>
                <p className="font-medium">Feedbacks pendentes</p>
                <p className="text-sm text-muted-foreground">Responder feedbacks</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                (stats?.pendingFeedbacks || 0) > 0 ? "bg-warning/20 text-warning" : "bg-secondary text-muted-foreground"
              }`}>
                {stats?.pendingFeedbacks || 0}
              </span>
            </Link>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Ações Rápidas</h2>
          </div>
          <div className="space-y-2">
            <Link
              to="/admin/categories"
              className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <p className="font-medium">Gerenciar Categorias</p>
              <p className="text-sm text-muted-foreground">Criar e editar categorias de conteúdo</p>
            </Link>
            <Link
              to="/admin/lessons"
              className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <p className="font-medium">Adicionar Aula</p>
              <p className="text-sm text-muted-foreground">Criar nova aula com vídeo</p>
            </Link>
            <Link
              to="/admin/users"
              className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <p className="font-medium">Gerenciar Usuários</p>
              <p className="text-sm text-muted-foreground">Ver e editar status VIP</p>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
