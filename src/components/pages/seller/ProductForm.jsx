import React, { useState, useEffect } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Upload, Save, Fish } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

// RN02 — espécies escassas ou ameaçadas de extinção não podem ser cadastradas para venda
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
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      base44.entities.Product.get(id).then(p => {
        setForm({
          name: p.name || "",
          price: p.price?.toString() || "",
          description: p.description || "",
          quantity: p.quantity?.toString() || "",
          species: p.species || "",
          unit: p.unit || "kg",
          active: p.active !== false,
          image_url: p.image_url || "",
        });
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, image_url: file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      toast({ title: "O preço deve ser maior que zero", variant: "destructive" });
      return;
    }
    if (!form.species.trim()) {
      toast({ title: "Espécie obrigatória", variant: "destructive" });
      return;
    }
    // RN02 — bloqueia espécies escassas ou ameaçadas de extinção
    const speciesNormalized = form.species.trim().toLowerCase();
    if (ENDANGERED_SPECIES.some(s => speciesNormalized.includes(s))) {
      toast({
        title: "Espécie não permitida",
        description: "Essa espécie é escassa ou ameaçada de extinção e não pode ser cadastrada para venda.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const data = {
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity) || 0,
      seller_id: user.id,
      seller_name: user.business_name || user.full_name,
    };

    if (isNew) {
      await base44.entities.Product.create(data);
      toast({ title: "Produto cadastrado!" });
    } else {
      await base44.entities.Product.update(id, data);
      toast({ title: "Produto atualizado!" });
    }
    setSaving(false);
    navigate("/seller/dashboard");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-[#5A5FBF]/20 border-t-[#0D1273] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D1273] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <h1 className="text-2xl font-heading font-bold text-[#0D1273] mb-8">
        {isNew ? "Novo Produto" : "Editar Produto"}
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        {/* Foto */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Foto do Produto</Label>
          <div className="relative">
            {form.image_url ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
                <img src={form.image_url} alt="Produto" className="w-full h-full object-cover" />
                <label className="absolute bottom-3 right-3 gradient-btn px-3 py-1.5 rounded-lg text-xs cursor-pointer">
                  Alterar
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-[#0D1273] cursor-pointer transition-colors bg-gray-50">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-[#5A5FBF]/30 border-t-[#0D1273] rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Enviar foto</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">Nome do Peixe</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="ex: Filé de Tilápia Fresca"
            className="rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Preço (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0,00"
              className="rounded-xl"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Unidade</Label>
            <Select value={form.unit} onValueChange={(v) => setForm(prev => ({ ...prev, unit: v }))}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">por kg</SelectItem>
                <SelectItem value="unit">por unidade</SelectItem>
                <SelectItem value="dozen">por dúzia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Quantidade em Estoque</Label>
            <Input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="0"
              className="rounded-xl"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 flex items-center gap-1">
              <Fish className="w-3.5 h-3.5" /> Espécie
            </Label>
            <Input
              value={form.species}
              onChange={(e) => setForm(prev => ({ ...prev, species: e.target.value }))}
              placeholder="ex: Tilápia"
              className="rounded-xl"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2">
          Espécies escassas na baía local ou ameaçadas de extinção não podem ser cadastradas.
        </p>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">Descrição</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descreva seu produto..."
            rows={4}
            className="rounded-xl resize-none"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium">Anúncio ativo</span>
          <Switch checked={form.active} onCheckedChange={(v) => setForm(prev => ({ ...prev, active: v }))} />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full gradient-btn py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" /> {isNew ? "Cadastrar Produto" : "Salvar Alterações"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}