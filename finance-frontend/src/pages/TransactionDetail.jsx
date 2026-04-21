import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransactionById, deleteTransaction } from '../api/transactions';
import { getCategoryLabel, getPaymentLabel } from '../api/categories';
import AddTransactionModal from './AddTransactionModal';
import './transactions.css';

function ArrowBack() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>; }
function EditIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
function TrashIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>; }
function IncomeIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>; }
function ExpenseIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>; }

const fmt = (n) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n);

function fmtDate(str) {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}
function fmtDateTime(str) {
    if (!str) return '—';
    return new Date(str).toLocaleString('en-IN');
}

export default function TransactionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tx, setTx] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEdit, setShowEdit] = useState(false);
    const [delModal, setDelModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await getTransactionById(id);
            setTx(res.data);
        } catch {
            setError('Could not load transaction.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteTransaction(id);
            navigate('/transactions');
        } catch {
            setError('Failed to delete. Please try again.');
            setDelModal(false);
        } finally {
            setDeleting(false);
        }
    };

    const isCr = tx?.type?.toUpperCase() === 'INCOME';

    if (loading) {
        return (
            <div className="txdetail-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="tx-spinner" style={{ width: 36, height: 36 }} />
            </div>
        );
    }

    if (error && !tx) {
        return (
            <div className="txdetail-page">
                <div className="tx-error">{error}</div>
                <button className="back-btn" onClick={() => navigate('/transactions')}>
                    <ArrowBack /> Back to List
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="txdetail-page">
                {/* Back bar */}
                <div className="txdetail-back-bar">
                    <button className="back-btn" onClick={() => navigate('/transactions')}>
                        <ArrowBack /> Back to List
                    </button>
                    <div className="detail-actions">
                        <button className="detail-action-btn edit" onClick={() => setShowEdit(true)}>
                            <EditIcon /> Edit
                        </button>
                        <button className="detail-action-btn del" onClick={() => setDelModal(true)}>
                            <TrashIcon /> Delete
                        </button>
                    </div>
                </div>

                {error && <div className="tx-error">{error}</div>}

                <div className="txdetail-card">
                    {/* Hero */}
                    <div className="txdetail-hero">
                        <div className={`txdetail-hero-icon ${isCr ? 'cr' : 'dr'}`}>
                            {isCr ? <IncomeIcon /> : <ExpenseIcon />}
                        </div>
                        <div className="txdetail-hero-info">
                            <div className={`txdetail-amount ${isCr ? 'cr' : 'dr'}`}>
                                {isCr ? '+' : '-'}₹{fmt(tx.amount)}
                            </div>
                            <span className={`txdetail-type-badge ${isCr ? 'cr' : 'dr'}`}>
                                {isCr ? 'INCOME' : 'EXPENSE'}
                            </span>
                        </div>
                        <div className="txdetail-id">#{tx.id ? `TXN-${String(tx.id).padStart(5, '0')}` : '—'}</div>
                    </div>

                    {/* Fields */}
                    <div className="txdetail-fields">
                        <div className="txdetail-field">
                            <span className="txdetail-field-label">Category</span>
                            <span className="txdetail-field-value">{getCategoryLabel(tx.category)}</span>
                        </div>
                        <div className="txdetail-field">
                            <span className="txdetail-field-label">Date</span>
                            <span className="txdetail-field-value">{fmtDate(tx.date)}</span>
                        </div>
                        <div className="txdetail-field">
                            <span className="txdetail-field-label">Payment Method</span>
                            <span className="txdetail-field-value">{getPaymentLabel(tx.paymentMethod)}</span>
                        </div>
                        {tx.description && (
                            <div className="txdetail-field">
                                <span className="txdetail-field-label">Notes</span>
                                <span className="txdetail-field-value txdetail-note">"{tx.description}"</span>
                            </div>
                        )}
                    </div>

                    <hr className="txdetail-divider" />

                    {/* Meta */}
                    <div className="txdetail-meta">
                        <div className="txdetail-meta-row">
                            {tx.userId && (
                                <div className="txdetail-meta-item">
                                    <label>User ID</label>
                                    <span>U-{tx.userId}</span>
                                </div>
                            )}
                            {tx.createdAt && (
                                <div className="txdetail-meta-item">
                                    <label>Created</label>
                                    <span>{fmtDateTime(tx.createdAt)}</span>
                                </div>
                            )}
                            {tx.updatedAt && (
                                <div className="txdetail-meta-item">
                                    <label>Updated</label>
                                    <span>{fmtDateTime(tx.updatedAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit modal */}
            {showEdit && (
                <AddTransactionModal
                    editData={{ ...tx }}
                    onClose={() => setShowEdit(false)}
                    onSaved={() => { setShowEdit(false); load(); }}
                />
            )}

            {/* Delete confirm */}
            {delModal && (
                <div className="confirm-overlay">
                    <div className="confirm-box">
                        <div className="confirm-icon">🗑️</div>
                        <div className="confirm-title">Delete Transaction?</div>
                        <div className="confirm-body">
                            This action cannot be undone. The transaction of{' '}
                            <strong style={{ color: '#f87171' }}>₹{fmt(tx.amount)}</strong> will be permanently removed.
                        </div>
                        <div className="confirm-btns">
                            <button className="confirm-cancel" onClick={() => setDelModal(false)}>Cancel</button>
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
