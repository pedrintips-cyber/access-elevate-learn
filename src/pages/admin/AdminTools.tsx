import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Pencil, Trash2, Loader2, FileText, Link as LinkIcon, Code } from "lucide-react";
import { toast } from "sonner";

interface Tool {
  id: string;
  title: string;
  description: string | null;
  type: string;
  content: string | null;
  file_url: string | null;
  external_url: string | null;
  file_type: string | null;
  category_id: string | null;
  order_index: number | null;
  is_published: boolean | null;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function AdminTools() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "file",
    content: "",
    file_url: "",
    external_url: "",
    file_type: "",
    category_id: "",
    order_index: 0,
    is_published: true,
    instructions: "",
  });

  const { data: tools, isLoading } = useQuery({
    queryKey: ["admin-tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*, categories(name, type)")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-tool-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, type")
        .eq("type", "tools")
        .order("name");
      if (error) throw error;
      return data as Category[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("tools").insert({
        ...data,
        category_id: data.category_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tools"] });
      toast.success("Ferramenta criada com sucesso!");
      setIsOpen(false);
      resetForm();
    },
    onError: () => toast.error("Erro ao criar ferramenta"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("tools").update({
        ...data,
        category_id: data.category_id || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tools"] });
      toast.success("Ferramenta atualizada!");
      setIsOpen(false);
      resetForm();
    },
    onError: () => toast.error("Erro ao atualizar ferramenta"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tools").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tools"] });
      toast.success("Ferramenta excluída!");
    },
    onError: () => toast.error("Erro ao excluir ferramenta"),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "file",
      content: "",
      file_url: "",
      external_url: "",
      file_type: "",
      category_id: "",
      order_index: 0,
      is_published: true,
      instructions: "",
    });
    setEditingTool(null);
  };

  const handleEdit = (tool: any) => {
    setEditingTool(tool);
    setFormData({
      title: tool.title,
      description: tool.description || "",
      type: tool.type,
      content: tool.content || "",
      file_url: tool.file_url || "",
      external_url: tool.external_url || "",
      file_type: tool.file_type || "",
      category_id: tool.category_id || "",
      order_index: tool.order_index || 0,
      is_published: tool.is_published ?? true,
      instructions: tool.instructions || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTool) {
      updateMutation.mutate({ id: editingTool.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "file": return <FileText className="w-4 h-4" />;
      case "link": return <LinkIcon className="w-4 h-4" />;
      case "script": return <Code className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <AdminLayout title="Ferramentas">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Gerencie as ferramentas e recursos
        </p>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Ferramenta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTool ? "Editar Ferramenta" : "Nova Ferramenta"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título da ferramenta"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da ferramenta"
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
                      <SelectItem value="file">Arquivo</SelectItem>
                      <SelectItem value="link">Link Externo</SelectItem>
                      <SelectItem value="script">Script/Código</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {formData.type === "file" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">URL do Arquivo</label>
                    <Input
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tipo do Arquivo</label>
                    <Input
                      value={formData.file_type}
                      onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                      placeholder="PDF, XLSX, etc."
                    />
                  </div>
                </>
              )}

              {formData.type === "link" && (
                <div>
                  <label className="text-sm font-medium mb-1 block">URL Externa</label>
                  <Input
                    value={formData.external_url}
                    onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              )}

              {formData.type === "script" && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Código/Script</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Cole o código aqui..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1 block">Instruções de Uso</label>
                <Textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Explique passo a passo como usar essa ferramenta..."
                  rows={5}
                />
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
                  {editingTool ? "Salvar" : "Criar"}
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
                <th className="text-left p-4 font-medium">Ferramenta</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Tipo</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Categoria</th>
                <th className="text-right p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tools?.map((tool: any) => (
                <tr key={tool.id} className="border-t border-border">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        {getTypeIcon(tool.type)}
                      </div>
                      <div>
                        <p className="font-medium">{tool.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-secondary">
                      {tool.type === "file" ? "Arquivo" : tool.type === "link" ? "Link" : "Script"}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">
                    {tool.categories?.name || "-"}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(tool)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir esta ferramenta?")) {
                            deleteMutation.mutate(tool.id);
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
