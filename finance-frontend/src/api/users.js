import axios from 'axios';

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const BASE = '/api/users';

export const getUserProfile = (userId) =>
    axios.get(`${BASE}/${userId}`, { headers: authHeader() });

export const updateUserProfile = (userId, data) =>
    axios.put(`${BASE}/${userId}/profile`, data, { headers: authHeader() });

export const updateUserPassword = (userId, data) =>
    axios.put(`${BASE}/${userId}/password`, data, { headers: authHeader() });
