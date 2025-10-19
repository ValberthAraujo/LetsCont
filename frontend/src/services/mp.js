// Lightweight loader + opener for Mercado Pago Checkout (JS v2)
// Uses a public key only (PK- or TEST-). Never use access tokens (APP_USR-).

const SDK_URL = 'https://sdk.mercadopago.com/js/v2';

function isPublicKey(key) {
  return typeof key === 'string' && (key.startsWith('PK-') || key.startsWith('TEST-'));
}

export const MP_PUBLIC_KEY = (import.meta.env?.VITE_MP_PUBLIC_KEY || import.meta.env?.VITE_MERCADOPAGO_PUBLIC_KEY || import.meta.env?.VITE_PUBLIC_KEY || '').trim();

let loading;
export function loadMercadoPago() {
  if (typeof window !== 'undefined' && window.MercadoPago) return Promise.resolve(window.MercadoPago);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      script.onload = () => resolve(window.MercadoPago);
      script.onerror = () => reject(new Error('Falha ao carregar SDK do Mercado Pago'));
      document.head.appendChild(script);
    } catch (e) {
      reject(e);
    }
  });
  return loading;
}

export async function openMercadoPagoCheckout(preferenceId, { locale = 'pt-BR' } = {}) {
  const key = MP_PUBLIC_KEY;
  if (!preferenceId || !isPublicKey(key)) return false;
  try {
    await loadMercadoPago();
    const mp = new window.MercadoPago(key, { locale });
    mp.checkout({ preference: { id: preferenceId }, autoOpen: true });
    return true;
  } catch (_) {
    return false;
  }
}

