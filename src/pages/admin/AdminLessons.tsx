import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Video, Eye, EyeOff, Link as LinkIcon, X } from "lucide-react";
import { toast } from "sonner";

interface RelatedLink {
  type: "tool" | "lesson";
  id: string;
  label?: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Tool {
  id: string;
  title: string;
}

export default function AdminLessons() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: "",
    duration: "",
    category_id: "",
    order_index: 0,
    is_published: true,
    content: "",
    related_links: [] as RelatedLink[],
  });

  // For adding related links
  const [linkType, setLinkType] = useState<"tool" | "lesson">("tool");
  const [selectedLinkId, setSelectedLinkId] = useState("");

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["admin-lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*, categories(name, type)")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, type")
        .order("type")
        .order("name");
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: tools } = useQuery({
    queryKey: ["admin-tools-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("id, title")
        .eq("is_published", true)
        .order("title");
      if (error) throw error;
      return data as Tool[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("lessons").insert({
        title: data.title,
        description: data.description || null,
        video_url: data.video_url || null,
        thumbnail_url: data.thumbnail_url || null,
        duration: data.duration || null,
        category_id: data.category_id || null,
        order_index: data.order_index,
        is_published: data.is_published,
        content: data.content || null,
        related_links: data.related_links.length > 0 ? JSON.stringify(data.related_links) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      toast.success("Aula criada com sucesso!");
      setIsOpen(false);
      resetForm();
    },
    onError: () => toast.error("Erro ao criar aula"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("lessons").update({
        title: data.title,
        description: data.description || null,
        video_url: data.video_url || null,
        thumbnail_url: data.thumbnail_url || null,
        duration: data.duration || null,
        category_id: data.category_id || null,
        order_index: data.order_index,
        is_published: data.is_published,
        content: data.content || null,
        related_links: data.related_links.length > 0 ? JSON.stringify(data.related_links) : null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      toast.success("Aula atualizada!");
      setIsOpen(false);
      resetForm();
    },
    onError: () => toast.error("Erro ao atualizar aula"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      toast.success("Aula excluída!");
    },
    onError: () => toast.error("Erro ao excluir aula"),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      video_url: "",
      thumbnail_url: "",
      duration: "",
      category_id: "",
      order_index: 0,
      is_published: true,
      content: "",
      related_links: [],
    });
    setEditingLessonId(null);
    setLinkType("tool");
    setSelectedLinkId("");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (lesson: any) => {
    setEditingLessonId(lesson.id);
    // Parse related_links from JSON
    let relatedLinks: RelatedLink[] = [];
    if (lesson.related_links) {
      try {
        if (typeof lesson.related_links === 'string') {
          relatedLinks = JSON.parse(lesson.related_links);
        } else if (Array.isArray(lesson.related_links)) {
          relatedLinks = lesson.related_links;
        }
      } catch {
        relatedLinks = [];
      }
    }
    
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      video_url: lesson.video_url || "",
      thumbnail_url: lesson.thumbnail_url || "",
      duration: lesson.duration || "",
      category_id: lesson.category_id || "",
      order_index: lesson.order_index || 0,
      is_published: lesson.is_published ?? true,
      content: lesson.content || "",
      related_links: relatedLinks,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLessonId) {
      updateMutation.mutate({ id: editingLessonId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const addRelatedLink = () => {
    if (!selectedLinkId) return;
    
    // Check if already exists
    const exists = formData.related_links.some(
      link => link.type === linkType && link.id === selectedLinkId
    );
    if (exists) {
      toast.error("Este item já foi adicionado");
      return;
    }

    const newLink: RelatedLink = {
      type: linkType,
      id: selectedLinkId,
    };
    
    setFormData({
      ...formData,
      related_links: [...formData.related_links, newLink],
    });
    setSelectedLinkId("");
  };

  const removeRelatedLink = (index: number) => {
    setFormData({
      ...formData,
      related_links: formData.related_links.filter((_, i) => i !== index),
    });
  };

  const getItemName = (link: RelatedLink) => {
    if (link.type === "tool") {
      return tools?.find(t => t.id === link.id)?.title || "Ferramenta não encontrada";
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lesson = lessons?.find((l: any) => l.id === link.id);
      return lesson?.title || "Aula não encontrada";
    }
  };

  const typeLabels: Record<string, string> = {
    free: "Gratuito",
    vip: "VIP",
    tools: "Ferramentas",
  };

  // Filter lessons for linking (exclude current lesson being edited)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const availableLessons = lessons?.filter((l: any) => l.id !== editingLessonId) || [];

  // Helper to parse related links for display
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getRelatedLinksCount = (lesson: any): number => {
    if (!lesson.related_links) return 0;
    try {
      if (typeof lesson.related_links === 'string') {
        return JSON.parse(lesson.related_links).length;
      } else if (Array.isArray(lesson.related_links)) {
        return lesson.related_links.length;
      }
    } catch {
      return 0;
    }
    return 0;
  };

  return (
    <AdminLayout title="Aulas">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Gerencie as aulas e vídeos do curso
        </p>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Aula
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLessonId ? "Editar Aula" : "Nova Aula"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título da aula"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da aula"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Categoria</label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} ({typeLabels[cat.type]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Duração</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Ex: 15:30"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">URL do Vídeo</label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cole o link do YouTube, Vimeo ou qualquer player de vídeo
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">URL da Thumbnail</label>
                <Input
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Conteúdo Adicional</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Links, materiais, descrição detalhada..."
                  rows={4}
                />
              </div>

              {/* Related Links Section */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-primary" />
                  <label className="text-sm font-medium">Links Relacionados</label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Adicione atalhos para ferramentas ou outras aulas que complementam este conteúdo
                </p>
                
                <div className="flex gap-2">
                  <Select value={linkType} onValueChange={(v) => setLinkType(v as "tool" | "lesson")}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tool">Ferramenta</SelectItem>
                      <SelectItem value="lesson">Aula</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedLinkId} onValueChange={setSelectedLinkId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {linkType === "tool" ? (
                        tools?.map((tool) => (
                          <SelectItem key={tool.id} value={tool.id}>
                            {tool.title}
                          </SelectItem>
                        ))
                      ) : (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        availableLessons.map((lesson: any) => (
                          <SelectItem key={lesson.id} value={lesson.id}>
                            {lesson.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  <Button type="button" variant="secondary" onClick={addRelatedLink}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.related_links.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.related_links.map((link, index) => (
                      <Badge key={index} variant="secondary" className="gap-1 pr-1">
                        <span className="text-xs text-muted-foreground">
                          {link.type === "tool" ? "🔧" : "📚"}
                        </span>
                        {getItemName(link)}
                        <button
                          type="button"
                          onClick={() => removeRelatedLink(index)}
                          className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Ordem</label>
                  <Input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <label className="text-sm font-medium">Publicado</label>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingLessonId ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 font-medium">Aula</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Categoria</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Duração</th>
                <th className="text-center p-4 font-medium hidden md:table-cell">Status</th>
                <th className="text-right p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {lessons?.map((lesson: any) => (
                <tr key={lesson.id} className="border-t border-border">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                        <Video className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {lesson.description}
                        </p>
                        {getRelatedLinksCount(lesson) > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <LinkIcon className="w-3 h-3 text-primary" />
                            <span className="text-xs text-primary">{getRelatedLinksCount(lesson)} link(s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {lesson.categories?.name ? (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        lesson.categories.type === "vip" 
                          ? "bg-primary/20 text-primary" 
                          : lesson.categories.type === "tools"
                          ? "bg-warning/20 text-warning"
                          : "bg-accent/20 text-accent"
                      }`}>
                        {lesson.categories.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">
                    {lesson.duration || "-"}
                  </td>
                  <td className="p-4 hidden md:table-cell text-center">
                    {lesson.is_published ? (
                      <Eye className="w-4 h-4 text-success inline" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground inline" />
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(lesson)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir esta aula?")) {
                            deleteMutation.mutate(lesson.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
