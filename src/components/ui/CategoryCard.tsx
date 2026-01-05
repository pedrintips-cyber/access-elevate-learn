import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, DollarSign, Flame, TrendingUp, Layers, Crown, Zap, Brain, MessageCircle, Bot, FileText, Palette, LucideIcon, Lock } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  DollarSign,
  Flame,
  TrendingUp,
  Layers,
  Crown,
  Zap,
  Brain,
  MessageCircle,
  Bot,
  FileText,
  Palette,
};

interface CategoryCardProps {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  type: string;
  lessonsCount?: number;
  isLocked?: boolean;
}

export const CategoryCard = ({
  id,
  name,
  description,
  icon,
  type,
  lessonsCount = 0,
  isLocked = false,
}: CategoryCardProps) => {
  const IconComponent = icon ? iconMap[icon] || Flame : Flame;
  const basePath = type === 'free' ? '/free/category' : type === 'vip' ? '/vip/category' : '/tools/category';
  
  const gradientColors = type === 'vip' 
    ? 'from-primary/20 to-warning/20' 
    : type === 'tools'
    ? 'from-accent/20 to-primary/20'
    : 'from-accent/20 to-free/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: isLocked ? 1 : 1.02 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
    >
      <Link
        to={isLocked ? "#" : `${basePath}/${id}`}
        className={`glass-card block p-4 group ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary/30'} transition-all`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientColors} flex items-center justify-center flex-shrink-0`}>
            {isLocked ? (
              <Lock className="w-6 h-6 text-muted-foreground" />
            ) : (
              <IconComponent className="w-6 h-6 text-primary" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {description}
              </p>
            )}
            {lessonsCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {lessonsCount} {type === 'tools' ? 'ferramentas' : 'aulas'}
              </p>
            )}
          </div>
          
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
};
