import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Product } from '../mocks/products';
import { useProducts } from './ProductContext';

export interface CartItem extends Product {
  quantity: number;
  type?: 'simple' | 'bundle' | 'combo'; // 'combo' for backend combos, 'bundle' deprecated/alias
  bundleItems?: Product[];    // New field
  bundleId?: string;          // To link back to campaign if needed
  originalPrice?: number;     // To track original price if on sale
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product | CartItem, quantity?: number) => void;
  removeFromCart: (productId: number, variantId?: string) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const { products, isLoaded } = useProducts();

  // Validate Cart against actual products when loaded
  useEffect(() => {
    if (isLoaded && products.length > 0) {
      setCart(prev => prev.filter(item => {
        // Keep bundles (assuming they are valid or checked elsewhere) or if type is 'bundle'
        if (item.type === 'bundle') return true;

        // Filter out items that don't exist in the product list
        // Note: item.id is number for products
        return products.some(p => p.id === item.id);
      }));
    }
  }, [isLoaded, products]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product | CartItem, quantity: number = 1) => {
    setCart((prev) => {
      // Check if it's a bundle or simple product
      const isBundle = (product as CartItem).type === 'bundle';

      // --- PRICE LOGIC START ---
      // Determine effective price. 
      // If we already added it as CartItem, it might have price set.
      // If it's a fresh Product, we check salePrice.

      let effectivePrice = product.price;
      let originalPrice: number | undefined = undefined;

      // Check if product has sale price and it is active (lower than regular)
      if (product.salePrice && product.salePrice < product.price) {
        effectivePrice = product.salePrice;
        originalPrice = product.price;
      }

      // If passing incomplete object, ensure we don't lose data, but typically we pass full product.
      // --- PRICE LOGIC END ---

      const existing = prev.find((item) => {
        if (isBundle) {
          // Match bundles by ID (assuming pseudo-ID provided)
          return item.id === product.id && item.type === 'bundle';
        }
        return item.id === product.id
          && item.type !== 'bundle'
          && item.variantId === (product.variantId || undefined);
      });

      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.variantId === (product.variantId || undefined)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, {
        ...product,
        quantity,
        price: effectivePrice, // Override with sale price if applicable
        originalPrice: originalPrice,
        type: isBundle ? 'bundle' : 'simple'
      }];
    });
  };

  const removeFromCart = (productId: number, variantId?: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === productId && item.variantId === variantId)));
  };

  const updateQuantity = (productId: number, quantity: number, variantId?: string) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === productId && item.variantId === variantId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, total }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
