import { useState, useEffect, useMemo } from 'react';
import { getUserIdFromToken } from '../api/transactions';
import { getUserProfile, updateUserProfile, updateUserPassword } from '../api/users';
import './Profile.css';

export default function Profile() {
    const userId = useMemo(() => getUserIdFromToken(), []);
    const [profile, setProfile] = useState({ fullName: '', email: '', currencyPreference: 'INR', monthlyIncome: '' });
    const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!userId) return;
        getUserProfile(userId)
            .then(res => {
                setProfile(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setMessage({ type: 'error', text: 'Failed to load profile' });
                setLoading(false);
            });
    }, [userId]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await updateUserProfile(userId, {
                fullName: profile.fullName,
                currencyPreference: profile.currencyPreference,
                monthlyIncome: profile.monthlyIncome
            });
            setProfile(res.data);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        } finally {
            setUpdating(false);
        }
    };

    const handlePwdSubmit = async (e) => {
        e.preventDefault();
        if (pwd.newPassword !== pwd.confirmPassword) {
            return setMessage({ type: 'error', text: 'New passwords do not match' });
        }
        setUpdating(true);
        setMessage({ type: '', text: '' });
        try {
            await updateUserPassword(userId, {
                currentPassword: pwd.currentPassword,
                newPassword: pwd.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully' });
            setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Password change failed' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-loader">Loading profile...</div>;

    return (
        <div className="p-container">
            <header className="p-header">
                <h1 className="p-title">Account Settings</h1>
                <p className="p-subtitle">Manage your profile and security preferences</p>
            </header>

            {message.text && (
                <div className={`p-alert ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="p-grid">
                {/* Profile Form */}
                <section className="p-card">
                    <h2 className="p-card-title">Profile Information</h2>
                    <form onSubmit={handleProfileSubmit} className="p-form">
                        <div className="p-field">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={profile.fullName}
                                onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="p-field">
                            <label>Email Address</label>
                            <input type="email" value={profile.email} disabled className="disabled" />
                            <small>Email cannot be changed</small>
                        </div>
                        <div className="p-field">
                            <label>Monthly Income (Optional)</label>
                            <input
                                type="number"
                                value={profile.monthlyIncome || ''}
                                onChange={e => setProfile({ ...profile, monthlyIncome: e.target.value })}
                                placeholder="Enter estimated income"
                            />
                        </div>
                        <div className="p-field">
                            <label>Currency Preference</label>
                            <select
                                value={profile.currencyPreference}
                                onChange={e => setProfile({ ...profile, currencyPreference: e.target.value })}
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                        <button type="submit" className="p-btn" disabled={updating}>
                            {updating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </section>

                {/* Password Form */}
                <section className="p-card">
                    <h2 className="p-card-title">Change Password</h2>
                    <form onSubmit={handlePwdSubmit} className="p-form">
                        <div className="p-field">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={pwd.currentPassword}
                                onChange={e => setPwd({ ...pwd, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="p-field">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={pwd.newPassword}
                                onChange={e => setPwd({ ...pwd, newPassword: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="p-field">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={pwd.confirmPassword}
                                onChange={e => setPwd({ ...pwd, confirmPassword: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                        <button type="submit" className="p-btn secondary" disabled={updating}>
                            {updating ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
