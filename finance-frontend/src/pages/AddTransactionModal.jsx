import { useEffect, useMemo, useRef, useState } from 'react';
import { createTransaction, getUserIdFromToken, updateTransaction } from '../api/transactions';
import './transactions.css';

/* ── Predefined categories matching backend enums ─────────── */
const EXPENSE_CATEGORIES = [
    { value: 'FOOD', label: 'Food' },
    { value: 'TRAVEL', label: 'Travel' },
    { value: 'RENT', label: 'Rent' },
    { value: 'BILLS', label: 'Bills' },
    { value: 'SHOPPING', label: 'Shopping' },
    { value: 'HEALTH', label: 'Health' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'OTHER', label: 'Other' },
];

const INCOME_CATEGORIES = [
    { value: 'SALARY', label: 'Salary' },
    { value: 'FREELANCE', label: 'Freelance' },
    { value: 'BONUS', label: 'Bonus' },
    { value: 'INVESTMENT', label: 'Investment' },
    { value: 'GIFT', label: 'Gift' },
    { value: 'OTHER', label: 'Other' },
];

const PAYMENT_METHODS = [
    { value: 'UPI', label: 'UPI' },
    { value: 'CASH', label: 'Cash' },
    { value: 'CARD', label: 'Card' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
];

function XIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function UpIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
        </svg>
    );
}

function DownIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
        </svg>
    );
}

function TagIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

function CreditCardIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <line x1="6" y1="15" x2="10" y2="15" />
        </svg>
    );
}

function NoteIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
        </svg>
    );
}

function ChevronDown() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

function toInputDate(value) {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
}

export default function AddTransactionModal({ editData, onClose, onSaved }) {
    const isEdit = Boolean(editData?.id);
    const dateInputRef = useRef(null);
    const userId = useMemo(() => getUserIdFromToken(), []);

    const [type, setType] = useState(editData?.type?.toUpperCase?.() === 'INCOME' ? 'INCOME' : editData?.type?.toUpperCase?.() === 'EXPENSE' ? 'EXPENSE' : 'EXPENSE');
    const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const [category, setCategory] = useState(
        editData?.category ?? (type === 'INCOME' ? INCOME_CATEGORIES[0].value : EXPENSE_CATEGORIES[0].value)
    );
    const [amount, setAmount] = useState(editData?.amount ?? '');
    const [date, setDate] = useState(toInputDate(editData?.transactionDate));
    const [paymentMethod, setPaymentMethod] = useState(editData?.paymentMethod ?? 'UPI');
    const [description, setDescription] = useState(editData?.description ?? '');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    const submit = async (e) => {
        e?.preventDefault?.();
        if (saving) return;
        setError('');

        const amt = Number(amount);
        if (!category) return setError('Category is required.');
        if (!date) return setError('Date is required.');
        if (!Number.isFinite(amt) || amt <= 0) return setError('Amount must be a positive number.');
        if (!userId) return setError('Missing user. Please log in again.');

        const payload = {
            userId,
            type,
            category,
            amount: amt,
            transactionDate: date,
            paymentMethod,
            description: description.trim(),
        };

        setSaving(true);
        try {
            if (isEdit) await updateTransaction(editData.id, payload);
            else await createTransaction(payload);
            onSaved?.();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'Save failed. Please try again.';
            setError(String(msg));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => onClose?.()} role="dialog" aria-modal="true">
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">{isEdit ? 'Edit Transaction' : 'Add Transaction'}</div>
                    <button className="modal-close" onClick={() => onClose?.()} aria-label="Close">
                        <XIcon />
                    </button>
                </div>

                <form onSubmit={submit}>
                    <div className="modal-body">
                        {error && <div className="tx-error" style={{ marginBottom: 0 }}>{error}</div>}

                        <div className="type-toggle" aria-label="Transaction type">
                            <button
                                type="button"
                                className={`type-btn income ${type === 'INCOME' ? 'active' : ''}`}
                                onClick={() => {
                                    setType('INCOME');
                                    setCategory(INCOME_CATEGORIES[0].value);
                                }}
                            >
                                <UpIcon /> Income
                            </button>
                            <button
                                type="button"
                                className={`type-btn expense ${type === 'EXPENSE' ? 'active' : ''}`}
                                onClick={() => {
                                    setType('EXPENSE');
                                    setCategory(EXPENSE_CATEGORIES[0].value);
                                }}
                            >
                                <DownIcon /> Expense
                            </button>
                        </div>

                        <div className="form-row">
                            <div className="tx-form-group">
                                <label>Category</label>
                                <div className="tx-input-wrap">
                                    <span className="ti-icon"><TagIcon /></span>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        {categories.map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                    <span className="sel-chevron"><ChevronDown /></span>
                                </div>
                            </div>

                            <div className="tx-form-group">
                                <label>Amount</label>
                                <div className="tx-input-wrap">
                                    <span className="amount-badge">₹</span>
                                    <input
                                        className="amount-input"
                                        placeholder="0.00"
                                        inputMode="decimal"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="tx-form-group">
                                <label>Date</label>
                                <div className="tx-input-wrap" style={{ cursor: 'pointer' }} onClick={() => dateInputRef.current?.showPicker?.()}>
                                    <span className="ti-icon" style={{ pointerEvents: 'none' }}><CalendarIcon /></span>
                                    <input ref={dateInputRef} type="date" value={date} onChange={(e) => setDate(e.target.value)} onClick={(e) => e.stopPropagation()} />
                                </div>
                            </div>

                            <div className="tx-form-group">
                                <label>Payment</label>
                                <div className="tx-input-wrap">
                                    <span className="ti-icon"><CreditCardIcon /></span>
                                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                        {PAYMENT_METHODS.map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                    <span className="sel-chevron"><ChevronDown /></span>
                                </div>
                            </div>
                        </div>

                        <div className="tx-form-group">
                            <label>Notes</label>
                            <div className="tx-input-wrap">
                                <span className="ti-icon"><NoteIcon /></span>
                                <textarea
                                    placeholder="Optional description…"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={() => onClose?.()} disabled={saving}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save" disabled={saving}>
                            {saving ? (isEdit ? 'Updating…' : 'Saving…') : (isEdit ? 'Update' : 'Save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

