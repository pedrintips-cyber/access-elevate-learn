import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, FolderOpen, Video, Wrench, Crown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [usersRes, categoriesRes, lessonsRes, toolsRes, vipRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        supabase.from("tools").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_vip", true),
      ]);

      return {
        users: usersRes.count || 0,
        categories: categoriesRes.count || 0,
        lessons: lessonsRes.count || 0,
        tools: toolsRes.count || 0,
        vipUsers: vipRes.count || 0,
      };
    },
  });

  const statCards = [
    { label: "Total de Usuários", value: stats?.users || 0, icon: Users, color: "text-accent", path: "/admin/users" },
    { label: "Usuários VIP", value: stats?.vipUsers || 0, icon: Crown, color: "text-primary", path: "/admin/users" },
    { label: "Categorias", value: stats?.categories || 0, icon: FolderOpen, color: "text-free-blue", path: "/admin/categories" },
    { label: "Aulas", value: stats?.lessons || 0, icon: Video, color: "text-success", path: "/admin/lessons" },
    { label: "Ferramentas", value: stats?.tools || 0, icon: Wrench, color: "text-warning", path: "/admin/tools" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.path}
              className="glass-card p-4 hover:border-primary/30 transition-all"
            >
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
            <TrendingUp className="w-5 h-5 text-primary" />
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

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Status do Sistema</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">Sistema de Login</span>
              <span className="text-success font-medium">Ativo</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">Banco de Dados</span>
              <span className="text-success font-medium">Conectado</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">Autenticação</span>
              <span className="text-success font-medium">Configurada</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
