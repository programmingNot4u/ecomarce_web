import { Dialog, Transition } from '@headlessui/react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Fragment, useEffect, useState } from 'react';
import type { InventoryLog } from '../../context/ProductContext';
import { useProducts } from '../../context/ProductContext';
import { getMediaUrl } from '../../services/api';

export default function AdminInventory() {
    const { products, updateStock, pagination, fetchProducts } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all'); // low is client-side only for now, out uses backend
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Stock Adjustment Modal State
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ productId: number, combinationId?: string, currentStock: number, name: string } | null>(null);
    const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
    const [adjustmentReason, setAdjustmentReason] = useState<InventoryLog['reason']>('Restock');
    const [adjustmentNote, setAdjustmentNote] = useState('');

    // Fetch products when filters change
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts({
                page: 1, // Reset to page 1 on filter change
                search: searchTerm,
                category: selectedCategory !== 'all' ? selectedCategory : undefined, // This expects ID or name? Backend expects ID usually. 
                // But here categories list is names. 
                // AdminProducts uses ID. 
                // Let's stick to client-side category filter for names if we don't have IDs easily,
                // OR better, we should fetch categories from context to get IDs. 
                // For this step I will rely on search string for category if needed or just client side filter for now to avoid breaking.
                // Actually, let's use the search param for broad search.
                in_stock: filter === 'out' ? 'False' : undefined
            });
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, filter]);

    const handlePageChange = (newPage: number) => {
        fetchProducts({
            page: newPage,
            search: searchTerm,
            in_stock: filter === 'out' ? 'False' : undefined
        });
    };

    // Flatten Inventory Items 
    const inventoryItems = products.flatMap(product => {
        const items = [];
        const basePrice = product.price || 0;

        if (product.combinations && product.combinations.length > 0) {
            product.combinations.forEach(combo => {
                let variantName = 'Variant';
                if (combo.attributes) {
                    if (typeof combo.attributes === 'object') {
                        variantName = Object.values(combo.attributes).join(' / ');
                    } else if (typeof combo.attributes === 'string') {
                        try {
                            variantName = Object.values(JSON.parse(combo.attributes)).join(' / ');
                        } catch (e) {
                            variantName = String(combo.attributes);
                        }
                    }
                }
                items.push({
                    id: product.id,
                    uniqueId: `${product.id}-${combo.id}`,
                    name: product.name,
                    sku: combo.sku || 'N/A',
                    variant: variantName,
                    stock: combo.stockQuantity || 0,
                    price: combo.price || basePrice,
                    image: product.image,
                    combinationId: combo.id,
                    type: 'Variant',
                    category: product.category_name || String(product.category)
                });
            });
        } else {
            items.push({
                id: product.id,
                uniqueId: `${product.id}`,
                name: product.name,
                sku: product.sku || 'N/A',
                variant: '-',
                stock: product.stockQuantity || 0,
                price: basePrice,
                image: product.image,
                combinationId: undefined,
                type: 'Simple',
                category: product.category_name || String(product.category)
            });
        }
        return items;
    });

    // Client-side filtering wrapper for things backend doesn't fully cover yet (like "Low Stock" specific count or Category Name exact match if we don't have IDs)
    const filteredItems = inventoryItems.filter(item => {
        // Status Filter (Low Stock is hard to do server side without custom filter)
        if (filter === 'low' && item.stock > 5) return false;
        if (filter === 'out' && item.stock > 0) return false;

        // Category Name Filter (Client side because we only have names here so far)
        // Note: AdminProducts loads categories with IDs. We should use that eventually.
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

        return true;
    });

    // Get Unique Categories for dropdown
    const categories = Array.from(new Set(products.map(p => p.category_name).filter(Boolean)));

    const openAdjustment = (item: typeof inventoryItems[0]) => {
        setSelectedItem({
            productId: item.id,
            combinationId: item.combinationId,
            currentStock: item.stock,
            name: `${item.name} ${item.variant !== '-' ? `(${item.variant})` : ''}`
        });
        setAdjustmentAmount(0);
        setAdjustmentReason('Restock');
        setAdjustmentNote('');
        setIsAdjustOpen(true);
    };

    const handleSaveAdjustment = () => {
        if (!selectedItem || adjustmentAmount === 0) return;
        updateStock(selectedItem.productId, adjustmentAmount, adjustmentReason, adjustmentNote, selectedItem.combinationId);
        setIsAdjustOpen(false);
    };

    // Calculate stats based on current page (approximate for now, or we need a specific stats endpoint)
    const totalStockValue = inventoryItems.reduce((sum, item) => sum + (item.stock * item.price), 0);
    const lowStockCount = inventoryItems.filter(i => i.stock > 0 && i.stock <= 5).length;
    const outOfStockCount = inventoryItems.filter(i => i.stock === 0).length;

    return (
        <div className="space-y-6 animate-fadeIn pb-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">Inventory Manager</h1>
                    <p className="mt-1 text-sm text-gray-500">Track stock levels, manage variants, and view history.</p>
                </div>
                {/* Stats Cards - Make them scrollable or stacked on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <ExclamationTriangleIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Page Value</p>
                            <p className="text-xl font-bold text-gray-900">Tk {totalStockValue.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                            <ExclamationTriangleIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Low Stock</p>
                            <p className="text-xl font-bold text-gray-900">{lowStockCount}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                            <ArrowDownTrayIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Out of Stock</p>
                            <p className="text-xl font-bold text-gray-900">{outOfStockCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-lg border-0 py-2.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                    />
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                    >
                        <option value="all">Status: All</option>
                        <option value="low">Status: Low Stock</option>
                        <option value="out">Status: Out of Stock</option>
                    </select>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
                {filteredItems.map((item) => (
                    <div key={item.uniqueId} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-start gap-4">
                            <img className="h-16 w-16 rounded-lg object-cover bg-gray-100" src={getMediaUrl(item.image)} alt="" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 line-clamp-2">{item.name}</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.sku}</span>
                                    {item.variant !== '-' && <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{item.variant}</span>}
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    {item.stock === 0 ? (
                                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Out of Stock</span>
                                    ) : item.stock <= 5 ? (
                                        <span className="text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded">{item.stock} Left (Low)</span>
                                    ) : (
                                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded">{item.stock} in Stock</span>
                                    )}
                                    <button
                                        onClick={() => openAdjustment(item)}
                                        className="text-xs font-bold text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100"
                                    >
                                        Adjust
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredItems.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No items found.</p>
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredItems.map((item) => (
                                <tr key={item.uniqueId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img className="h-10 w-10 rounded-lg object-cover bg-gray-100" src={getMediaUrl(item.image)} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                <div className="text-xs text-gray-500">{item.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.variant !== '-' ? <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">{item.variant}</span> : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{item.stock}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.stock === 0 ? (
                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Out of Stock</span>
                                        ) : item.stock <= 5 ? (
                                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">Low Stock</span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">In Stock</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openAdjustment(item)}
                                            className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                        >
                                            Adjust
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No items found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl shadow-sm mt-0.5">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={!pagination.previous}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <p className="text-sm text-gray-700 py-2">
                            Page {pagination.current_page}
                        </p>
                        <button
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={!pagination.next}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing page <span className="font-semibold text-gray-900">{pagination.current_page}</span> of <span className="font-semibold text-gray-900">{pagination.total_pages}</span> ({pagination.count} results)
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={!pagination.previous}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                                >
                                    <span className="sr-only">Previous</span>
                                    {/* ChevronLeftIcon */}
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={!pagination.next}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                                >
                                    <span className="sr-only">Next</span>
                                    {/* ChevronRightIcon */}
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Adjustment Modal */}
            <Transition appear show={isAdjustOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsAdjustOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-bold leading-6 text-gray-900"
                                    >
                                        Adjust Stock Level
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Update stock for <span className="font-bold text-gray-900">{selectedItem?.name}</span>.
                                            Current level: <span className="font-bold text-gray-900">{selectedItem?.currentStock}</span>
                                        </p>

                                        <div className="mt-6 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => setAdjustmentAmount(Math.abs(adjustmentAmount))}
                                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${adjustmentAmount >= 0 ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'border-gray-200 text-gray-600'}`}
                                                    >
                                                        <ArrowUpTrayIcon className="h-5 w-5" />
                                                        Add Stock
                                                    </button>
                                                    <button
                                                        onClick={() => setAdjustmentAmount(-Math.abs(adjustmentAmount))}
                                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${adjustmentAmount < 0 ? 'bg-red-50 border-red-200 text-red-700 font-bold' : 'border-gray-200 text-gray-600'}`}
                                                    >
                                                        <ArrowDownTrayIcon className="h-5 w-5" />
                                                        Remove Stock
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={Math.abs(adjustmentAmount)}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setAdjustmentAmount(adjustmentAmount < 0 ? -val : val);
                                                    }}
                                                    className="block w-full rounded-md border-0 py-2 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                                <select
                                                    value={adjustmentReason}
                                                    onChange={(e) => setAdjustmentReason(e.target.value as any)}
                                                    className="block w-full rounded-md border-0 py-2 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                >
                                                    <option value="Restock">Restock (Received Shipment)</option>
                                                    <option value="Correction">Inventory Correction</option>
                                                    <option value="Damage">Damaged / Expired</option>
                                                    <option value="Return">Customer Return</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                                                <textarea
                                                    rows={2}
                                                    value={adjustmentNote}
                                                    onChange={(e) => setAdjustmentNote(e.target.value)}
                                                    className="block w-full rounded-md border-0 py-2 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                    placeholder="Details about this change..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                            onClick={() => setIsAdjustOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                                            onClick={handleSaveAdjustment}
                                        >
                                            Update Stock
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
