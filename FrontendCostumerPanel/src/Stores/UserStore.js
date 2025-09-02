import { create } from 'zustand'
import api from '../lib/axios'

const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  fetchMe: async () => {
    try {
      set({ loading: true, error: null })
      const { data } = await api.get('/auth/me')
      set({ user: data?.data?.user || null, loading: false })
    } catch (err) {
      set({ error: err.message || 'Failed to fetch user', loading: false })
    }
  },
}))

export default useUserStore
