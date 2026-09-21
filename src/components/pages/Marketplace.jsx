import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, SlidersHorizontal, Fish, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/products/ProductCard";

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [allSpecies, setAllSpecies] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const all = await base44.entities.Product.filter({ active: true });
    setProducts(all);
    const species = [...new Set(all.map(p => p.species).filter(Boolean))];
    setAllSpecies(species);
    setLoading(false);
  };

  const filtered = products
    .filter(p => {
      if (search && !p.name?.toLowerCase().includes(search.toLowerCase()) && !p.species?.toLowerCase().includes(search.toLowerCase()) && !p.seller_name?.toLowerCase().includes(search.toLowerCase())) return false;
      if (speciesFilter && speciesFilter !== "all_species" && p.species !== speciesFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
      return 0; // mais recentes — ordem padrão
    });

  const clearFilters = () => {
    setSearch("");
    setSpeciesFilter("");
    setSortBy("newest");
  };

  const hasActiveFilters = search || speciesFilter || sortBy !== "newest";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0D1273]">Marketplace</h1>
        <p className="text-gray-500 mt-1">Encontre pescado fresco de pescadores artesanais locais</p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar peixe, espécie ou vendedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 focus:border-[#0D1273]"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-xl border-gray-200 sm:w-auto"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div className="min-w-[160px]">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Espécie</label>
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Todas as espécies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_species">Todas as espécies</SelectItem>
                {allSpecies.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Ordenar por</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="price_asc">Menor preço</SelectItem>
                <SelectItem value="price_desc">Maior preço</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 text-xs">
              <X className="w-3 h-3 mr-1" /> Limpar
            </Button>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#5A5FBF]/20 border-t-[#0D1273] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Fish className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Nenhum produto encontrado</p>
          <p className="text-sm mt-1">Tente ajustar sua busca ou filtros</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">{filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}