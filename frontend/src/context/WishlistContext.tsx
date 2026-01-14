import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { Product } from '../mocks/products'; // Or appropriate type
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface WishlistItem {
    id: number; // Wishlist ID
    productId?: number;
    productDetails?: Product;
    product_details?: Product; // Legacy support
    createdAt?: string;
    created_at?: string;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    addToWishlist: (product: Product) => Promise<void>;
    removeFromWishlist: (wishlistId: number) => Promise<void>;
    removeFromWishlistByProductId: (productId: number) => Promise<void>;
    isInWishlist: (productId: number) => boolean;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { showNotification } = useNotification();

    const fetchWishlist = async () => {
        if (!user) {
            // Guest mode: load from localStorage
            const local = localStorage.getItem('guest_wishlist');
            if (local) {
                setWishlist(JSON.parse(local));
            }
            return;
        }

        try {
            setLoading(true);
            const response = await api.get('/wishlist/');
            setWishlist(response.data);
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        } finally {
            setLoading(false);
        }
    };

    // Sync Guest Wishlist on Login
    useEffect(() => {
        const syncGuestWishlist = async () => {
            if (user) {
                const local = localStorage.getItem('guest_wishlist');
                if (local) {
                    const guestItems: WishlistItem[] = JSON.parse(local);

                    // Iterate and sync
                    for (const item of guestItems) {
                        const product = item.productDetails || item.product_details;
                        if (!product) continue;

                        try {
                            await api.post('/wishlist/', { productId: product.id });
                        } catch (e) {
                            console.log("Sync item skipped or failed", product.name);
                        }
                    }

                    // Clear local after sync attempt
                    localStorage.removeItem('guest_wishlist');
                }
                // Then fetch fresh from server
                fetchWishlist();
            } else {
                fetchWishlist();
            }
        };

        syncGuestWishlist();

    }, [user]);

    const addToWishlist = async (product: Product) => {
        if (isInWishlist(product.id)) {
            showNotification("Already in wishlist", "info");
            return;
        }

        if (!user) {
            // Guest mode
            const newItem: WishlistItem = {
                id: Date.now(),
                productId: product.id,
                productDetails: product,
                createdAt: new Date().toISOString()
            };
            const updated = [newItem, ...wishlist];
            setWishlist(updated);
            localStorage.setItem('guest_wishlist', JSON.stringify(updated));
            showNotification("Added to wishlist (Guest)", "success");
            return;
        }

        try {
            const response = await api.post('/wishlist/', { productId: product.id });
            const newItem = response.data;
            setWishlist((prev) => [newItem, ...prev]);
            showNotification("Added to wishlist", "success");
        } catch (error) {
            console.error("Failed to add to wishlist", error);
            showNotification("Failed to add to wishlist", "error");
        }
    };

    const removeFromWishlist = async (wishlistId: number) => {
        if (!user) {
            const updated = wishlist.filter((item) => item.id !== wishlistId);
            setWishlist(updated);
            localStorage.setItem('guest_wishlist', JSON.stringify(updated));
            showNotification("Removed from wishlist", "success");
            return;
        }

        try {
            await api.delete(`/wishlist/${wishlistId}/`);
            setWishlist((prev) => prev.filter((item) => item.id !== wishlistId));
            showNotification("Removed from wishlist", "success");
        } catch (error) {
            console.error("Failed to remove from wishlist", error);
            showNotification("Failed to remove from wishlist", "error");
        }
    };

    const removeFromWishlistByProductId = async (productId: number) => {
        const item = wishlist.find(i => (i.productDetails?.id || i.product_details?.id) === productId);
        if (item) {
            await removeFromWishlist(item.id);
        }
    };

    const isInWishlist = (productId: number) => {
        return wishlist.some((item) => (item.productDetails?.id || item.product_details?.id) === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, removeFromWishlistByProductId, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
