import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { User, Phone, MapPin, FileText, Store, Truck, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
  const { user, setUser } = useOutletContext();
  const { toast } = useToast();
  const [form, setForm] = useState({
    role: "buyer",
    phone: "",
    address: "",
    cpf: "",
    cpf_cnpj: "",
    location: "",
    business_name: "",
    commercial: false,
    own_delivery: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        role: user.role || "buyer",
        phone: user.phone || "",
        address: user.address || "",
        cpf: user.cpf || "",
        cpf_cnpj: user.cpf_cnpj || "",
        location: user.location || "",
        business_name: user.business_name || "",
        commercial: user.commercial || false,
        own_delivery: user.own_delivery || false,
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    const updated = await base44.auth.me();
    setUser(updated);
    toast({ title: "Perfil salvo!", description: "Seus dados foram atualizados." });
    setSaving(false);
  };

  const isSeller = form.role === "seller";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0D1273] mb-8">Meu Perfil</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        {/* Dados básicos (somente leitura) */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-[#0D1273] flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0D1273]">{user?.full_name || "Usuário"}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Tipo de conta (alterável) */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Tipo de Conta</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, role: "buyer" }))}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                form.role === "buyer"
                  ? "border-[#0D1273] bg-[#0D1273]/5 text-[#0D1273]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">Comprador</span>
            </button>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, role: "seller" }))}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                form.role === "seller"
                  ? "border-[#0D1273] bg-[#0D1273]/5 text-[#0D1273]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <Store className="w-5 h-5" />
              <span className="text-sm font-medium">Vendedor</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">Você pode alterar o tipo de conta quando quiser.</p>
        </div>

        {/* Campos compartilhados */}
        <div>
          <Label className="text-sm font-medium mb-1.5 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" /> Telefone
          </Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(00) 00000-0000"
            className="rounded-xl"
          />
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Endereço
          </Label>
          <Input
            value={form.address}
            onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Seu endereço completo"
            className="rounded-xl"
          />
        </div>

        {/* Campos do comprador */}
        {!isSeller && (
          <div>
            <Label className="text-sm font-medium mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> CPF
            </Label>
            <Input
              value={form.cpf}
              onChange={(e) => setForm(prev => ({ ...prev, cpf: e.target.value }))}
              placeholder="000.000.000-00"
              className="rounded-xl"
            />
          </div>
        )}

        {/* Campos do vendedor */}
        {isSeller && (
          <>
            <div>
              <Label className="text-sm font-medium mb-1.5 flex items-center gap-1">
                <Store className="w-3.5 h-3.5" /> Nome do Estabelecimento
              </Label>
              <Input
                value={form.business_name}
                onChange={(e) => setForm(prev => ({ ...prev, business_name: e.target.value }))}
                placeholder="Nome da sua peixaria ou barraca"
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> CPF / CNPJ
              </Label>
              <Input
                value={form.cpf_cnpj}
                onChange={(e) => setForm(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                placeholder="CPF ou CNPJ"
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Localização / Região de Pesca
              </Label>
              <Input
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Onde você pesca / vende"
                className="rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Vendedor comercial (CNPJ)</span>
              </div>
              <Switch checked={form.commercial} onCheckedChange={(v) => setForm(prev => ({ ...prev, commercial: v }))} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Faço minha própria entrega</span>
              </div>
              <Switch checked={form.own_delivery} onCheckedChange={(v) => setForm(prev => ({ ...prev, own_delivery: v }))} />
            </div>
          </>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full gradient-btn py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" /> Salvar Perfil
            </>
          )}
        </button>
      </div>
    </div>
  );
}