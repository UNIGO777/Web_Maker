import { create } from 'zustand'
import api from '../lib/axios'

const useAuthStore = create((set, get) => ({
    // Fix: Use '||' instead of '|' to get token or null
    token: localStorage.getItem('token') || null,
    adminToken : localStorage.getItem('adminToken') || null,
    adminUser : JSON.parse(localStorage.getItem('adminUser')) || null,
    user: localStorage.getItem('user') || null,
    error: null,
    setError: (error) => set({ error }),

    
    clearToken: () => {
        localStorage.removeItem('token');
        set({ token: null });
    },

    



    adminLogin: async (email, password) => {
        try {
            const { data } = await api.post('/auth/admin/login', { email, password });
            if (data?.data?.token) {
                localStorage.setItem('adminToken', data.data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.data.user));
                set({ adminToken: data.data.token, error: null });
                set({ adminUser: data.data.user, error: null });
                window.location.href = '/admin/dashboard';
            } else {
                set({ error: 'No token received from server.' });
            }
        } catch (err) {
            set({ error: err?.response?.data?.message || err.message || 'Admin login failed.' });
        }
    },

    login: async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            if (data?.data?.token) {
                localStorage.setItem('token', data.data.token);
                set({ token: data.data.token, error: null });
                console.log(data)
                window.location.href = '/'
            } else {
                set({ error: 'No token received from server.' });
            }
        } catch (err) {
            set({ error: err?.response?.data?.message || err.message || 'Login failed.' });
        }
    },

    register: async ({ firstName, lastName, email, password }) => {
        try {
            const { data } = await api.post('/auth/register', { firstName, lastName, email, password });
            if (data?.data?.token) {
                localStorage.setItem('token', data.data.token);
                set({ token: data.data.token, error: null });
                window.location.href = '/';
            } else {
                set({ error: 'No token received from server.' });
            }
        } catch (err) {
            set({ error: err?.response?.data?.message || err.message || 'Registration failed.' });
        }
    },
}))

export default useAuthStore
