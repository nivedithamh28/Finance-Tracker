/* Predefined categories matching backend enums */

export const EXPENSE_CATEGORIES = [
    { value: 'FOOD', label: 'Food', icon: '🍔' },
    { value: 'TRAVEL', label: 'Travel', icon: '✈️' },
    { value: 'RENT', label: 'Rent', icon: '🏠' },
    { value: 'BILLS', label: 'Bills', icon: '📄' },
    { value: 'SHOPPING', label: 'Shopping', icon: '🛍️' },
    { value: 'HEALTH', label: 'Health', icon: '❤️' },
    { value: 'ENTERTAINMENT', label: 'Entertainment', icon: '🎬' },
    { value: 'EDUCATION', label: 'Education', icon: '📚' },
    { value: 'OTHER', label: 'Other', icon: '📦' },
];

export const INCOME_CATEGORIES = [
    { value: 'SALARY', label: 'Salary', icon: '💼' },
    { value: 'FREELANCE', label: 'Freelance', icon: '💻' },
    { value: 'BONUS', label: 'Bonus', icon: '🎁' },
    { value: 'INVESTMENT', label: 'Investment', icon: '📈' },
    { value: 'GIFT', label: 'Gift', icon: '🎀' },
    { value: 'OTHER', label: 'Other', icon: '💰' },
];

export const PAYMENT_METHODS = [
    { value: 'UPI', label: 'UPI' },
    { value: 'CASH', label: 'Cash' },
    { value: 'CARD', label: 'Card' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
];

const ALL = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

/** Returns the human-readable label for a category enum value, e.g. "FOOD" → "Food" */
export function getCategoryLabel(value) {
    if (!value) return '—';
    const found = ALL.find((c) => c.value === value?.toUpperCase());
    return found ? found.label : value; // fallback: return raw value
}

/** Returns the emoji icon for a category enum value */
export function getCategoryIcon(value) {
    if (!value) return '📦';
    const found = ALL.find((c) => c.value === value?.toUpperCase());
    return found ? found.icon : '📦';
}

/** Returns the human-readable label for a payment method enum value */
export function getPaymentLabel(value) {
    if (!value) return '—';
    const found = PAYMENT_METHODS.find((p) => p.value === value?.toUpperCase());
    return found ? found.label : value;
}
