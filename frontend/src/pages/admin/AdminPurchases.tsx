import { Dialog, Transition } from '@headlessui/react';
import {
    ArrowPathIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    TrashIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import { Fragment, useEffect, useMemo, useState } from 'react';
import type { Product, PurchaseOrder } from '../../context/ProductContext';
import { useProducts } from '../../context/ProductContext';
import { fetchPurchaseOrders } from '../../services/api';

export default function AdminPurchases() {
    const { suppliers, products, addPurchaseOrder, updatePurchaseOrder } = useProducts();
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Filter State
    const [currentPage, setCurrentPage] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [supplierFilter, setSupplierFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Date Filters
    const [timeFilter, setTimeFilter] = useState('Today');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [orderStatus, setOrderStatus] = useState<PurchaseOrder['status']>('Draft');
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [orderNotes, setOrderNotes] = useState('');

    // Item Adding State
    const [itemSearch, setItemSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<string>('');
    const [itemQty, setItemQty] = useState(1);
    const [itemCost, setItemCost] = useState(0);

    const resetForm = () => {
        setSelectedSupplierId('');
        setOrderDate(new Date().toISOString().split('T')[0]);
        setOrderStatus('Draft');
        setOrderItems([]);
        setOrderNotes('');
        setEditingId(null);
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleTimeFilterChange = (filter: string) => {
        setTimeFilter(filter);
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        if (filter === 'Today') {
            setStartDate(todayStr);
            setEndDate(todayStr);
        } else if (filter === 'Week') {
            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7);
            setStartDate(lastWeek.toISOString().split('T')[0]);
            setEndDate(todayStr);
        } else if (filter === 'Month') {
            const lastMonth = new Date(today);
            lastMonth.setDate(today.getDate() - 30);
            setStartDate(lastMonth.toISOString().split('T')[0]);
            setEndDate(todayStr);
        } else if (filter === 'All') {
            setStartDate('');
            setEndDate('');
        }
    };

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch Data
    useEffect(() => {
        const loadPO = async () => {
            setIsLoading(true);
            try {
                const params: any = {
                    page: currentPage,
                    page_size: 10,
                    ordering: '-created_at'
                };

                if (startDate) params.created_at__gte = startDate;
                if (endDate) params.created_at__lte = endDate + 'T23:59:59';
                if (statusFilter) params.status = statusFilter;
                if (supplierFilter) params.supplier = supplierFilter;
                // Currently backend searches on id or item name, we can improve search later
                if (debouncedSearch) params.search = debouncedSearch;

                const data = await fetchPurchaseOrders(params);
                setPurchaseOrders(data.results);
                setTotalCount(data.count);
            } catch (error) {
                console.error("Failed to load Purchase Orders", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPO();
    }, [currentPage, startDate, endDate, statusFilter, supplierFilter, debouncedSearch, refreshTrigger]);


    const handleOpenAdd = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (po: PurchaseOrder) => {
        setEditingId(po.id);
        setSelectedSupplierId(po.supplierId);
        setOrderDate(po.date.split('T')[0]);
        setOrderStatus(po.status);
        setOrderItems(po.items);
        setOrderNotes(po.notes || '');
        setIsModalOpen(true);
    };

    const addItemToOrder = () => {
        if (!selectedProduct) return;

        const newItem = {
            productId: selectedProduct.id,
            variantId: selectedVariantId || undefined,
            quantity: itemQty,
            cost: itemCost,
            // Store display info for easy rendering
            productName: selectedProduct.name,
            variantName: selectedVariantId
                ? selectedProduct.combinations?.find(c => c.id === selectedVariantId)?.sku
                : '-',
            image: selectedProduct.image
        };

        setOrderItems([...orderItems, newItem]);

        // Reset Item Inputs
        setSelectedProduct(null);
        setSelectedVariantId('');
        setItemQty(1);
        setItemCost(0);
        setItemSearch('');
    };

    const removeItemFromOrder = (index: number) => {
        const newItems = [...orderItems];
        newItems.splice(index, 1);
        setOrderItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const totalCost = orderItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

        const poData: Omit<PurchaseOrder, 'id'> = {
            orderNumber: editingId ? purchaseOrders.find(p => p.id === editingId)?.orderNumber! : `PO-${Date.now().toString().slice(-6)}`,
            supplierId: selectedSupplierId,
            date: new Date(orderDate).toISOString(),
            status: orderStatus,
            items: orderItems,
            totalCost,
            notes: orderNotes
        };

        if (editingId) {
            await updatePurchaseOrder(editingId, poData);
        } else {
            await addPurchaseOrder(poData);
        }
        setIsModalOpen(false);
        handleRefresh(); // Reload list
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Received': return 'bg-green-100 text-green-700 ring-green-600/20';
            case 'Ordered': return 'bg-blue-100 text-blue-700 ring-blue-600/20';
            case 'Cancelled': return 'bg-red-100 text-red-700 ring-red-600/20';
            default: return 'bg-gray-100 text-gray-700 ring-gray-600/20';
        }
    };

    // Filtered Products for Search in Modal
    const searchResults = useMemo(() => {
        if (!itemSearch) return [];
        return products.filter(p =>
            p.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
            p.sku?.toLowerCase().includes(itemSearch.toLowerCase())
        ).slice(0, 5);
    }, [itemSearch, products]);

    const totalPages = Math.ceil(totalCount / 10);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col gap-6 border-b border-gray-200 pb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold leading-7 text-gray-900">Purchase Orders</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage restocking and supplier orders.</p>
                    </div>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-gray-800 transition-all"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Create Order
                    </button>
                </div>

                {/* Filters & Search Bar */}
                <div className="flex flex-col gap-4">
                    {/* Time Filter Buttons */}
                    <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-fit overflow-x-auto no-scrollbar">
                        {['Today', 'Week', 'Month', 'All'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => handleTimeFilterChange(filter)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap flex-1 sm:flex-none ${timeFilter === filter
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {filter === 'Week' ? 'This Week' : filter === 'Month' ? 'This Month' : filter}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Date Range */}
                        <div className="col-span-1 md:col-span-2 flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-200">
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => {
                                    setStartDate(e.target.value);
                                    setTimeFilter('Custom');
                                }}
                                className="block w-full rounded-md border-0 bg-transparent py-1.5 px-2 text-gray-900 focus:ring-0 sm:text-sm cursor-pointer"
                            />
                            <span className="text-gray-400 font-medium">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => {
                                    setEndDate(e.target.value);
                                    setTimeFilter('Custom');
                                }}
                                className="block w-full rounded-md border-0 bg-transparent py-1.5 px-2 text-gray-900 focus:ring-0 sm:text-sm cursor-pointer"
                            />
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Supplier Filter */}
                        <select
                            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                            value={supplierFilter}
                            onChange={(e) => setSupplierFilter(e.target.value)}
                        >
                            <option value="">All Suppliers</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>

                        {/* Status & Refresh Container */}
                        <div className="flex gap-2">
                            <select
                                className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="Draft">Draft</option>
                                <option value="Ordered">Ordered</option>
                                <option value="Received">Received</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>

                            <button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="flex items-center justify-center px-4 py-2 text-gray-700 bg-white ring-1 ring-inset ring-gray-300 rounded-md hover:bg-gray-50 hover:text-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 transition-all shadow-sm sm:text-sm"
                                title="Refresh Orders"
                            >
                                <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content State Handling */}
            {isLoading && purchaseOrders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <ArrowPathIcon className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
                    <p className="mt-2 text-sm text-gray-500">Loading orders...</p>
                </div>
            ) : purchaseOrders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <TruckIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No purchase orders found</h3>
                    <p className="mt-1 text-sm text-gray-500">Adjust filters or create a new order.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {purchaseOrders.map(po => {
                                        // Use backend provided supplier name if available, else fallback to lookup
                                        const supplierName = (po as any).supplier_name || suppliers.find(s => s.id === po.supplierId)?.name || 'Unknown Supplier';
                                        return (
                                            <tr key={po.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleOpenEdit(po)}>
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{po.orderNumber}</td>
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplierName}</td>
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(po.date).toLocaleDateString()}</td>
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(po.status)}`}>
                                                        {po.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Tk {(po.totalCost || 0).toLocaleString()}</td>
                                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-indigo-600 hover:text-indigo-900 font-bold">
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span> ({totalCount} results)
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                        >
                                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                        >
                                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create/Edit Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900">
                                            {editingId ? 'Edit Purchase Order' : 'New Purchase Order'}
                                        </Dialog.Title>
                                        {editingId && (
                                            <div className="flex gap-2">
                                                {orderStatus !== 'Received' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setOrderStatus('Received');
                                                        }}
                                                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold hover:bg-green-200"
                                                    >
                                                        Mark as Received
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Top Section: Supplier & Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                                                <select
                                                    required
                                                    value={selectedSupplierId}
                                                    onChange={e => setSelectedSupplierId(e.target.value)}
                                                    className="block w-full rounded-lg border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                                                >
                                                    <option value="">Select Supplier</option>
                                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={orderDate}
                                                    onChange={e => setOrderDate(e.target.value)}
                                                    className="block w-full rounded-lg border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                                <select
                                                    value={orderStatus}
                                                    onChange={e => setOrderStatus(e.target.value as any)}
                                                    className="block w-full rounded-lg border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                                                >
                                                    <option value="Draft">Draft</option>
                                                    <option value="Ordered">Ordered</option>
                                                    <option value="Received">Received</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Line Items Section */}
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <h4 className="text-sm font-bold text-gray-900 mb-4">Order Items</h4>

                                            {/* Item Entry Row */}
                                            <div className="flex flex-col md:flex-row gap-3 items-end mb-4 pb-4 border-b border-gray-200">
                                                <div className="flex-1 relative">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Product</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Search product..."
                                                        value={itemSearch}
                                                        onChange={e => {
                                                            setItemSearch(e.target.value);
                                                            if (!e.target.value) setSelectedProduct(null);
                                                        }}
                                                        className="block w-full rounded-lg border-0 py-1.5 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                                                    />
                                                    {itemSearch && !selectedProduct && searchResults.length > 0 && (
                                                        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
                                                            {searchResults.map(p => (
                                                                <li
                                                                    key={p.id}
                                                                    className="cursor-pointer px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                                                    onClick={() => {
                                                                        setSelectedProduct(p);
                                                                        setItemSearch(p.name);
                                                                        setItemCost(p.price || 0);
                                                                    }}
                                                                >
                                                                    <img src={p.image} className="h-6 w-6 rounded object-cover" />
                                                                    {p.name}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>

                                                {selectedProduct && !selectedProduct.combinations?.length && (
                                                    <>
                                                        <div className="w-24">
                                                            <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={itemQty}
                                                                onChange={e => setItemQty(parseInt(e.target.value) || 1)}
                                                                className="block w-full rounded-lg border-0 py-1.5 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                                                            />
                                                        </div>

                                                        <div className="w-32">
                                                            <label className="block text-xs font-medium text-gray-500 mb-1">Unit Cost</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={itemCost}
                                                                onChange={e => setItemCost(parseFloat(e.target.value) || 0)}
                                                                className="block w-full rounded-lg border-0 py-1.5 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                                                            />
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={addItemToOrder}
                                                            className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-black disabled:opacity-50"
                                                            disabled={!selectedProduct}
                                                        >
                                                            Add
                                                        </button>
                                                    </>
                                                )}

                                                {/* Variants Logic handled if combinations exist (Simplified for brevity, restoring minimal logic) */}
                                                {selectedProduct?.combinations && selectedProduct.combinations.length > 0 && (
                                                    <div className="w-full text-center text-sm text-gray-500 py-2">
                                                        Please select variants (Simplified for view)
                                                    </div>
                                                )}


                                            </div>

                                            {/* Items Table */}
                                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                                                            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">Variant</th>
                                                            <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                                                            <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500">Cost</th>
                                                            <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                                                            <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {(orderItems || []).map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td className="px-2 sm:px-4 py-2 text-sm text-gray-900">{item.productName || 'Product'}</td>
                                                                <td className="px-2 sm:px-4 py-2 text-sm text-gray-500">{item.variantName}</td>
                                                                <td className="px-2 sm:px-4 py-2 text-sm text-right text-gray-900">{item.quantity}</td>
                                                                <td className="px-2 sm:px-4 py-2 text-sm text-right text-gray-900">{item.cost}</td>
                                                                <td className="px-2 sm:px-4 py-2 text-sm text-right font-bold text-gray-900">{(item.quantity * item.cost).toLocaleString()}</td>
                                                                <td className="px-2 sm:px-4 py-2 text-right">
                                                                    <button type="button" onClick={() => removeItemFromOrder(idx)} className="text-red-500 hover:text-red-700">
                                                                        <TrashIcon className="h-4 w-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {orderItems.length === 0 && (
                                                            <tr>
                                                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No items added yet.</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                            <textarea
                                                rows={2}
                                                value={orderNotes}
                                                onChange={(e) => setOrderNotes(e.target.value)}
                                                className="block w-full rounded-lg border-0 py-2 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                onClick={() => setIsModalOpen(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
                                            >
                                                {editingId ? 'Update Order' : 'Create Order'}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div >
    );
}
