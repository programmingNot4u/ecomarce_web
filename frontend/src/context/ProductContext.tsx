import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { type Product } from '../mocks/products';

export type { Product };

export interface Category {
  id: string; // Using string for easier UUID-like or slug usage, or keeping simple
  name: string;
  count: number;
  hasSub?: boolean;
  parentId?: string; // For hierarchy
  subCategories?: Category[]; // For recursive structure in UI, though flat list in DB is often easier
}

export interface Brand {
  id: string;
  name: string;
  count: number;
  logo?: boolean; 
  image?: string;
}

export interface Review {
  id: string;
  productId: number;
  userName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface InventoryLog {
  id: string;
  productId: number;
  combinationId?: string; // If specific variant
  changeAmount: number;
  reason: 'Restock' | 'Order' | 'Damage' | 'Return' | 'Correction' | 'Other';
  note?: string;
  date: string;
  user: string; // e.g., 'Admin'
}

interface ProductContextType {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  addBrand: (brand: Brand) => void;
  updateBrand: (id: string, brand: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  
  getProductsByCategory: (category: string) => Product[];
  getProductsByBrand: (brand: string) => Product[];

  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date' | 'status'>) => void;
  getProductReviews: (productId: number) => Review[];

  // Inventory
  inventoryLogs: InventoryLog[];
  updateStock: (productId: number, change: number, reason: InventoryLog['reason'], note?: string, combinationId?: string) => void;
  suppliers: Supplier[];
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
}

export interface Supplier {
    id: string;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Seed Data
// Seed Data - Cleared for User Request (User wants to populate from Admin)
// Seed Data - Cleared for User Request (User wants to populate from Admin)
// Note: maintaining empty seedProducts implicitly by not importing or using a cleared array if I remove the import, 
// but for minimal diff I will just use empty array here or ignore the import.
// Actually I need to make sure 'seedProducts' import doesn't override.
// Let's just define empty arrays here.

export function ProductProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
  
    // Initialize from LocalStorage or Seed (Empty)
    useEffect(() => {
      // Products
      const storedProducts = localStorage.getItem('maryone_products_v3');
      if (storedProducts) {
        try { setProducts(JSON.parse(storedProducts)); } 
        catch { setProducts([]); }
      } else {
        setProducts([]);
      }
  
      // Categories
      const storedCategories = localStorage.getItem('maryone_categories_v3'); 
      if (storedCategories) {
          try { setCategories(JSON.parse(storedCategories)); }
          catch { setCategories([]); }
      } else {
          setCategories([]);
      }
  
      // Brands
      const storedBrands = localStorage.getItem('maryone_brands_v3');
      if (storedBrands) {
          try { setBrands(JSON.parse(storedBrands)); }
          catch { setBrands([]); }
      } else {
          setBrands([]);
      }

      // Reviews
      const storedReviews = localStorage.getItem('maryone_reviews_v3');
      if (storedReviews) {
          try { setReviews(JSON.parse(storedReviews)); }
          catch { setReviews([]); }
      } else {
          setReviews([]);
      }
  
      setIsLoaded(true);
    }, []);
  
    // Sync to LocalStorage
    useEffect(() => {
      if (isLoaded) {
        localStorage.setItem('maryone_products_v3', JSON.stringify(products));
        localStorage.setItem('maryone_categories_v3', JSON.stringify(categories));
        localStorage.setItem('maryone_brands_v3', JSON.stringify(brands));
        localStorage.setItem('maryone_reviews_v3', JSON.stringify(reviews));
      }
    }, [products, categories, brands, isLoaded]);
  
    // --- Product Actions ---
    const addProduct = (newProductData: Omit<Product, 'id'>) => {
      const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
      const newProduct = { ...newProductData, id: maxId + 1 };
      setProducts(prev => [newProduct, ...prev]);
    };
  
    const updateProduct = (id: number, updatedFields: Partial<Product>) => {
      setProducts(prev => 
        prev.map(p => (p.id === id ? { ...p, ...updatedFields } : p))
      );
    };
  
    const deleteProduct = (id: number) => {
      setProducts(prev => prev.filter(p => p.id !== id));
    };
  
    // --- Category Actions ---

    // Recursive helper to add subcategory
    const addCategoryRecursive = (cats: Category[], parentId: string, newCat: Category): Category[] => {
        return cats.map(cat => {
            if (cat.id === parentId) {
                return { 
                    ...cat, 
                    hasSub: true,
                    subCategories: [...(cat.subCategories || []), newCat] 
                };
            } else if (cat.subCategories) {
                return {
                    ...cat,
                    subCategories: addCategoryRecursive(cat.subCategories, parentId, newCat)
                };
            }
            return cat;
        });
    };

    const addCategory = (category: Category) => {
        if (category.parentId) {
            setCategories(prev => addCategoryRecursive(prev, category.parentId!, category));
        } else {
            setCategories(prev => [...prev, category]);
        }
    };
    
    // Recursive helper to update category
    const updateCategoryRecursive = (cats: Category[], id: string, updatedFields: Partial<Category>): Category[] => {
        return cats.map(cat => {
            if (cat.id === id) {
                return { ...cat, ...updatedFields };
            }
            if (cat.subCategories) {
                return {
                    ...cat,
                    subCategories: updateCategoryRecursive(cat.subCategories, id, updatedFields)
                };
            }
            return cat;
        });
    };

    const updateCategory = (id: string, updatedFields: Partial<Category>) => {
        setCategories(prev => updateCategoryRecursive(prev, id, updatedFields));
    };
  
    // Recursive helper to delete category
    const deleteCategoryRecursive = (cats: Category[], id: string): Category[] => {
        return cats
            .filter(cat => cat.id !== id)
            .map(cat => ({
                ...cat,
                subCategories: cat.subCategories ? deleteCategoryRecursive(cat.subCategories, id) : []
            }));
    };

    const deleteCategory = (id: string) => {
        setCategories(prev => deleteCategoryRecursive(prev, id));
    };
  
    // --- Brand Actions ---
    const addBrand = (brand: Brand) => {
        setBrands(prev => [...prev, brand]);
    };
  
    const updateBrand = (id: string, updatedFields: Partial<Brand>) => {
        setBrands(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
    };
  
    const deleteBrand = (id: string) => {
        setBrands(prev => prev.filter(b => b.id !== id));
    };
  
    // Recursive helper to calculate counts
    const calculateCounts = (cats: Category[], prods: Product[]): Category[] => {
        return cats.map(cat => {
            // First calculate for subcategories
            const updatedSubCategories = cat.subCategories 
                ? calculateCounts(cat.subCategories, prods) 
                : [];
            
            // Count products directly in this category
            const directCount = prods.filter(p => {
                // Ensure hidden products are not counted
                if (p.status !== 'published' && p.status !== undefined) return false;
                
                if (p.categoryId) return p.categoryId === cat.id;
                return p.category === cat.name;
            }).length;
            
            // Sum counts from subcategories
            const aggregatedCount = updatedSubCategories.reduce((sum, sub) => sum + sub.count, 0);
            
            return {
                ...cat,
                subCategories: updatedSubCategories,
                count: directCount + aggregatedCount,
                hasSub: updatedSubCategories.length > 0
            };
        });
    };

    const categoriesWithCounts = useMemo(() => {
        return calculateCounts(categories, products);
    }, [categories, products]);

    // Helpers for recursive product fetching
    const findCategoryByName = (cats: Category[], name: string): Category | null => {
        for (const cat of cats) {
            if (cat.name === name) return cat;
            if (cat.subCategories) {
                const found = findCategoryByName(cat.subCategories, name);
                if (found) return found;
            }
        }
        return null;
    };

    const getAllCategoryNames = (cat: Category): string[] => {
        let names = [cat.name];
        if (cat.subCategories) {
            cat.subCategories.forEach(sub => {
                names = [...names, ...getAllCategoryNames(sub)];
            });
        }
        return names;
    };

    const getProductsByCategory = (categoryName: string) => {
        const categoryNode = findCategoryByName(categories, categoryName);
        if (!categoryNode) {
             // Fallback to strict match if category not found in tree
            return products.filter(p => p.category === categoryName);
        }
        
        // 1. Collect all valid IDs and Names recursively
        const getAllCategoryIdsAndNames = (cat: Category): { ids: string[], names: string[] } => {
            let ids = [cat.id];
            let names = [cat.name];
            if (cat.subCategories) {
                cat.subCategories.forEach(sub => {
                    const result = getAllCategoryIdsAndNames(sub);
                    ids = [...ids, ...result.ids];
                    names = [...names, ...result.names];
                });
            }
            return { ids, names };
        };

        const { ids, names } = getAllCategoryIdsAndNames(categoryNode);
        
        // 2. Filter products that match ANY of the IDs (priority) or Names (fallback)
        return products.filter(p => {
            if (p.status !== 'published') return false; // Hide non-published from public view
            if (p.categoryId) {
                return ids.includes(p.categoryId);
            }
            return names.includes(p.category);
        });
    };

    const getProductsByBrand = (brand: string) => products.filter(p => p.brand === brand && p.status === 'published');
  
    // --- Review Actions ---
    const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'status'>) => {
        const newReview: Review = {
            ...reviewData,
            id: Date.now().toString(),
            date: new Date().toISOString(),
            status: 'approved' // Auto-approve for now or 'pending' if moderation needed
        };
        setReviews(prev => [newReview, ...prev]);
    };

    const getProductReviews = (productId: number) => reviews.filter(r => r.productId === productId && r.status === 'approved');
  
    // --- Inventory & Suppliers ---
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => {
      const saved = localStorage.getItem('maryone_inventory_logs');
      return saved ? JSON.parse(saved) : [];
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
      const saved = localStorage.getItem('maryone_suppliers');
      return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('maryone_inventory_logs', JSON.stringify(inventoryLogs));
  }, [inventoryLogs]);

  useEffect(() => {
    localStorage.setItem('maryone_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  const updateStock = (productId: number, change: number, reason: InventoryLog['reason'], note?: string, combinationId?: string) => {
      setProducts(prev => prev.map(p => {
          if (p.id !== productId) return p;

          let newProduct = { ...p };

          if (combinationId && newProduct.combinations) {
              // Update variant combination stock
              newProduct.combinations = newProduct.combinations.map(c => {
                  if (c.id === combinationId) {
                      const newStock = (c.stockQuantity || 0) + change;
                      return { ...c, stockQuantity: Math.max(0, newStock) };
                  }
                  return c;
              });
              // Also update total stock if you want to track aggregate? 
              // unique stock tracking usually relies on SKU level, but let's keep simple
          } else {
             // Update main product stock
             const newStock = (newProduct.stockQuantity || 0) + change;
             newProduct.stockQuantity = Math.max(0, newStock);
             newProduct.inStock = newProduct.stockQuantity > 0;
          }

          return newProduct;
      }));

      // Log the change
      const log: InventoryLog = {
          id: Date.now().toString(),
          productId,
          combinationId,
          changeAmount: change,
          reason,
          note,
          date: new Date().toISOString(),
          user: 'Admin'
      };
      setInventoryLogs(prev => [log, ...prev]);
  };

  const addSupplier = (supplier: Supplier) => setSuppliers(prev => [...prev, supplier]);
  const updateSupplier = (id: string, updates: Partial<Supplier>) => setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  const deleteSupplier = (id: string) => setSuppliers(prev => prev.filter(s => s.id !== id));

  return (
    <ProductContext.Provider
      value={{
        products,
        categories: categoriesWithCounts,
        brands,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addBrand,
        updateBrand,
        deleteBrand,
        getProductsByCategory,
        getProductsByBrand,
        reviews,
        addReview,
        getProductReviews,
        inventoryLogs,
        updateStock,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier
      }}
    >
      {children}
    </ProductContext.Provider>
  );
  }
  
  export function useProducts() {
    const context = useContext(ProductContext);
    if (context === undefined) {
      throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
  }
