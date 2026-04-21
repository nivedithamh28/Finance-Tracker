import { useEffect, useMemo, useState, useCallback } from 'react';
import { createBudget, deleteBudget, getBudgetForMonth, getCurrentBudget, updateBudget, getAllBudgets } from '../api/budgets';
import { getUserIdFromToken } from '../api/transactions';
import './Budget.css';

/* ── Helpers ── */
const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(n ?? 0));
const fmtPct = (n) => `${Number(n ?? 0).toFixed(1)}%`;
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const now = new Date();
const CY = now.getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CY - i);

/* ── Status config ── */
const STATUS_CFG = {
  SAFE: { label: 'Safe', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', emoji: '✅' },
  WARNING: { label: 'Warning', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', emoji: '⚠️' },
  EXCEEDED: { label: 'Exceeded', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', emoji: '🚨' },
};
const getCfg = (s) => STATUS_CFG[s] || { label: '—', color: '#607a94', bg: 'transparent', border: 'rgba(255,255,255,0.07)', emoji: '💰' };

/* ── SVG progress ring ── */
function ProgressRing({ pct, status, size = 140 }) {
  const cfg = getCfg(status);
  const r = size === 140 ? 54 : 38;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  const cx = size / 2, cy = size / 2;
  const strokeW = size === 140 ? 8 : 6;
  return (
    <svg className="budget-ring" viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      <circle cx={cx} cy={cy} r={r} className="ring-track" strokeWidth={strokeW} />
      <circle cx={cx} cy={cy} r={r} className="ring-fill"
        strokeWidth={strokeW}
        style={{ stroke: cfg.color, strokeDasharray: `${dash} ${circ}` }} />
      <text x={cx} y={cy - 5} textAnchor="middle" className="ring-pct"
        style={{ fill: cfg.color, fontSize: size === 140 ? 11 : 8 }}>
        {fmtPct(pct)}
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" className="ring-label"
        style={{ fontSize: size === 140 ? 5.5 : 4 }}>used</text>
    </svg>
  );
}

/* ── Month Budget Card (history grid) ── */
function BudgetHistoryCard({ b, onSelect }) {
  const cfg = getCfg(b.status);
  const pct = Number(b.usedPercentage ?? 0);
  return (
    <div className="hist-card" style={{ borderColor: cfg.border }}
      onClick={() => onSelect(b)} title="Click to manage this month">
      <div className="hist-card-top">
        <div className="hist-month">{MONTH_SHORT[b.month - 1]} {b.year}</div>
        <span className="hist-pill" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>
      <ProgressRing pct={pct} status={b.status} size={80} />
      <div className="hist-stats">
        <div className="hist-stat">
          <span className="hs-label">Limit</span>
          <span className="hs-val">₹{fmt(b.amount)}</span>
        </div>
        <div className="hist-stat">
          <span className="hs-label">Spent</span>
          <span className="hs-val" style={{ color: '#f87171' }}>₹{fmt(b.totalExpense)}</span>
        </div>
        <div className="hist-stat">
          <span className="hs-label">Left</span>
          <span className="hs-val" style={{ color: Number(b.remaining) < 0 ? '#ef4444' : '#10b981' }}>
            ₹{fmt(b.remaining)}
          </span>
        </div>
      </div>
      <div className="hist-bar-track">
        <div className="hist-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: cfg.color }} />
      </div>
    </div>
  );
}

export default function Budget() {
  const userId = useMemo(() => getUserIdFromToken(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(CY);
  const [selected, setSelected] = useState(null);   // budget being managed
  const [allBudgets, setAllBudgets] = useState([]);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);

  /* Load: current month + all budgets */
  const loadAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true); setError('');
    try {
      const [allRes, curRes] = await Promise.allSettled([
        getAllBudgets(userId),
        getCurrentBudget(userId),
      ]);
      if (allRes.status === 'fulfilled') setAllBudgets(allRes.value.data);
      if (curRes.status === 'fulfilled') {
        setCurrentBudget(curRes.value.data);
        setSelected(curRes.value.data);
        setMonth(curRes.value.data.month);
        setYear(curRes.value.data.year);
        setAmountInput(String(curRes.value.data.amount));
      } else {
        setSelected(null); setAmountInput('');
      }
    } catch { setError('Failed to load budgets.'); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* Select a month from the history grid */
  const handleSelectCard = (b) => {
    setSelected(b);
    setMonth(b.month);
    setYear(b.year);
    setAmountInput(String(b.amount));
    setEditMode(false); setDelConfirm(false); setError('');
  };

  /* View unset month via picker */
  const handleView = async () => {
    if (!userId) return;
    setSaving(true); setError('');
    try {
      const res = await getBudgetForMonth(userId, month, year);
      setSelected(res.data);
      setAmountInput(String(res.data.amount));
      setEditMode(false); setDelConfirm(false);
    } catch (e) {
      if (e?.response?.status === 404) {
        setSelected(null); setAmountInput('');
        setError(`No budget set for ${MONTH_NAMES[month - 1]} ${year}.`);
      } else setError('Failed to load.');
    } finally { setSaving(false); }
  };

  const handleSave = async () => {
    if (!amountInput || parseFloat(amountInput) <= 0) { setError('Enter a valid positive amount.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { userId, month, year, amount: parseFloat(amountInput) };
      const res = selected?.id ? await updateBudget(selected.id, payload) : await createBudget(payload);
      setSelected(res.data);
      setAmountInput(String(res.data.amount));
      setEditMode(false);
      await loadAll(); // refresh history
    } catch (e) { setError(e?.response?.data?.message || 'Failed to save budget.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected?.id) return;
    setSaving(true); setError('');
    try {
      await deleteBudget(selected.id);
      setSelected(null); setAmountInput('');
      setDelConfirm(false);
      await loadAll();
    } catch { setError('Failed to delete budget.'); }
    finally { setSaving(false); }
  };

  const cfg = getCfg(selected?.status);
  const pct = Number(selected?.usedPercentage ?? 0);
  const selectedLabel = `${MONTH_NAMES[(month || 1) - 1]} ${year}`;

  return (
    <div className="budget-page">
      {/* ── Header ── */}
      <div className="budget-topbar">
        <div>
          <h1 className="budget-h1">Budget</h1>
          <p className="budget-sub">Set limits. Track spending. Stay in control.</p>
        </div>
        <div className="budget-topbar-right">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} disabled={saving}>
            {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} disabled={saving}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="mp-view-btn" onClick={handleView} disabled={saving || loading}>View</button>
        </div>
      </div>

      {error && <div className="budget-alert">{error}</div>}

      {loading ? (
        <div className="budget-loader-wrap"><span className="budget-spinner" /></div>
      ) : (
        <div className="budget-body">
          {/* ══ TOP SECTION: Selected month detail + Edit form ══ */}
          <div className="budget-two-col">
            {/* Left: Hero status */}
            <div className="hero-card" style={{ borderColor: cfg.border }}>
              <div className="hero-month-label">{selectedLabel}</div>

              {selected ? (
                <div className="hero-content">
                  <ProgressRing pct={pct} status={selected.status} size={140} />
                  <div className="hero-right">
                    <div className="status-pill"
                      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
                      {cfg.emoji} {cfg.label}
                    </div>
                    <div className="hero-metrics">
                      <div className="hm-item">
                        <span className="hm-label">Limit</span>
                        <span className="hm-value">₹{fmt(selected.amount)}</span>
                      </div>
                      <div className="hm-item">
                        <span className="hm-label">Expenses</span>
                        <span className="hm-value spent">₹{fmt(selected.totalExpense)}</span>
                      </div>
                      <div className="hm-item">
                        <span className="hm-label">Remaining</span>
                        <span className="hm-value" style={{ color: Number(selected.remaining) < 0 ? '#ef4444' : '#10b981' }}>
                          ₹{fmt(selected.remaining)}
                        </span>
                      </div>
                      <div className="hm-item">
                        <span className="hm-label">Used</span>
                        <span className="hm-value" style={{ color: cfg.color }}>{fmtPct(pct)}</span>
                      </div>
                    </div>
                    <div className="hero-bar-track">
                      <div className="hero-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: cfg.color }} />
                    </div>
                    <div className="bar-legend">
                      <span style={{ color: '#10b981' }}>✅ &lt; 80%</span>
                      <span style={{ color: '#f59e0b' }}>⚠️ ≥ 80%</span>
                      <span style={{ color: '#ef4444' }}>🚨 &gt; 100%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hero-empty">
                  <div className="empty-icon">💸</div>
                  <div className="empty-text">No budget for {selectedLabel}</div>
                  <div className="empty-hint">Use the form on the right to set one.</div>
                </div>
              )}
            </div>

            {/* Right: Manage form */}
            <div className="budget-form-card">
              <div className="form-card-header">
                <h2>{selected ? 'Manage Budget' : `Set Budget`}</h2>
                {selected && !editMode && (
                  <button className="link-btn" onClick={() => setEditMode(true)}>Edit amount</button>
                )}
              </div>

              <div className="form-stack">
                <div className="fgroup">
                  <label>Month</label>
                  <select value={month} onChange={e => setMonth(Number(e.target.value))} disabled={saving}>
                    {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div className="fgroup">
                  <label>Year</label>
                  <select value={year} onChange={e => setYear(Number(e.target.value))} disabled={saving}>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="fgroup">
                  <label>Budget Limit (₹)</label>
                  <div className="amount-input-wrap">
                    <span className="amount-prefix">₹</span>
                    <input type="number" min="1" step="1" placeholder="e.g. 30000"
                      value={amountInput}
                      onChange={e => setAmountInput(e.target.value)}
                      disabled={saving || (selected && !editMode)} />
                  </div>
                </div>
              </div>

              <div className="form-btns">
                {(!selected || editMode) && (
                  <button className="btn-primary" onClick={handleSave}
                    disabled={saving || !amountInput || parseFloat(amountInput) <= 0}>
                    {saving ? 'Saving…' : selected ? 'Update Budget' : 'Set Budget'}
                  </button>
                )}
                {editMode && (
                  <button className="btn-ghost" onClick={() => { setEditMode(false); setAmountInput(String(selected?.amount ?? '')); }}>
                    Cancel
                  </button>
                )}
                {selected && !editMode && !delConfirm && (
                  <button className="btn-danger-ghost" onClick={() => setDelConfirm(true)}>Delete</button>
                )}
                {delConfirm && (
                  <>
                    <button className="btn-danger" onClick={handleDelete} disabled={saving}>
                      {saving ? 'Deleting…' : 'Confirm Delete'}
                    </button>
                    <button className="btn-ghost" onClick={() => setDelConfirm(false)}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ══ BOTTOM SECTION: All months grid ══ */}
          <div className="history-section">
            <div className="history-header">
              <h2 className="history-title">All Budgets — History</h2>
              <span className="history-count">{allBudgets.length} month{allBudgets.length !== 1 ? 's' : ''} set</span>
            </div>

            {allBudgets.length === 0 ? (
              <div className="history-empty">
                No budgets set yet. Start by setting a budget for this month!
              </div>
            ) : (
              <div className="history-grid">
                {allBudgets.map(b => (
                  <BudgetHistoryCard key={b.id} b={b} onSelect={handleSelectCard} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
