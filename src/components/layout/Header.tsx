import { Menu, X, Crown, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { label: "Home", path: "/", emoji: "🏠" },
  { label: "Conteúdo Gratuito", path: "/free", emoji: "📚" },
  { label: "Área VIP", path: "/vip", emoji: "👑" },
  { label: "Ferramentas", path: "/tools", emoji: "🛠️" },
  { label: "Perfil", path: "/profile", emoji: "👤" },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 header-cartoon bg-card">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-warning to-cartoon-orange border-4 border-foreground flex items-center justify-center"
              style={{ boxShadow: 'var(--shadow-cartoon-sm)' }}
              whileHover={{ rotate: -10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Crown className="w-6 h-6 text-foreground" />
            </motion.div>
            <span className="font-display font-bold text-2xl tracking-wide">
              <span className="gradient-text-vip">Método</span>
              <span className="text-foreground">VIP</span>
            </span>
          </Link>

          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-cartoon-purple/10 border-3 border-foreground transition-all"
            style={{ boxShadow: 'var(--shadow-cartoon-sm)' }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </motion.button>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%", rotate: 5 }}
              animate={{ x: 0, rotate: 0 }}
              exit={{ x: "100%", rotate: 5 }}
              transition={{ type: "spring", damping: 20, stiffness: 180 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-card border-l-4 border-foreground z-50 p-6"
              style={{ boxShadow: '-8px 0 0 hsl(var(--muted))' }}
            >
              {/* Rainbow bar */}
              <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-primary via-warning to-accent" />

              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-warning animate-pulse" />
                  <span className="font-display text-xl font-bold text-foreground">Menu</span>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-muted/50 border-3 border-foreground"
                  style={{ boxShadow: 'var(--shadow-cartoon-sm)' }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <nav className="space-y-3">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-lg transition-all border-3 ${
                        location.pathname === item.path
                          ? "bg-primary/15 text-primary border-primary"
                          : "text-foreground border-transparent hover:bg-muted/50 hover:border-muted-foreground/30"
                      }`}
                      style={{ 
                        fontFamily: 'Fredoka',
                        boxShadow: location.pathname === item.path ? 'var(--shadow-cartoon-sm)' : 'none' 
                      }}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div 
                className="absolute bottom-8 left-6 right-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  to="/vip"
                  onClick={() => setIsOpen(false)}
                  className="btn-vip w-full flex items-center justify-center gap-3 text-lg"
                >
                  <Crown className="w-6 h-6" />
                  Quero ser VIP
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};