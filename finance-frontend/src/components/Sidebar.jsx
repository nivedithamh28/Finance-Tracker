import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Sidebar.css';

/* ── Icons ────────────────────────────────────────────────── */
function HomeIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>; }
function ListIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>; }
function TagIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>; }
function WalletIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>; }
function ChartIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>; }
function LogoutIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>; }
function LogoIcon() {
    return (
        <svg viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="url(#sdg)" />
            <path d="M9 26 L18 11 L27 21 L22 21 L26 26" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="18" cy="11" r="2.2" fill="white" />
            <defs><linearGradient id="sdg" x1="0" y1="0" x2="36" y2="36"><stop offset="0%" stopColor="#00d4c8" /><stop offset="100%" stopColor="#0077b6" /></linearGradient></defs>
        </svg>
    );
}

const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { key: 'transactions', label: 'Transactions', icon: ListIcon, path: '/transactions' },
    { key: 'category', label: 'Category', icon: TagIcon, path: '/categories' },
    { key: 'budget', label: 'Budget', icon: WalletIcon, path: '/budget' },
    { key: 'analytics', label: 'Analytics', icon: ChartIcon, path: '/analytics' },
];

export default function Sidebar({ collapsed, onToggle }) {
    const navigate = useNavigate();
    const location = useLocation();
    const activeKey = location.pathname.startsWith('/transactions')
        ? 'transactions'
        : location.pathname.startsWith('/dashboard')
            ? 'dashboard'
            : location.pathname.startsWith('/budget')
                ? 'budget'
                : location.pathname.startsWith('/analytics')
                    ? 'analytics'
                    : location.pathname.startsWith('/categories')
                        ? 'category'
                        : '';

    return (
        <aside className={`sb-root ${collapsed ? 'collapsed' : ''}`}>
            {/* Brand */}
            <div className="sb-brand">
                <span className="sb-logo-icon"><LogoIcon /></span>
                <span className="sb-brand-name">FinTrack</span>
            </div>

            <nav className="sb-nav">
                {NAV_ITEMS.map(({ key, label, icon: Icon, path }) => (
                    <button
                        key={key}
                        className={`sb-item ${activeKey === key ? 'active' : ''}`}
                        onClick={() => path && navigate(path)}
                        title={collapsed ? label : undefined}
                    >
                        <span className="sb-item-icon"><Icon /></span>
                        <span className="sb-item-label">{label}</span>
                    </button>
                ))}
            </nav>


        </aside>
    );
}
