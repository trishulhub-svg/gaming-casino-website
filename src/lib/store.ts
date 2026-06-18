'use client'
import { create } from 'zustand'

export interface User {
  id: number
  username: string
  email: string
  phone: string | null
  balance: number
  avatar_url: string | null
  role: string
  referral_code: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
  updateBalance: (balance: number) => void
}

// No persist middleware — auth state is fetched from /api/user/profile on every mount.
// This avoids all SSR/hydration issues with localStorage access.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateBalance: (balance) =>
    set((state) => ({
      user: state.user ? { ...state.user, balance } : null,
    })),
}))

interface UIState {
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
  balanceHidden: boolean
  toggleBalance: () => void
}

export const useUIStore = create<UIState>((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  balanceHidden: false,
  toggleBalance: () => set((s) => ({ balanceHidden: !s.balanceHidden })),
}))

// Toast store (lightweight)
interface ToastItem {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}
interface ToastState {
  toasts: ToastItem[]
  push: (t: Omit<ToastItem, 'id'>) => void
  dismiss: (id: string) => void
}
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    if (typeof window !== 'undefined') {
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter(x => x.id !== id) })), 4000)
    }
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter(x => x.id !== id) })),
}))
