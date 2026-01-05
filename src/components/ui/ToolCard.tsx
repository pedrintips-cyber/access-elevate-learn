import { Download, ExternalLink, Copy, FileText, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

interface ToolCardProps {
  id: string;
  title: string;
  description: string;
  type: "file" | "script" | "link";
  content?: string;
  fileUrl?: string;
  externalUrl?: string;
  fileType?: string;
}

export const ToolCard = ({
  title,
  description,
  type,
  content,
  fileUrl,
  externalUrl,
  fileType,
}: ToolCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Script copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
      toast.success("Download iniciado!");
    }
  };

  const handleExternalLink = () => {
    if (externalUrl) {
      window.open(externalUrl, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          
          {fileType && (
            <span className="inline-block px-2 py-0.5 bg-secondary text-xs text-muted-foreground rounded mb-3">
              {fileType}
            </span>
          )}

          {type === "script" && content && (
            <div className="bg-muted/50 rounded-lg p-3 mb-3">
              <pre className="text-xs text-foreground/80 whitespace-pre-wrap break-words font-mono">
                {content.length > 150 ? `${content.slice(0, 150)}...` : content}
              </pre>
            </div>
          )}

          <div className="flex gap-2">
            {type === "file" && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
                Baixar
              </button>
            )}

            {type === "script" && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            )}

            {type === "link" && (
              <button
                onClick={handleExternalLink}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-4 h-4" />
                Acessar
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
