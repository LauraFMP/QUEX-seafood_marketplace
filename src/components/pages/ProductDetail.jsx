import React, { useState, useEffect } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Fish, MapPin, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    base44.entities.Product.get(id)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    if (!user) return;
    setAdding(true);
    const existing = await base44.entities.CartItem.filter({
      buyer_id: user.id,
      product_id: product.id,
    });

    if (existing.length > 0) {
      await base44.entities.CartItem.update(existing[0].id, {
        quantity: existing[0].quantity + qty,
        subtotal: (existing[0].quantity + qty) * product.price,
      });
    } else {
      await base44.entities.CartItem.create({
        buyer_id: user.id,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_image: product.image_url,
        seller_name: product.seller_name,
        quantity: qty,
        subtotal: qty * product.price,
      });
    }

    toast({ title: "Adicionado ao carrinho!", description: `${qty}× ${product.name}` });
    setAdding(false);
  };

  const unitLabel = (u) => (u === "unit" ? "unidade" : u === "dozen" ? "dúzia" : "kg");
  const fallbackImg = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop";

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-[#5A5FBF]/20 border-t-[#0D1273] rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Fish className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-600">Produto não encontrado</h2>
        <Button variant="ghost" onClick={() => navigate("/marketplace")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Marketplace
        </Button>
      </div>
    );
  }

  const inStock = product.quantity > 0;
  const isBuyer = user?.role !== "seller";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D1273] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Imagem */}
        <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100">
          <img src={product.image_url || fallbackImg} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Informações */}
        <div className="space-y-6">
          <div>
            {product.species && (
              <Badge className="mb-3 gradient-bg text-white border-0">
                <Fish className="w-3 h-3 mr-1" /> {product.species}
              </Badge>
            )}
            <h1 className="text-3xl font-heading font-bold text-[#0D1273]">{product.name}</h1>
            {product.seller_name && (
              <p className="text-gray-500 flex items-center gap-1 mt-2">
                <MapPin className="w-4 h-4" /> Vendido por {product.seller_name}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#0D1273]">R$ {product.price?.toFixed(2)}</span>
            <span className="text-gray-400">/{unitLabel(product.unit)}</span>
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-4">
            <Badge variant={inStock ? "default" : "destructive"} className={inStock ? "bg-green-100 text-green-700 border-0" : ""}>
              {inStock ? `${product.quantity} em estoque` : "Sem estoque"}
            </Badge>
          </div>

          {isBuyer && inStock && (
            <div className="bg-[#F2F2F2] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">Quantidade:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.quantity, qty + 1))}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-bold text-[#0D1273] text-lg">R$ {(qty * product.price).toFixed(2)}</span>
              </div>
              <button
                onClick={addToCart}
                disabled={adding}
                className="w-full gradient-btn py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {adding ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Adicionar ao Carrinho
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}