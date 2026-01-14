import { useQueries } from '@tanstack/react-query';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '../mocks/products';
import api from '../services/api';



export interface Category {
    id: string; // Using string for easier UUID-like or slug usage, or keeping simple
    name: string;
    count: number;
    hasSub?: boolean;
    parentId?: string; // For hierarchy
    subCategories?: Category[]; // For recursive structure in UI, though flat list in DB is often easier
    showInMenu?: boolean;
    image?: string;
}

export interface Brand {
    id: string; // number in backend but string safe
    name: string;
    slug?: string;
    logo?: string;
    count?: number; // computed on frontend or backend
}

export interface Review {
    id: string;
    productId: number;
    userName: string;
    rating: number; // 1-5
    comment: string;
    date: string;
    comment: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
    reply?: string;
    replyDate?: string;
    verifiedPurchase?: boolean;
    images?: string[];
    helpful?: number;
}

export interface InventoryLog {
    id: number;
    product: number;
    productName?: string;
    variant?: number;
    variantName?: string;
    changeAmount: number;
    reason: string;
    note?: string;
    createdAt: string;
    user?: number;
    userName?: string;
}

export interface PaginationMetadata {
    count: number;
    next: string | null;
    previous: string | null;
    current_page: number;
    total_pages: number;
}

interface ProductContextType {
    products: Product[];
    pagination: PaginationMetadata;
    fetchProducts: (params?: any) => Promise<void>;
    isLoaded: boolean;
    categories: Category[];
    brands: Brand[];

    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (id: number, product: Partial<Product>) => void;
    deleteProduct: (id: number) => void;

    addCategory: (category: Category | FormData) => void;
    updateCategory: (id: string, category: Partial<Category> | FormData) => void;
    deleteCategory: (id: string) => void;

    addBrand: (brand: Brand) => void;
    updateBrand: (id: string, brand: Partial<Brand>) => void;
    deleteBrand: (id: string) => void;

    getProductsByCategory: (category: string) => Product[];
    getProductsByBrand: (brand: string) => Product[];

    // Reviews
    reviews: Review[];
    addReview: (review: Omit<Review, 'id' | 'date' | 'status'>) => void;
    updateReview: (id: string, updates: Partial<Review>) => void;
    deleteReview: (id: string) => void;
    getProductReviews: (productId: number) => Review[];

    // Support
    supportTickets: SupportTicket[];
    addSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'date' | 'status' | 'replies'>) => void;
    updateSupportTicket: (id: string, updates: Partial<SupportTicket>) => void;
    deleteSupportTicket: (id: string) => void;
    replyToTicket: (ticketId: string, message: string) => void;


    // Inventory
    inventoryLogs: InventoryLog[];
    updateStock: (productId: number, change: number, reason: InventoryLog['reason'], note?: string, combinationId?: string) => void;
    suppliers: Supplier[];
    addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
    updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
    deleteSupplier: (id: string) => void;

    purchaseOrders: PurchaseOrder[];
    addPurchaseOrder: (po: Omit<PurchaseOrder, 'id'>) => void;
    updatePurchaseOrder: (id: string, po: Partial<PurchaseOrder>) => void;

    orders: Order[];
    addOrder: (order: Order) => void;
    updateOrder: (id: string, order: Partial<Order>) => void;
    paymentMethods: PaymentMethodConfig[];
    updatePaymentMethod: (id: string, updates: Partial<PaymentMethodConfig>) => void;
    addPaymentMethod: (method: PaymentMethodConfig) => void;
    deletePaymentMethod: (id: string) => void;

    // Global Payment Settings
    paymentSettings: PaymentSettings;
    updatePaymentSettings: (settings: Partial<PaymentSettings>) => void;


    // City Management
    insideDhakaCities: string[];
    addInsideDhakaCity: (city: string) => void;
    removeInsideDhakaCity: (city: string) => void;

    resolveReturn: (orderId: string, action: 'Returned' | 'Lost') => Promise<any>;

    updateOrderItems: (orderId: string, newItems: Order['items']) => void;
    shipOrder: (orderId: string, courierName: string) => Promise<void>;
    cancelOrder: (orderId: string) => Promise<void>;
    addVerificationLog: (orderId: string, log: { action: string; outcome: string; note?: string }) => Promise<void>;
    fetchOrders: () => Promise<void>;

    // Marketing
    campaigns: Campaign[];
    addCampaign: (campaign: Campaign) => void;
    updateCampaign: (id: string, updates: Partial<Campaign>) => void;
    deleteCampaign: (id: string) => void;

    coupons: Coupon[];
    addCoupon: (coupon: Coupon) => void;
    updateCoupon: (id: string, updates: Partial<Coupon>) => void;

    deleteCoupon: (id: string) => void;
    validateCoupon: (code: string) => Promise<any>; // Added validateCoupon


    // Content
    banners: Banner[];
    addBanner: (banner: Banner) => void;
    updateBanner: (id: string, updates: Partial<Banner>) => void;
    deleteBanner: (id: string) => void;

    pages: PageContent[];
    addPage: (page: { title: string; slug?: string; content?: string }) => void;
    updatePage: (slug: string, content: string) => void;
    deletePage: (slug: string) => void;

    faqs: FAQ[];
    addFAQ: (faq: FAQ) => void;
    updateFAQ: (id: string, updates: Partial<FAQ>) => void;
    deleteFAQ: (id: string) => void;

    // Q&A
    questions: Question[];
    addQuestion: (question: Omit<Question, 'id' | 'date' | 'status'>) => void;
    answerQuestion: (id: string, answer: string) => void;
    deleteQuestion: (id: string) => void;
    getProductQuestions: (productId: number) => Question[];
}

export interface Supplier {
    id: string;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
}

export interface PurchaseOrder {
    id: string;
    orderNumber: string;
    supplierId: string;
    date: string;
    status: 'Draft' | 'Ordered' | 'Received' | 'Cancelled';
    items: {
        productId: number;
        variantId?: string;
        quantity: number;
        cost: number;
    }[];
    totalCost: number;
    notes?: string;
}

export interface PaymentMethodConfig {
    id: string;
    name: string; // e.g. Bkash, Nagad
    type: 'manual' | 'gateway' | 'cod';
    number?: string; // For manual mobile banking
    instructions?: string; // "Send money to this number..."
    qrCode?: string; // URL or Base64
    isActive: boolean;
}

export interface PaymentSettings {
    vatPercentage: number;
    insideDhakaShipping: number;
    outsideDhakaShipping: number;
}


export interface Order {
    id: string;
    userId?: string;
    customerName: string;
    email: string;
    phone: string;
    date: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
    paymentMethod: string; // Changed from literal union to string to support dynamic names
    transactionId?: string; // New field for manual verification
    total: number;
    subtotal: number;
    shipping: number;
    fee: number;
    items: {
        id: number;
        product: number; // Product ID
        productName: string; // Mapped from product_name
        name?: string; // Legacy/Fallback
        price: number;
        quantity: number;
        image: string;
        variantId?: string;
        variantInfo?: any; // Added to capture color/size details
        type?: 'simple' | 'bundle';
        bundleItems?: Product[];
    }[];
    billingAddress: any;
    shippingAddress: any;
    trackingNumber?: string;
    courierName?: string;
    instructions?: string; // Delivery instructions
    returnStatus?: 'Pending' | 'Returned' | 'Lost' | 'None';
    lossAmount?: number;
    verificationStatus?: 'Pending' | 'Verified' | 'Unreachable' | 'Issues';
    verificationLogs?: VerificationLog[];
    raw?: any;
}

export interface VerificationLog {
    id: string;
    date: string;
    admin: string;
    action: 'Call' | 'Message' | 'Email';
    outcome: 'Connected' | 'No Answer' | 'Busy' | 'Wrong Number' | 'Confirmed' | 'Follow Up';
    note?: string;
}

export interface ShippingMethod {
    id: string;
    name: string;
    price: number;
    description: string;
}

export interface SupportTicket {
    id: string;
    userId?: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    priority: 'Low' | 'Medium' | 'High';
    date: string;
    replies?: {
        id: string;
        sender: 'User' | 'Admin';
        message: string;
        date: string;
    }[];
}

export interface Campaign {
    id: string;
    name: string;
    type: 'flash_sale' | 'bundle' | 'loyalty';
    startDate: string;
    endDate: string;
    status: 'active' | 'scheduled' | 'ended';
    discountValue: number;
    campaign_products?: {
        product: number;
        product_name?: string;
        product_image?: string[]; // URL array
        discount_type: 'percentage' | 'fixed';
        discount_value: number;
    }[];
    description?: string;
    bannerImage?: string;
}

export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minPurchase?: number;
    usageLimit?: number;
    usedCount: number;
    expiryDate: string;
    status: 'active' | 'expired' | 'disabled';
}

export interface Banner {
    id: string;
    title: string;
    image: string;
    link: string;
    subtitle?: string;
    ctaText?: string;
    position: 'hero' | 'mid' | 'footer' | 'grid-1' | 'grid-2' | 'grid-3' | 'grid-4';
    order: number;
    active: boolean;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
}

export interface PageContent {
    id: string;
    slug: 'about' | 'terms' | 'privacy' | 'shipping' | 'returns';
    title: string;
    content: string; // HTML or Markdown
    lastUpdated: string;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: 'General' | 'Shipping' | 'Payment' | 'Returns';
    order: number;
}

export interface Question {
    id: string;
    productId: number;
    userName: string;
    question: string;
    date: string;
    answer?: string;
    answerDate?: string;
    status: 'pending' | 'answered';
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
    const [pagination, setPagination] = useState<PaginationMetadata>({
        count: 0,
        next: null,
        previous: null,
        current_page: 1,
        total_pages: 1
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]); // Initialize state
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
        vatPercentage: 5,
        insideDhakaShipping: 60,
        outsideDhakaShipping: 120
    });

    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize from LocalStorage or Seed (Empty)
    // React Query Implementation
    const results = useQueries({
        queries: [
            { queryKey: ['products'], queryFn: () => api.get('/products/'), staleTime: 5 * 60 * 1000 },
            { queryKey: ['categories'], queryFn: () => api.get('/categories/'), staleTime: 10 * 60 * 1000 },
            { queryKey: ['brands'], queryFn: () => api.get('/brands/'), staleTime: 10 * 60 * 1000 },
            { queryKey: ['reviews'], queryFn: () => api.get('/reviews/'), staleTime: 5 * 60 * 1000 },
            { queryKey: ['banners'], queryFn: () => api.get('/banners/'), staleTime: 10 * 60 * 1000 },
            { queryKey: ['faqs'], queryFn: () => api.get('/faqs/'), staleTime: 10 * 60 * 1000 },
            { queryKey: ['pages'], queryFn: () => api.get('/pages/'), staleTime: 10 * 60 * 1000 },
            { queryKey: ['questions'], queryFn: () => api.get('/questions/'), staleTime: 5 * 60 * 1000 },
            { queryKey: ['campaigns'], queryFn: () => api.get('/campaigns/'), staleTime: 2 * 60 * 1000 },
            { queryKey: ['paymentMethods'], queryFn: () => api.get('/payment-methods/'), staleTime: 10 * 60 * 1000 },
            { queryKey: ['paymentSettings'], queryFn: () => api.get('/payment-settings/'), staleTime: 10 * 60 * 1000 }
        ]
    });

    const [
        productsQuery,
        categoriesQuery,
        brandsQuery,
        reviewsQuery,
        bannersQuery,
        faqsQuery,
        pagesQuery,
        questionsQuery,
        campaignsQuery,
        paymentMethodsQuery,
        paymentSettingsQuery
    ] = results;

    // Sync Query Data to State (Maintenance of existing API)
    useEffect(() => {
        if (productsQuery.data?.data) {
            const responseData = productsQuery.data.data;
            const rawProducts = responseData.results || [];
            const allProducts = rawProducts.map((p: any) => ({
                ...p,
                stockQuantity: p.stock_quantity || p.stockQuantity || 0,
                manageStock: p.manage_stock ?? p.manageStock ?? true,
                lowStockThreshold: p.low_stock_threshold || p.lowStockThreshold || 2,
                combinations: (p.combinations || []).map((v: any) => ({
                    ...v,
                    stockQuantity: v.stock_quantity || v.stockQuantity || 0
                }))
            }));
            setProducts(allProducts);
            setPagination({
                count: responseData.count || 0,
                next: responseData.next,
                previous: responseData.previous,
                current_page: 1,
                total_pages: Math.ceil((responseData.count || 0) / 10)
            });
        }
    }, [productsQuery.data]);

    useEffect(() => { if (categoriesQuery.data?.data) setCategories(categoriesQuery.data.data); }, [categoriesQuery.data]);
    useEffect(() => { if (brandsQuery.data?.data) setBrands(brandsQuery.data.data); }, [brandsQuery.data]);
    useEffect(() => {
        if (reviewsQuery.data?.data) {
            const reviewData = reviewsQuery.data.data;
            setReviews(Array.isArray(reviewData) ? reviewData : (reviewData.results || []));
        }
    }, [reviewsQuery.data]);
    useEffect(() => { if (bannersQuery.data?.data) setBanners(bannersQuery.data.data); }, [bannersQuery.data]);
    useEffect(() => { if (faqsQuery.data?.data) setFaqs(faqsQuery.data.data); }, [faqsQuery.data]);
    useEffect(() => { if (pagesQuery.data?.data) setPages(pagesQuery.data.data); }, [pagesQuery.data]);
    useEffect(() => {
        if (questionsQuery.data?.data) {
            const qData = questionsQuery.data.data;
            setQuestions(Array.isArray(qData) ? qData : (qData.results || []));
        }
    }, [questionsQuery.data]);
    useEffect(() => {
        if (campaignsQuery.data?.data) {
            const rawCampaigns = campaignsQuery.data.data;
            setCampaigns(rawCampaigns.map((c: any) => ({
                id: c.id.toString(),
                name: c.name,
                type: (c.campaignType || c.campaign_type || c.type || 'unknown').toLowerCase(),
                startDate: c.start_date || c.startDate,
                endDate: c.end_date || c.endDate,
                status: (() => {
                    if (c.status) return c.status;
                    if (!c.is_active) return 'ended';
                    const now = new Date();
                    const start = new Date(c.start_date || c.startDate);
                    const end = new Date(c.end_date || c.endDate);
                    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'active';
                    if (now >= start && now <= end) return 'active';
                    if (now < start) return 'scheduled';
                    return 'ended';
                })(),
                discountValue: Number(c.discount_value || c.discountValue),
                campaign_products: (c.campaignProducts || c.campaign_products || []).map((cp: any) => ({
                    product: cp.product,
                    product_name: cp.productName || cp.product_name,
                    product_image: cp.productImage || cp.product_image,
                    discount_type: cp.discountType || cp.discount_type || 'percentage',
                    discount_value: Number(cp.discountValue || cp.discount_value || 0)
                })),
                description: c.description
            })));
        }
    }, [campaignsQuery.data]);
    useEffect(() => { if (paymentMethodsQuery.data?.data) setPaymentMethods(paymentMethodsQuery.data.data); }, [paymentMethodsQuery.data]);
    useEffect(() => {
        if (paymentSettingsQuery.data?.data) {
            const settings = paymentSettingsQuery.data.data;
            setPaymentSettings({
                vatPercentage: Number(settings.vatPercentage ?? settings.vat_percentage),
                insideDhakaShipping: Number(settings.insideDhakaShipping ?? settings.inside_dhaka_shipping),
                outsideDhakaShipping: Number(settings.outsideDhakaShipping ?? settings.outside_dhaka_shipping)
            });
        }
    }, [paymentSettingsQuery.data]);

    useEffect(() => {
        const allLoaded = results.every(r => !r.isLoading);
        if (allLoaded) setIsLoaded(true);
    }, [results]);

    // Legacy fetch for admin/protected data (kept separate for now as auth handling is specific)
    useEffect(() => {
        const fetchProtected = async () => {
            const token = localStorage.getItem('token');
            const adminUser = localStorage.getItem('admin_current_user');
            if (token && adminUser) {
                try {
                    const protectedPromises = [
                        api.get('/coupons/'),
                        api.get('/inventory-logs/'),
                        api.get('/suppliers/'),
                        api.get('/purchase-orders/'),
                        api.get('/orders/?page_size=1000'),
                        api.get('/tickets/'),
                    ];
                    const protectedResults = await Promise.allSettled(protectedPromises);

                    if (protectedResults[0].status === 'fulfilled') {
                        const rawCoupons = protectedResults[0].value.data;
                        setCoupons(rawCoupons.map((c: any) => ({
                            id: c.id.toString(),
                            code: c.code,
                            type: c.discount_type,
                            value: c.value,
                            minPurchase: c.min_purchase,
                            usageLimit: c.usage_limit,
                            usedCount: c.used_count,
                            expiryDate: c.expiry_date,
                            status: c.is_active ? 'active' : 'disabled'
                        })));
                    }
                    if (protectedResults[1].status === 'fulfilled') setInventoryLogs(protectedResults[1].value.data);
                    if (protectedResults[2].status === 'fulfilled') setSuppliers(protectedResults[2].value.data);
                    if (protectedResults[3].status === 'fulfilled') {
                        const poData = protectedResults[3].value.data;
                        const mappedPOs = Array.isArray(poData) ? poData.map((p: any) => ({
                            id: p.id.toString(),
                            orderNumber: p.order_number || p.orderNumber,
                            supplierId: (p.supplier && typeof p.supplier === 'object') ? p.supplier.id.toString() : (p.supplier ? p.supplier.toString() : (p.supplierId ? p.supplierId.toString() : '')),
                            date: p.date ? p.date : (p.created_at ? p.created_at : new Date().toISOString()),
                            status: p.status,
                            items: p.items || [],
                            totalCost: Number(p.total_cost || p.totalCost || 0),
                            notes: p.notes
                        })) : [];
                        setPurchaseOrders(mappedPOs);
                    }
                    if (protectedResults[4].status === 'fulfilled') {
                        const responseData = protectedResults[4].value.data;
                        const rawOrders = Array.isArray(responseData) ? responseData : (responseData.results || []);
                        const mappedOrders = rawOrders.map((o: any) => ({
                            id: o.id.toString(),
                            customerName: o.customerName,
                            email: o.email || '',
                            phone: o.phone,
                            date: o.date,
                            status: o.status,
                            paymentStatus: o.paymentStatus,
                            paymentMethod: o.paymentMethod,
                            transactionId: o.transactionId,
                            subtotal: Number(o.subtotal),
                            shipping: Number(o.shippingCost),
                            total: Number(o.total),
                            fee: 0,
                            items: (o.items || []).map((item: any) => ({
                                id: item.product,
                                name: item.productName || item.name || 'Unknown Product',
                                price: Number(item.price),
                                quantity: item.quantity,
                                image: item.image || '',
                                variantInfo: (typeof item.variantInfo === 'string' ? JSON.parse(item.variantInfo.replace(/'/g, '"')) : item.variantInfo) || item.variantInfo,
                                variantId: item.variantId
                            })),
                            shippingAddress: (typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress.replace(/'/g, '"')) : o.shippingAddress) || {},
                            instructions: o.instructions || '',
                            billingAddress: (typeof o.billingAddress === 'string' ? JSON.parse(o.billingAddress.replace(/'/g, '"')) : o.billingAddress) || {},
                            trackingNumber: o.trackingNumber,
                            courierName: o.courierName,
                            returnStatus: o.returnStatus || o.return_status || 'None',
                            lossAmount: Number(o.lossAmount || o.loss_amount || 0),
                            verificationStatus: o.verificationStatus,
                            verificationLogs: o.verificationLogs
                        }));
                        setOrders(mappedOrders);
                    }
                    if (protectedResults[5].status === 'fulfilled') {
                        setSupportTickets(protectedResults[5].value.data);
                    }
                } catch (err) {
                    console.warn("Protected data fetch skipped or failed", err);
                }
            }
        };
        fetchProtected();
    }, []);

    // Sync to LocalStorage
    // Removed products sync as it's now partial/paginated and shouldn't overwrite cache with partial data
    useEffect(() => {
        if (isLoaded) {
            // localStorage.setItem('maryone_products_v3', JSON.stringify(products));  // Disabled for pagination safety
            // localStorage.setItem('maryone_categories_v3', JSON.stringify(categories)); 
            localStorage.setItem('maryone_brands_v3', JSON.stringify(brands));
            localStorage.setItem('maryone_reviews_v3', JSON.stringify(reviews));
        }
    }, [products, categories, brands, reviews, isLoaded]);

    const fetchProducts = useCallback(async (params: any = {}) => {
        try {
            const res = await api.get('/products/', { params });
            const data = res.data;
            const rawProducts = data.results || [];

            const mappedProducts = rawProducts.map((p: any) => ({
                ...p,
                stockQuantity: p.stock_quantity || p.stockQuantity || 0,
                manageStock: p.manage_stock ?? p.manageStock ?? true,
                lowStockThreshold: p.low_stock_threshold || p.lowStockThreshold || 2,
                combinations: (p.combinations || []).map((v: any) => ({
                    ...v,
                    stockQuantity: v.stock_quantity || v.stockQuantity || 0
                }))
            }));

            setProducts(mappedProducts);
            setPagination({
                count: data.count,
                next: data.next,
                previous: data.previous,
                current_page: params.page || 1,
                total_pages: Math.ceil(data.count / (params.page_size || 10))
            });

        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    }, []);

    // --- Product Actions ---
    const addProduct = async (newProductData: Omit<Product, 'id'>) => {
        try {
            // Map to snake_case for backend
            const payload = {
                ...newProductData,
                stock_quantity: newProductData.stockQuantity,
                manage_stock: newProductData.manageStock,
                low_stock_threshold: newProductData.lowStockThreshold,
                allow_backorders: newProductData.allowBackorders,
                on_sale: newProductData.onSale,
                // Nested combinations mapping
                combinations: newProductData.combinations?.map(c => ({
                    ...c,
                    stock_quantity: c.stockQuantity
                }))
            };
            const res = await api.post('/products/', payload);

            // Map Response Back to Frontend Format
            const mappedProduct = {
                ...res.data,
                stockQuantity: res.data.stock_quantity || res.data.stockQuantity || 0,
                manageStock: res.data.manage_stock ?? res.data.manageStock ?? true,
                lowStockThreshold: res.data.low_stock_threshold || res.data.lowStockThreshold || 2,
                combinations: (res.data.combinations || []).map((v: any) => ({
                    ...v,
                    stockQuantity: v.stock_quantity || v.stockQuantity || 0
                }))
            };

            setProducts(prev => [mappedProduct, ...prev]);
        } catch (error) { console.error("Failed to add product", error); }
    };

    const updateProduct = async (id: number, updatedFields: Partial<Product>) => {
        try {
            // Map to snake_case for backend
            const payload: any = { ...updatedFields };
            if (updatedFields.stockQuantity !== undefined) payload.stock_quantity = updatedFields.stockQuantity;
            if (updatedFields.manageStock !== undefined) payload.manage_stock = updatedFields.manageStock;
            if (updatedFields.lowStockThreshold !== undefined) payload.low_stock_threshold = updatedFields.lowStockThreshold;
            if (updatedFields.allowBackorders !== undefined) payload.allow_backorders = updatedFields.allowBackorders;
            if (updatedFields.onSale !== undefined) payload.on_sale = updatedFields.onSale;

            if (updatedFields.combinations) {
                payload.product_combinations = updatedFields.combinations.map(c => ({
                    ...c,
                    stock_quantity: c.stockQuantity
                }));
                // Ensure we send 'product_combinations' key if that's what we mapped, 
                // OR 'combinations' if serializer expects that. 
                // My previous serializer edit added 'combinations' field.
                // So I should send 'combinations'.
                // BUT I also mapped 'product_combinations' in addProduct above. 
                // Let's check serializer again. Serializer has `combinations = ... source='product_combinations'`. 
                // So input key 'combinations' writes to 'product_combinations'. 
                // So payload SHOULD have 'combinations'. 
                // Correcting both to use 'combinations' key for safety with my serializer change.
                payload.combinations = payload.product_combinations;
                delete payload.product_combinations;
            }

            const res = await api.patch(`/products/${id}/`, payload);

            // Map Response Back to Frontend Format
            const mappedProduct = {
                ...res.data,
                stockQuantity: res.data.stock_quantity || res.data.stockQuantity || 0,
                manageStock: res.data.manage_stock ?? res.data.manageStock ?? true,
                lowStockThreshold: res.data.low_stock_threshold || res.data.lowStockThreshold || 2,
                combinations: (res.data.combinations || []).map((v: any) => ({
                    ...v,
                    stockQuantity: v.stock_quantity || v.stockQuantity || 0
                }))
            };

            setProducts(prev =>
                prev.map(p => (p.id === id ? mappedProduct : p))
            );
        } catch (e) {
            console.error(e);
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            await api.delete(`/products/${id}/`);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (e) { console.error(e); }
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

    const addCategory = async (categoryData: Category | FormData) => {
        try {
            const isFormData = categoryData instanceof FormData;
            const parentId = isFormData ? categoryData.get('parent') : (categoryData as Category).parentId;

            // Axios automatically sets Content-Type with boundary for FormData
            const res = await api.post('/categories/', categoryData);

            if (parentId) {
                // setCategories(prev => addCategoryRecursive(prev, String(parentId), res.data));
                const refresh = await api.get('/categories/');
                setCategories(refresh.data);
            } else {
                // setCategories(prev => [...prev, res.data]);
                const refresh = await api.get('/categories/');
                setCategories(refresh.data);
            }
        } catch (e) {
            console.error("Failed to add category", e);
            throw e; // Rethrow for component handling
        }
    };

    const updateCategory = async (id: string, updatedFields: Partial<Category> | FormData) => {
        try {
            console.log('Updating category:', id, updatedFields);

            if (updatedFields instanceof FormData) {
                // Log FormData contents
                for (let [key, value] of updatedFields.entries()) {
                    console.log(`FormData: ${key} =`, value);
                }

                // Axios automatically sets correct Content-Type with boundary for FormData
                // Don't override headers as it may interfere with auth token
                const response = await api.patch(`/categories/${id}/`, updatedFields);
                console.log('Update response:', response.data);
            } else {
                const response = await api.patch(`/categories/${id}/`, updatedFields);
                console.log('Update response:', response.data);
            }

            // Force refresh from server to ensure tree is correct (fixes persist issue)
            // Force refresh from server to ensure tree is correct (fixes persist issue)
            const refresh = await api.get('/categories/');
            setCategories(refresh.data);

            // Optimistic update (can be kept or removed, but refresh ensures truth)
            // setCategories(prev => updateCategoryRecursive(prev, id, res.data)); 
        } catch (e: any) {
            console.error("Failed to update category", e);
            console.error("Error response:", e.response?.data);
            throw e;
        }
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

    const deleteCategory = async (id: string) => {
        try {
            await api.delete(`/categories/${id}/`);
            setCategories(prev => deleteCategoryRecursive(prev, id));
        } catch (e) { console.error(e); }
    };

    // --- Brand Actions ---
    const addBrand = async (brandData: Brand) => {
        try {
            const res = await api.post('/brands/', brandData);
            setBrands(prev => [...prev, res.data]);
        } catch (e) { console.error("Failed to add brand", e); }
    };

    const updateBrand = async (id: string, updatedFields: Partial<Brand>) => {
        try {
            const res = await api.patch(`/brands/${id}/`, updatedFields);
            setBrands(prev => prev.map(b => b.id == id ? res.data : b));
        } catch (e) { console.error("Failed to update brand", e); }
    };

    const deleteBrand = async (id: string) => {
        try {
            await api.delete(`/brands/${id}/`);
            setBrands(prev => prev.filter(b => String(b.id) !== String(id)));
        } catch (e) { console.error("Failed to delete brand", e); }
    };

    // ... (existing helper function calculateCounts matching original)
    const calculateCounts = (cats: Category[], prods: Product[]): Category[] => {
        return cats.map(cat => {
            const updatedSubCategories = cat.subCategories ? calculateCounts(cat.subCategories, prods) : [];
            const directCount = prods.filter(p => {
                if (p.status !== 'published' && p.status !== undefined) return false;
                if (p.categoryId) return p.categoryId === cat.id;
                if (p.categoryId) return p.categoryId === cat.id;
                const pCat = p.category_name || (typeof p.category === 'string' ? p.category : '');
                return pCat === cat.name;
            }).length;
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

    const getProductsByCategory = (categoryName: string) => {
        const categoryNode = findCategoryByName(categories, categoryName);

        // Helper to check standard name match
        const checkNameMatch = (p: Product, targetName: string) => {
            const pCatName = p.category_name || (typeof p.category === 'string' ? p.category : '');
            return pCatName === targetName;
        };

        if (!categoryNode) {
            return products.filter(p => {
                if (p.status !== 'published') return false;
                return checkNameMatch(p, categoryName);
            });
        }

        const getAllCategoryIdsAndNames = (cat: Category): { ids: string[], names: string[] } => {
            let ids = [String(cat.id)];
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
        const targetIds = ids.map(String); // Ensure all strings

        return products.filter(p => {
            if (p.status !== 'published') return false;

            // 1. Check ID match (Robust: categoryId, category as ID, category.id)
            if (p.categoryId && targetIds.includes(String(p.categoryId))) return true;

            if ((typeof p.category === 'number' || typeof p.category === 'string') && targetIds.includes(String(p.category))) return true;

            if (typeof p.category === 'object' && p.category && (p.category as any).id && targetIds.includes(String((p.category as any).id))) return true;

            // 2. Check Name match
            // const pCatName = p.category_name || (typeof p.category === 'string' ? p.category : '');
            // if (pCatName && names.includes(pCatName)) return true;
            // Check against any name in the tree
            if (names.some(n => checkNameMatch(p, n))) return true;

            return false;
        });
    };

    const getProductsByBrand = (brand: string) => products.filter(p => p.brand === brand && p.status === 'published');

    // --- Review Actions ---
    const addReview = async (reviewData: Omit<Review, 'id' | 'date' | 'status'>) => {
        try {
            const payload = {
                ...reviewData,
                product: reviewData.productId, // Explicitly map for backend serializer
                user_name: reviewData.userName // Explicitly send snake_case to satisfy strict backend validation
            };
            const res = await api.post('/reviews/', payload);
            setReviews(prev => [res.data, ...prev]);
            return res.data; // Return data so caller can await and handle success
        } catch (e: any) {
            console.error("Failed to add review", e);
            if (e.response && e.response.data) console.error("Server Error Details:", e.response.data);
            throw e; // Rethrow so caller knows it failed
        }
    };

    // --- Coupon Actions ---
    const validateCoupon = async (code: string) => {
        try {
            const res = await api.post('/coupons/validate/', { code });
            return res.data;
        } catch (error: any) {
            console.error("Coupon validation failed", error);
            // Return error details if available 
            if (error.response && error.response.data) {
                throw error.response.data;
            }
            throw new Error('Failed to validate coupon');
        }
    };


    const updateReview = async (id: string, updates: Partial<Review>) => {
        try {
            const res = await api.patch(`/reviews/${id}/`, updates);
            setReviews(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
        } catch (e) { console.error(e); }
    };

    const deleteReview = async (id: string) => {
        try {
            await api.delete(`/reviews/${id}/`);
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (e) { console.error(e); }
    };

    const getProductReviews = (productId: number) => Array.isArray(reviews) ? reviews.filter(r => r.productId === productId && r.status === 'approved') : [];

    // --- Support Logic ---
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
        const saved = localStorage.getItem('maryone_support_tickets');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('maryone_support_tickets', JSON.stringify(supportTickets));
    }, [supportTickets]);

    const addSupportTicket = async (ticketData: Omit<SupportTicket, 'id' | 'date' | 'status' | 'replies'>) => {
        try {
            // Backend sets status=Open, replies=[], etc.
            const res = await api.post('/tickets/', ticketData);
            setSupportTickets(prev => [res.data, ...prev]);
        } catch (e) { console.error(e); }
    };

    const updateSupportTicket = async (id: string, updates: Partial<SupportTicket>) => {
        try {
            const res = await api.patch(`/tickets/${id}/`, updates);
            setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        } catch (e) { console.error(e); }
    };

    const deleteSupportTicket = async (id: string) => {
        try {
            await api.delete(`/tickets/${id}/`);
            setSupportTickets(prev => prev.filter(t => t.id !== id));
        } catch (e) { console.error(e); }
    };

    const replyToTicket = async (ticketId: string, message: string) => {
        try {
            // Backend expects { ticket: id, message: "msg" }
            const res = await api.post('/ticket-replies/', { ticket: ticketId, message });

            // Optimistically update the ticket's reply list
            setSupportTickets(prev => prev.map(t => {
                if (t.id === ticketId) {
                    return {
                        ...t,
                        status: 'In Progress',
                        replies: [...(t.replies || []), {
                            id: res.data.id.toString(),
                            sender: 'Admin',
                            message: res.data.message,
                            date: res.data.created_at || new Date().toISOString()
                        }]
                    };
                }
                return t;
            }));
        } catch (e) { console.error("Failed to reply to ticket", e); }
    };


    // --- Q&A Logic ---

    // --- Q&A Logic ---
    const [questions, setQuestions] = useState<Question[]>([]);

    const addQuestion = async (questionData: Omit<Question, 'id' | 'date' | 'status'>) => {
        try {
            const payload = {
                ...questionData,
                product: questionData.productId, // Backend expects 'product' ID
                user_name: questionData.userName // Explicitly send snake_case
            };
            const res = await api.post('/questions/', payload);
            setQuestions(prev => [res.data, ...prev]);
        } catch (e: any) {
            console.error("Failed to add question", e);
            if (e.response && e.response.data) console.error("Server Error Details:", e.response.data);
            // alert("Failed to submit question. Please try again.");
        }
    };

    const answerQuestion = async (id: string, answer: string) => {
        try {
            const res = await api.post(`/questions/${id}/answer/`, { answer });
            setQuestions(prev => prev.map(q => q.id === id ? res.data : q));
        } catch (e) { console.error("Failed to answer question", e); }
    };

    const deleteQuestion = async (id: string) => {
        try {
            await api.delete(`/questions/${id}/`);
            setQuestions(prev => prev.filter(q => q.id !== id));
        } catch (e) { console.error("Failed to delete question", e); }
    };

    const getProductQuestions = (productId: number) => Array.isArray(questions) ? questions.filter(q => q.productId === productId) : [];



    // --- Inventory, Suppliers & Purchase Orders ---
    const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);

    const updateStock = async (productId: number, change: number, reason: InventoryLog['reason'], note?: string, combinationId?: string) => {
        try {
            const payload = { changeAmount: change, reason, note, variantId: combinationId };
            const res = await api.post(`/products/${productId}/adjust_stock/`, payload);

            // Optimistic or Fetch? Let's just append the log if we constructed it, 
            // but simpler to re-fetch logs or just fetch products to sync stock.
            // Refresh products to show new stock
            const prodRes = await api.get('/products/');
            setProducts(prodRes.data);

            // Refresh logs
            const logsRes = await api.get('/inventory-logs/');
            setInventoryLogs(logsRes.data);

        } catch (e) {
            console.error("Failed to adjust stock", e);
        }
    };

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

    const [orders, setOrders] = useState<Order[]>([]);

    // Helper to safely parse potentially malformed JSON strings (like Python dict dumps)
    const safeParse = (input: any) => {
        if (!input) return {};
        if (typeof input === 'object') return input;

        try {
            return JSON.parse(input);
        } catch (e) {
            try {
                // Handle Python-style single quoted strings
                const fixed = input.replace(/'/g, '"').replace(/None/g, 'null').replace(/True/g, 'true').replace(/False/g, 'false');
                return JSON.parse(fixed);
            } catch (e2) {
                console.warn("Failed to parse address data:", input);
                return {};
            }
        }
    };

    const fetchOrders = useCallback(async (filters: any = {}) => {
        try {
            // If filters are provided, we use them directly with api.get('/orders/')
            // This supports the server-side filtering/pagination in AdminOrders
            const hasFilters = Object.keys(filters).length > 0;
            const res = await api.get('/orders/', { params: hasFilters ? filters : undefined });

            // Backend returns list of orders. Sanitize them using the same robust logic as initial fetch.
            const rawOrders = Array.isArray(res.data) ? res.data : (res.data.results || []);
            const sanitized = rawOrders.map((o: any) => ({
                id: o.id.toString(),
                customerName: o.customerName || o.customer_name,
                email: o.email || '',
                phone: o.phone,
                date: o.date,
                status: o.status,
                paymentStatus: o.paymentStatus || o.payment_status,
                paymentMethod: o.paymentMethod || o.payment_method || 'COD', // Fallback
                transactionId: o.transactionId || o.transaction_id,
                subtotal: Number(o.subtotal || 0),
                shipping: Number(o.shippingCost || o.shipping_cost || o.shipping || 0),
                total: Number(o.total || 0),
                fee: Number(o.fee || 0),
                items: (o.items || []).map((i: any) => {
                    const productDef = products.find(p => p.id === i.product);
                    return {
                        id: i.product,
                        name: i.productName || i.product_name || i.name || i.product_details?.name || productDef?.name || 'Unknown Product',
                        price: Number(i.price || 0),
                        quantity: Number(i.quantity || 1),
                        image: i.image || i.product_details?.images?.[0] || productDef?.images?.[0] || '',
                        variantInfo: safeParse(i.variantInfo || i.variant_info) || i.variantInfo,
                        variantId: i.variantId || i.variant_id
                    };
                }),
                shippingAddress: safeParse(o.shippingAddress || o.shipping_address) || {},
                billingAddress: safeParse(o.billingAddress || o.billing_address || o.shippingAddress || o.shipping_address) || {},
                trackingNumber: o.trackingNumber || o.tracking_number,
                courierName: o.courierName || o.courier_name,
                returnStatus: o.returnStatus || o.return_status,
                lossAmount: o.lossAmount || o.loss_amount ? Number(o.lossAmount || o.loss_amount) : 0,
                verificationStatus: o.verificationStatus || o.verification_status,

                verificationLogs: o.verificationLogs || o.verification_logs,

            })) as Order[];

            // If no filters (global sync), update state. 
            // If filters are used (AdminOrders pagination), we usually return data, 
            // but here we can update state too if it makes sense.
            // However, AdminOrders manages its own state for pagination.
            // Let's return the data for AdminOrders to use.
            if (!hasFilters) {
                setOrders(sanitized);
            }
            return { results: sanitized, count: res.data.count || sanitized.length };

        } catch (e) {
            console.error("Failed to fetch orders from backend", e);
            throw e;
        }
    }, [products]);

    // Sync on mount - REMOVED redundant call to prevent race condition with initial fetchData
    // useEffect(() => {
    //     fetchOrders();
    // }, []);

    const shipOrder = async (orderId: string, courierName: string) => {
        try {
            const res = await api.post(`/orders/${orderId}/ship/`, { courier_name: courierName });
            setOrders(prev => prev.map(o => o.id === orderId ? {
                ...o,
                status: 'Shipped',
                trackingNumber: res.data.tracking_number,
                courierName: courierName
            } : o));
        } catch (e) {
            console.error("Failed to ship order", e);
            throw e;
        }
    };

    const cancelOrder = async (orderId: string) => {
        try {
            await api.post(`/orders/${orderId}/cancel/`);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled', returnStatus: 'Pending' } : o));

            // Refresh logic to ensure stock restored visuals if needed, but context products refresh is heavy.
            // Maybe just optimistic locally or refresh page.
        } catch (e) {
            console.error("Failed to cancel order", e);
            throw e;
        }
    };



    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>(() => {
        const saved = localStorage.getItem('maryone_shipping_methods');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'inside_dhaka', name: 'Inside Dhaka', price: 80, description: 'Delivery within 2-3 days' },
            { id: 'outside_dhaka', name: 'Outside Dhaka', price: 150, description: 'Delivery within 3-5 days' }
        ];
    });


    useEffect(() => {
        localStorage.setItem('maryone_inventory_logs', JSON.stringify(inventoryLogs));
    }, [inventoryLogs]);

    const [insideDhakaCities, setInsideDhakaCities] = useState<string[]>(() => {
        const saved = localStorage.getItem('maryone_inside_dhaka_cities');
        return saved ? JSON.parse(saved) : [
            'Adabor', 'Badda', 'Bangshal', 'Biman Bandar', 'Cantonment', 'Chak Bazar', 'Dakshinkhan',
            'Darus Salam', 'Demra', 'Dhanmondi', 'Gendaria', 'Gulshan', 'Hazaribagh', 'Jatrabari',
            'Kadamtali', 'Kafrul', 'Kalabagan', 'Kamrangirchar', 'Khilgaon', 'Khilkhet', 'Kotwali',
            'Lalbagh', 'Mirpur', 'Mohammadpur', 'Motijheel', 'New Market', 'Pallabi', 'Paltan',
            'Ramna', 'Rampura', 'Sabujbagh', 'Shah Ali', 'Shahbag', 'Sher-e-Bangla Nagar', 'Shyampur',
            'Sutrapur', 'Tejgaon', 'Tejgaon Ind. Area', 'Turag', 'Uttara', 'Uttara West', 'Vatara', 'Wari'
        ];
    });

    useEffect(() => {
        localStorage.setItem('maryone_inside_dhaka_cities', JSON.stringify(insideDhakaCities));
    }, [insideDhakaCities]);

    useEffect(() => {
        localStorage.setItem('maryone_shipping_methods', JSON.stringify(shippingMethods));
    }, [shippingMethods]);








    const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
        try {
            const res = await api.post('/suppliers/', supplier);
            setSuppliers(prev => [...prev, res.data]);
        } catch (e) { console.error(e); }
    };

    const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
        try {
            const res = await api.patch(`/suppliers/${id}/`, updates);
            setSuppliers(prev => prev.map(s => s.id === id ? res.data : s));
        } catch (e) { console.error(e); }
    };

    const deleteSupplier = async (id: string) => {
        try {
            await api.delete(`/suppliers/${id}/`);
            setSuppliers(prev => prev.filter(s => s.id !== id));
        } catch (e) { console.error(e); }
    };

    const addPurchaseOrder = async (po: Omit<PurchaseOrder, 'id'>) => {
        try {
            const res = await api.post('/purchase-orders/', po);
            setPurchaseOrders(prev => [res.data, ...prev]);
        } catch (e: any) {
            console.error(e);
            if (e.response && e.response.data) {
                alert(`Error creating PO: ${JSON.stringify(e.response.data)}`);
            } else {
                alert(`Error creating PO: ${e.message}`);
            }
        }
    };

    const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
        try {
            const res = await api.patch(`/purchase-orders/${id}/`, updates);
            setPurchaseOrders(prev => prev.map(p => p.id === id ? res.data : p));

            // Note: Stock update logic is now handled by the Backend when status changes to 'Received'.
            // Logic removed from frontend.
            if (updates.status === 'Received') {
                // Refresh products to reflect new stock
                const prodRes = await api.get('/products/');
                setProducts(prodRes.data);
                // Refresh logs
                const logsRes = await api.get('/inventory-logs/');
                setInventoryLogs(logsRes.data);
            }
        } catch (e) { console.error(e); }
    };

    const addOrder = async (order: Order) => {
        try {
            // Map frontend camelCase to backend snake_case
            const payload = {
                customer_name: order.customerName,
                email: order.email,
                phone: order.phone,
                date: order.date,
                status: order.status,
                payment_status: order.paymentStatus,
                payment_method: order.paymentMethod,
                transaction_id: order.transactionId,
                subtotal: order.subtotal,
                shipping_cost: order.shipping,
                total: order.total,
                shipping_address: order.shippingAddress,
                // Map items to cart_items for serializer
                cart_items: order.items.map(item => ({
                    id: item.id,
                    name: item.name, // CRITICAL: Send name
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image,
                    variant_info: item.variantInfo || (item as any).variant_info || (item as any).options || (item as any).selectedOptions
                }))
            };



            const res = await api.post('/orders/', payload);

            // Backend returns snake_case, but we update local state with our camelCase object + new ID
            const newOrder = { ...order, id: res.data.id.toString() };
            setOrders(prev => [newOrder, ...prev]);

            return newOrder;

        } catch (e) {
            console.error("Failed to add order", e);
            throw e;
        }
    };

    const updateOrder = async (id: string, updates: Partial<Order>) => {
        try {
            const res = await api.patch(`/orders/${id}/`, updates);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
        } catch (e) { console.error(e); }
    };

    const addVerificationLog = async (orderId: string, log: { action: string; outcome: string; note?: string }) => {
        try {
            const res = await api.post(`/orders/${orderId}/add_log/`, log);

            // Log successfully added, now update local state
            // Logic to mirror backend status update
            let newStatus: Order['verificationStatus'] = undefined;
            if (log.outcome === 'Confirmed') newStatus = 'Verified';
            if (log.outcome === 'Wrong Number' || log.outcome === 'No Answer') newStatus = 'Unreachable';

            setOrders(prev => prev.map(o => {
                if (o.id === orderId) {
                    const updatedLogs = [res.data, ...(o.verificationLogs || [])];
                    return {
                        ...o,
                        verificationLogs: updatedLogs,
                        verificationStatus: newStatus || o.verificationStatus
                    };
                }
                return o;
            }));
        } catch (e) {
            console.error("Failed to add verification log", e);
            throw e;
        }
    };

    const updatePaymentMethod = (id: string, updates: Partial<PaymentMethodConfig>) => {
        setPaymentMethods(prev => prev.map(pm => pm.id === id ? { ...pm, ...updates } : pm));
    };

    const updatePaymentSettings = async (settings: Partial<PaymentSettings>) => {
        try {
            const payload = {
                vat_percentage: settings.vatPercentage,
                inside_dhaka_shipping: settings.insideDhakaShipping,
                outside_dhaka_shipping: settings.outsideDhakaShipping
            };
            const res = await api.post('/payment-settings/', payload);
            setPaymentSettings({
                vatPercentage: Number(res.data.vatPercentage ?? res.data.vat_percentage),
                insideDhakaShipping: Number(res.data.insideDhakaShipping ?? res.data.inside_dhaka_shipping),
                outsideDhakaShipping: Number(res.data.outsideDhakaShipping ?? res.data.outside_dhaka_shipping)
            });
        } catch (e) { console.error("Failed to update payment settings", e); throw e; }
    };


    const resolveReturn = async (orderId: string, action: 'Returned' | 'Lost') => {
        try {
            // Updated to match backend ViewSet action URL
            const res = await api.post(`/orders/${orderId}/resolve_return/`, { action });

            // Update state with response data
            setOrders(prev => prev.map(o => o.id === orderId ? {
                ...o,
                returnStatus: res.data.returnStatus || res.data.return_status || action,
                lossAmount: Number(res.data.lossAmount || res.data.loss_amount || 0)
            } : o));

            // Refresh logs/products if stock changed (optional, could just rely on next fetch)
            // But if we returned stock, we should probably fetch products to update counts
            if (action === 'Returned') {
                const prodRes = await api.get('/products/');
                setProducts(prodRes.data);
            }

            return res.data; // Return data for local UI updates

        } catch (e) {
            console.error("Failed to resolve return", e);
            alert("Failed to update return status.");
            throw e;
        }
    };

    // --- Marketing Actions ---
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    const [coupons, setCoupons] = useState<Coupon[]>(() => {
        const saved = localStorage.getItem('maryone_coupons');
        return saved ? JSON.parse(saved) : [];
    });



    useEffect(() => {
        localStorage.setItem('maryone_coupons', JSON.stringify(coupons));
    }, [coupons]);

    const addCampaign = async (campaign: Campaign) => {
        try {
            // Transform for backend
            const payload = {
                name: campaign.name,
                campaign_type: campaign.type,
                start_date: campaign.startDate,
                end_date: campaign.endDate,
                status: campaign.status,
                discount_value: campaign.discountValue,
                description: campaign.description,
                campaign_products: campaign.campaign_products
            };
            const res = await api.post('/campaigns/', payload);
            const c = res.data;
            const newCampaign: Campaign = {
                id: c.id.toString(),
                name: c.name || campaign.name,
                type: (c.campaignType || c.campaign_type || c.type || campaign.type || 'unknown').toLowerCase() as any,
                startDate: c.start_date || c.startDate || campaign.startDate,
                endDate: c.end_date || c.endDate || campaign.endDate,
                status: (() => {
                    const statusStr = c.status || campaign.status;
                    if (statusStr) return statusStr;
                    if (c.is_active !== undefined) return c.is_active ? 'active' : 'ended';

                    const now = new Date();
                    const start = new Date(c.start_date || c.startDate || campaign.startDate);
                    const end = new Date(c.end_date || c.endDate || campaign.endDate);
                    if (now >= start && now <= end) return 'active';
                    if (now < start) return 'scheduled';
                    return 'ended';
                })(),
                discountValue: Number(c.discount_value || c.discountValue || campaign.discountValue),
                campaign_products: c.campaign_products || campaign.campaign_products || [],
                description: c.description || campaign.description
            };
            setCampaigns(prev => [newCampaign, ...prev]);
        } catch (e) { console.error("Failed to add campaign", e); }
    };

    const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
        try {
            const payload: any = { ...updates };
            if (updates.type) payload.campaign_type = updates.type;
            if (updates.startDate) payload.start_date = updates.startDate;
            if (updates.endDate) payload.end_date = updates.endDate;
            if (updates.discountValue) payload.discount_value = updates.discountValue;
            if (updates.campaign_products) payload.campaign_products = updates.campaign_products;

            const res = await api.patch(`/campaigns/${id}/`, payload);
            const c = res.data;
            const updatedCampaign: Campaign = {
                id: c.id.toString(),
                name: c.name,
                type: (c.campaignType || c.campaign_type || c.type || updates.type || 'unknown').toLowerCase() as any,
                startDate: c.start_date || updates.startDate,
                endDate: c.end_date || updates.endDate,
                status: c.status || updates.status,
                discountValue: Number(c.discount_value || updates.discountValue),
                campaign_products: c.campaign_products || updates.campaign_products,
                description: c.description || updates.description
            };
            setCampaigns(prev => prev.map(item => item.id === id ? updatedCampaign : item));
        } catch (e) { console.error(e); }
    };

    const deleteCampaign = async (id: string) => {
        try {
            await api.delete(`/campaigns/${id}/`);
            setCampaigns(prev => prev.filter(c => c.id !== id));
        } catch (e) { console.error(e); }
    };

    const addCoupon = async (coupon: Coupon) => {
        try {
            const res = await api.post('/coupons/', {
                code: coupon.code,
                discount_type: coupon.type,
                value: coupon.value,
                min_purchase: coupon.minPurchase,
                usage_limit: coupon.usageLimit,
                expiry_date: coupon.expiryDate,
                is_active: true
            });
            // Map backend response back to frontend model if needed, or just use the input for now + id
            setCoupons(prev => [res.data ? {
                id: res.data.id.toString(),
                code: res.data.code,
                type: res.data.discount_type,
                value: res.data.value,
                minPurchase: res.data.min_purchase,
                usageLimit: res.data.usage_limit,
                usedCount: res.data.used_count || 0,
                expiryDate: res.data.expiry_date || coupon.expiryDate,
                status: res.data.is_active ? 'active' : 'disabled'
            } : coupon, ...prev]);
        } catch (e) { console.error("Failed to add coupon", e); }
    };

    const updateCoupon = async (id: string, updates: Partial<Coupon>) => {
        try {
            const payload: any = {};
            if (updates.code) payload.code = updates.code;
            if (updates.type) payload.discount_type = updates.type;
            if (updates.value) payload.value = updates.value;
            if (updates.minPurchase) payload.min_purchase = updates.minPurchase;
            if (updates.expiryDate) payload.expiry_date = updates.expiryDate;
            if (updates.status) payload.is_active = updates.status === 'active';

            const res = await api.patch(`/coupons/${id}/`, payload);
            setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c)); // Simplified optimistic update or use response
        } catch (e) { console.error("Failed to update coupon", e); }
    };

    const deleteCoupon = async (id: string) => {
        try {
            await api.delete(`/coupons/${id}/`);
            setCoupons(prev => prev.filter(c => c.id !== id));
        } catch (e) { console.error("Failed to delete coupon", e); }
    };

    // --- Content Actions ---
    const [banners, setBanners] = useState<Banner[]>([]);
    const [pages, setPages] = useState<PageContent[]>([]);
    const [faqs, setFaqs] = useState<FAQ[]>([]);

    const addBanner = async (banner: Banner) => {
        try {
            const res = await api.post('/banners/', banner);
            setBanners(prev => [...prev, res.data]);
        } catch (e) { console.error(e); }
    };
    const updateBanner = async (id: string, updates: Partial<Banner>) => {
        try {
            const res = await api.patch(`/banners/${id}/`, updates);
            setBanners(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
        } catch (e) { console.error(e); }
    };
    const deleteBanner = async (id: string) => {
        try {
            await api.delete(`/banners/${id}/`);
            setBanners(prev => prev.filter(b => b.id !== id));
        } catch (e) { console.error(e); }
    };

    const addPage = async (pageData: { title: string; slug?: string; content?: string }) => {
        try {
            const res = await api.post('/pages/', pageData);
            setPages(prev => [...prev, res.data]);
        } catch (e) { console.error("Failed to add page", e); }
    };

    const updatePage = async (slug: string, content: string) => {
        try {
            const res = await api.patch(`/pages/${slug}/`, { content });
            setPages(prev => prev.map(p => p.slug === slug ? res.data : p));
        } catch (e) { console.error("Failed to update page", e); }
    };

    const deletePage = async (slug: string) => {
        try {
            await api.delete(`/pages/${slug}/`);
            setPages(prev => prev.filter(p => p.slug !== slug));
        } catch (e) { console.error("Failed to delete page", e); }
    };

    const addFAQ = async (faq: FAQ) => {
        try {
            const res = await api.post('/faqs/', faq);
            setFaqs(prev => [...prev, res.data]);
        } catch (e) { console.error("Failed to add FAQ", e); }
    };
    const updateFAQ = async (id: string, updates: Partial<FAQ>) => {
        try {
            const res = await api.patch(`/faqs/${id}/`, updates);
            setFaqs(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
        } catch (e) { console.error("Failed to update FAQ", e); }
    };
    const deleteFAQ = async (id: string) => {
        try {
            await api.delete(`/faqs/${id}/`);
            setFaqs(prev => prev.filter(f => f.id !== id));
        } catch (e) { console.error("Failed to delete FAQ", e); }
    };




    // Helper for Order Item Updates with Stock Reconciliation
    const updateOrderItems = async (orderId: string, newItems: Order['items']) => {
        try {
            // Prepare payload for backend
            const payload = {
                cart_items: newItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image,
                    variant_info: item.variantInfo,
                    variantId: item.variantId
                }))
            };

            // Persist to backend
            await api.patch(`/orders/${orderId}/`, payload);

            // Update Local State & Stock
            setOrders(prev => {
                const order = prev.find(o => o.id === orderId);
                if (!order) return prev;

                const oldItemMap = new Map(order.items.map(i => [i.id + (i.variantId || ''), i]));
                const newItemMap = new Map(newItems.map(i => [i.id + (i.variantId || ''), i]));

                // Process Old Items (Stock Reconciliation)
                order.items.forEach(oldItem => {
                    const key = oldItem.id + (oldItem.variantId || '');
                    const newItem = newItemMap.get(key);

                    if (!newItem) {
                        updateStock(oldItem.id, oldItem.quantity, 'Correction', `Order #${orderId} Item Removed`, oldItem.variantId);
                    } else {
                        const diff = newItem.quantity - oldItem.quantity;
                        if (diff !== 0) {
                            updateStock(oldItem.id, -diff, 'Correction', `Order #${orderId} Qty Changed`, oldItem.variantId);
                        }
                    }
                });

                // Process New Items
                newItems.forEach(newItem => {
                    const key = newItem.id + (newItem.variantId || '');
                    if (!oldItemMap.has(key)) {
                        updateStock(newItem.id, -newItem.quantity, 'Order', `Order #${orderId} Item Added`, newItem.variantId);
                    }
                });

                const newSubtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const newTotal = newSubtotal + order.shipping + (order.fee || 0);

                return prev.map(o => o.id === orderId ? { ...o, items: newItems, subtotal: newSubtotal, total: newTotal } : o);
            });
        } catch (error) {
            console.error("Failed to update order items", error);
            // Optionally revert state here if needed, but for now we log error
        }
    };

    const contextValue = useMemo(() => ({
        products,
        pagination,
        fetchProducts,
        isLoaded,
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
        pages,
        addPage,
        updatePage,
        deletePage,
        getProductsByCategory,
        getProductsByBrand,
        reviews,
        addReview,
        updateReview,
        deleteReview,
        getProductReviews,
        inventoryLogs,
        updateStock,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        purchaseOrders,
        addPurchaseOrder,
        updatePurchaseOrder,
        orders,
        addOrder,
        updateOrder,
        paymentMethods,
        updatePaymentMethod,
        paymentSettings,
        updatePaymentSettings,
        shippingMethods,
        updateShippingMethod: (id: string, updates: Partial<ShippingMethod>) => setShippingMethods(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m)),

        // City Management
        insideDhakaCities,
        addInsideDhakaCity: (city: string) => setInsideDhakaCities(prev => [...prev, city]),
        removeInsideDhakaCity: (city: string) => setInsideDhakaCities(prev => prev.filter(c => c !== city)),

        supportTickets,
        addSupportTicket,
        updateSupportTicket,
        deleteSupportTicket,
        replyToTicket,
        resolveReturn,
        updateOrderItems,
        shipOrder,
        cancelOrder,
        addVerificationLog,
        fetchOrders,

        // Marketing
        campaigns,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        validateCoupon,

        // Content
        banners,
        addBanner,
        updateBanner,
        deleteBanner,

        faqs,
        addFAQ,
        updateFAQ,
        deleteFAQ,

        // Q&A
        questions,
        addQuestion,
        answerQuestion,
        deleteQuestion,
        getProductQuestions,
    }), [
        products, pagination, fetchProducts, isLoaded, categoriesWithCounts, brands,
        pages, reviews, inventoryLogs, suppliers, purchaseOrders, orders,
        paymentMethods, paymentSettings, shippingMethods, insideDhakaCities,
        supportTickets, campaigns, coupons, banners, faqs, questions
    ]);

    return (
        <ProductContext.Provider value={contextValue}>
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
