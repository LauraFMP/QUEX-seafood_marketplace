import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Package, Truck, Check, Clock, Ban, MapPin, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const STATUS_CONFIG = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  paid: { label: "Pago", color: "bg-blue-100 text-blue-700", icon: Check },
  preparing: { label: "Em Preparo", color: "bg-orange-100 text-orange-700", icon: Package },
  dispatched: { label: "Saiu para Entrega", color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-700", icon: Check },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: Ban },
};

export default function Orders() {
  const { user } = useOutletContext();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    base44.entities.Order.filter({ buyer_id: user.id }, "-created_date")
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  const copyTracking = (code) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copiado!", description: "Código de rastreio copiado." });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-[#5A5FBF]/20 border-t-[#0D1273] rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-heading font-semibold text-gray-600">Nenhum pedido ainda</h2>
        <p className="text-gray-400 mt-2">Seu histórico de pedidos aparecerá aqui</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0D1273] mb-8">Meus Pedidos</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const StatusIcon = sc.icon;
          const paymentLabels = { pix: "PIX", card: "Cartão", boleto: "Boleto", cash: "Dinheiro" };
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400">Pedido #{order.id?.slice(-8)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.created_date).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <Badge className={`${sc.color} border-0 text-xs`}>
                  <StatusIcon className="w-3 h-3 mr-1" /> {sc.label}
                </Badge>
              </div>

              <div className="space-y-1.5">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.quantity}× {item.product_name}</span>
                    <span className="font-medium">R$ {item.subtotal?.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-50 pt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-gray-500">
                  <span>{paymentLabels[order.payment_method] || order.payment_method}</span>
                  {order.delivery_address && (
                    <span className="ml-3 inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {order.delivery_address.slice(0, 30)}...
                    </span>
                  )}
                </div>
                <span className="font-bold text-[#0D1273]">R$ {order.total?.toFixed(2)}</span>
              </div>

              {order.tracking_code && (
                <div className="bg-[#5A5FBF]/5 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Código de Rastreio</p>
                    <p className="font-mono font-semibold text-[#0D1273] text-sm">{order.tracking_code}</p>
                  </div>
                  <button onClick={() => copyTracking(order.tracking_code)} className="p-2 rounded-lg hover:bg-[#5A5FBF]/10 transition-colors">
                    <Copy className="w-4 h-4 text-[#0D1273]" />
                  </button>
                </div>
              )}

              {/* Progresso da entrega */}
              {order.status !== "cancelled" && (
                <div className="flex items-center gap-1 pt-2">
                  {["pending", "paid", "preparing", "dispatched", "delivered"].map((step, idx) => {
                    const stepOrder = ["pending", "paid", "preparing", "dispatched", "delivered"];
                    const currentIdx = stepOrder.indexOf(order.status);
                    const isActive = idx <= currentIdx;
                    return (
                      <React.Fragment key={step}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isActive ? "gradient-bg text-white" : "bg-gray-100 text-gray-400"
                        }`}>
                          {idx + 1}
                        </div>
                        {idx < 4 && <div className={`flex-1 h-0.5 ${isActive && idx < currentIdx ? "gradient-bg" : "bg-gray-100"}`} />}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}