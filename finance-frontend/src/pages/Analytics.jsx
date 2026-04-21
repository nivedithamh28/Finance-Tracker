import { useEffect, useMemo, useState } from 'react';
import {
    PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line
} from 'recharts';
import { getAnalytics, getUserIdFromToken } from '../api/analytics';
import './analytics.css';

/* ── Palette ─────────────────────────────────────────────── */
const COLORS = [
    '#00d4c8', '#0096c7', '#6366f1', '#f59e0b', '#ef4444',
    '#10b981', '#a855f7', '#f97316', '#64748b', '#ec4899',
];

const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n ?? 0);

const fmtDecimal = (n) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n ?? 0);

/* ── Stat Card ───────────────────────────────────────────── */
function StatCard({ label, value, sub, accent }) {
    return (
        <div className="an-stat-card" style={{ '--accent': accent }}>
            <span className="an-stat-label">{label}</span>
            <span className="an-stat-value">{value}</span>
            {sub && <span className="an-stat-sub">{sub}</span>}
        </div>
    );
}

/* ── Custom Tooltip ──────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="an-tooltip">
            {label && <p className="an-tooltip-label">{label}</p>}
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: ₹{fmt(p.value)}
                </p>
            ))}
        </div>
    );
}

/* ── Loading Skeleton ────────────────────────────────────── */
function Skeleton({ h = 200 }) {
    return <div className="an-skeleton" style={{ height: h }} />;
}

/* ── Icons ───────────────────────────────────────────────── */
function ChartBarIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function Analytics() {
    const userId = useMemo(() => getUserIdFromToken(), []);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) { setLoading(false); return; }
        let cancelled = false;
        setLoading(true);
        getAnalytics(userId)
            .then(res => { if (!cancelled) setData(res.data); })
            .catch(err => { if (!cancelled) setError(err?.response?.data?.message || 'Failed to load analytics.'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [userId]);

    /* ── Derived chart data ── */
    const pieData = (data?.categoryExpenses ?? []).map((c, i) => ({
        name: c.category,
        value: c.total,
        color: COLORS[i % COLORS.length],
    }));

    const barData = (data?.monthlyTrends ?? []).map(m => ({
        month: m.month,
        Income: m.income,
        Expense: m.expense,
    }));

    const lineData = (data?.monthlyTrends ?? []).map(m => ({
        month: m.month,
        Expense: m.expense,
    }));

    /* ── Render ── */
    return (
        <div className="an-main">
            {/* Top Bar */}
            <header className="an-topbar">
                <div className="an-topbar-title">
                    <span className="an-title-icon"><ChartBarIcon /></span>
                    <div>
                        <h1 className="an-title">Analytics & Reports</h1>
                        <p className="an-subtitle">Your complete financial picture</p>
                    </div>
                </div>
            </header>

            <main className="an-content">
                {/* ── Error ── */}
                {error && (
                    <div className="an-error">
                        ⚠️ {error}
                    </div>
                )}

                {/* ── Stat Cards ── */}
                <section className="an-section">
                    <h2 className="an-section-title">Summary Overview</h2>
                    {loading ? (
                        <div className="an-stats-grid">
                            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} h={110} />)}
                        </div>
                    ) : (
                        <div className="an-stats-grid">
                            <StatCard
                                label="Total Income"
                                value={`₹${fmt(data?.totalIncome)}`}
                                accent="#00d4c8"
                            />
                            <StatCard
                                label="Total Expenses"
                                value={`₹${fmt(data?.totalExpense)}`}
                                accent="#ef4444"
                            />
                            <StatCard
                                label="Net Balance"
                                value={`₹${fmt(data?.netBalance)}`}
                                sub={data?.netBalance >= 0 ? '✅ Positive' : '⚠️ Negative'}
                                accent={data?.netBalance >= 0 ? '#10b981' : '#ef4444'}
                            />
                            <StatCard
                                label="Total Transactions"
                                value={data?.totalTransactions ?? 0}
                                accent="#6366f1"
                            />
                            <StatCard
                                label="Top Spending Category"
                                value={data?.topSpendingCategory ?? 'N/A'}
                                accent="#f59e0b"
                            />
                            <StatCard
                                label="Highest Expense"
                                value={`₹${fmt(data?.highestExpenseAmount)}`}
                                sub={data?.highestExpenseDescription}
                                accent="#f97316"
                            />
                            <StatCard
                                label="Avg Expense / Month"
                                value={`₹${fmtDecimal(data?.avgExpensePerMonth)}`}
                                accent="#a855f7"
                            />
                            <StatCard
                                label="Avg Income / Month"
                                value={`₹${fmtDecimal(data?.avgIncomePerMonth)}`}
                                accent="#00d4c8"
                            />
                        </div>
                    )}
                </section>

                {/* ── Charts Row: Pie + Bar ── */}
                <div className="an-charts-row">
                    {/* Pie Chart */}
                    <div className="an-chart-card">
                        <div className="an-chart-header">
                            <h2 className="an-section-title">Category-wise Expenses</h2>
                            <span className="an-chart-badge pie">Pie</span>
                        </div>
                        {loading ? <Skeleton h={300} /> : pieData.length === 0 ? (
                            <div className="an-empty">No expense data yet.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {pieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ReTooltip
                                        formatter={(val) => [`₹${fmt(val)}`, 'Amount']}
                                        contentStyle={{
                                            background: '#0c1220',
                                            border: '1px solid rgba(0,212,200,0.2)',
                                            borderRadius: 10,
                                            color: '#e2e8f0',
                                        }}
                                    />
                                    <Legend
                                        formatter={(val) => (
                                            <span style={{ color: '#c8daea', fontSize: '0.8rem' }}>{val}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Bar Chart */}
                    <div className="an-chart-card">
                        <div className="an-chart-header">
                            <h2 className="an-section-title">Income vs Expense</h2>
                            <span className="an-chart-badge bar">Bar</span>
                        </div>
                        {loading ? <Skeleton h={300} /> : barData.length === 0 ? (
                            <div className="an-empty">No monthly data yet.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barData}
                                    margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="month" tick={{ fill: '#607a94', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#607a94', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                                    <ReTooltip content={<CustomTooltip />} />
                                    <Legend formatter={val => <span style={{ color: '#c8daea', fontSize: '0.8rem' }}>{val}</span>} />
                                    <Bar dataKey="Income" fill="#00d4c8" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Line Chart */}
                <div className="an-chart-card an-chart-wide">
                    <div className="an-chart-header">
                        <h2 className="an-section-title">Expense Trend Over Time</h2>
                        <span className="an-chart-badge line">Line</span>
                    </div>
                    {loading ? <Skeleton h={280} /> : lineData.length === 0 ? (
                        <div className="an-empty">No expense trend data yet.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={lineData}
                                margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fill: '#607a94', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#607a94', fontSize: 11 }} axisLine={false} tickLine={false}
                                    tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                                <ReTooltip content={<CustomTooltip />} />
                                <Legend formatter={val => <span style={{ color: '#c8daea', fontSize: '0.8rem' }}>{val}</span>} />
                                <Line
                                    type="monotone"
                                    dataKey="Expense"
                                    stroke="#ef4444"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#0c1220' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </main>
        </div>
    );
}
