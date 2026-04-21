import axios from 'axios';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const BASE = '/api/budgets';

export const getCurrentBudget = (userId) =>
  axios.get(`${BASE}/current`, { headers: authHeader(), params: { userId } });

export const getAllBudgets = (userId) =>
  axios.get(`${BASE}/all`, { headers: authHeader(), params: { userId } });

export const getBudgetForMonth = (userId, month, year) =>
  axios.get(BASE, { headers: authHeader(), params: { userId, month, year } });

export const createBudget = (data) =>
  axios.post(BASE, data, { headers: authHeader() });

export const updateBudget = (id, data) =>
  axios.put(`${BASE}/${id}`, data, { headers: authHeader() });

export const deleteBudget = (id) =>
  axios.delete(`${BASE}/${id}`, { headers: authHeader() });

