import { create } from 'zustand'
import api from '../lib/axios'

const useAuthStore = create((set, get) => ({
    // Fix: Use '||' instead of '|' to get token or null
    token: localStorage.getItem('token') || null,
    adminToken : localStorage.getItem('adminToken') || null,
    adminUser: (() => {
        try {
            const adminUserData = localStorage.getItem('adminUser');
            return adminUserData ? JSON.parse(adminUserData) : null;
        } catch (error) {
            console.error('Error parsing admin user data from localStorage:', error);
            localStorage.removeItem('adminUser');
            return null;
        }
    })(),
    user: (() => {
        try {
            const userData = localStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
            localStorage.removeItem('user');
            return null;
        }
    })(),
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
                if (data.data.user) {
                    localStorage.setItem('user', JSON.stringify(data.data.user));
                    set({ token: data.data.token, user: data.data.user, error: null });
                } else {
                    set({ token: data.data.token, error: null });
                }
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
                if (data.data.user) {
                    localStorage.setItem('user', JSON.stringify(data.data.user));
                    set({ token: data.data.token, user: data.data.user, error: null });
                } else {
                    set({ token: data.data.token, error: null });
                }
                window.location.href = '/';
            } else {
                set({ error: 'No token received from server.' });
            }
        } catch (err) {
            set({ error: err?.response?.data?.message || err.message || 'Registration failed.' });
        }
    },

    logout: async () => {
        try {
            // Call backend logout endpoint
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Clear local storage and state regardless of backend response
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ token: null, user: null, error: null });
            window.location.href = '/login';
        }
    },
    AdminLogout: async () => {
        try {
            // Call backend logout endpoint
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Admin logout error:', err);
        } finally {
            // Clear admin local storage and state regardless of backend response
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            set({ adminToken: null, adminUser: null, error: null });
            window.location.href = '/admin/login';
        }
    },
}))

export default useAuthStore
