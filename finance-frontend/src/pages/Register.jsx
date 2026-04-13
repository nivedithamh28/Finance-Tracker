import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auth.css';

const CURRENCIES = [
    { code: 'INR', label: '🇮🇳 INR – Indian Rupee' },
    { code: 'USD', label: '🇺🇸 USD – US Dollar' },
    { code: 'EUR', label: '🇪🇺 EUR – Euro' },
    { code: 'GBP', label: '🇬🇧 GBP – British Pound' },
    { code: 'AUD', label: '🇦🇺 AUD – Australian Dollar' },
    { code: 'CAD', label: '🇨🇦 CAD – Canadian Dollar' },
    { code: 'SGD', label: '🇸🇬 SGD – Singapore Dollar' },
    { code: 'JPY', label: '🇯🇵 JPY – Japanese Yen' },
];

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        currencyPreference: 'INR',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const validate = () => {
        if (!form.fullName.trim()) return 'Full name is required.';
        if (!form.email) return 'Email is required.';
        if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address.';
        if (form.password.length < 6) return 'Password must be at least 6 characters.';
        if (form.password !== form.confirmPassword) return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setLoading(true);
        try {
            await axios.post('/api/auth/register', {
                fullName: form.fullName,
                email: form.email,
                password: form.password,
                currencyPreference: form.currencyPreference,
            });
            setSuccess('Account created! Redirecting to login…');
            setTimeout(() => navigate('/login'), 1800);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="bg-blob blob-1" />
            <div className="bg-blob blob-2" />
            <div className="bg-blob blob-3" />

            <div className="auth-card auth-card--wide">
                {/* Logo */}
                <div className="auth-logo">
                    <div className="logo-icon">
                        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="12" fill="url(#logoGrad2)" />
                            <path d="M10 28 L20 12 L30 22 L24 22 L28 28" stroke="white" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <circle cx="20" cy="12" r="2.5" fill="white" />
                            <defs>
                                <linearGradient id="logoGrad2" x1="0" y1="0" x2="40" y2="40">
                                    <stop offset="0%" stopColor="#00d4c8" />
                                    <stop offset="100%" stopColor="#0077b6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className="logo-text">Finance Tracker</span>
                </div>

                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Start tracking your finances today</p>
                </div>

                {error && <div className="auth-error">{error}</div>}
                {success && <div className="auth-success">{success}</div>}

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {/* Full Name */}
                    <div className="form-group">
                        <label htmlFor="reg-fullName">Full Name</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <input
                                id="reg-fullName"
                                type="text"
                                name="fullName"
                                placeholder="John Doe"
                                value={form.fullName}
                                onChange={handleChange}
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="reg-email">Email</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </span>
                            <input
                                id="reg-email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="reg-password">Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <circle cx="12" cy="16" r="1" fill="currentColor" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                id="reg-password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="toggle-pw"
                                onClick={() => setShowPassword((v) => !v)}
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="reg-confirmPassword">Confirm Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </span>
                            <input
                                id="reg-confirmPassword"
                                type={showConfirm ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Re-enter password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="toggle-pw"
                                onClick={() => setShowConfirm((v) => !v)}
                                tabIndex={-1}
                                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                            >
                                {showConfirm ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Currency Preference */}
                    <div className="form-group">
                        <label htmlFor="reg-currency">Currency Preference</label>
                        <div className="input-wrapper select-wrapper">
                            <span className="input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v2m0 8v2M6 12h2m8 0h2" />
                                    <path d="M9 9a3 3 0 1 1 6 3c0 2-3 3-3 3" />
                                </svg>
                            </span>
                            <select
                                id="reg-currency"
                                name="currencyPreference"
                                value={form.currencyPreference}
                                onChange={handleChange}
                            >
                                {CURRENCIES.map((c) => (
                                    <option key={c.code} value={c.code}>{c.label}</option>
                                ))}
                            </select>
                            <span className="select-chevron">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? <span className="btn-spinner" /> : 'Create Account'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}
