import { ChevronRight, Lock, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ModuleCardProps {
  id: string;
  number: number;
  title: string;
  description: string;
  lessonsCount: number;
  completedLessons?: number;
  isLocked?: boolean;
  thumbnail?: string;
}

export const ModuleCard = ({
  id,
  number,
  title,
  description,
  lessonsCount,
  completedLessons = 0,
  isLocked = false,
  thumbnail,
}: ModuleCardProps) => {
  const progress = lessonsCount > 0 ? (completedLessons / lessonsCount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={isLocked ? "#" : `/vip/module/${id}`}
        className={`module-card block ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <div className="relative h-32 overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Play className="w-10 h-10 text-primary/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg">
              Módulo {number}
            </span>
          </div>

          {isLocked && (
            <div className="absolute top-3 right-3">
              <div className="p-2 bg-background/80 rounded-lg">
                <Lock className="w-4 h-4 text-primary" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-display font-semibold text-lg text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{completedLessons}/{lessonsCount} aulas</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-primary to-warning rounded-full"
                />
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
