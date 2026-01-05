import { Home, BookOpen, Wrench, Crown, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", path: "/", emoji: "🏠" },
  { icon: BookOpen, label: "Aulas", path: "/free", emoji: "📚" },
  { icon: Wrench, label: "Ferramentas", path: "/tools", emoji: "🛠️" },
  { icon: Crown, label: "VIP", path: "/vip", emoji: "👑" },
  { icon: User, label: "Perfil", path: "/profile", emoji: "👤" },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav z-50 md:hidden">
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-1 px-2 py-2"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-br from-primary/20 to-warning/20 rounded-2xl border-3 border-primary/50"
                  transition={{ type: "spring", duration: 0.5 }}
                  style={{ boxShadow: '3px 3px 0 hsl(var(--primary) / 0.3)' }}
                />
              )}
              <motion.span 
                className="relative z-10 text-xl"
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {item.emoji}
              </motion.span>
              <span
                className={`relative z-10 text-xs font-bold transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                style={{ fontFamily: 'Fredoka' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};