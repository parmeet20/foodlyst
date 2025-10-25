import { create } from 'zustand';

export type Role = 'OWNER' | 'USER';

// Your User interface
export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    walletAddress: string;
    walletConnected: boolean;
    latitude?: number;
    longitude?: number;
    balance: number;
}

// Auth state interface
interface AuthState {
    user: User | null;
    token: string | null;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    setLocation: (latitude: number, longitude: number) => void; // Added setLocation
    logout: () => void;
}

// Zustand store
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    setLocation: (latitude, longitude) =>
        set((state) => ({
            user: state.user ? { ...state.user, latitude, longitude } : null,
        })),
    logout: () => set({ user: null, token: null }),
}));