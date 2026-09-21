import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CreditCard, QrCode, Receipt, Banknote, MapPin, Calendar, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function Checkout() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [payMethod, setPayMethod] = useState("pix");
  const [address, setAddress] = useState(user?.address || "");
  const [schedDate, setSchedDate] = useState("");

  useEffect(() => {
    if (!user) return;
    setAddress(user.address || "");
    base44.entities.CartItem.filter({ buyer_id: user.id })
      .then(setItems)
      .finally(() => setLoading(false));
  }, [user]);

  const total = items.reduce((sum, i) => sum + (i.subtotal || i.quantity * i.product_price), 0);

  const placeOrder = async () => {
    if (!address.trim()) {
      toast({ title: "Endereço obrigatório", description: "Informe o endereço de entrega.", variant: "destructive" });
      return;
    }
    setPlacing(true);

    const orderItems = items.map(i => ({
      product_id: i.product_id,
      product_name: i.product_name,
      quantity: i.quantity,
      price: i.product_price,
      subtotal: i.subtotal || i.quantity * i.product_price,
      seller_name: i.seller_name,
    }));

    await base44.entities.Order.create({
      buyer_id: user.id,
      buyer_name: user.full_name,
      status: payMethod === "cash" ? "pending" : "paid",
      total,
      payment_method: payMethod,
      payment_status: payMethod === "cash" ? "pending" : "confirmed",
      delivery_address: address,
      scheduled_date: schedDate || undefined,
      items: orderItems,
    });

    // Limpa o carrinho
    for (const item of items) {
      await base44.entities.CartItem.delete(item.id);
    }

    setPlacing(false);
    toast({ title: "Pedido realizado!", description: "Seu pedido foi confirmado." });
    navigate("/orders");
  };

  const paymentMethods = [
    { id: "pix", label: "PIX", icon: QrCode, desc: "Pagamento instantâneo" },
    { id: "card", label: "Cartão", icon: CreditCard, desc: "Crédito ou débito" },
    { id: "boleto", label: "Boleto", icon: Receipt, desc: "Boleto bancário" },
    { id: "cash", label: "Dinheiro", icon: Banknote, desc: "Pagar na entrega" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-[#5A5FBF]/20 border-t-[#0D1273] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0D1273] mb-8">Finalizar Compra</h1>

      <div className="space-y-6">
        {/* Resumo do pedido */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-[#0D1273] mb-3">Resumo do Pedido</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.quantity}× {item.product_name}</span>
                <span className="font-medium">R$ {(item.subtotal || item.quantity * item.product_price).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between">
              <span className="font-semibold text-[#0D1273]">Total</span>
              <span className="font-bold text-[#0D1273] text-lg">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Endereço de entrega */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-[#0D1273] mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Endereço de Entrega
          </h2>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Digite seu endereço completo de entrega"
            className="rounded-xl"
          />
          <div className="mt-3">
            <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3" /> Agendar entrega (opcional)
            </Label>
            <Input
              type="date"
              value={schedDate}
              onChange={(e) => setSchedDate(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Forma de pagamento */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-[#0D1273] mb-3">Forma de Pagamento</h2>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setPayMethod(pm.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  payMethod === pm.id
                    ? "border-[#0D1273] bg-[#5A5FBF]/5"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    payMethod === pm.id ? "gradient-bg" : "bg-gray-100"
                  }`}>
                    <pm.icon className={`w-5 h-5 ${payMethod === pm.id ? "text-white" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{pm.label}</p>
                    <p className="text-xs text-gray-400">{pm.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Finalizar pedido */}
        <button
          onClick={placeOrder}
          disabled={placing}
          className="w-full gradient-btn py-4 rounded-xl flex items-center justify-center gap-2 text-base disabled:opacity-50"
        >
          {placing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5" /> Confirmar Pedido — R$ {total.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </div>
  );
}