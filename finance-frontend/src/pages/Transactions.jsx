import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactionsByUser, deleteTransaction, getUserIdFromToken } from '../api/transactions';
import { getCategoryLabel, getPaymentLabel, EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../api/categories';
import AddTransactionModal from './AddTransactionModal';
import './transactions.css';

/* ── Icons ── */
function PlusIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
function EditIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
function TrashIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></svg>; }
function EyeIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>; }
function UpIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>; }
function DownIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>; }
function BalanceIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>; }
function SearchIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>; }
function FilterIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>; }
function SortIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>; }
function XIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
function ChevLeft() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>; }
function ChevRight() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>; }
function ChevDown() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>; }

const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
const fmtAmt = (n) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n);

const MONTHS = [
    { value: '', label: 'All Months' },
    ...[['1', 'January'], ['2', 'February'], ['3', 'March'], ['4', 'April'], ['5', 'May'], ['6', 'June'],
    ['7', 'July'], ['8', 'August'], ['9', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December']]
        .map(([v, l]) => ({ value: v, label: l })),
];
const CY = new Date().getFullYear();
const YEARS = [{ value: '', label: 'All Years' }, ...Array.from({ length: 6 }, (_, i) => ({ value: String(CY - i), label: String(CY - i) }))];
const SORT_OPTIONS = [
    { sortBy: 'transactionDate', sortDir: 'desc', label: '📅 Newest First' },
    { sortBy: 'transactionDate', sortDir: 'asc', label: '📅 Oldest First' },
    { sortBy: 'amount', sortDir: 'desc', label: '💰 Highest Amount' },
    { sortBy: 'amount', sortDir: 'asc', label: '💰 Lowest Amount' },
];
const PAGE_SIZES = [5, 10, 20, 50];
const INITIAL = { type: '', category: '', paymentMethod: '', month: '', year: '', startDate: '', endDate: '', search: '', sortBy: 'transactionDate', sortDir: 'desc' };

export default function Transactions() {
    const navigate = useNavigate();
    const userId = getUserIdFromToken();

    // ── Data state ──
    const [page, setPage] = useState(null);   // PageResponseDTO from backend
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ── UI state ──
    const [showAdd, setShowAdd] = useState(false);
    const [editTx, setEditTx] = useState(null);
    const [delId, setDelId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // ── Filter + pagination state ──
    const [filters, setFilters] = useState(INITIAL);
    const [pageNum, setPageNum] = useState(0);   // 0-based
    const [pageSize, setPageSize] = useState(10);

    const searchTimer = useRef(null);

    const load = useCallback(async (f, pn, ps) => {
        if (!userId) return;
        setLoading(true); setError('');
        try {
            const params = {
                ...Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '' && v != null)),
                page: pn,
                size: ps,
            };
            const res = await getTransactionsByUser(userId, params);
            setPage(res.data);
        } catch {
            setError('Failed to load transactions. Is the backend running?');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Auto-load: debounce search, immediate otherwise
    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => load(filters, pageNum, pageSize), 500);
        return () => clearTimeout(searchTimer.current);
    }, [filters, pageNum, pageSize, load]);

    // Reset to page 0 when filters change
    const setFilter = (key, value) => {
        setFilters(prev => {
            const next = { ...prev, [key]: value };
            if (key === 'type') next.category = '';
            return next;
        });
        setPageNum(0);
    };
    const removeFilter = (key) => { setFilters(prev => ({ ...prev, [key]: INITIAL[key] })); setPageNum(0); };
    const resetAll = () => { setFilters(INITIAL); setPageNum(0); };

    // ── Pagination helpers ──
    const goTo = (n) => setPageNum(n);
    const goPrev = () => setPageNum(p => Math.max(0, p - 1));
    const goNext = () => setPageNum(p => Math.min((page?.totalPages ?? 1) - 1, p + 1));

    const handleSizeChange = (s) => { setPageSize(s); setPageNum(0); };

    // ── Active filter chips ──
    const activeChips = Object.entries(filters).filter(([k, v]) =>
        v !== '' && v != null && !['sortBy', 'sortDir', 'search'].includes(k)
    );
    const activeFiltersCount = activeChips.length + (filters.search ? 1 : 0);
    const isFiltered = activeFiltersCount > 0;

    const chipLabel = (key, value) => {
        if (key === 'type') return value;
        if (key === 'category') return getCategoryLabel(value);
        if (key === 'paymentMethod') return getPaymentLabel(value);
        if (key === 'month') return MONTHS.find(m => m.value === String(value))?.label ?? value;
        if (key === 'year') return value;
        if (key === 'startDate') return `From: ${value}`;
        if (key === 'endDate') return `To: ${value}`;
        return value;
    };

    // ── Summaries (current page) ──
    const transactions = page?.content ?? [];
    const totals = transactions.reduce((acc, t) => {
        if (t.type?.toUpperCase() === 'INCOME') acc.income += Number(t.amount);
        else acc.expense += Number(t.amount);
        return acc;
    }, { income: 0, expense: 0 });
    totals.net = totals.income - totals.expense;

    const handleDelete = async () => {
        setDeleting(true);
        try { await deleteTransaction(delId); setDelId(null); load(filters, pageNum, pageSize); }
        catch { setError('Delete failed.'); setDelId(null); }
        finally { setDeleting(false); }
    };

    const categories = filters.type === 'INCOME' ? INCOME_CATEGORIES
        : filters.type === 'EXPENSE' ? EXPENSE_CATEGORIES
            : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

    // Page number buttons to render (max 7 visible)
    const totalPages = page?.totalPages ?? 0;
    const pageButtons = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
        const arr = [];
        const start = Math.max(0, Math.min(pageNum - 2, totalPages - 5));
        const end = Math.min(totalPages - 1, start + 4);
        if (start > 0) { arr.push(0); if (start > 1) arr.push('…left'); }
        for (let i = start; i <= end; i++) arr.push(i);
        if (end < totalPages - 1) { if (end < totalPages - 2) arr.push('…right'); arr.push(totalPages - 1); }
        return arr;
    };

    const startItem = page ? pageNum * pageSize + 1 : 0;
    const endItem = page ? Math.min((pageNum + 1) * pageSize, page.totalElements) : 0;

    return (
        <>
            <div className="txlist-page">
                {/* ── Top Bar ── */}
                <div className="txlist-topbar">
                    <div className="txlist-title-block">
                        <h1>Transactions</h1>
                        <p>
                            {page ? `${startItem}–${endItem} of ${page.totalElements} record${page.totalElements !== 1 ? 's' : ''}` : '—'}
                            {isFiltered ? ' (filtered)' : ''}
                        </p>
                    </div>
                    <div className="txlist-actions">
                        {/* Search */}
                        <div className="txlist-search">
                            <span className="ti-icon"><SearchIcon /></span>
                            <input placeholder="Search by description…" value={filters.search}
                                onChange={e => setFilter('search', e.target.value)} />
                            {filters.search && (
                                <button className="search-clear-btn" onClick={() => setFilter('search', '')} title="Clear">
                                    <XIcon />
                                </button>
                            )}
                        </div>

                        {/* Filters toggle */}
                        <button className={`filter-toggle-btn ${showFilters ? 'active' : ''} ${activeFiltersCount > 0 ? 'has-active' : ''}`}
                            onClick={() => setShowFilters(v => !v)}>
                            <FilterIcon /> Filters
                            {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
                        </button>

                        {/* Sort */}
                        <div className="sort-wrap">
                            <span className="ti-icon sort-icon-prefix"><SortIcon /></span>
                            <select className="sort-select"
                                value={`${filters.sortBy}:${filters.sortDir}`}
                                onChange={e => {
                                    const [sb, sd] = e.target.value.split(':');
                                    setFilters(prev => ({ ...prev, sortBy: sb, sortDir: sd }));
                                    setPageNum(0);
                                }}>
                                {SORT_OPTIONS.map(s => (
                                    <option key={`${s.sortBy}:${s.sortDir}`} value={`${s.sortBy}:${s.sortDir}`}>{s.label}</option>
                                ))}
                            </select>
                            <span className="sel-chevron"><ChevDown /></span>
                        </div>

                        {/* Add */}
                        <button className="tb-add-btn" id="add-tx-list-btn"
                            onClick={() => { setEditTx(null); setShowAdd(true); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'linear-gradient(135deg,#00d4c8,#0096c7)', border: 'none', borderRadius: 10, color: '#060c18', fontSize: '0.855rem', fontWeight: 700, fontFamily: 'Inter,sans-serif', cursor: 'pointer', flexShrink: 0 }}>
                            <span style={{ width: 16, height: 16, display: 'flex' }}><PlusIcon /></span>
                            Add Transaction
                        </button>
                    </div>
                </div>

                {/* ── Active Filter Chips ── */}
                {(activeChips.length > 0 || filters.search) && (
                    <div className="filter-chips-bar">
                        <span className="filter-chips-label">Active:</span>
                        {filters.search && (
                            <span className="filter-chip search-chip">
                                🔍 "{filters.search}"
                                <button onClick={() => setFilter('search', '')}><XIcon /></button>
                            </span>
                        )}
                        {activeChips.map(([key, value]) => (
                            <span key={key} className="filter-chip">
                                {chipLabel(key, value)}
                                <button onClick={() => removeFilter(key)}><XIcon /></button>
                            </span>
                        ))}
                        <button className="chips-clear-all" onClick={resetAll}>Clear all</button>
                    </div>
                )}

                {/* ── Filter Panel ── */}
                {showFilters && (
                    <div className="filter-panel">
                        <div className="filter-grid">
                            <div className="filter-group">
                                <label>Type</label>
                                <div className="filter-type-btns">
                                    {[['', 'All'], ['INCOME', '↑ Income'], ['EXPENSE', '↓ Expense']].map(([v, l]) => (
                                        <button key={v}
                                            className={`ftype-btn ${v === 'INCOME' ? 'income' : v === 'EXPENSE' ? 'expense' : ''} ${filters.type === v ? 'active' : ''}`}
                                            onClick={() => setFilter('type', v)}>{l}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-group">
                                <label>Category</label>
                                <div className="filter-select-wrap">
                                    <select value={filters.category} onChange={e => setFilter('category', e.target.value)}>
                                        <option value="">All Categories</option>
                                        {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select><ChevDown />
                                </div>
                            </div>
                            <div className="filter-group">
                                <label>Payment</label>
                                <div className="filter-select-wrap">
                                    <select value={filters.paymentMethod} onChange={e => setFilter('paymentMethod', e.target.value)}>
                                        <option value="">All Methods</option>
                                        {PAYMENT_METHODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select><ChevDown />
                                </div>
                            </div>
                            <div className="filter-group">
                                <label>Month</label>
                                <div className="filter-select-wrap">
                                    <select value={filters.month} onChange={e => setFilter('month', e.target.value)}>
                                        {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select><ChevDown />
                                </div>
                            </div>
                            <div className="filter-group">
                                <label>Year</label>
                                <div className="filter-select-wrap">
                                    <select value={filters.year} onChange={e => setFilter('year', e.target.value)}>
                                        {YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                                    </select><ChevDown />
                                </div>
                            </div>
                            <div className="filter-group">
                                <label>From Date</label>
                                <input type="date" className="filter-date-input" value={filters.startDate} onChange={e => setFilter('startDate', e.target.value)} />
                            </div>
                            <div className="filter-group">
                                <label>To Date</label>
                                <input type="date" className="filter-date-input" value={filters.endDate} onChange={e => setFilter('endDate', e.target.value)} />
                            </div>
                            <div className="filter-group filter-reset-group">
                                <label>&nbsp;</label>
                                <button className="filter-reset-inline-btn" onClick={resetAll}>↺ Reset All</button>
                            </div>
                        </div>
                    </div>
                )}

                {error && <div className="tx-error" style={{ margin: '0 28px 16px', color: '#f87171', background: 'rgba(239,68,68,0.08)', padding: '10px 16px', borderRadius: 9, fontSize: '0.85rem' }}>{error}</div>}

                {/* ── Summary Cards ── */}
                <div className="txlist-summary">
                    <div className="mini-card income">
                        <div className="mini-card-icon"><UpIcon /></div>
                        <div><div className="mini-card-label">Income</div><div className="mini-card-value">₹{fmt(totals.income)}</div></div>
                    </div>
                    <div className="mini-card expense">
                        <div className="mini-card-icon"><DownIcon /></div>
                        <div><div className="mini-card-label">Expenses</div><div className="mini-card-value">₹{fmt(totals.expense)}</div></div>
                    </div>
                    <div className="mini-card net">
                        <div className="mini-card-icon"><BalanceIcon /></div>
                        <div>
                            <div className="mini-card-label">Net</div>
                            <div className="mini-card-value" style={{ color: totals.net >= 0 ? '#00d4c8' : '#f87171' }}>
                                {totals.net >= 0 ? '+' : '-'}₹{fmt(Math.abs(totals.net))}
                            </div>
                        </div>
                    </div>
                    {/* Pagination mini-info */}
                    <div className="mini-card sort-indicator">
                        <div className="mini-card-icon" style={{ fontSize: '1.1rem', width: 36, height: 36, background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, flexShrink: 0 }}>
                            📄
                        </div>
                        <div>
                            <div className="mini-card-label">Page</div>
                            <div className="mini-card-value" style={{ fontSize: '0.85rem' }}>
                                {page ? `${pageNum + 1} / ${page.totalPages || 1}` : '—'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="txlist-table-wrap">
                    <div className="txlist-table">
                        {loading ? (
                            <div className="tx-loading"><span className="tx-spinner" /></div>
                        ) : transactions.length === 0 ? (
                            <div className="tx-empty">
                                <div className="tx-empty-icon">{isFiltered ? '🔍' : '📭'}</div>
                                <div style={{ fontWeight: 600, color: '#c8daea' }}>
                                    {isFiltered ? 'No matching transactions' : 'No transactions yet'}
                                </div>
                                <div style={{ fontSize: '0.8rem', marginTop: 6, color: '#607a94' }}>
                                    {isFiltered
                                        ? <button className="empty-clear-btn" onClick={resetAll}>Clear filters to see all transactions</button>
                                        : 'Click "Add Transaction" to get started!'}
                                </div>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th>Category</th>
                                        <th>Payment</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(t => {
                                        const isCr = t.type?.toUpperCase() === 'INCOME';
                                        const dateStr = t.transactionDate
                                            ? new Date(t.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : '—';
                                        return (
                                            <tr key={t.id} onClick={() => navigate(`/transactions/${t.id}`)}>
                                                <td>
                                                    <div className="tx-table-meta">
                                                        <div className={`tx-table-avatar ${isCr ? 'cr' : 'dr'}`}>{isCr ? <UpIcon /> : <DownIcon />}</div>
                                                        <div>
                                                            <div className="tx-table-name">{getCategoryLabel(t.category)}</div>
                                                            <div className="tx-table-notes">{t.description || '—'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="cat-chip">{getCategoryLabel(t.category)}</span></td>
                                                <td><span className="pay-chip">{getPaymentLabel(t.paymentMethod)}</span></td>
                                                <td style={{ color: '#7a8fa6', fontSize: '0.83rem' }}>{dateStr}</td>
                                                <td><span className={`tx-amount-cell ${isCr ? 'cr' : 'dr'}`}>{isCr ? '+' : '-'}₹{fmtAmt(t.amount)}</span></td>
                                                <td onClick={e => e.stopPropagation()}>
                                                    <div className="tx-actions-cell">
                                                        <button className="tbl-action-btn" title="View" onClick={() => navigate(`/transactions/${t.id}`)}><EyeIcon /></button>
                                                        <button className="tbl-action-btn edit" title="Edit" onClick={() => { setEditTx(t); setShowAdd(true); }}><EditIcon /></button>
                                                        <button className="tbl-action-btn del" title="Delete" onClick={() => setDelId(t.id)}><TrashIcon /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* ── Pagination Bar ── */}
                    {page && page.totalPages > 0 && (
                        <div className="pagination-bar">
                            {/* Left: rows info + page size */}
                            <div className="pagination-info">
                                <span className="pg-showing">
                                    Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of <strong>{page.totalElements}</strong>
                                </span>
                                <div className="pg-size-wrap">
                                    <span>Rows:</span>
                                    <select className="pg-size-select" value={pageSize} onChange={e => handleSizeChange(Number(e.target.value))}>
                                        {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Center: page navigation */}
                            <div className="pagination-nav">
                                <button className="pg-btn" onClick={goPrev} disabled={page.first} title="Previous page">
                                    <ChevLeft />
                                </button>

                                {pageButtons().map((b, i) =>
                                    typeof b === 'string' ? (
                                        <span key={b + i} className="pg-ellipsis">…</span>
                                    ) : (
                                        <button key={b} className={`pg-btn pg-num ${pageNum === b ? 'active' : ''}`} onClick={() => goTo(b)}>
                                            {b + 1}
                                        </button>
                                    )
                                )}

                                <button className="pg-btn" onClick={goNext} disabled={page.last} title="Next page">
                                    <ChevRight />
                                </button>
                            </div>

                            {/* Right: jump to page */}
                            <div className="pagination-jump">
                                <span>Go to</span>
                                <input
                                    type="number"
                                    className="pg-jump-input"
                                    min={1}
                                    max={page.totalPages}
                                    defaultValue={pageNum + 1}
                                    key={pageNum}  /* reset on navigation */
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            const v = Math.max(1, Math.min(page.totalPages, Number(e.target.value)));
                                            goTo(v - 1);
                                        }
                                    }}
                                />
                                <span>of {page.totalPages}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showAdd && <AddTransactionModal editData={editTx} onClose={() => { setShowAdd(false); setEditTx(null); }} onSaved={() => { setShowAdd(false); setEditTx(null); load(filters, pageNum, pageSize); }} />}

            {delId && (
                <div className="confirm-overlay">
                    <div className="confirm-box">
                        <div className="confirm-icon">🗑️</div>
                        <div className="confirm-title">Delete Transaction?</div>
                        <div className="confirm-body">This action is permanent and cannot be undone.</div>
                        <div className="confirm-btns">
                            <button className="confirm-cancel" onClick={() => setDelId(null)}>Cancel</button>
                            <button className="confirm-delete" onClick={handleDelete} disabled={deleting}>
                                {deleting ? 'Deleting…' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
