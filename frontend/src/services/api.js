function deriveApiBase() {
  const env = (import.meta.env?.VITE_API_URL || '').trim();
  if (env) return env.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;
    // Local dev defaults
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.localhost')
    ) {
      return 'http://localhost:8000';
    }
    // Derive api.<apex> based on current host, keep same scheme (avoid mixed content)
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const apex = parts.slice(-2).join('.');
      return `${protocol}//api.${apex}`.replace(/\/$/, '');
    }
  }
  return 'http://localhost:8000';
}

const BASE = deriveApiBase();
export const API_BASE = BASE;
export const API_V1 = `${BASE}/api/v1`;
export const PUBLIC_KEY = (import.meta.env?.VITE_PUBLIC_KEY || '').trim();

// HTTP wrapper with consistent error handling and Authorization support
export async function apiFetch(path, { method = 'GET', token, headers = {}, body } = {}) {
  const url = path.startsWith('http') ? path : `${API_V1}${path.startsWith('/') ? path : `/${path}`}`;
  const init = { method, headers: { ...headers } };

  if (token) init.headers.Authorization = `Bearer ${token}`;

  if (body !== undefined) {
    if (body instanceof URLSearchParams || body instanceof FormData || typeof body === 'string') {
      init.body = body;
    } else {
      init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/json';
      init.body = JSON.stringify(body);
    }
  }

  const res = await fetch(url, init);
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;
  if (!res.ok) {
    const message = data?.detail || data?.message || `${res.status} ${res.statusText}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function login(email, password) {
  const body = new URLSearchParams({ username: email, password });
  return apiFetch('/login/access-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  }); // { access_token, token_type }
}

export async function testToken(token) {
  return apiFetch('/login/test-token', { method: 'POST', token }); // UserPublic
}

// Admin: listar inscrições (requer superusuário)
export async function listInscricoes(token) {
  return apiFetch('/inscricoes', { method: 'GET', token }); // { data: InscricaoPublic[], count: number }
}

export async function listRifas(token) {
  return apiFetch('/rifas', { method: 'GET', token }); // { data: InscricaoPublic[], count: number }
}

// Contato: enviar mensagem de contato pública
export async function sendContato({ nome, email, mensagem }) {
  return apiFetch('/contatos', {
    method: 'POST',
    body: { nome, email, mensagem },
  }); // expected: { id, detail? }
}

// Admin/Infra: listar contatos recebidos
export async function listContatos(token) {
  return apiFetch('/contatos', { method: 'GET', token }); // { data: ContatoPublic[], count: number }
}

// Rifa: criar checkout/pedido de pagamento
export async function checkoutRifa({ nome, email, valor, quantidade = 1 }) {
  const headers = {};
  if (PUBLIC_KEY) headers['X-Public-Key'] = PUBLIC_KEY;
  return apiFetch('/rifas/checkout', {
    method: 'POST',
    headers,
    body: { nome, email, valor, quantidade },
  }); // expected: { payment_url? , status? }
}

// Rifa: consultar status do pagamento por id (flexível por query param)
export async function getRifaStatus(id) {
  const qs = new URLSearchParams({ id: String(id) });
  return apiFetch(`/rifas/status?${qs.toString()}`, { method: 'GET' });
}

// Infra: marcar contato como respondido
export async function responderContato(token, id, resposta = 'Respondido pelo painel') {
  return apiFetch(`/contatos/${id}/responder`, {
    method: 'PATCH',
    token,
    body: { resposta },
  }); // ContatoPublic
}

// Let's Coffe: produtos
export async function listProdutos(token) {
  return apiFetch('/letscoffe/produtos', { method: 'GET', token }); // { data: ProdutoPublic[], count }
}

export async function createProduto(token, { nome, quantidade, preco, descricao, foto }) {
  return apiFetch('/letscoffe/produtos', {
    method: 'POST',
    token,
    body: { nome, quantidade, preco, descricao, foto },
  }); // ProdutoPublic
}

export async function updateProduto(token, id, body) {
  return apiFetch(`/letscoffe/produtos/${id}`, {
    method: 'PATCH',
    token,
    body,
  }); // ProdutoPublic
}

export async function deleteProduto(token, id) {
  return apiFetch(`/letscoffe/produtos/${id}`, { method: 'DELETE', token });
}
