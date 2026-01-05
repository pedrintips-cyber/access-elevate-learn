import { Play, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface LessonCardProps {
  id: string;
  title: string;
  description: string;
  duration?: string;
  isLocked?: boolean;
  isCompleted?: boolean;
  thumbnail?: string;
  type: "free" | "vip";
}

export const LessonCard = ({
  id,
  title,
  description,
  duration,
  isLocked = false,
  isCompleted = false,
  thumbnail,
  type,
}: LessonCardProps) => {
  const linkPath = type === "free" ? `/free/${id}` : `/vip/lesson/${id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={isLocked ? "#" : linkPath}
        className={`lesson-card block p-4 ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <div className="flex gap-4">
          <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                <Play className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            {isLocked && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
            )}
            {isCompleted && (
              <div className="absolute top-1 right-1">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate mb-1">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {description}
            </p>
            {duration && (
              <span className="text-xs text-muted-foreground">{duration}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
