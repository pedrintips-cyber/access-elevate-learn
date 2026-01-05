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

  const thumbnails = [
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=200&fit=crop",
  ];

  const moduleThumbnail = thumbnail || thumbnails[(number - 1) % thumbnails.length];

  return (
    <motion.div
      whileHover={!isLocked ? { y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link
        to={isLocked ? "#" : `/vip/module/${id}`}
        className={`module-card block ${isLocked ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        <div className="relative h-36 overflow-hidden">
          <img
            src={moduleThumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-lg">
              Módulo {number}
            </span>
          </div>

          {isLocked && (
            <div className="absolute top-3 right-3">
              <div className="p-2.5 bg-background/90 rounded-xl backdrop-blur-sm">
                <Lock className="w-4 h-4 text-primary" />
              </div>
            </div>
          )}

          {!isLocked && (
            <div className="absolute bottom-3 right-3">
              <div className="p-2.5 bg-primary rounded-xl shadow-glow-gold">
                <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
              </div>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-display font-semibold text-lg text-foreground mb-1.5">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>{completedLessons}/{lessonsCount} aulas</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
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
