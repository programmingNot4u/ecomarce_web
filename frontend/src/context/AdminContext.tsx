import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { loginUser } from '../services/auth';

// --- Types ---
export interface Staff {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Editor' | 'Support';
    status: 'Active' | 'Pending' | 'Inactive';
    lastActive: string;
    avatar: string;
    password?: string; // Simple client-side auth
}

export interface StoreSettings {
    storeName: string;
    websiteUrl: string;
    currency: string;
    description: string;
    notifications: {
        orderReceived: boolean;
        lowStock: boolean;
        newReview: boolean;
        dailyReport: boolean;
    };
    security: {
        twoFactorEnabled: boolean;
    };
}

interface AdminContextType {
    staff: Staff[];
    currentUser: Staff | null;
    settings: StoreSettings;
    addStaff: (staff: Omit<Staff, 'id' | 'lastActive'>) => void;
    updateStaff: (id: string, updates: Partial<Staff>) => void;
    removeStaff: (id: string) => void;
    updateSettings: (updates: Partial<StoreSettings>) => void;
    toggleNotification: (key: keyof StoreSettings['notifications']) => void;
    login: (email: string, password?: string) => Promise<boolean>;
    logout: () => void;
}

// --- Initial Data ---
const DEFAULT_STAFF: Staff[] = [
    { id: '1', name: 'Rony Parker', email: 'ronyp@maryone.shop', role: 'Admin', status: 'Active', lastActive: 'Now', avatar: 'R', password: 'admin' }, // Default password for demo
    { id: '2', name: 'Sarah Jenkins', email: 'sarah.j@maryone.shop', role: 'Manager', status: 'Active', lastActive: '2h ago', avatar: 'S', password: '123' },
];

const DEFAULT_SETTINGS: StoreSettings = {
    storeName: 'Maryoné Shop',
    websiteUrl: 'maryone.shop',
    currency: 'BDT (৳)',
    description: 'Premium fashion and lifestyle brand based in Dhaka.',
    notifications: {
        orderReceived: true,
        lowStock: true,
        newReview: true,
        dailyReport: false,
    },
    security: {
        twoFactorEnabled: false,
    }
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    // --- State ---
    const [staff, setStaff] = useState<Staff[]>([]);

    const [settings, setSettings] = useState<StoreSettings>(() => {
        const saved = localStorage.getItem('admin_settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    const [currentUser, setCurrentUser] = useState<Staff | null>(() => {
        const saved = localStorage.getItem('admin_current_user');
        return saved ? JSON.parse(saved) : null;
    });

    // --- Persistence ---
    useEffect(() => {
        if (currentUser) {
            fetchStaff();
        }
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem('admin_settings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('admin_current_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('admin_current_user');
        }
    }, [currentUser]);

    // --- Actions ---
    const fetchStaff = async () => {
        try {
            const res = await api.get('/users/');
            const mappedStaff: Staff[] = res.data.map((u: any) => ({
                id: u.id.toString(),
                name: u.firstName ? `${u.firstName} ${u.lastName}`.trim() : u.username || u.email,
                email: u.email,
                role: u.role || (u.isSuperuser ? 'Admin' : 'Support'),
                status: u.isActive ? 'Active' : 'Inactive',
                lastActive: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never',
                avatar: u.avatar || '',
            }));
            setStaff(mappedStaff);
        } catch (error: any) {
            // console.error("Failed to fetch staff", error); // Silence log to avoid user confusion
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                // Token is invalid or user is not admin
                // Automatically clear stale admin session
                console.warn("Cleared stale admin session due to 401/403");
                logout();
            }
        }
    };

    const addStaff = async (newStaff: Omit<Staff, 'id' | 'lastActive'>) => {
        try {
            // Split name
            const [firstName, ...lastNameParts] = newStaff.name.split(' ');
            const lastName = lastNameParts.join(' ');

            const payload = {
                username: newStaff.email,
                email: newStaff.email,
                first_name: firstName,
                last_name: lastName,
                password: newStaff.password,
                role: newStaff.role,
                avatar: newStaff.avatar,
                is_active: newStaff.status === 'Active'
            };

            await api.post('/users/', payload);
            fetchStaff();
        } catch (error: any) {
            console.error("Failed to add staff", error);
            if (error.response && error.response.status === 400) {
                const data = error.response.data;
                if (data.username || data.email) {
                    alert("A user with this email already exists.");
                    return;
                }
            }
            alert("Failed to create user. Please try again.");
        }
    };

    const updateStaff = async (id: string, updates: Partial<Staff>) => {
        try {
            const payload: any = {};
            if (updates.name) {
                const [firstName, ...lastNameParts] = updates.name.split(' ');
                payload.first_name = firstName;
                payload.last_name = lastNameParts.join(' ');
            }
            if (updates.email) payload.email = updates.email;
            if (updates.role) payload.role = updates.role;
            if (updates.status) payload.is_active = updates.status === 'Active';
            if (updates.password) payload.password = updates.password;
            if (updates.avatar !== undefined) payload.avatar = updates.avatar || null; // Handle clear

            await api.patch(`/users/${id}/`, payload);
            fetchStaff();

            // Logic to update currentUser if self-edit is complex with API, relies on refresh or re-fetch
        } catch (error) {
            console.error("Failed to update staff", error);
        }
    };

    const removeStaff = async (id: string) => {
        try {
            await api.delete(`/users/${id}/`);
            setStaff(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error("Failed to remove staff", error);
        }
    };

    const updateSettings = (updates: Partial<StoreSettings>) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    const toggleNotification = (key: keyof StoreSettings['notifications']) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    const login = async (email: string, password?: string): Promise<boolean> => {
        try {
            const data = await loginUser({ email, password });
            if (data && data.token) {
                // Map API user to Staff
                const user = data.user;
                const staffMember: Staff = {
                    id: user.id.toString(),
                    name: user.first_name ? `${user.first_name} ${user.last_name}` : 'Admin User',
                    email: user.email,
                    role: user.is_superuser ? 'Admin' : 'Editor', // Simple mapping
                    status: 'Active',
                    lastActive: 'Now',
                    avatar: user.avatar || 'A', // Backend might need avatar field in serializer
                    password: '' // Don't store password
                };
                setCurrentUser(staffMember);
                localStorage.setItem('token', data.token); // Shared with Redux potentially
                return true;
            }
        } catch (e) {
            console.error("Login failed", e);
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('admin_current_user');
    };

    return (
        <AdminContext.Provider value={{
            staff,
            currentUser,
            settings,
            addStaff,
            updateStaff,
            removeStaff,
            updateSettings,
            toggleNotification,
            login,
            logout
        }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    // Re-export Staff type for consumers
    return context;
}

// Export type for usage in other files
export type { Staff };

