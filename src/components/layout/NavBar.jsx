import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShoppingCart, Menu, X, Fish, User, LogOut, Package, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar({ user, cartCount = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await base44.auth.logout("/");
  };

  const isSeller = user?.role === "seller";

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#5A5FBF]/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-[#0D1273] flex items-center justify-center">
              <Fish className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-[#0D1273] tracking-tight">
              QUÉX
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/marketplace" className="text-sm font-medium text-gray-600 hover:text-[#0D1273] transition-colors">
              Comprar Pescados
            </Link>
            {isSeller && (
              <Link to="/seller/dashboard" className="text-sm font-medium text-gray-600 hover:text-[#0D1273] transition-colors">
                Minha Loja
              </Link>
            )}
            {!isSeller && (
              <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-[#0D1273] transition-colors">
                Meus Pedidos
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!isSeller && (
              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-[#5A5FBF]/10 transition-colors">
                <ShoppingCart className="w-5 h-5 text-[#0D1273]" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-[#0D1273] text-white border-0">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-lg hover:bg-[#5A5FBF]/10">
                  <User className="w-5 h-5 text-[#0D1273]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium truncate">{user?.full_name || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground">
                    {isSeller ? "Vendedor" : "Comprador"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4 mr-2" /> Perfil
                </DropdownMenuItem>
                {isSeller ? (
                  <DropdownMenuItem onClick={() => navigate("/seller/dashboard")}>
                    <Store className="w-4 h-4 mr-2" /> Minha Loja
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    <Package className="w-4 h-4 mr-2" /> Meus Pedidos
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-[#5A5FBF]/10"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5 text-[#0D1273]" /> : <Menu className="w-5 h-5 text-[#0D1273]" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/marketplace" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#5A5FBF]/10">
              Comprar Pescados
            </Link>
            {isSeller ? (
              <Link to="/seller/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#5A5FBF]/10">
                Minha Loja
              </Link>
            ) : (
              <>
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#5A5FBF]/10">
                  Carrinho ({cartCount})
                </Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#5A5FBF]/10">
                  Meus Pedidos
                </Link>
              </>
            )}
            <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#5A5FBF]/10">
              Perfil
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}