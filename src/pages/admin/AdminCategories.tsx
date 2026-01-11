import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Loader2, ChevronRight, FolderOpen } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  type: string;
  order_index: number | null;
  parent_id: string | null;
}

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Flame",
    type: "free",
    order_index: 0,
    parent_id: "",
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("type")
        .order("order_index");
      if (error) throw error;
      return data as Category[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const insertData = {
        name: data.name,
        description: data.description || null,
        icon: data.icon,
        type: data.type,
        order_index: data.order_index,
        parent_id: data.parent_id || null,
      };
      const { error } = await supabase.from("categories").insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Categoria criada com sucesso!");
      setIsOpen(false);
      resetForm();
    },
    onError: () => toast.error("Erro ao criar categoria"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const updateData = {
        name: data.name,
        description: data.description || null,
        icon: data.icon,
        type: data.type,
        order_index: data.order_index,
        parent_id: data.parent_id || null,
      };
      const { error } = await supabase.from("categories").update(updateData).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Categoria atualizada!");
      setIsOpen(false);
      resetForm();
    },
    onError: () => toast.error("Erro ao atualizar categoria"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Categoria excluída!");
    },
    onError: () => toast.error("Erro ao excluir categoria. Verifique se não há subcategorias ou aulas vinculadas."),
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", icon: "Flame", type: "free", order_index: 0, parent_id: "" });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "Flame",
      type: category.type,
      order_index: category.order_index || 0,
      parent_id: category.parent_id || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const iconOptions = [
    "Flame", "Star", "Zap", "Target", "Trophy", "Rocket", 
    "Lightbulb", "TrendingUp", "DollarSign", "Crown", "Heart", "Gift",
    "Brain", "MessageCircle", "Bot", "FileText", "Palette", "Layers"
  ];

  const typeLabels: Record<string, string> = {
    free: "Gratuito",
    vip: "VIP",
    tools: "Ferramentas",
  };

  // Separar categorias principais e subcategorias
  const mainCategories = categories?.filter(c => !c.parent_id) || [];
  const getSubcategories = (parentId: string) => 
    categories?.filter(c => c.parent_id === parentId) || [];

  // Categorias disponíveis como pai (excluir a própria categoria se estiver editando)
  const availableParentCategories = categories?.filter(c => 
    !c.parent_id && c.id !== editingCategory?.id
  ) || [];

  return (
    <AdminLayout title="Categorias">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Gerencie as categorias e subcategorias
        </p>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da categoria"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da categoria"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Tipo</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="tools">Ferramentas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Ícone</label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Categoria Pai (opcional)</label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma (categoria principal)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma (categoria principal)</SelectItem>
                    {availableParentCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name} ({typeLabels[cat.type]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Selecione uma categoria pai para criar uma subcategoria
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ordem</label>
                <Input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingCategory ? "Salvar" : "Criar"}
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
        <div className="space-y-4">
          {mainCategories.map((category) => {
            const subcategories = getSubcategories(category.id);
            
            return (
              <div key={category.id} className="glass-card overflow-hidden">
                {/* Categoria Principal */}
                <div className="flex items-center justify-between p-4 bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          category.type === "vip" 
                            ? "bg-primary/20 text-primary" 
                            : category.type === "tools"
                            ? "bg-warning/20 text-warning"
                            : "bg-accent/20 text-accent"
                        }`}>
                          {typeLabels[category.type]}
                        </span>
                        {subcategories.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {subcategories.length} subcategoria{subcategories.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir esta categoria e todas as subcategorias?")) {
                          deleteMutation.mutate(category.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Subcategorias */}
                {subcategories.length > 0 && (
                  <div className="border-t border-border">
                    {subcategories.map((sub) => (
                      <div 
                        key={sub.id} 
                        className="flex items-center justify-between p-4 pl-12 border-b border-border/50 last:border-b-0 hover:bg-secondary/20"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{sub.name}</p>
                            {sub.description && (
                              <p className="text-xs text-muted-foreground">{sub.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(sub)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir esta subcategoria?")) {
                                deleteMutation.mutate(sub.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {mainCategories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma categoria cadastrada
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}