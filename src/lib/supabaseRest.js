const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[QUÉX] Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente do Base44.');
}

async function request(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!response.ok) {
    const message = data?.message || data?.hint || data?.details || `Supabase HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export async function callSupabaseFunction(functionName, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!response.ok) {
    const message = data?.message || data?.hint || data?.details || `Supabase RPC HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export async function getProduct(id) {
  const rows = await request(`/produto?id=eq.${encodeURIComponent(id)}&select=*`);
  return rows?.[0] || null;
}

export async function listProductsBySellerEmail(email) {
  return callSupabaseFunction("quex_list_products", { p_email: email });
}

export async function toggleProduct(id, email, active) {
  return callSupabaseFunction("quex_toggle_product", { p_id: Number(id), p_email: email, p_ativo: active });
}

export async function removeProduct(id, email) {
  return callSupabaseFunction("quex_delete_product", { p_id: Number(id), p_email: email });
}

export async function deleteProduct(id) {
  return request(`/produto?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function updateProductDirect(id, payload) {
  return request(`/produto?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  });
}
