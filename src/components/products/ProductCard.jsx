import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Fish } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProductCard({ product }) {
  const fallbackImg = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop";

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#5A5FBF]/40 hover:shadow-xl transition-all duration-300"
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={product.image_url || fallbackImg}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.quantity <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Sem Estoque</span>
          </div>
        )}
        {product.species && (
          <Badge className="absolute top-3 left-3 bg-white/90 text-[#0D1273] border-0 text-xs">
            <Fish className="w-3 h-3 mr-1" />
            {product.species}
          </Badge>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-[#0D1273] group-hover:text-[#5A5FBF] transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
        <div className="flex items-end justify-between pt-1">
          <div>
            <span className="text-xl font-bold text-[#0D1273]">
              R$ {product.price?.toFixed(2)}
            </span>
            <span className="text-xs text-gray-400 ml-1">/{product.unit === "unit" ? "unid." : product.unit === "dozen" ? "dúzia" : "kg"}</span>
          </div>
          {product.seller_name && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {product.seller_name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}