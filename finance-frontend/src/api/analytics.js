import axios from 'axios';
import { getUserIdFromToken } from './transactions';

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const BASE = '/api/analytics';

export const getAnalytics = (userId) =>
    axios.get(`${BASE}/user/${userId}`, { headers: authHeader() });

export { getUserIdFromToken };
