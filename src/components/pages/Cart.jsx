import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Cart() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadCart();
  }, [user]);

  const loadCart = async () => {
    setLoading(true);
    const cartItems = await base44.entities.CartItem.filter({ buyer_id: user.id });
    setItems(cartItems);
    setLoading(false);
  };

  const updateQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      await base44.entities.CartItem.delete(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      await base44.entities.CartItem.update(item.id, {
        quantity: newQty,
        subtotal: newQty * item.product_price,
      });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty, subtotal: newQty * item.product_price } : i));
    }
  };

  const removeItem = async (item) => {
    await base44.entities.CartItem.delete(item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
    toast({ title: "Removido do carrinho", description: item.product_name });
  };

  const total = items.reduce((sum, i) => sum + (i.subtotal || i.quantity * i.product_price), 0);
  const fallbackImg = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop";

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-[#5A5FBF]/20 border-t-[#0D1273] rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-heading font-semibold text-gray-600">Seu carrinho está vazio</h2>
        <p className="text-gray-400 mt-2">Explore o marketplace e encontre pescado fresco!</p>
        <Link to="/marketplace">
          <button className="gradient-btn px-6 py-3 rounded-xl text-sm mt-6">
            Ver Marketplace
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0D1273] mb-8">Carrinho de Compras</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-center">
            <img
              src={item.product_image || fallbackImg}
              alt={item.product_name}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#0D1273] truncate">{item.product_name}</h3>
              {item.seller_name && <p className="text-xs text-gray-400">{item.seller_name}</p>}
              <p className="text-sm font-medium text-gray-600 mt-1">R$ {item.product_price?.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item, -1)}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateQty(item, 1)}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="font-bold text-[#0D1273]">R$ {(item.subtotal || item.quantity * item.product_price).toFixed(2)}</p>
            </div>
            <button onClick={() => removeItem(item)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Total + Checkout */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Total ({items.length} item{items.length !== 1 ? "s" : ""}):</span>
          <span className="text-2xl font-bold text-[#0D1273]">R$ {total.toFixed(2)}</span>
        </div>
        <button
          onClick={() => navigate("/checkout")}
          className="w-full gradient-btn py-3.5 rounded-xl flex items-center justify-center gap-2"
        >
          Ir para o Pagamento <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}