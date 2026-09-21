import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Fish, ShoppingBag, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/products/ProductCard";

export default function Home() {
  const { user } = useOutletContext();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Product.filter({ active: true }, "-created_date", 6)
      .then(setFeatured)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0D1273] text-white">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-[#F29E38] to-[#F2541B] blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gradient-to-br from-[#5A5FBF] to-[#0D1273] blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm">
              <Fish className="w-4 h-4" />
              <span>Pescado fresco, direto do mar para sua mesa</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight">
              Compre pescado fresco
              <span className="block gradient-text">direto do pescador</span>
            </h1>
            <p className="text-lg text-blue-100 max-w-lg">
              O QUÉX conecta você a pescadores artesanais locais. Compre pescado fresco com preço justo, sem intermediários, com entrega até a sua casa.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/marketplace">
                <button className="gradient-btn px-6 py-3 rounded-xl text-sm flex items-center gap-2">
                  Ver Marketplace <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              {user?.role === "seller" && (
                <Link to="/seller/dashboard">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl px-6 py-3">
                    Painel do Vendedor
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Fish, title: "Pescado do Dia", desc: "Peixes anunciados diariamente por pescadores locais — sempre frescos, nunca congelados." },
              { icon: ShoppingBag, title: "Preço Justo e Direto", desc: "Sem intermediários. Compre direto da fonte com preços transparentes." },
              { icon: Truck, title: "Entrega em Casa", desc: "Agende a entrega no seu endereço e acompanhe seu pedido em tempo real." },
            ].map((f, i) => (
              <div key={i} className="text-center p-6 rounded-2xl hover:bg-[#5A5FBF]/5 transition-colors group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0D1273] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-[#0D1273] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-[#F2F2F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0D1273]">Pescado Fresco Hoje</h2>
              <p className="text-gray-500 mt-1">Confira os anúncios mais recentes dos pescadores locais</p>
            </div>
            <Link to="/marketplace" className="hidden md:flex items-center gap-1 text-sm font-medium text-[#0D1273] hover:underline">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#5A5FBF]/20 border-t-[#0D1273] rounded-full animate-spin" />
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Fish className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg">Nenhum produto cadastrado ainda</p>
              <p className="text-sm mt-1">Seja o primeiro pescador a anunciar seu pescado!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="md:hidden text-center mt-8">
            <Link to="/marketplace">
              <button className="gradient-btn px-6 py-3 rounded-xl text-sm">
                Ver Todos os Produtos
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0D1273] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-heading font-bold">
            É pescador ou microempreendedor da pesca?
          </h2>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">
            Cadastre-se no QUÉX e venda seu pescado para milhares de compradores. Defina seus preços, gerencie seu estoque e aumente sua renda sem intermediários.
          </p>
          <Link to="/register">
            <button className="gradient-btn px-8 py-3.5 rounded-xl text-sm mt-4">
              Comece a Vender Hoje
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0D1273] flex items-center justify-center">
              <Fish className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-[#0D1273]">QUÉX</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 QUÉX — Marketplace de Pescados. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}