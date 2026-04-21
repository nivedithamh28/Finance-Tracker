import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import { getUserIdFromToken } from '../api/transactions';
import { getUserProfile } from '../api/users';
import './Layout.css';

function UserIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>; }
function LogoutIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>; }
function ChevronDownIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>; }

export default function Layout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const userId = useMemo(() => getUserIdFromToken(), []);

    useEffect(() => {
        if (!userId) return;
        getUserProfile(userId)
            .then(res => setUserName(res.data.fullName))
            .catch(e => console.error('Failed to load user name', e));
    }, [userId]);

    const pageName = useMemo(() => {
        const path = location.pathname;
        if (path === '/dashboard') return 'Dashboard';
        if (path.startsWith('/transactions')) return 'Transactions';
        if (path.startsWith('/budget')) return 'Budget';
        if (path.startsWith('/analytics')) return 'Analytics';
        if (path.startsWith('/categories')) return 'Categories';
        if (path.startsWith('/profile')) return 'Profile Settings';
        return 'Overview';
    }, [location]);

    const userInitials = useMemo(() => {
        if (!userName) return 'U';
        return userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }, [userName]);

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
        } catch (e) {
            console.error('Logout sync failed', e);
        }
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="layout-root">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
            <div className="layout-body">
                <header className="layout-topbar">
                    <div className="lt-left">
                        <button
                            className="layout-hamburger"
                            onClick={() => setCollapsed(v => !v)}
                            aria-label="Toggle sidebar"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <h2 className="lt-page-title">{pageName}</h2>
                    </div>

                    <div className="lt-right">
                        <div className="lt-user-wrapper">
                            <button className="lt-user-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
                                <div className="lt-avatar">{userInitials}</div>
                                <span className="lt-username">{userName || 'User'}</span>
                                <span className={`lt-chevron ${showUserMenu ? 'open' : ''}`}><ChevronDownIcon /></span>
                            </button>

                            {showUserMenu && (
                                <>
                                    <div className="lt-backdrop" onClick={() => setShowUserMenu(false)} />
                                    <div className="lt-dropdown">
                                        <button className="lt-drop-item" onClick={() => { navigate('/profile'); setShowUserMenu(false); }}>
                                            <UserIcon /> Profile Settings
                                        </button>
                                        <div className="lt-divider" />
                                        <button className="lt-drop-item logout" onClick={handleLogout}>
                                            <LogoutIcon /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>
                <main className="layout-main">{children}</main>
            </div>
        </div>
    );
}
