import React, { useEffect, useRef, useState } from 'react';
import styles from './checkout.module.css';
import { useNavigate } from 'react-router-dom';
import { checkoutRifa, getRifaStatus } from '../../../../services/api';
import { openMercadoPagoCheckout } from '../../../../services/mp';

export function Checkout() {
  const maxQuantity = 100;
  const pricePerTicket = 4.99;

  const [quantity, setQuantity] = useState(1);
  const [nome, setNome] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '', paymentUrl: '' });
  const [paymentInfo, setPaymentInfo] = useState({ provider: '', paymentUrl: '', qrSrc: '', pixCode: '', expiresAt: '', orderId: '' });
  const [copied, setCopied] = useState(false);
  const [paymentState, setPaymentState] = useState({ code: '', label: '' });
  const pollRef = useRef(null);

  useEffect(() => () => { if (pollRef.current) { clearTimeout(pollRef.current); pollRef.current = null; } }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  };

  const schedulePoll = (id, untilTs = Date.now() + 5 * 60_000) => {
    if (!id) return;
    const doPoll = async () => {
      try {
        const res = await getRifaStatus(id);
        const status = (res?.status || res?.payment_status || res?.state || '').toLowerCase();
        if (['paid', 'approved', 'completed', 'settled', 'succeeded', 'success'].includes(status)) {
          setPaymentState({ code: 'paid', label: 'Pagamento confirmado ✔' });
          setStatus({ type: 'success', text: 'Pagamento aprovado! Obrigado por participar.' });
          stopPolling();
          return;
        }
        if (['expired', 'canceled', 'cancelled', 'failed', 'rejected', 'error'].includes(status)) {
          setPaymentState({ code: 'failed', label: 'Pagamento não aprovado' });
          setStatus({ type: 'error', text: res?.detail || 'Pagamento não aprovado. Tente novamente.' });
          stopPolling();
          return;
        }
        // pending or unknown
        setPaymentState({ code: 'pending', label: 'Aguardando pagamento...' });
        if (Date.now() < untilTs) {
          pollRef.current = setTimeout(doPoll, 4000);
        } else {
          stopPolling();
        }
      } catch (_) {
        // tenta novamente até expirar
        if (Date.now() < untilTs) {
          pollRef.current = setTimeout(doPoll, 5000);
        } else {
          stopPolling();
        }
      }
    };
    // start now
    doPoll();
  };
  const navigate = useNavigate();

  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const increaseQuantity = () => setQuantity(prev => (prev < maxQuantity ? prev + 1 : maxQuantity));

  const handleQuantityChange = (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) value = 1;
    if (value > maxQuantity) value = maxQuantity;
    setQuantity(value);
  };

  const handlePayment = async () => {
    if (loading) return;
    setStatus({ type: '', text: '', paymentUrl: '' });
    setLoading(true);
    try {
      const payload = { nome, email, valor: Number(totalPrice), quantidade: Number(quantity) };
      const res = await checkoutRifa(payload);

      const provider = res?.provider || res?.gateway || '';
      const paymentUrl = res?.payment_url || res?.init_point || res?.url || '';
      const expiresAt = res?.expires_at || res?.expiration || '';

      let qrSrc = '';
      let pixCode = '';

      const rawQr = res?.qr_code_base64 || res?.qr_code || '';
      if (rawQr) {
        qrSrc = rawQr.startsWith('data:image') ? rawQr : `data:image/png;base64,${rawQr}`;
      }
      pixCode = res?.copy_and_paste || res?.pix_code || res?.copia_cola || res?.pixCopiaCola || '';

      const orderId = res?.order_id || res?.id || res?.payment_id || res?.preference_id || res?.transaction_id || res?.reference || '';
      setPaymentInfo({ provider, paymentUrl, qrSrc, pixCode, expiresAt, orderId });

      if (paymentUrl && !qrSrc && !pixCode) {
        setStatus({ type: 'success', text: 'Redirecionando para o pagamento...', paymentUrl });
        window.open(paymentUrl, '_blank');
      } else if (!paymentUrl && !qrSrc && !pixCode && res?.preference_id) {
        const opened = await openMercadoPagoCheckout(res.preference_id);
        if (opened) {
          setStatus({ type: 'success', text: 'Abrindo checkout do Mercado Pago...' });
          if (orderId) schedulePoll(orderId);
        } else {
          setStatus({ type: 'error', text: 'Não foi possível abrir o checkout. Tente pelo link se disponível.' });
        }
      } else if (pixCode || qrSrc) {
        setStatus({ type: 'success', text: 'Pedido criado. Pague usando o QR Code ou o código abaixo.' });
        if (orderId) schedulePoll(orderId);
      } else {
        setStatus({ type: 'success', text: res?.detail || 'Pedido criado com sucesso. Verifique seu email.' });
        if (orderId) schedulePoll(orderId);
      }
    } catch (err) {
      setStatus({ type: 'error', text: err?.message || 'Falha ao iniciar pagamento. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/rifa');
  };

  const totalPrice = (quantity * pricePerTicket).toFixed(2);

  return (
    <main className={styles.checkoutPage}>
      <section className={styles.checkoutSection}>
        <div className={styles.container}>
          <h1 className={styles.title}>Finalizar Compra</h1>
          <div className={styles.checkoutContent}>
            <form className={styles.checkoutForm} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Nome Completo *</label>
                <input type="text" id="name" className={styles.input} placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="tel" className={styles.label}>Número de Telefone *</label>
                <input type="tel" id="tel" className={styles.input} placeholder="Seu número" value={tel} onChange={(e) => setTel(e.target.value)} required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email *</label>
                <input type="email" id="email" className={styles.input} placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className={styles.quantityPicker}>
                <span className={styles.quantityLabel}>Quantidade:</span>
                <div className={styles.quantityControls}>
                  <button type="button" className={styles.quantityBtn} onClick={decreaseQuantity}>-</button>
                  <input
                    type="number"
                    className={styles.quantityInput}
                    value={quantity}
                    min="1"
                    max={maxQuantity}
                    onChange={handleQuantityChange}
                  />
                  <button type="button" className={styles.quantityBtn} onClick={increaseQuantity}>+</button>
                </div>
              </div>

              <div className={styles.total}>
                Total: <span className={styles.totalPrice}>R${totalPrice}</span>
              </div>

              <div className={styles.actionButtons}>
                <button type="button" className={styles.primaryButton} onClick={handlePayment} disabled={loading}>
                  {loading ? 'Processando...' : 'Pagar Agora'}
                </button>
                <button type="button" className={`${styles.primaryButton} ${styles.backButton}`} onClick={handleBack}>
                  Voltar
                </button>
                {status.text && (
                  <div className={`${styles.statusMessage} ${status.type === 'success' ? styles.success : styles.error}`}>
                    {status.text}
                  </div>
                )}
              </div>

              {(paymentInfo.qrSrc || paymentInfo.pixCode || paymentInfo.paymentUrl) && (
                <div className={styles.paymentBox}>
                  {paymentInfo.provider && (
                    <div className={styles.providerTag}>Gateway: {paymentInfo.provider}</div>
                  )}
                  {paymentInfo.qrSrc && (
                    <div className={styles.qrWrap}>
                      <img src={paymentInfo.qrSrc} alt="QR Code para pagamento" className={styles.qrImage} />
                    </div>
                  )}
                  {paymentInfo.pixCode && (
                    <div className={styles.pixBox}>
                      <label className={styles.label}>Código Pix (copia e cola)</label>
                      <textarea
                        className={`${styles.input} ${styles.pixTextarea}`}
                        readOnly
                        value={paymentInfo.pixCode}
                        rows={4}
                      />
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(paymentInfo.pixCode);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                          } catch (_) {}
                        }}
                      >
                        {copied ? 'Copiado!' : 'Copiar código Pix'}
                      </button>
                    </div>
                  )}
                  {paymentInfo.paymentUrl && (
                    <div className={styles.paymentLinkBox}>
                      <a href={paymentInfo.paymentUrl} target="_blank" rel="noreferrer" className={styles.primaryButton}>
                        Abrir Checkout
                      </a>
                    </div>
                  )}
                  {paymentInfo.expiresAt && (
                    <div className={styles.expiresNote}>Expira em: {new Date(paymentInfo.expiresAt).toLocaleString()}</div>
                  )}
                  {paymentState.label && (
                    <div className={`${styles.statusBadge} ${paymentState.code === 'paid' ? styles.badgePaid : paymentState.code === 'failed' ? styles.badgeFailed : styles.badgePending}`}>
                      {paymentState.label}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
