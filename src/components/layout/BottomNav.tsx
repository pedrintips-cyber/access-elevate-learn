import { Home, Crown, Wrench, Gem, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export const BottomNav = () => {
  const location = useLocation();
  const { isVIP, user } = useAuth();

  // Build nav items dynamically based on VIP status
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Crown, label: "VIP", path: "/vip" },
    { icon: Wrench, label: "Tools", path: "/tools" },
    // Show "Comprar VIP" instead of Feed for non-VIP users
    isVIP 
      ? { icon: Crown, label: "Feed", path: "/feed" }
      : { icon: Gem, label: "Comprar", path: "/comprar-vip", isHighlight: true },
    { icon: User, label: "Perfil", path: "/profile" },
  ];

  return (
    <nav className="bottom-nav z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const isHighlight = 'isHighlight' in item && item.isHighlight;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-1 px-3 py-2"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 rounded-xl ${isHighlight ? 'bg-primary/20' : 'bg-primary/10'}`}
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isHighlight 
                    ? "text-primary" 
                    : isActive 
                      ? "text-primary" 
                      : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors ${
                  isHighlight 
                    ? "text-primary" 
                    : isActive 
                      ? "text-primary" 
                      : "text-muted-foreground"
                }`}
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
