import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddTransactionModal from './AddTransactionModal';
import './Dashboard.css';
import { getCurrentBudget } from '../api/budgets';
import { getUserIdFromToken, getTransactionsByUser, deleteTransaction } from '../api/transactions';
import { getAnalytics } from '../api/analytics';

/* ── Static Data ─────────────────────────────────────────── */




const CATEGORIES = [
    { name: 'Food', pct: 40, color: '#00d4c8' },
    { name: 'Travel', pct: 20, color: '#0096c7' },
    { name: 'Bills', pct: 15, color: '#f59e0b' },
    { name: 'Shopping', pct: 15, color: '#6366f1' },
    { name: 'Others', pct: 10, color: '#64748b' },
];



/* ── Helpers ─────────────────────────────────────────────── */
const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

const COLORS = ['#00d4c8', '#0096c7', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#10b981'];
const monthYearLabel = (m, y) => {
    if (!m || !y) return '';
    const d = new Date(Number(y), Number(m) - 1, 1);
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d);
    return `${monthName} ${y}`;
};

/* ── Pie chart via SVG conic-trick (CSS) ─────────────────── */
function PieChart({ categories, totalExpense }) {
    if (!categories || categories.length === 0) {
        return (
            <svg viewBox="0 0 160 160" className="pie-svg empty">
                <circle cx="80" cy="80" r="68" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="4 4" />
                <text x="80" y="85" textAnchor="middle" fill="#607a94" fontSize="10">No Expenses</text>
            </svg>
        );
    }

    let acc = 0;
    const slices = categories.map((c, i) => {
        const start = acc;
        acc += c.pct;
        return { ...c, start, end: acc, color: COLORS[i % COLORS.length] };
    });

    const toRad = (p) => (p / 100) * 2 * Math.PI;
    const cx = 80, cy = 80, r = 68;

    const arc = (s, e) => {
        const x1 = cx + r * Math.sin(toRad(s));
        const y1 = cy - r * Math.cos(toRad(s));
        const x2 = cx + r * Math.sin(toRad(e));
        const y2 = cy - r * Math.cos(toRad(e));
        const large = e - s > 50 ? 1 : 0;
        if (e - s >= 99.99) { // Full circle case
            return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;
        }
        return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    };

    return (
        <svg viewBox="0 0 160 160" className="pie-svg">
            {slices.map((s) => (
                <path key={s.name} d={arc(s.start, s.end)} fill={s.color} opacity="0.9">
                    <title>{s.name}: {s.pct}%</title>
                </path>
            ))}
            <circle cx={cx} cy={cy} r="34" fill="#0c1220" />
            <text x={cx} y={cy - 6} textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">₹{fmt(totalExpense)}</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill="#7a8fa6" fontSize="9">Total Spent</text>
        </svg>
    );
}

function AlertBanner({ type, message, icon: Icon }) {
    return (
        <div className={`alert-banner ${type}`}>
            <span className="alert-icon"><Icon /></span>
            <span className="alert-msg">{message}</span>
        </div>
    );
}

function InfoIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>; }
function WarnIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>; }
function ErrorIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>; }

/* ── Icon components ─────────────────────────────────────── */
function HomeIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>; }
function ListIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>; }
function TagIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>; }
function WalletIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>; }
function ChartIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>; }
function SettingsIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>; }
function BellIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>; }
function PlusIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
function SearchIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>; }
function ArrowUpIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>; }
function ArrowDnIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>; }
function TrashIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>; }
function EditIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
function LogoIcon() {
    return (
        <svg viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="url(#dg)" />
            <path d="M9 26 L18 11 L27 21 L22 21 L26 26" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="18" cy="11" r="2.2" fill="white" />
            <defs><linearGradient id="dg" x1="0" y1="0" x2="36" y2="36"><stop offset="0%" stopColor="#00d4c8" /><stop offset="100%" stopColor="#0077b6" /></linearGradient></defs>
        </svg>
    );
}

/* ── Main Component ──────────────────────────────────────── */
export default function Dashboard() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const userId = useMemo(() => getUserIdFromToken(), []);
    const [currentBudget, setCurrentBudget] = useState(null);
    const [budgetLoading, setBudgetLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    const summary = analytics || { totalIncome: 0, totalExpense: 0, netBalance: 0 };

    const budgetPct = Math.round(Number(currentBudget?.usedPercentage || 0));
    const budgetLabel = currentBudget
        ? monthYearLabel(currentBudget.month, currentBudget.year)
        : monthYearLabel(new Date().getMonth() + 1, new Date().getFullYear());

    const currentMonthYear = useMemo(() => {
        const d = new Date();
        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }, []);

    const dynamicCategories = useMemo(() => {
        if (!analytics || !analytics.categoryExpenses) return [];
        const total = summary.totalExpense || 1;
        return analytics.categoryExpenses.map(ce => ({
            name: ce.categoryName,
            pct: Math.round((ce.totalAmount / total) * 100),
            amount: ce.totalAmount
        })).sort((a, b) => b.amount - a.amount);
    }, [analytics, summary.totalExpense]);

    const loadTransactions = async () => {
        if (!userId) return;
        setTransactionsLoading(true);
        try {
            const res = await getTransactionsByUser(userId, {
                size: 5,
                sortBy: 'transactionDate',
                sortDir: 'desc'
            });
            setTransactions(res.data.content);
        } catch (e) {
            console.error('Failed to load transactions', e);
        } finally {
            setTransactionsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await deleteTransaction(id);
            loadTransactions(); // Refresh
        } catch (e) {
            alert('Failed to delete transaction');
        }
    };

    useEffect(() => {
        let cancelled = false;
        async function load() {
            if (!userId) return;
            setBudgetLoading(true);
            setAnalyticsLoading(true);
            try {
                const [budgetRes, analyticsRes] = await Promise.all([
                    getCurrentBudget(userId),
                    getAnalytics(userId)
                ]);
                if (!cancelled) {
                    setCurrentBudget(budgetRes.data);
                    setAnalytics(analyticsRes.data);
                }
            } catch (e) {
                if (!cancelled) {
                    console.error('Failed to load dashboard data', e);
                }
            } finally {
                if (!cancelled) {
                    setBudgetLoading(false);
                    setAnalyticsLoading(false);
                }
            }
        }
        load();
        loadTransactions();
        return () => {
            cancelled = true;
        };
    }, [userId]);

    return (
        <>
            <div className="db-main">



                {/* ── Content ── */}
                <main className="db-content">
                    {/* Page Title */}
                    <div className="page-title-row">
                        <div>
                            <h1 className="page-title">Dashboard</h1>
                            <p className="page-subtitle">{currentMonthYear} — Financial Overview</p>
                        </div>
                        <button className="db-add-btn-main" onClick={() => setShowModal(true)}>
                            <PlusIcon /> Add Transaction
                        </button>
                    </div>

                    {/* ── Alerts ── */}
                    <div className="alerts-section">
                        {!analyticsLoading && !budgetLoading && (
                            <>
                                {budgetPct > 100 && (
                                    <AlertBanner
                                        type="critical"
                                        message={`Critical: You have exceeded your monthly budget by ₹${fmt(summary.totalExpense - (currentBudget?.amount || 0))}!`}
                                        icon={ErrorIcon}
                                    />
                                )}
                                {budgetPct >= 80 && budgetPct <= 100 && (
                                    <AlertBanner
                                        type="warning"
                                        message={`Warning: You've used ${budgetPct}% of your monthly budget.`}
                                        icon={WarnIcon}
                                    />
                                )}
                                {transactions.length === 0 && !transactionsLoading && (
                                    <AlertBanner
                                        type="info"
                                        message="Welcome! You haven't added any transactions this month. Start by adding one below."
                                        icon={InfoIcon}
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* ── Summary Cards ── */}
                    <div className="summary-grid">
                        <div className="s-card income">
                            <div className="s-card-icon"><ArrowUpIcon /></div>
                            <div className="s-card-body">
                                <span className="s-card-label">Total Income</span>
                                <span className="s-card-value">₹{analyticsLoading ? '...' : fmt(summary.totalIncome)}</span>
                                <span className="s-card-badge up">Actual</span>
                            </div>
                        </div>
                        <div className="s-card expense">
                            <div className="s-card-icon"><ArrowDnIcon /></div>
                            <div className="s-card-body">
                                <span className="s-card-label">Total Expenses</span>
                                <span className="s-card-value">₹{analyticsLoading ? '...' : fmt(summary.totalExpense)}</span>
                                <span className="s-card-badge down">Actual</span>
                            </div>
                        </div>
                        <div className="s-card balance">
                            <div className="s-card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                            <div className="s-card-body">
                                <span className="s-card-label">Net Balance</span>
                                <span className="s-card-value">₹{analyticsLoading ? '...' : fmt(summary.netBalance)}</span>
                                <span className="s-card-badge up">{summary.netBalance >= 0 ? 'Healthy' : 'Deficit'}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Budget Progress ── */}
                    <div className="budget-card">
                        <div className="budget-header">
                            <div>
                                <h2 className="section-title">Monthly Budget Status</h2>
                                <p className="budget-sub">
                                    {budgetLabel}
                                    {currentBudget ? ` — Limit: ₹${fmt(currentBudget.amount)}` : ' — No budget set'}
                                </p>
                            </div>
                            <span className={`budget-warn ${currentBudget && budgetPct >= 80 ? 'show' : ''}`}>
                                ⚠️ High Spending!
                            </span>
                        </div>

                        <div className="budget-bar-wrap">
                            <div
                                className="budget-bar-fill"
                                style={{
                                    width: `${Math.min(budgetPct, 100)}%`,
                                    '--pct': budgetPct,
                                }}
                            />
                        </div>

                        <div className="budget-labels">
                            <span>Spent: ₹{fmt(currentBudget?.totalExpense || 0)}</span>
                            <span className="budget-pct">
                                {budgetLoading ? '…' : currentBudget ? `${budgetPct}%` : '—'}
                            </span>
                            <span>
                                Remaining: ₹{fmt(currentBudget?.remaining ?? 0)}
                                {!currentBudget && (
                                    <>
                                        {' '}
                                        <button className="see-all" onClick={() => navigate('/budget')}>
                                            Set Budget →
                                        </button>
                                    </>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* ── Bottom Row ── */}
                    <div className="bottom-grid">
                        {/* Recent Transactions */}
                        <div className="section-card">
                            <div className="section-header">
                                <h2 className="section-title">Recent Transactions</h2>
                                <button className="see-all" onClick={() => navigate('/transactions')}>See All →</button>
                            </div>
                            <div className="tx-list">
                                {transactionsLoading ? (
                                    <div className="tx-loading">Loading recent transactions...</div>
                                ) : transactions.length === 0 ? (
                                    <div className="tx-empty">No transactions found.</div>
                                ) : (
                                    transactions.map((tx) => (
                                        <div key={tx.id} className="tx-row">
                                            <div className={`tx-avatar ${tx.type === 'INCOME' ? 'cr' : 'dr'}`}>
                                                {tx.type === 'INCOME' ? <ArrowUpIcon /> : <ArrowDnIcon />}
                                            </div>
                                            <div className="tx-info">
                                                <span className="tx-title">{tx.description || tx.category}</span>
                                                <span className="tx-cat">{tx.category} · {new Date(tx.transactionDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                                            </div>
                                            <div className="tx-meta">
                                                <span className={`tx-amount ${tx.type === 'INCOME' ? 'cr' : 'dr'}`}>
                                                    {tx.type === 'INCOME' ? '+' : '-'}₹{fmt(tx.amount)}
                                                </span>
                                                <div className="tx-actions">
                                                    <button className="tx-act-btn edit" title="Edit" onClick={() => navigate(`/transactions/${tx.id}`)}>
                                                        <EditIcon />
                                                    </button>
                                                    <button className="tx-act-btn delete" title="Delete" onClick={() => handleDelete(tx.id)}>
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Top Categories */}
                        <div className="section-card">
                            <div className="section-header">
                                <h2 className="section-title">Top Categories</h2>
                            </div>
                            <div className="cat-wrapper">
                                <PieChart categories={dynamicCategories} totalExpense={summary.totalExpense} />
                                <div className="cat-legend">
                                    {analyticsLoading ? (
                                        <div className="cat-loading">Loading...</div>
                                    ) : dynamicCategories.length === 0 ? (
                                        <div className="cat-empty">No expenses tracked.</div>
                                    ) : (
                                        dynamicCategories.map((c, i) => (
                                            <div key={c.name} className="cat-row">
                                                <span className="cat-dot" style={{ background: COLORS[i % COLORS.length] }} />
                                                <span className="cat-name">{c.name}</span>
                                                <span className="cat-pct">{c.pct}%</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {showModal && (
                <AddTransactionModal
                    onClose={() => setShowModal(false)}
                    onSaved={() => setShowModal(false)}
                />
            )}
        </>
    );
}
