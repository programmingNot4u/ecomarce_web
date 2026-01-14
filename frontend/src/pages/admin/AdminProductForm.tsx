import { ExclamationTriangleIcon, MagnifyingGlassIcon, PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useProducts } from '../../context/ProductContext';
import api, { getMediaUrl } from '../../services/api';

const tabs = [
    { name: 'General', id: 'general' },
    { name: 'Images & Media', id: 'images' },
    { name: 'Variants', id: 'variants' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'Inventory', id: 'inventory' },
    { name: 'SEO', id: 'seo' },
    { name: 'Supplier', id: 'supplier' },
    { name: 'History', id: 'history' },
    { name: 'Guides & Info', id: 'sections' },
];

export default function AdminProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { addProduct, updateProduct, products, categories, brands, inventoryLogs } = useProducts();
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    // History Tab Pagination & Sorting
    const [historyPage, setHistoryPage] = useState(1);
    const historyItemsPerPage = 50;
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');

    const historyData = useMemo(() => {
        if (!id) return {
            productLogs: [], filteredLogs: [], sortedLogs: [], paginatedLogs: [],
            stats: { totalIn: 0, totalSold: 0, recentSold: 0, dailyVelocity: '0.00' },
            totalPages: 1
        };

        const logs = inventoryLogs
            .filter(l => l.product === Number(id))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Stats
        const totalIn = logs.filter(l => l.changeAmount > 0).reduce((sum, l) => sum + l.changeAmount, 0);
        const totalSold = logs.filter(l => l.changeAmount < 0 && (l.reason === 'Order' || l.reason === 'Sale')).reduce((sum, l) => sum + Math.abs(l.changeAmount), 0);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentSold = logs.filter(l => l.changeAmount < 0 && (l.reason === 'Order' || l.reason === 'Sale') && new Date(l.createdAt) >= thirtyDaysAgo).reduce((sum, l) => sum + Math.abs(l.changeAmount), 0);
        const firstSale = logs.findLast(l => l.changeAmount < 0 && (l.reason === 'Order' || l.reason === 'Sale'));
        const daysSinceFirstSale = firstSale ? Math.max(1, Math.floor((new Date().getTime() - new Date(firstSale.createdAt).getTime()) / (1000 * 3600 * 24))) : 1;
        const dailyVelocity = (totalSold / daysSinceFirstSale).toFixed(2);

        // Filter
        const filtered = logs.filter(log =>
            (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.variantName || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            if (sortConfig.key === 'createdAt') {
                return sortConfig.direction === 'asc'
                    ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            const aVal = (a as any)[sortConfig.key] || '';
            const bVal = (b as any)[sortConfig.key] || '';
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        // Pagination
        const totalPages = Math.max(1, Math.ceil(sorted.length / historyItemsPerPage));
        const paginated = sorted.slice((historyPage - 1) * historyItemsPerPage, historyPage * historyItemsPerPage);

        return {
            productLogs: logs,
            filteredLogs: filtered,
            sortedLogs: sorted,
            paginatedLogs: paginated,
            totalPages,
            stats: { totalIn, totalSold, recentSold, dailyVelocity }
        };
    }, [inventoryLogs, id, searchTerm, sortConfig, historyPage]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const downloadCSV = () => {
        const headers = ["Date", "User", "Action", "Variant", "Change", "Note"];
        const rows = historyData.sortedLogs.map(l => [
            new Date(l.createdAt).toLocaleString(),
            l.userName || 'System',
            l.reason,
            l.variantName || 'Base Product',
            l.changeAmount,
            `"${(l.note || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `product_${id}_history.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const SortIcon = ({ colKey }: { colKey: string }) => {
        if (sortConfig.key !== colKey) return <span className="opacity-20 ml-1">⇅</span>;
        return <span className="ml-1 text-gray-900">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        salePrice: '',
        category: '',
        brand: '',
        inStock: true,
        onSale: false,
        stockQuantity: '0',
        manageStock: true,
        lowStockThreshold: '2',
        allowBackorders: false,
        sku: '',
        image: '',
        images: [] as string[], // Dynamic Images
        rating: 5,
        // Variants
        variants: [] as { id: string; name: string; options: string[] }[],
        // SEO
        seoTitle: '',
        seoDescription: '',
        // Supplier
        supplierName: '',
        supplierContact: '',
        // Dynamic Sections
        sections: [] as { id: string; title: string; content: string }[],
        combinations: [] as { id?: string; sku: string; price: number; stockQuantity: number; attributes: Record<string, string> }[],
        // Combo Type
        type: 'simple' as 'simple' | 'combo',
        comboItems: [] as { productId: number; quantity: number }[],
    });

    const [productSearch, setProductSearch] = useState('');

    const [newImageInput, setNewImageInput] = useState('');
    const [newVariantName, setNewVariantName] = useState('');
    const [newVariantOptions, setNewVariantOptions] = useState('');

    // Load existing if ID present
    useEffect(() => {
        if (id) {
            const product = products.find(p => p.id === Number(id));
            if (product) {
                setFormData({
                    name: product.name,
                    description: product.description,
                    price: product.price.toString(),
                    salePrice: product.salePrice ? product.salePrice.toString() : '',
                    category: product.category,
                    categoryId: product.categoryId || (typeof product.category === 'number' || (typeof product.category === 'string' && !isNaN(Number(product.category))) ? String(product.category) : ''),
                    brand: product.brand,
                    status: (product.status as any) || 'published',
                    inStock: product.inStock,
                    onSale: product.onSale,
                    stockQuantity: product.stockQuantity ? product.stockQuantity.toString() : '0',
                    manageStock: product.manageStock ?? true,
                    lowStockThreshold: product.lowStockThreshold ? product.lowStockThreshold.toString() : '2',
                    allowBackorders: product.allowBackorders ?? false,
                    sku: product.sku || '',
                    image: product.image,
                    images: product.images || (product.image ? [product.image] : []),
                    rating: product.rating,
                    variants: product.variants || [],
                    seoTitle: product.seoTitle || '',
                    seoDescription: product.seoDescription || '',
                    supplierName: product.supplierName || '',
                    supplierContact: product.supplierContact || '',
                    sections: product.sections || [],
                    combinations: product.combinations || [],
                    type: product.type || 'simple',
                    comboItems: product.comboItems || []
                });
            }
        }
    }, [id, products]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedCat = categories.find(c => c.id === selectedId) ||
            categories.flatMap(c => c.subCategories || []).find(sub => sub.id === selectedId);

        setFormData(prev => ({
            ...prev,
            categoryId: selectedId,
            category: selectedCat ? selectedCat.name : '' // Keep name for UI but rely on ID for backend
        }));
    };

    const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        setFormData(prev => ({ ...prev, brand: selectedId }));
    };

    // Image Handlers
    const handleAddImage = () => {
        if (newImageInput.trim()) {
            setFormData(prev => ({ ...prev, images: [...prev.images, newImageInput.trim()] }));
            setNewImageInput('');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newImages: string[] = [];

            await Promise.all(Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                try {
                    // Assuming 'api' is imported and configured for API calls
                    // For example: import api from '../../utils/api';
                    const res = await api.post('/upload/', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    newImages.push(res.data.url);
                } catch (err) {
                    console.error("Upload failed", err);
                    showNotification('Image upload failed', 'error');
                }
            }));

            if (newImages.length > 0) {
                setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
            }
        }
        // Reset input
        e.target.value = '';
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleSetMainImage = (img: string) => {
        setFormData(prev => ({ ...prev, image: img }));
    };

    // Section Handlers
    const handleAddSection = () => {
        setFormData(prev => ({
            ...prev,
            sections: [...prev.sections, { id: Date.now().toString(), title: '', content: '' }]
        }));
    };

    const handleUpdateSection = (id: string, field: 'title' | 'content', value: string) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === id ? { ...s, [field]: value } : s)
        }));
    };

    const handleRemoveSection = (id: string) => {
        setFormData(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
    };

    // Variant Handlers
    const handleAddVariant = () => {
        if (!newVariantName || !newVariantOptions) return;
        const optionsArray = newVariantOptions.split(',').map(s => s.trim()).filter(Boolean);
        const newVariant = {
            id: Date.now().toString(),
            name: newVariantName,
            options: optionsArray
        };
        setFormData(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
        setNewVariantName('');
        setNewVariantOptions('');
    };

    const handleRemoveVariant = (variantId: string) => {
        setFormData(prev => ({ ...prev, variants: prev.variants.filter(v => v.id !== variantId) }));
    };

    const generateCombinations = () => {
        let results: Record<string, string>[] = [{}];
        formData.variants.forEach(variant => {
            if (!variant.options.length) return;
            const newResults: Record<string, string>[] = [];
            results.forEach(res => {
                variant.options.forEach(opt => {
                    newResults.push({ ...res, [variant.name]: opt });
                });
            });
            results = newResults;
        });

        const newCombinations = results.map(attrs => {
            const existing = formData.combinations.find(c =>
                Object.entries(attrs).every(([k, v]) => c.attributes[k] === v)
            );
            if (existing) return existing;
            return {
                id: Date.now() + Math.random().toString(),
                attributes: attrs,
                price: formData.price ? Number(formData.price) : 0,
                stockQuantity: 0,
                sku: ''
            };
        });

        setFormData(prev => ({ ...prev, combinations: newCombinations }));
    };

    const handleUpdateCombination = (id: string, field: 'price' | 'stockQuantity' | 'sku', value: string) => {
        setFormData(prev => ({
            ...prev,
            combinations: prev.combinations.map(c => c.id === id ? { ...c, [field]: field === 'sku' ? value : Number(value) } : c)
        }));
    };

    // Combo Handlers
    const handleAddComboItem = (productId: number) => {
        setFormData(prev => {
            if (prev.comboItems.some(i => i.productId === productId)) return prev;
            return { ...prev, comboItems: [...prev.comboItems, { productId, quantity: 1 }] };
        });
        setProductSearch('');
    };

    const handleUpdateComboItem = (productId: number, qty: number) => {
        setFormData(prev => ({
            ...prev,
            comboItems: prev.comboItems.map(item => item.productId === productId ? { ...item, quantity: Math.max(1, qty) } : item)
        }));
    };

    const handleRemoveComboItem = (productId: number) => {
        setFormData(prev => ({
            ...prev,
            comboItems: prev.comboItems.filter(item => item.productId !== productId)
        }));
    };

    // Filtered products for combo search
    const comboSearchResults = productSearch ? products.filter(p =>
        p.id !== Number(id) && // Exclude self
        p.status === 'published' &&
        (p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku?.includes(productSearch))
    ).slice(0, 5) : [];

    const handleSave = async () => {
        if (!formData.name.trim()) {
            showNotification('Product Name is required', 'error');
            return;
        }
        if (!formData.price) {
            showNotification('Product Price is required', 'error');
            return;
        }

        const priceNum = Number(formData.price);
        const salePriceNum = formData.salePrice ? Number(formData.salePrice) : undefined;

        // Auto-calculate onSale status
        let finalOnSale = formData.onSale;
        if (salePriceNum && salePriceNum < priceNum) {
            finalOnSale = true;
        }

        // Ensure we have at least one image if images array is populated, or fallback
        const mainImage = formData.image || formData.images[0] || 'https://placehold.co/600x600?text=No+Image';
        const hoverImage = formData.images[1] || mainImage; // Default hover to second image or main

        const productData = {
            ...formData,
            price: priceNum,
            salePrice: salePriceNum,
            category: formData.categoryId ? Number(formData.categoryId) : null,
            brand: formData.brand ? Number(formData.brand) : null,
            stockQuantity: Number(formData.stockQuantity),
            manageStock: formData.manageStock,
            lowStockThreshold: Number(formData.lowStockThreshold),
            allowBackorders: formData.allowBackorders,
            onSale: finalOnSale,
            status: formData.status as any,
            image: mainImage,
            hoverImage: hoverImage,
            images: formData.images.length > 0 ? formData.images : [mainImage],
            sections: formData.sections,
            combinations: formData.combinations,
            type: formData.type,
            comboItems: formData.comboItems
        };

        setIsSaving(true);
        try {
            if (id) {
                await updateProduct(Number(id), productData); // Ensure updateProduct in context is awaited if async
            } else {
                await addProduct(productData);
            }
            navigate('/admin/products');
        } catch (e) {
            console.error("Failed to save product", e);
            showNotification('Failed to save product', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Shared Input Styles
    const inputClass = "block w-full rounded-lg border-0 py-3 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 transition-all duration-200";
    const labelClass = "block text-sm font-semibold leading-6 text-gray-900 mb-2";

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 bg-white px-4 py-4 md:px-8 md:py-5 shrink-0 shadow-sm z-10 gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{id ? 'Edit Product' : 'Add Product'}</h1>
                    <p className="text-sm text-gray-500 mt-1">Fill in the information to listed your product.</p>
                </div>
                <div className="flex items-center gap-x-4 w-full sm:w-auto justify-end">
                    <button type="button" onClick={() => navigate('/admin/products')} className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Discard</button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gray-400/20 hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving && (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-8">
                    <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                        {/* Left Column (Forms) */}
                        <div className="flex-1 space-y-6 md:space-y-8 min-w-0">

                            {/* Tab Navigation */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                                <nav className="flex space-x-1 overflow-x-auto no-scrollbar" aria-label="Tabs">
                                    {tabs.map((tab) => {
                                        return (
                                            <button
                                                key={tab.name}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`
                                    whitespace-nowrap px-4 py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2 rounded-lg flex-1 sm:flex-none
                                    ${activeTab === tab.id
                                                        ? 'bg-black text-white shadow'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'}
                                    `}
                                            >
                                                {tab.id === 'variants' && formData.type === 'combo' ? 'Combo Items' : tab.name}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Tab Panels */}
                            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-8 min-h-[600px]">

                                {/* 1. General Tab */}
                                {activeTab === 'general' && (
                                    <div className="space-y-8 max-w-3xl animate-fadeIn">
                                        <div>
                                            <label className={labelClass}>Product Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={inputClass}
                                                placeholder="e.g. Luxurious Cotton T-Shirt"
                                                autoFocus
                                            />
                                        </div>





                                        {/* Product Type (Existing, keeping simpler) */}
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                                Structure
                                            </h3>
                                            <div className="flex gap-4">
                                                <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.type === 'simple' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                    <input
                                                        type="radio"
                                                        name="type"
                                                        value="simple"
                                                        checked={formData.type === 'simple'}
                                                        onChange={() => setFormData(p => ({ ...p, type: 'simple' }))}
                                                        className="hidden"
                                                    />
                                                    <span className="font-bold text-gray-900">Simple Product</span>
                                                </label>
                                                <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.type === 'combo' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                    <input
                                                        type="radio"
                                                        name="type"
                                                        value="combo"
                                                        checked={formData.type === 'combo'}
                                                        onChange={() => setFormData(p => ({ ...p, type: 'combo' }))}
                                                        className="hidden"
                                                    />
                                                    <span className="font-bold text-gray-900">Combo / Bundle</span>
                                                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold">NEW</span>
                                                </label>
                                            </div>
                                        </div>

                                    </div>
                                )}

                                {/* 2. Images Tab */}
                                {activeTab === 'images' && (
                                    <div className="space-y-8 animate-fadeIn">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Gallery</h3>

                                            {/* Add Image Input */}
                                            <div className="flex flex-col gap-6 mb-8 max-w-2xl">

                                                {/* URL Input */}
                                                <div className="flex gap-4 items-start">
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            value={newImageInput}
                                                            onChange={(e) => setNewImageInput(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                                                            className={inputClass}
                                                            placeholder="Paste image URL here..."
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddImage}
                                                        className="mt-1 flex-shrink-0 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
                                                    >
                                                        Add URL
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-medium text-gray-400 uppercase">OR</span>
                                                    <div className="h-px flex-1 bg-gray-100"></div>
                                                </div>

                                                {/* File Upload */}
                                                <div>
                                                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <PhotoIcon className="w-8 h-8 mb-3 text-gray-400" />
                                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-black">Click to upload</span> or drag and drop</p>
                                                            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (Recommended 800x800px)</p>
                                                        </div>
                                                        <input id="file-upload" type="file" className="hidden" multiple accept="image/*" onChange={handleFileUpload} />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Image Grid */}
                                            {formData.images.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                                    {formData.images.map((img, idx) => (
                                                        <div key={idx} className="group relative aspect-square rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                            <img src={getMediaUrl(img)} alt={`Product ${idx}`} className="h-full w-full object-cover" />

                                                            {/* Actions Overlay */}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                                {formData.image === img && (
                                                                    <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Main</span>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSetMainImage(img)}
                                                                    className="text-white text-xs font-semibold hover:underline"
                                                                >
                                                                    Set as Main
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveImage(idx)}
                                                                    className="bg-white text-red-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" />
                                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No images yet</h3>
                                                    <p className="mt-1 text-sm text-gray-500">Add URLs above to build your gallery.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 3. Variants / Combo Tab */}
                                {activeTab === 'variants' && formData.type === 'combo' && (
                                    <div className="space-y-8 max-w-4xl animate-fadeIn">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Combo Contents</h3>
                                            <p className="text-sm text-gray-500 mb-6">Select products to include in this combo. The price above will be the selling price for the whole bundle.</p>

                                            {/* Search & Add */}
                                            <div className="relative max-w-xl mb-8">
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            value={productSearch}
                                                            onChange={(e) => setProductSearch(e.target.value)}
                                                            className={`${inputClass} pl-10`}
                                                            placeholder="Search products to add..."
                                                        />
                                                    </div>
                                                </div>

                                                {/* Dropdown Results */}
                                                {productSearch && comboSearchResults.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                                        {comboSearchResults.map(product => (
                                                            <button
                                                                key={product.id}
                                                                onClick={() => handleAddComboItem(product.id)}
                                                                type="button"
                                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-center gap-3"
                                                            >
                                                                <img src={getMediaUrl(product.image)} alt="" className="h-8 w-8 rounded object-cover" />
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900">{product.name}</p>
                                                                    <p className="text-xs text-gray-500">Tk {product.price}</p>
                                                                </div>
                                                                <div className="ml-auto">
                                                                    <PlusIcon className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Selected Items List */}
                                            <div className="space-y-4">
                                                {formData.comboItems.map((item, idx) => {
                                                    const product = products.find(p => p.id === item.productId);
                                                    if (!product) return null;
                                                    return (
                                                        <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                                            <img src={getMediaUrl(product.image)} alt="" className="h-16 w-16 rounded-lg object-cover bg-gray-100" />
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-gray-900">{product.name}</h4>
                                                                <p className="text-sm text-gray-500">Unit Price: Tk {product.price}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <label className="text-xs font-semibold text-gray-500 uppercase">Qty</label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) => handleUpdateComboItem(item.productId, parseInt(e.target.value))}
                                                                    className="w-20 rounded-md border-gray-300 shadow-sm text-sm"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveComboItem(item.productId)}
                                                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}

                                                {formData.comboItems.length === 0 && (
                                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                                        <p className="text-gray-500">No items in this combo yet.</p>
                                                        <p className="text-xs text-gray-400 mt-1">Search above to add products.</p>
                                                    </div>
                                                )}

                                                {formData.comboItems.length > 0 && (
                                                    <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center mt-6">
                                                        <span className="font-medium text-gray-600">Total Value of Items:</span>
                                                        <span className="font-bold text-lg text-gray-900">
                                                            Tk {formData.comboItems.reduce((sum, item) => {
                                                                const p = products.find(prod => prod.id === item.productId);
                                                                return sum + ((p?.price || 0) * item.quantity);
                                                            }, 0)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'variants' && formData.type !== 'combo' && (
                                    <div className="space-y-8 max-w-4xl animate-fadeIn">
                                        {formData.variants.length > 0 && formData.combinations.length === 0 && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                                                <div>
                                                    <h3 className="text-sm font-bold text-yellow-800">Action Required: Generate Combinations</h3>
                                                    <p className="text-sm text-yellow-700 mt-1">
                                                        You have defined variants but have not generated the stock combinations yet.
                                                        These variants will NOT appear in Inventory or Purchase Orders until you click
                                                        <span className="font-bold"> Generate Combinations</span> below and Save.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="border border-gray-200 rounded-xl bg-gray-50/50 p-6 mb-8">
                                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Add New Option</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                                                    <div className="md:col-span-4">
                                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">Option Name</label>
                                                        <input
                                                            type="text"
                                                            value={newVariantName}
                                                            onChange={(e) => setNewVariantName(e.target.value)}
                                                            placeholder="e.g. Size, Color"
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-6">
                                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">Values (comma separated)</label>
                                                        <input
                                                            type="text"
                                                            value={newVariantOptions}
                                                            onChange={(e) => setNewVariantOptions(e.target.value)}
                                                            placeholder="e.g. S, M, L, XL"
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleAddVariant}
                                                            className="w-full flex items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-gray-800 transition-colors"
                                                        >
                                                            <PlusIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Existing Variants List */}
                                            <div className="space-y-4">
                                                {formData.variants.map((variant) => (
                                                    <div key={variant.id} className="flex items-start justify-between bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                                                        <div>
                                                            <h5 className="font-bold text-gray-900 text-lg">{variant.name}</h5>
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                {variant.options.map(opt => (
                                                                    <span key={opt} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                                                                        {opt}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveVariant(variant.id)}
                                                            className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {formData.variants.length === 0 && (
                                                    <p className="text-center text-gray-500 py-4 italic">No variants configured.</p>
                                                )}
                                            </div>

                                            {/* Combinations / Pricing Table */}
                                            {formData.variants.length > 0 && (
                                                <div className="mt-8 pt-8 border-t border-gray-200">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h4 className="font-bold text-gray-900 text-lg">Variant Pricing & Stock</h4>
                                                        <button
                                                            type="button"
                                                            onClick={generateCombinations}
                                                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                                                        >
                                                            Generate / Refresh Combinations
                                                        </button>
                                                    </div>

                                                    {formData.combinations.length > 0 ? (
                                                        <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                                            <table className="min-w-full divide-y divide-gray-200">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Tk)</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="bg-white divide-y divide-gray-200">
                                                                    {formData.combinations.map((combo) => (
                                                                        <tr key={combo.id}>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                                {combo.attributes ? Object.entries(combo.attributes).map(([k, v]) => `${k}: ${v}`).join(' / ') : 'No Attributes'}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <input
                                                                                    type="number"
                                                                                    value={combo.price}
                                                                                    onChange={(e) => handleUpdateCombination(combo.id, 'price', e.target.value)}
                                                                                    className="block w-32 rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                                                />
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <input
                                                                                    type="number"
                                                                                    value={combo.stockQuantity}
                                                                                    onChange={(e) => handleUpdateCombination(combo.id, 'stockQuantity', e.target.value)}
                                                                                    className="block w-24 rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                                                />
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <input
                                                                                    type="text"
                                                                                    value={combo.sku}
                                                                                    onChange={(e) => handleUpdateCombination(combo.id, 'sku', e.target.value)}
                                                                                    className="block w-32 rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                                                />
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">Click &quot;Generate&quot; to configure pricing for your variants.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 4. Pricing Tab */}
                                {activeTab === 'pricing' && (
                                    <div className="space-y-8 max-w-2xl animate-fadeIn">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className={labelClass}>Regular Price</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        name="price"
                                                        value={formData.price}
                                                        onChange={handleChange}
                                                        className={`pl-8 ${inputClass}`}
                                                        placeholder="0.00"
                                                    />
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Tk</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Sale Price</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        name="salePrice"
                                                        value={formData.salePrice}
                                                        onChange={handleChange}
                                                        className={`pl-8 ${inputClass}`}
                                                        placeholder="0.00"
                                                    />
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Tk</span>
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500">Leaving empty means no sale.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 5. Inventory Tab */}
                                {activeTab === 'inventory' && (
                                    <div className="space-y-8 max-w-2xl animate-fadeIn">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="manageStock"
                                                    checked={formData.manageStock}
                                                    onChange={handleChange}
                                                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                                                />
                                                <div>
                                                    <span className="block font-semibold text-gray-900">Manage Stock?</span>
                                                    <span className="block text-xs text-gray-500">Enable stock management at product level</span>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className={labelClass}>SKU (Stock Keeping Unit)</label>
                                                <input
                                                    type="text"
                                                    name="sku"
                                                    value={formData.sku}
                                                    onChange={handleChange}
                                                    className={inputClass}
                                                    placeholder="e.g. TSHIRT-001"
                                                />
                                            </div>

                                            {formData.manageStock && (
                                                <>
                                                    <div>
                                                        <label className={labelClass}>Stock Quantity</label>
                                                        <input
                                                            type="number"
                                                            name="stockQuantity"
                                                            value={formData.stockQuantity}
                                                            onChange={handleChange}
                                                            className={inputClass}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Low Stock Threshold</label>
                                                        <input
                                                            type="number"
                                                            name="lowStockThreshold"
                                                            value={formData.lowStockThreshold}
                                                            onChange={handleChange}
                                                            className={inputClass}
                                                            placeholder="2"
                                                        />
                                                    </div>
                                                    <div className="flex items-end h-full pb-3">
                                                        <label className="flex items-center gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name="allowBackorders"
                                                                checked={formData.allowBackorders}
                                                                onChange={handleChange}
                                                                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                                                            />
                                                            <span className="font-medium text-gray-900 text-sm">Allow Backorders?</span>
                                                        </label>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 6. SEO Tab */}
                                {activeTab === 'seo' && (
                                    <div className="space-y-8 max-w-3xl animate-fadeIn">
                                        <div>
                                            <label className={labelClass}>Meta Title</label>
                                            <input
                                                type="text"
                                                name="seoTitle"
                                                value={formData.seoTitle}
                                                onChange={handleChange}
                                                className={inputClass}
                                                placeholder="Title for search engines"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Meta Description</label>
                                            <textarea
                                                rows={4}
                                                name="seoDescription"
                                                value={formData.seoDescription}
                                                onChange={handleChange}
                                                className={inputClass}
                                                placeholder="Brief description used in search results..."
                                            ></textarea>
                                        </div>
                                    </div>
                                )}

                                {/* 7. Supplier Tab */}
                                {activeTab === 'supplier' && (
                                    <div className="space-y-8 max-w-3xl animate-fadeIn">
                                        <div>
                                            <label className={labelClass}>Supplier Name</label>
                                            <input
                                                type="text"
                                                name="supplierName"
                                                value={formData.supplierName}
                                                onChange={handleChange}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Contact Info</label>
                                            <input
                                                type="text"
                                                name="supplierContact"
                                                value={formData.supplierContact}
                                                onChange={handleChange}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 8. History Tab */}
                                {activeTab === 'history' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        {/* Stats Grid */}
                                        {/* Stats Grid */}
                                        {/* Header with Export & Filter */}
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">Professional History</h3>
                                                <p className="text-xs text-gray-500">Track all movements, sales, and corrections.</p>
                                            </div>
                                            <div className="flex items-center gap-2 w-full md:w-auto">
                                                <div className="relative flex-1 md:flex-initial">
                                                    <input
                                                        type="text"
                                                        placeholder="Filter logs..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="pl-8 pr-4 py-2 w-full md:w-64 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                                    </svg>
                                                </div>
                                                <button
                                                    onClick={downloadCSV}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                    </svg>
                                                    Export
                                                </button>
                                            </div>
                                        </div>

                                        {/* Stats Cards */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                                                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Lifetime Stock</p>
                                                <p className="text-2xl font-bold text-gray-900">{historyData.stats.totalIn}</p>
                                                <p className="text-xs text-blue-400 mt-1">Total items received</p>
                                            </div>
                                            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                                                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Lifetime Sold</p>
                                                <p className="text-2xl font-bold text-gray-900">{historyData.stats.totalSold}</p>
                                                <p className="text-xs text-emerald-400 mt-1">Total items sold</p>
                                            </div>
                                            <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl">
                                                <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-1">Recent (30d)</p>
                                                <p className="text-2xl font-bold text-gray-900">{historyData.stats.recentSold}</p>
                                                <p className="text-xs text-purple-400 mt-1">Sales last 30 days</p>
                                            </div>
                                            <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl">
                                                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Velocity</p>
                                                <p className="text-2xl font-bold text-gray-900">{historyData.stats.dailyVelocity}</p>
                                                <p className="text-xs text-orange-400 mt-1">Avg. items / day</p>
                                            </div>
                                        </div>

                                        {/* Timeline Table with Scroll */}
                                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                    <h3 className="font-bold text-gray-900 text-sm">Activity Log</h3>
                                                </div>
                                                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                                                    {historyData.filteredLogs.length} Records
                                                </span>
                                            </div>

                                            {/* Scrollable Container */}
                                            <div className="overflow-y-auto overflow-x-auto h-[500px] w-full max-w-full custom-scrollbar relative">
                                                <table className="min-w-full divide-y divide-gray-100">
                                                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm ring-1 ring-gray-900/5">
                                                        <tr>
                                                            {[
                                                                { label: 'Date', key: 'createdAt', align: 'left' },
                                                                { label: 'User', key: 'userName', align: 'left' },
                                                                { label: 'Action', key: 'reason', align: 'left' },
                                                                { label: 'Variant', key: 'variantName', align: 'left' },
                                                                { label: 'Change', key: 'changeAmount', align: 'right' },
                                                            ].map((col) => (
                                                                <th
                                                                    key={col.key}
                                                                    onClick={() => requestSort(col.key)}
                                                                    className={`px-6 py-3 text-${col.align} text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors select-none whitespace-nowrap bg-gray-50`}
                                                                >
                                                                    {col.label}
                                                                    {sortConfig.key !== col.key ? <span className="opacity-20 ml-1">⇅</span> : <span className="ml-1 text-gray-900">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                                                                </th>
                                                            ))}
                                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap bg-gray-50">Note</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-50">
                                                        {historyData.paginatedLogs.map((log) => (
                                                            <tr key={log.id} className="hover:bg-gray-50/80 transition-colors group">
                                                                <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-500 font-medium">
                                                                    {new Date(log.createdAt).toLocaleString()}
                                                                </td>
                                                                <td className="px-6 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-600 font-bold">
                                                                            {(log.userName || 'S').charAt(0).toUpperCase()}
                                                                        </div>
                                                                        {log.userName || 'System'}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-3 whitespace-nowrap text-xs">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border
                                                                            ${log.reason === 'Order' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                            log.reason === 'Restock' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                                log.reason === 'Correction' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                                                    'bg-gray-50 text-gray-700 border-gray-100'}`}>
                                                                        {log.reason}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-500">
                                                                    {log.variantName || <span className="text-gray-300 italic">Base</span>}
                                                                </td>
                                                                <td className={`px-6 py-3 whitespace-nowrap text-xs text-right font-bold font-mono
                                                                        ${log.changeAmount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                                                    {log.changeAmount > 0 ? '+' : ''}{log.changeAmount}
                                                                </td>
                                                                <td className="px-6 py-3 text-xs text-gray-400 max-w-xs truncate group-hover:text-gray-600 transition-colors">
                                                                    {log.note || '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {historyData.paginatedLogs.length === 0 && (
                                                            <tr>
                                                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                                                                    {searchTerm ? 'No matching logs found.' : 'No history available for this product.'}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Footer / Pagination */}
                                            {historyData.filteredLogs.length > 0 && (
                                                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                                                    <span className="text-xs text-gray-500">
                                                        Showing <span className="font-medium">{(historyPage - 1) * historyItemsPerPage + 1}</span> to <span className="font-medium">{Math.min(historyPage * historyItemsPerPage, historyData.filteredLogs.length)}</span> of <span className="font-medium">{historyData.filteredLogs.length}</span> results
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                                            disabled={historyPage === 1}
                                                            className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            Previous
                                                        </button>
                                                        <button
                                                            onClick={() => setHistoryPage(p => Math.min(historyData.totalPages, p + 1))}
                                                            disabled={historyPage === historyData.totalPages}
                                                            className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>





                                    </div>



                                )}

                                {/* 8. Sections Tab */}
                                {activeTab === 'sections' && (
                                    <div className="space-y-8 max-w-4xl animate-fadeIn">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-gray-900">Custom Guides & Information</h3>
                                            <button
                                                type="button"
                                                onClick={handleAddSection}
                                                className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                                            >
                                                + Add Section
                                            </button>
                                        </div>

                                        {formData.sections.length === 0 ? (
                                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                                <p className="text-gray-500">No custom sections added yet.</p>
                                                <button onClick={handleAddSection} className="text-indigo-600 font-semibold text-sm mt-2 hover:underline">Add one now</button>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {formData.sections.map((section, index) => (
                                                    <div key={section.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 relative group">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSection(section.id)}
                                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>

                                                        <div className="grid gap-6">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Section Title</label>
                                                                <input
                                                                    type="text"
                                                                    value={section.title}
                                                                    onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)}
                                                                    className={inputClass}
                                                                    placeholder="e.g. Size Guide, Care Instructions"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Content</label>
                                                                <textarea
                                                                    rows={4}
                                                                    value={section.content}
                                                                    onChange={(e) => handleUpdateSection(section.id, 'content', e.target.value)}
                                                                    className={inputClass}
                                                                    placeholder="Enter the content for this section..."
                                                                ></textarea>
                                                                <p className="mt-2 text-xs text-gray-400">Supports HTML for tables, lists, and formatting.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column (Settings) */}
                        <div className="w-80 shrink-0 space-y-6">

                            {/* Publish Status */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Availability</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleChange} className="peer sr-only" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">In Stock</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" name="onSale" checked={formData.onSale} onChange={handleChange} className="peer sr-only" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">On Sale</span>
                                    </label>
                                </div>
                            </div>

                            {/* Organization */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Product Status</h3>
                                <div className="space-y-4">
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                    <p className="text-xs text-gray-500">
                                        {formData.status === 'published' && 'Visible to all customers.'}
                                        {formData.status === 'draft' && 'Hidden, work in progress.'}
                                        {formData.status === 'archived' && 'Hidden, discontinued.'}
                                    </p>
                                </div>
                            </div>

                            {/* Organization */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Organization</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Category</label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId || ''}
                                            onChange={handleCategoryChange}
                                            className={inputClass}
                                        >
                                            <option value="">Select Category</option>
                                            {(() => {
                                                const renderOptions = (cats: typeof categories, level = 0): React.ReactNode[] => {
                                                    return cats.flatMap(c => [
                                                        <option key={c.id} value={c.id}>
                                                            {'\u00A0'.repeat(level * 4)}{c.name}
                                                        </option>,
                                                        ...(c.subCategories ? renderOptions(c.subCategories, level + 1) : [])
                                                    ]);
                                                };
                                                return renderOptions(categories);
                                            })()}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Brand</label>
                                        <select
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleBrandChange}
                                            className={inputClass}
                                        >
                                            <option value="">Select Brand</option>
                                            {brands.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
