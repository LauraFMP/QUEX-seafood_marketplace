import React, { useEffect, useState } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Fish } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { callSupabaseFunction } from "@/lib/supabaseRest";

const ENDANGERED_SPECIES = [
  "garoupa", "mero", "cação-anjo", "tubarão-martelo", "tainha-de-corrida",
  "peixe-serra", "peixe-boi", "tartaruga-marinha", "cavalo-marinho",
];

export default function ProductForm() {
  const { id } = useParams();
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === "new";

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    quantity: "",
    species: "",
    unit: "kg",
    active: true,
    image_url: "",
    tem_espinha: false,
    tipo_agua: "doce",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) loadProduct();
  }, [id, isNew]);

  async function loadProduct() {
    try {
      const result = await callSupabaseFunction("quex_get_product", { p_id: Number(id) });
      const p = Array.isArray(result) ? result[0] : result;
      if (!p) throw new Error("Produto não encontrado.");
      setForm({
        name: p.nome || "",
        price: p.preco?.toString() || "",
        description: p.descricao || "",
        quantity: p.quantidade?.toString() || "",
        species: p.especie || "",
        unit: p.unidade || "kg",
        active: p.ativo !== false,
        image_url: p.fotos_url || "",
        tem_espinha: Boolean(p.tem_espinha),
        tipo_agua: p.tipo_agua || "doce",
      });
    } catch (error) {
      toast({ title: "Erro ao carregar produto", description: error.message, variant: "destructive" });
      navigate("/seller/dashboard");
    }
  }

  async function handleSave() {
    if (!user?.email) {
      toast({ title: "Usuário sem e-mail", description: "Não foi possível identificar o vendedor no banco.", variant: "destructive" });
      return;
    }
    if (!form.name.trim()) return toast({ title: "Nome obrigatório", variant: "destructive" });
    if (!form.species.trim()) return toast({ title: "Espécie obrigatória", variant: "destructive" });
    if (!form.price || Number(form.price) <= 0) return toast({ title: "O preço deve ser maior que zero", variant: "destructive" });
    if (!form.quantity || Number(form.quantity) <= 0) return toast({ title: "A quantidade deve ser maior que zero", variant: "destructive" });

    const normalized = form.species.trim().toLowerCase();
    if (ENDANGERED_SPECIES.some((s) => normalized.includes(s))) {
      return toast({
        title: "Espécie não permitida",
        description: "Essa espécie é escassa ou ameaçada de extinção e não pode ser cadastrada para venda.",
        variant: "destructive",
      });
    }

    setSaving(true);
    try {
      await callSupabaseFunction("quex_save_product", {
        p_product_id: isNew ? null : Number(id),
        p_email: user.email,
        p_nome: form.name.trim(),
        p_preco: Number(form.price),
        p_descricao: form.description.trim() || null,
        p_quantidade: Number(form.quantity),
        p_especie: form.species.trim(),
        p_unidade: form.unit,
        p_ativo: form.active,
        p_fotos_url: form.image_url || null,
        p_tem_espinha: form.tem_espinha,
        p_tipo_agua: form.tipo_agua,
      });

      toast({ title: isNew ? "Produto cadastrado!" : "Produto atualizado!" });
      navigate("/seller/dashboard");
    } catch (error) {
      toast({ title: "Não foi possível salvar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D1273] mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <h1 className="text-2xl font-heading font-bold text-[#0D1273] mb-8">
        {isNew ? "Novo Produto" : "Editar Produto"}
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Nome do Peixe</Label>
          <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="ex: Filé de Tilápia Fresca" className="rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Preço (R$)</Label>
            <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0,00" className="rounded-xl" />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Quantidade disponível</Label>
            <Input type="number" min="1" step="1" value={form.quantity} onChange={(e) => setForm(p => ({ ...p, quantity: e.target.value }))} placeholder="0" className="rounded-xl" />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 flex items-center gap-1"><Fish className="w-3.5 h-3.5" /> Espécie</Label>
          <Input value={form.species} onChange={(e) => setForm(p => ({ ...p, species: e.target.value }))} placeholder="ex: Tilápia" className="rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Espinha</Label>
            <Select value={form.tem_espinha ? "sim" : "nao"} onValueChange={(v) => setForm(p => ({ ...p, tem_espinha: v === "sim" }))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="sim">Com espinha</SelectItem><SelectItem value="nao">Sem espinha</SelectItem></SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Tipo de água</Label>
            <Select value={form.tipo_agua} onValueChange={(v) => setForm(p => ({ ...p, tipo_agua: v }))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="doce">Água doce</SelectItem><SelectItem value="salgada">Água salgada</SelectItem></SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">Unidade</Label>
          <Select value={form.unit} onValueChange={(v) => setForm(p => ({ ...p, unit: v }))}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="kg">por kg</SelectItem><SelectItem value="unit">por unidade</SelectItem><SelectItem value="dozen">por dúzia</SelectItem></SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">Descrição</Label>
          <Textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descreva seu produto..." rows={4} className="rounded-xl resize-none" />
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">URL da foto (opcional)</Label>
          <Input value={form.image_url} onChange={(e) => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." className="rounded-xl" />
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium">Anúncio ativo</span>
          <Switch checked={form.active} onCheckedChange={(v) => setForm(p => ({ ...p, active: v }))} />
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full gradient-btn py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> {isNew ? "Cadastrar Produto" : "Salvar Alterações"}</>}
        </button>
      </div>
    </div>
  );
}
