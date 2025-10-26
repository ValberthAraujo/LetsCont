import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../styles/admin.module.css';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { listRifas, listProdutos, createProduto, updateProduto, deleteProduto } from '../../../../services/api.js';

export function PanelLetsCoffe() {
  const { token, user } = useAuth();
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [produtosError, setProdutosError] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ nome: '', quantidade: 1, preco: '', descricao: '' });
  const [showForm, setShowForm] = useState(false);
  const [dzActive, setDzActive] = useState(false);
  const descMax = 240;
  const [rifas, setRifas] = useState([]);
  const [loadingRifas, setLoadingRifas] = useState(false);
  const [rifasError, setRifasError] = useState('');
  const nameInputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!showForm) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowForm(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showForm]);

  useEffect(() => {
    if (showForm && nameInputRef.current) {
      try { nameInputRef.current.focus(); } catch {}
    }
  }, [showForm]);

  // Trap focus inside modal and disable background scroll while open
  useEffect(() => {
    if (!showForm) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const getFocusable = () => {
      if (!modalRef.current) return [];
      return Array.from(
        modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'));
    };
    const handleTabTrap = (e) => {
      if (e.key !== 'Tab') return;
      const nodes = getFocusable();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleTabTrap, true);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleTabTrap, true);
    };
  }, [showForm]);

  // Load raffle orders to compute revenue
  useEffect(() => {
    let active = true;
    const ac = new AbortController();
    async function run() {
      if (!token) return;
      setLoadingRifas(true);
      setRifasError('');
      try {
        const data = await listRifas(token, { signal: ac.signal });
        if (!active) return;
        const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setRifas(arr);
      } catch (err) {
        if (!active || err?.name === 'AbortError') return;
        setRifasError(err?.message || 'Falha ao carregar receitas das rifas');
      } finally {
        if (active) setLoadingRifas(false);
      }
    }
    run();
    return () => { active = false; ac.abort(); };
  }, [token]);

  const precoNumber = useMemo(() => {
    const n = Number(String(preco).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }, [preco]);

  // Carregar produtos do backend
  useEffect(() => {
    let active = true;
    const ac = new AbortController();
    async function run() {
      if (!token) return;
      setLoadingProdutos(true);
      setProdutosError('');
      try {
        const data = await listProdutos(token, { signal: ac.signal });
        if (!active) return;
        const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setProdutos(arr);
      } catch (err) {
        if (!active || err?.name === 'AbortError') return;
        setProdutosError(err?.message || 'Falha ao carregar produtos');
      } finally {
        if (active) setLoadingProdutos(false);
      }
    }
    run();
    return () => { active = false; ac.abort(); };
  }, [token]);

  const loadFile = (file) => {
    setPhotoFile(file || null);
    if (!file) { setPhotoPreview(''); return; }
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    loadFile(file);
  };

  const handleAdd = async () => {
    setError('');
    if (!nome.trim()) {
      setError('Informe o nome do produto');
      return;
    }
    if (!precoNumber || precoNumber <= 0) {
      setError('Informe um preço válido');
      return;
    }
    if (!quantidade || quantidade <= 0) {
      setError('Informe uma quantidade válida');
      return;
    }
    try {
      const created = await createProduto(token, {
        nome: nome.trim(),
        quantidade: Number(quantidade),
        preco: Number(precoNumber),
        foto: photoPreview || null,
        descricao: (descricao || '').trim() || null,
      });
      setProdutos((prev) => [created, ...prev]);
    } catch (err) {
      setError(err?.message || 'Falha ao criar produto');
      return;
    }
    // limpa form
    setNome('');
    setQuantidade(1);
    setPreco('');
    setDescricao('');
    setPhotoFile(null);
    setPhotoPreview('');
    setShowForm(false);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraft({ nome: item.nome, quantidade: item.quantidade, preco: String(Number(item.preco || 0).toFixed(2)), descricao: item.descricao || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ nome: '', quantidade: 1, preco: '', descricao: '' });
  };

  const saveEdit = async (id) => {
    const q = Number(draft.quantidade);
    const p = Number(String(draft.preco).replace(',', '.'));
    if (!draft.nome.trim() || !q || q <= 0 || !p || p <= 0) return;
    try {
      const updated = await updateProduto(token, id, { nome: draft.nome.trim(), quantidade: q, preco: p, descricao: (draft.descricao || '').trim() });
      setProdutos((prev) => prev.map((x) => (x.id === id ? updated : x)));
    } catch (err) {
      setError(err?.message || 'Falha ao salvar alterações');
      return;
    }
    cancelEdit();
  };

  const deleteItem = async (id) => {
    try {
      await deleteProduto(token, id);
      setProdutos((prev) => prev.filter((x) => x.id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      setError(err?.message || 'Falha ao deletar produto');
    }
  };

  const paidStatuses = new Set(['paid','approved','completed','settled','succeeded','success']);
  const receitaRifas = useMemo(() => (
    rifas.reduce((acc, p) => acc + (paidStatuses.has(String(p?.status || '').toLowerCase()) ? Number(p?.valor || 0) : 0), 0)
  ), [rifas]);
  const gastosLets = useMemo(() => (
    produtos.reduce((acc, i) => acc + Number(i?.preco || 0) * Number(i?.quantidade || 0), 0)
  ), [produtos]);
  const resultadoLiquido = useMemo(() => receitaRifas - gastosLets, [receitaRifas, gastosLets]);
  const money = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className={styles.loginCard}>
      <h2>Painel LetsCoffe</h2>
      <p>Cadastre itens com foto, nome, quantidade e preço.</p>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Receita de Rifas {loadingRifas ? '(carregando...)' : ''}</div>
          <div className={`${styles.statValue} ${styles.statPositive}`}>{money(receitaRifas)}</div>
          {rifasError && <div className={styles.error}>{rifasError}</div>}
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Gastos Let's Coffe</div>
          <div className={`${styles.statValue} ${styles.statNegative}`}>{money(gastosLets)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Resultado Líquido</div>
          <div className={styles.statValue} style={{ color: resultadoLiquido >= 0 ? 'var(--color-success)' : 'var(--detail-color)' }}>{money(resultadoLiquido)}</div>
        </div>
      </div>

      {!showForm && (
        <div className={styles.cardActions} style={{ marginBottom: '0.75rem' }}>
          <div className={styles.btnRow}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowForm(true)}>
              Adicionar produto
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.currentTarget === e.target) setShowForm(false); }}
        >
          <div ref={modalRef} className={`${styles.modalContent} ${styles.formCard}`} aria-labelledby="letscoffe-modal-title">
            <div className={styles.modalHeader}>
              <div id="letscoffe-modal-title" className={styles.modalTitle}>Adicionar produto</div>
              <button type="button" className={styles.closeBtn} aria-label="Fechar" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className={styles.formGrid}>
              <div>
                <div
                  className={`${styles.dropzone} ${dzActive ? styles.dropActive : ''}`}
                  onClick={() => document.getElementById('letscoffe-upload')?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDzActive(true); }}
                  onDragEnter={() => setDzActive(true)}
                  onDragLeave={() => setDzActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDzActive(false);
                    const file = e.dataTransfer?.files?.[0];
                    if (file) loadFile(file);
                  }}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Pré-visualização" className={styles.previewImage} />
                  ) : (
                    <div className={styles.dropLabel}>Clique ou arraste a foto do produto</div>
                  )}
                </div>
                <input id="letscoffe-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                {photoPreview && (
                  <div className={styles.helpText}>
                    <button type="button" className={styles.btn} onClick={() => { setPhotoPreview(''); setPhotoFile(null); }}>Remover foto</button>
                  </div>
                )}
              </div>

              <div>
                <div className={styles.formGroup}>
                  <label>Nome do Produto</label>
                <input ref={nameInputRef} type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Café Coado" />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.formGroup}>
                    <label>Quantidade</label>
                    <input type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value || 1)))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Preço (R$)</label>
                    <input type="text" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="Ex.: 9,90" onBlur={(e) => { const n = Number(String(e.target.value).replace(',', '.')); if (Number.isFinite(n) && n > 0) setPreco(n.toFixed(2).replace('.', ',')); }} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Descrição do Produto</label>
                  <textarea rows={3} value={descricao} maxLength={descMax} onChange={(e) => setDescricao(e.target.value)} placeholder="Breve descrição (ex.: ingredientes, tamanho, observações)" />
                  <div className={styles.counter}>{descricao.length}/{descMax}</div>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.formActions}>
                  <button type="button" className={styles.btn} onClick={() => { setShowForm(false); setError(''); }}>Cancelar</button>
                  <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAdd}>Adicionar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {produtosError && <div className={styles.error}>{produtosError}</div>}
      {loadingProdutos && <div className={styles.muted}>Carregando produtos...</div>}
      {produtos.length > 0 && (
        <div className={styles.cardsGrid}>
          {produtos.map((i) => (
            <div key={i.id} className={styles.cardItem}>
              <div
                className={styles.cardImage}
                onClick={() => {
                  const input = document.getElementById(`foto-${i.id}`);
                  if (input) input.click();
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const input = document.getElementById(`foto-${i.id}`);
                    if (input) input.click();
                    e.preventDefault();
                  }
                }}
                aria-label="Alterar foto do produto"
                title="Clique para alterar a foto"
              >
                {i.foto ? (
                  <img src={i.foto} alt={i.nome || 'Foto do produto'} />
                ) : (
                  <span className={styles.muted}>Thumbnail</span>
                )}
                <input
                  id={`foto-${i.id}`}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = String(reader.result || '');
                      (async () => {
                        try {
                          const updated = await updateProduto(token, i.id, { foto: dataUrl });
                          setProdutos((prev) => prev.map((x) => (x.id === i.id ? updated : x)));
                        } catch (err) {
                          setError(err?.message || 'Falha ao atualizar foto');
                        }
                      })();
                    };
                    reader.readAsDataURL(file);
                    // limpa para poder reenviar o mesmo arquivo depois
                    e.target.value = '';
                  }}
                />
              </div>
              <div className={styles.cardBody}>
                {editingId === i.id ? (
                  <>
                    <input className={styles.inputInline} value={draft.nome} onChange={(e) => setDraft((d) => ({ ...d, nome: e.target.value }))} placeholder="Nome do produto" />
                    <input className={styles.inputInline} type="number" min="1" value={draft.quantidade} onChange={(e) => setDraft((d) => ({ ...d, quantidade: Math.max(1, Number(e.target.value || 1)) }))} placeholder="Quantidade" />
                    <input className={styles.inputInline} value={draft.preco} onChange={(e) => setDraft((d) => ({ ...d, preco: e.target.value }))} placeholder="Preço (R$)" />
                    <textarea className={styles.inputInline} rows={3} value={draft.descricao} onChange={(e) => setDraft((d) => ({ ...d, descricao: e.target.value }))} placeholder="Descrição do produto" />
                  </>
                ) : (
                  <>
                    <div className={styles.cardTitle}>{i.nome}</div>
                    <div className={styles.muted}>{i.descricao || '—'}</div>
                    <div><strong>Quantidade:</strong> {i.quantidade} &nbsp;•&nbsp; <strong>Preço:</strong> R$ {Number(i.preco || 0).toFixed(2)} &nbsp;•&nbsp; <strong>Total:</strong> R$ {(Number(i.preco || 0) * Number(i.quantidade || 0)).toFixed(2)}</div>
                  </>
                )}
                <div className={styles.cardActions}>
                  <div className={styles.btnRow}>
                    {editingId === i.id ? (
                      <>
                        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => saveEdit(i.id)}>Salvar</button>
                        <button type="button" className={styles.btn} onClick={cancelEdit}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles.btn}
                          onClick={() => deleteItem(i.id)}
                        >
                          Deletar
                        </button>
                        <button type="button" className={styles.btn} onClick={() => startEdit(i)}>Editar</button>
                      </>
                    )}
                  </div>
                  <div className={styles.time}>{i.updated_at ? new Date(i.updated_at).toLocaleTimeString() : ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PanelLetsCoffe;
