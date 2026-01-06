import { ReactNode, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Video, 
  Wrench, 
  Users, 
  Settings,
  ArrowLeft,
  Crown,
  Loader2,
  MessageSquare,
  MessageCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const menuItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Categorias", path: "/admin/categories", icon: FolderOpen },
  { label: "Aulas", path: "/admin/lessons", icon: Video },
  { label: "Ferramentas", path: "/admin/tools", icon: Wrench },
  { label: "Posts", path: "/admin/posts", icon: MessageSquare },
  { label: "Feedback", path: "/admin/feedback", icon: MessageCircle },
  { label: "Usuários", path: "/admin/users", icon: Users },
  { label: "Configurações", path: "/admin/settings", icon: Settings },
];

export const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { isAdmin, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [isLoading, user, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-warning flex items-center justify-center">
              <Crown className="w-5 h-5 text-background" />
            </div>
            <div>
              <span className="font-bold text-lg gradient-text-vip">Admin</span>
              <p className="text-xs text-muted-foreground">Painel de Controle</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Site
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold gradient-text-vip">Admin</span>
          <div className="w-5" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <div className="pt-16 md:pt-0">
          <div className="border-b border-border bg-card/50">
            <div className="px-6 py-6">
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 pb-24 md:pb-6"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden">
        <div className="flex justify-around py-2 overflow-x-auto">
          {menuItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px] ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label.slice(0, 5)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
