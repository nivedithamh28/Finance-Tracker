import axios from 'axios';

// Decode JWT to get userId
export function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId != null ? Number(payload.userId) : null;
    } catch {
        return null;
    }
}

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const BASE = '/api/transactions';

export const getTransactionsByUser = (userId, params = {}) =>
    axios.get(`${BASE}/user/${userId}`, { headers: authHeader(), params });

export const getTransactionById = (id) =>
    axios.get(`${BASE}/${id}`, { headers: authHeader() });

export const createTransaction = (data) =>
    axios.post(BASE, data, { headers: authHeader() });

export const updateTransaction = (id, data) =>
    axios.put(`${BASE}/${id}`, data, { headers: authHeader() });

export const deleteTransaction = (id) =>
    axios.delete(`${BASE}/${id}`, { headers: authHeader() });
