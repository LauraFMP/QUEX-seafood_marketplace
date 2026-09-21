import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Package, Fish, Edit, Trash2, Eye, EyeOff, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

export default function SellerDashboard() {
  const { user } = useOutletContext();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.Product.filter({ seller_id: user.id }),
      base44.entities.Order.list("-created_date", 50),
    ]).then(([prods, allOrders]) => {
      setProducts(prods);
      const myOrders = allOrders.filter(o =>
        o.items?.some(item => item.seller_id === user.id) ||
        o.items?.some(item => item.seller_name === user.full_name)
      );
      setOrders(myOrders);
    }).finally(() => setLoading(false));
  }, [user]);

  const toggleProduct = async (product) => {
    await base44.entities.Product.update(product.id, { active: !product.active });
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: !p.active } : p));
    toast({ title: product.active ? "Produto desativado" : "Produto ativado" });
  };

  const deleteProduct = async (product) => {
    await base44.entities.Product.delete(product.id);
    setProducts(prev => prev.filter(p => p.id !== product.id));
    toast({ title: "Produto excluído" });
  };

  const updateOrderStatus = async (order, newStatus) => {
    let updates = { status: newStatus };
    if (newStatus === "dispatched") {
      const code = "QX-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      updates.tracking_code = code;
      updates.delivery_status = "in_transit";
    }
    if (newStatus === "delivered") {
      updates.delivery_status = "delivered";
    }
    await base44.entities.Order.update(order.id, updates);
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...updates } : o));
    toast({ title: `Pedido atualizado para "${newStatus}"` });
  };

  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + (o.total || 0), 0);
  const fallbackImg = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop";
  const statusLabels = { pending: "Pendente", paid: "Pago", preparing: "Em Preparo", dispatched: "Despachado", delivered: "Entregue", cancelled: "Cancelado" };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-[#5A5FBF]/20 border-t-[#0D1273] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0D1273]">Minha Loja</h1>
          <p className="text-gray-500 mt-1">Gerencie seus produtos e pedidos</p>
        </div>
        <Link to="/seller/product/new">
          <button className="gradient-btn px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Produto
          </button>
        </Link>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Produtos", value: products.length, icon: Fish },
          { label: "Pedidos", value: orders.length, icon: Package },
          { label: "Faturamento", value: `R$ ${totalRevenue.toFixed(2)}`, icon: DollarSign },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0D1273] flex items-center justify-center">
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0D1273]">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="products">
        <TabsList className="bg-gray-100 rounded-xl p-1">
          <TabsTrigger value="products" className="rounded-lg text-sm">Produtos</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-lg text-sm">Pedidos</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Fish className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum produto ainda. Cadastre seu primeiro anúncio!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-center">
                  <img src={p.image_url || fallbackImg} alt={p.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#0D1273] truncate">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium">R$ {p.price?.toFixed(2)}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">{p.quantity} em estoque</span>
                    </div>
                  </div>
                  <Badge className={p.active ? "bg-green-100 text-green-700 border-0" : "bg-gray-100 text-gray-500 border-0"}>
                    {p.active ? "Ativo" : "Inativo"}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Link to={`/seller/product/${p.id}`}>
                      <Button variant="ghost" size="icon" className="rounded-lg hover:bg-[#5A5FBF]/10">
                        <Edit className="w-4 h-4 text-gray-500" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="rounded-lg hover:bg-[#5A5FBF]/10" onClick={() => toggleProduct(p)}>
                      {p.active ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-lg hover:bg-red-50" onClick={() => deleteProduct(p)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum pedido ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#0D1273]">{order.buyer_name || "Cliente"}</p>
                      <p className="text-xs text-gray-400">#{order.id?.slice(-8)} · {new Date(order.created_date).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <Badge className="text-xs">{statusLabels[order.status] || order.status}</Badge>
                  </div>
                  <div className="space-y-1">
                    {order.items?.map((item, idx) => (
                      <p key={idx} className="text-sm text-gray-600">{item.quantity}× {item.product_name} — R$ {item.subtotal?.toFixed(2)}</p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="font-bold text-[#0D1273]">R$ {order.total?.toFixed(2)}</span>
                    <div className="flex gap-2">
                      {order.status === "paid" && (
                        <button onClick={() => updateOrderStatus(order, "preparing")} className="gradient-btn px-3 py-1.5 rounded-lg text-xs">
                          Iniciar Preparo
                        </button>
                      )}
                      {order.status === "preparing" && (
                        <button onClick={() => updateOrderStatus(order, "dispatched")} className="gradient-btn px-3 py-1.5 rounded-lg text-xs">
                          Despachar
                        </button>
                      )}
                      {order.status === "dispatched" && (
                        <button onClick={() => updateOrderStatus(order, "delivered")} className="gradient-btn px-3 py-1.5 rounded-lg text-xs">
                          Marcar como Entregue
                        </button>
                      )}
                    </div>
                  </div>
                  {order.tracking_code && (
                    <p className="text-xs text-gray-500">Rastreio: <span className="font-mono font-semibold text-[#0D1273]">{order.tracking_code}</span></p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}