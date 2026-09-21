import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Navbar from "./NavBar";

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      const me = await base44.auth.me();
      setUser(me);
      if (me?.role !== "seller") {
        const items = await base44.entities.CartItem.filter({ buyer_id: me.id });
        setCartCount(items.length);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!user || user.role === "seller") return;
    const unsub = base44.entities.CartItem.subscribe((event) => {
      base44.entities.CartItem.filter({ buyer_id: user.id }).then(items => {
        setCartCount(items.length);
      });
    });
    return unsub;
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar user={user} cartCount={cartCount} />
      <main>
        <Outlet context={{ user, setUser, cartCount, setCartCount }} />
      </main>
    </div>
  );
}