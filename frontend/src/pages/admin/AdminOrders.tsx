import { Dialog, Transition } from '@headlessui/react';
import {
    ArrowPathIcon,
    CheckCircleIcon,
    ClipboardDocumentIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    NoSymbolIcon,
    PhoneIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Order, VerificationLog } from '../../context/ProductContext';
import { useProducts } from '../../context/ProductContext';
import api, { fetchOrders, getMediaUrl } from '../../services/api';

// Extend Order interface locally or trust 'any' mapping
interface AdminOrder extends Order {
    riskScore?: number;
    riskLabel?: string;
    paymentMethodLabel?: string;
    [key: string]: any;
}


export default function AdminOrders() {
    const { products, updateOrder, deleteOrder, resolveReturn, shipOrder, cancelOrder, addVerificationLog } = useProducts();
    // Local state for server-side pagination
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

    // Return Resolution Modal
    const [isResolveOpen, setIsResolveOpen] = useState(false);
    const [resolveAction, setResolveAction] = useState<'Returned' | 'Lost'>('Returned');

    // Shipment Modal
    const [isShipModalOpen, setIsShipModalOpen] = useState(false);
    const [selectedCourier, setSelectedCourier] = useState('Pathao');
    const [isShipping, setIsShipping] = useState(false);

    // Cancel Confirmation Modal
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const openResolveModal = () => setIsResolveOpen(true);

    const handleResolveSubmit = async () => {
        if (!selectedOrder) return;
        try {
            // @ts-ignore - resolveReturn now returns data
            const updatedData = await resolveReturn(selectedOrder.id, resolveAction);
            console.log("Resolution Response:", updatedData); // DEBUG log to verify loss_amount presence
            setIsResolveOpen(false);

            // Update local state immediately
            if (updatedData) {
                const updatedOrder = {
                    ...selectedOrder,
                    returnStatus: updatedData.returnStatus || updatedData.return_status || resolveAction,
                    // Handle camelCase conversion from DRF
                    lossAmount: Number(updatedData.lossAmount || updatedData.loss_amount || 0)
                };

                // Update list
                setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, ...updatedOrder } : o));

                // Update selected Item
                setSelectedOrder(updatedOrder as any);

                // Update global stats locally (Optimistic-ish)
                setServerStats((prev: any) => ({
                    ...prev,
                    // Assume we are ADDING to the loss. If it was already lost, this might double count?
                    // Ideally we check previous status. But usually we go from Pending -> Lost.
                    // If we go from Returned -> Lost, we should adjust diff.
                    // For now, simple addition is better than nothing.
                    totalLoss: (prev.totalLoss || prev.total_loss || 0) + (updatedOrder.lossAmount || 0)
                }));
            }
        } catch (e) {
            console.error("Failed to resolve return in UI", e);
        }
    };


    // Keep selectedOrder in sync with local state
    useEffect(() => {
        if (selectedOrder) {
            const updated = orders.find(o => o.id === selectedOrder.id);
            if (updated) {
                setSelectedOrder(updated);
            }
        }
    }, [orders, selectedOrder?.id]);

    const handleShipSubmit = async () => {
        if (!selectedOrder) return;
        setIsShipping(true);
        try {
            await shipOrder(selectedOrder.id, selectedCourier);
            setIsShipModalOpen(false);

            // Update local state (optimistic)
            setSelectedOrder(prev => prev ? {
                ...prev,
                status: 'Shipped',
                courierName: selectedCourier,
                trackingNumber: (selectedCourier === 'Pathao' ? 'PTH-' : 'TRK-') + Date.now()
            } : null);
        } catch (error) {
            console.error("Shipping failed", error);
            alert("Failed to confirm shipment. Please check network or try again.");
        } finally {
            setIsShipping(false);
        }
    };

    const handleCancelOrder = () => {
        if (!selectedOrder) return;
        setIsCancelModalOpen(true);
    };

    const confirmCancelOrder = async () => {
        if (!selectedOrder) return;
        try {
            await cancelOrder(selectedOrder.id);
            // Verify if we need to update state manually or if cancelOrder invalidates logic
            setSelectedOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'Cancelled' } : o));
            setIsCancelModalOpen(false);
        } catch (e) {
            console.error("Failed to cancel order", e);
            // Optionally add a toast here
        }
    };

    const handlePrintInvoice = () => {
        if (!selectedOrder) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
            <html>
            <head>
                <title>Invoice #${selectedOrder.id}</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                    .title { font-size: 24px; font-weight: bold; }
                    .meta { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border-bottom: 1px solid #ddd; padding: 10px; text-align: left; }
                    .total { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="title">MARYONÉ</div>
                        <p>Invoice #${selectedOrder.id}</p>
                    </div>
                    <div style="text-align: right;">
                        <p>Date: ${new Date(selectedOrder.date).toLocaleDateString()}</p>
                        <p>Status: ${selectedOrder.paymentStatus}</p>
                    </div>
                </div>
                
                <div class="meta">
                    <strong>Bill To:</strong><br>
                    ${selectedOrder.customerName}<br>
                    ${selectedOrder.email}<br>
                    ${selectedOrder.shippingAddress?.street}, ${selectedOrder.shippingAddress?.city}
                </div>

                <table>
                    <thead>
                        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                        ${selectedOrder.items.map(item => `
                            <tr>
                                <td>${item.name} ${item.variantId ? '(Var)' : ''}</td>
                                <td>${item.quantity}</td>
                                <td>Tk ${item.price}</td>
                                <td>Tk ${item.price * item.quantity}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="total">
                    <p>Subtotal: Tk ${selectedOrder.subtotal}</p>
                    <p>Shipping: Tk ${selectedOrder.shipping}</p>
                    <p>Total: Tk ${selectedOrder.total}</p>
                </div>
                
                <script>window.print();</script>
            </body>
            </html>
        `);
            printWindow.document.close();
        }
    };

    // --- Verification & CRM Logic ---
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [logNote, setLogNote] = useState('');
    const [logOutcome, setLogOutcome] = useState<VerificationLog['outcome']>('Connected');

    const handleAddVerificationLog = async () => {
        if (!selectedOrder) return;

        // Optimistic Log Object (Temporary ID)
        const newLog: VerificationLog = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            admin: 'Admin',
            action: 'Call',
            outcome: logOutcome,
            note: logNote
        };

        try {
            // Persist to Backend
            await addVerificationLog(selectedOrder.id, {
                action: 'Call',
                outcome: logOutcome,
                note: logNote
            });

            // Calculate Status for Local Update
            let newStatus = selectedOrder.verificationStatus;
            if (logOutcome === 'Confirmed') newStatus = 'Verified';
            if (logOutcome === 'Wrong Number' || logOutcome === 'No Answer') newStatus = 'Unreachable';

            const updatedLogs = [newLog, ...(selectedOrder.verificationLogs || [])];

            // Optimistic Update
            const updatedOrder = { ...selectedOrder, verificationLogs: updatedLogs, verificationStatus: newStatus as any };
            setSelectedOrder(updatedOrder);
            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o));

            setIsVerificationModalOpen(false);
            setLogNote('');
        } catch (error) {
            console.error("Failed to add log", error);
            alert("Failed to save verification log");
        }
    };

    // --- Order Edit Logic ---
    // --- Order Edit Logic Removed ---
    // ... (Keep existing sorting/filtering logic)

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Date Filter Logic
    const getTodayDate = () => new Date().toISOString().split('T')[0];
    const [timeFilter, setTimeFilter] = useState('Today');
    const [startDate, setStartDate] = useState(getTodayDate());
    const [endDate, setEndDate] = useState(getTodayDate());

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
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [serverStats, setServerStats] = useState({ total_revenue: 0, pending_value: 0, count: 0 });

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Fetch Orders from Server
    useEffect(() => {
        const loadOrders = async () => {
            setIsLoading(true);
            try {
                const params: any = {
                    page: currentPage,
                    page_size: 10, // Matching itemsPerPage
                    ordering: '-created_at'
                };

                if (startDate && startDate !== '') params.created_at__gte = startDate;
                if (endDate && endDate !== '') params.created_at__lte = endDate + 'T23:59:59';
                if (statusFilter) params.status = statusFilter;
                if (debouncedSearch) params.search = debouncedSearch;

                // Special handling cases from original code
                if (statusFilter === 'Return Pending') {
                    params.status = 'Cancelled';
                    // return_status logic isn't easily mapped without custom filter, 
                    // assuming backend handles just status=Cancelled for now or we filter client-side?
                    // For massive scale, backend needs custom filter. 
                    // falling back to status check.
                }

                const data = await fetchOrders(params);

                // Map results to ensure fields like lossAmount are present (snake string -> camel)
                const mappedOrders = data.results.map((o: any) => ({
                    ...o,
                    lossAmount: Number(o.lossAmount || o.loss_amount || 0),
                    returnStatus: o.returnStatus || o.return_status || 'None',
                    shipping: Number(o.shipping || o.shippingCost || o.shipping_cost || 0),
                    subtotal: Number(o.subtotal || 0),
                    total: Number(o.total || 0),
                    total: Number(o.total || 0),
                    // Ensure paymentMethod is mapped if needed (likely already correct as string)
                    paymentMethod: o.paymentMethod || o.payment_method || 'COD',
                    paymentMethodLabel: o.paymentMethodLabel || o.payment_method_label || o.paymentMethod || 'COD',
                    riskScore: o.riskScore ?? o.risk_score ?? 100,
                    riskLabel: o.riskLabel || o.risk_label || 'New User'
                }));

                setOrders(mappedOrders);
                // setTotalPages is not defined, derived from totalCount instead
                // setTotalPages(Math.ceil(data.count / 10)); 
                setTotalCount(data.count);

                // Fetch Stats
                try {
                    // Removed leading slash to avoid double slash with baseURL
                    const statsRes = await api.get('orders/stats/', { params });
                    setServerStats(statsRes.data);
                } catch (statsErr) {
                    console.error("Failed to fetch stats:", statsErr);
                }
            } catch (e) {
                console.error("Failed to load orders", e);
            } finally {
                setIsLoading(false);
            }
        };

        loadOrders();
    }, [currentPage, startDate, endDate, statusFilter, debouncedSearch, timeFilter, refreshTrigger]); // timeFilter dependency ensures update when presets change

    // Compute stats from current view (approximate) or fetch separate stats endpoint?
    // For now, simple stats based on loaded data is misleading if paginated.
    // We'll hide revenue stats or just show "Page Revenue" for now, or assume backend provides stats.
    // Preserving "paginatedOrders" variable name for compatibility with render
    const paginatedOrders = orders;
    const totalPages = Math.ceil(totalCount / 10);

    const handleStatusUpdate = (newStatus: Order['status']) => {
        if (!selectedOrder) return;
        if (newStatus === 'Cancelled') {
            handleCancelOrder(); // Use robust cancel
            return;
        }
        if (newStatus === 'Shipped') {
            setIsShipModalOpen(true);
            return;
        }

        const updates: Partial<Order> = { status: newStatus };
        updateOrder(selectedOrder.id, updates);

        // Optimistic Update Local State
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, ...updates } : o));
        setSelectedOrder({ ...selectedOrder, ...updates });
    };

    // ... (Keep payment/delete/delivery logic helpers if needed, though replaced by new ones)
    const handlePaymentUpdate = (newStatus: Order['paymentStatus']) => {
        if (!selectedOrder) return;
        updateOrder(selectedOrder.id, { paymentStatus: newStatus });
        // Optimistic Update
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, paymentStatus: newStatus } : o));
        setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus });
    };

    const handleDelete = () => {
        if (!selectedOrder) return;
        if (confirm('Are you sure you want to delete this order?')) {
            deleteOrder(selectedOrder.id);
            setSelectedOrder(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Shipped': return 'bg-blue-100 text-blue-800';
            case 'Processing': return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // calculateRiskScore removed - using backend data

    // Stats are now just for the current page or generic
    const stats = useMemo(() => {
        // Explicit mapping with fallbacks and logging
        const raw = serverStats as any;

        return {
            count: raw.count || raw.totalOrders || 0,
            // Handle both camelCase (DRF default) and snake_case (Django default)
            revenue: raw.totalRevenue ?? raw.total_revenue ?? 0,
            pending: raw.pendingValue ?? raw.pending_value ?? 0,
            loss: raw.totalLoss ?? raw.total_loss ?? 0
        };
    }, [serverStats]);


    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col gap-6 border-b border-gray-200 pb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">Orders</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage and track customer orders.</p>
                    </div>
                    {/* Quick Actions or Global Controls could go here */}
                </div>

                {/* Filters & Search Bar */}
                {/* Filters & Search Bar */}
                <div className="flex flex-col gap-4">
                    {/* Time Filter Buttons */}
                    <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-fit overflow-x-auto max-w-full no-scrollbar">
                        {['Today', 'Week', 'Month', 'All'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => handleTimeFilterChange(filter)}
                                className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap ${timeFilter === filter
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {filter === 'Week' ? 'This Week' : filter === 'Month' ? 'This Month' : filter}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Date Range */}
                        <div className="col-span-1 md:col-span-2 flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-200">
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => {
                                    setStartDate(e.target.value);
                                    setTimeFilter('Custom');
                                }}
                                className="block w-full rounded-md border-0 bg-transparent py-1.5 px-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 cursor-pointer"
                            />
                            <span className="text-gray-400 font-medium">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => {
                                    setEndDate(e.target.value);
                                    setTimeFilter('Custom');
                                }}
                                className="block w-full rounded-md border-0 bg-transparent py-1.5 px-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 cursor-pointer"
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
                                placeholder="Search by ID, Name, Email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Return Pending">Return Pending</option>
                        </select>

                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center justify-center px-4 py-2 text-gray-700 bg-white ring-1 ring-inset ring-gray-300 rounded-md hover:bg-gray-50 hover:text-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 transition-all shadow-sm sm:text-sm"
                            title="Refresh Orders"
                        >
                            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                            <span className="ml-2 hidden lg:inline">Refresh</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 ring-1 ring-inset ring-gray-200">
                    <dt className="truncate text-sm font-medium text-gray-500">Filtered Orders</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.count}</dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 ring-1 ring-inset ring-gray-200">
                    <dt className="truncate text-sm font-medium text-gray-500">Total Revenue</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">Tk {(stats.revenue || 0).toLocaleString()}</dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 ring-1 ring-inset ring-gray-200">
                    <dt className="truncate text-sm font-medium text-gray-500">Pending Value</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-yellow-600">Tk {(stats.pending || 0).toLocaleString()}</dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 ring-1 ring-inset ring-gray-200">
                    <dt className="truncate text-sm font-medium text-gray-500">Net Loss</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-red-600">Tk {(stats.loss || 0).toLocaleString()}</dd>
                </div>
            </div>

            {/* Orders List (Responsive) */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

                {/* Mobile Card View */}
                <div className="block lg:hidden divide-y divide-gray-200">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading orders...</div>
                    ) : paginatedOrders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No orders found</div>
                    ) : (
                        paginatedOrders.map(order => {
                            const riskLabel = order.riskLabel || 'New User';
                            const riskScore = order.riskScore ?? 100;
                            const riskColor = riskLabel === 'High Risk' ? 'bg-red-100 text-red-800' :
                                riskLabel === 'Medium Risk' ? 'bg-yellow-100 text-yellow-800' :
                                    riskLabel === 'New User' || riskLabel === 'No History' ? 'bg-gray-100 text-gray-600' :
                                        'bg-green-100 text-green-800';

                            return (
                                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 text-lg">#{order.id}</span>
                                            <span className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</span>
                                        </div>
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <p className="font-medium text-gray-900">{order.customerName}</p>
                                            <p className="text-xs text-gray-500">{order.phone || order.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">Tk {(order.total || 0).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">{order.paymentMethodLabel}</p>
                                        </div>
                                    </div>

                                    {/* Warnings / Badges */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {/* Risk Badge */}
                                        <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${riskColor}`}>
                                            {riskLabel}
                                        </span>

                                        {order.status === 'Cancelled' && order.returnStatus === 'Pending' && (
                                            <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-600">
                                                <ExclamationTriangleIcon className="h-3 w-3" /> Return Pending
                                            </span>
                                        )}
                                        {order.status === 'Pending' && (!order.verificationStatus || order.verificationStatus === 'Pending') && (
                                            <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">
                                                <PhoneIcon className="h-3 w-3" /> Call Pending
                                            </span>
                                        )}
                                        {order.verificationStatus === 'Verified' && (
                                            <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-xs font-bold text-green-600">
                                                <CheckCircleIcon className="h-3 w-3" /> Verified
                                            </span>
                                        )}
                                        {order.verificationStatus === 'Unreachable' && (
                                            <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                                                <NoSymbolIcon className="h-3 w-3" /> Unreachable
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Hint */}
                                    {/* <div className="mt-30 text-xs text-center text-gray-400 font-medium pt-2">Tap to view details</div> */}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan={8} className="text-center py-10 text-gray-500">Loading orders...</td></tr>
                            ) : paginatedOrders.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-10 text-gray-500">No orders found</td></tr>
                            ) : (
                                paginatedOrders.map(order => {
                                    const riskLabel = order.riskLabel || 'New User';
                                    const riskScore = order.riskScore ?? 100;
                                    const riskColor = riskLabel === 'High Risk' ? 'bg-red-100 text-red-800' :
                                        riskLabel === 'Medium Risk' ? 'bg-yellow-100 text-yellow-800' :
                                            riskLabel === 'New User' || riskLabel === 'No History' ? 'bg-gray-100 text-gray-600' :
                                                'bg-green-100 text-green-800';

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{order.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="font-medium">{order.customerName}</div>
                                                <div className="text-gray-500 text-xs">{order.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${riskColor}`}>
                                                        {riskLabel}
                                                    </span>
                                                    {riskLabel !== 'New User' && riskLabel !== 'No History' && (
                                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
                                                            <div
                                                                className={`h-full ${riskScore < 50 ? 'bg-red-100' : riskScore < 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                                style={{ width: `${riskScore}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                                {order.status === 'Cancelled' && order.returnStatus === 'Pending' && (
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-orange-600 font-bold animate-pulse">
                                                        <ExclamationTriangleIcon className="h-3 w-3" />
                                                        <span>Return Pending</span>
                                                    </div>
                                                )}
                                                {order.status === 'Pending' && (!order.verificationStatus || order.verificationStatus === 'Pending') && (
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-blue-600 font-bold">
                                                        <PhoneIcon className="h-3 w-3" />
                                                        <span>Call Pending</span>
                                                    </div>
                                                )}
                                                {order.verificationStatus === 'Verified' && (
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-green-600 font-bold">
                                                        <CheckCircleIcon className="h-3 w-3" />
                                                        <span>Verified</span>
                                                    </div>
                                                )}
                                                {order.verificationStatus === 'Unreachable' && (
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-red-600 font-bold">
                                                        <NoSymbolIcon className="h-3 w-3" />
                                                        <span>Unreachable</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.paymentStatus} ({order.paymentMethodLabel})
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Tk {(order.total || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-indigo-600 hover:text-indigo-900" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOrder(order);
                                                }}>
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Responsive) */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                        {/* Mobile Pagination */}
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="self-center text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        {/* Desktop Pagination */}
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-end">
                            <div className="mr-4 text-sm text-gray-700">
                                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                            </div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    {/* ChevronLeft Icon */}
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                {Array.from({ length: totalPages }).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map((_, i, arr) => {
                                    // Logic to show limited pages
                                    // Actually simpler to just show current range or use the full map if small
                                    // For now, let's just show logical page numbers
                                    // Re-using the index logic from before but careful with the slice

                                    // Recalculating index relative to page count
                                    const pageNum = Math.max(0, currentPage - 3) + i + 1;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNum
                                                ? 'z-10 bg-black text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    {/* ChevronRight Icon */}
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            <Transition appear show={!!selectedOrder} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setSelectedOrder(null)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                    {selectedOrder && (
                                        <>
                                            <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-200">
                                                <div>
                                                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">
                                                        Order #{selectedOrder.id}
                                                    </Dialog.Title>
                                                    <p className="text-sm text-gray-500 mt-1">Placed on {new Date(selectedOrder.date).toLocaleString()}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={handlePrintInvoice} className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm font-bold hover:bg-gray-50">
                                                        <ClipboardDocumentIcon className="h-4 w-4" /> Invoice
                                                    </button>
                                                    <button onClick={handleDelete} className="text-red-500 hover:text-red-700 p-1" title="Delete Order">
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                    <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-500">
                                                        <XMarkIcon className="h-6 w-6" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Tracking Info (If Shipped) */}
                                            {selectedOrder.status === 'Shipped' && (
                                                <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-blue-900 text-sm">Shipped via {selectedOrder.courierName || 'Courier'}</span>
                                                        <span className="bg-white px-2 py-0.5 rounded text-xs font-mono font-bold border border-blue-200 text-blue-700">
                                                            {selectedOrder.trackingNumber}
                                                        </span>
                                                    </div>
                                                    <button className="text-xs text-blue-600 hover:underline font-semibold">Track Shipment</button>
                                                </div>
                                            )}

                                            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                                                {/* Prediction Badge inside Modal */}
                                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-sm text-gray-900">AI Order Prediction</h4>
                                                        <p className="text-xs text-gray-500 mt-1">Based on customer's past behavior</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`inline-flex items-center rounded-sm px-2.5 py-1 text-sm font-bold 
                                                            ${(selectedOrder.riskLabel === 'High Risk' ? 'bg-red-100 text-red-800' :
                                                                selectedOrder.riskLabel === 'Medium Risk' ? 'bg-yellow-100 text-yellow-800' :
                                                                    selectedOrder.riskLabel === 'New User' ? 'bg-gray-100 text-gray-600' :
                                                                        'bg-green-100 text-green-800')}`}>
                                                            {selectedOrder.riskLabel || 'New User'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Status Control */}
                                                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-blue-50 p-4 rounded-lg flex flex-col justify-between">
                                                        <div className="mb-2">
                                                            <h4 className="text-sm font-bold text-blue-900">Order Status</h4>
                                                            <p className="text-sm text-blue-700">Current: {selectedOrder.status}</p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedOrder.status === 'Pending' && (
                                                                <button onClick={() => handleStatusUpdate('Processing')} className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-blue-700">
                                                                    Process
                                                                </button>
                                                            )}
                                                            {selectedOrder.status === 'Processing' && (
                                                                <button onClick={() => handleStatusUpdate('Shipped')} className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-purple-700">
                                                                    Ship
                                                                </button>
                                                            )}
                                                            {selectedOrder.status === 'Shipped' && (
                                                                <button onClick={() => handleStatusUpdate('Delivered')} className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-green-700">
                                                                    Deliver
                                                                </button>
                                                            )}
                                                            {['Pending', 'Processing'].includes(selectedOrder.status) && (
                                                                <button onClick={() => handleStatusUpdate('Cancelled')} className="bg-white border border-red-300 text-red-700 px-2 py-1 rounded text-xs font-bold hover:bg-red-50">
                                                                    Cancel
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="bg-yellow-50 p-4 rounded-lg flex flex-col justify-between">
                                                        <div className="mb-2">
                                                            <h4 className="text-sm font-bold text-yellow-900">Payment Status</h4>
                                                            <p className="text-sm text-yellow-700">Current: {selectedOrder.paymentStatus}</p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {/* Logic: Only allow payment updates if NOT cancelled, OR if it's a refund for a paid cancelled order */}
                                                            {selectedOrder.status !== 'Cancelled' && selectedOrder.paymentStatus !== 'Paid' && (
                                                                <button onClick={() => handlePaymentUpdate('Paid')} className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-green-700">
                                                                    Mark Paid
                                                                </button>
                                                            )}
                                                            {(selectedOrder.paymentStatus === 'Paid') && (
                                                                <button onClick={() => handlePaymentUpdate('Refunded')} className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-gray-700">
                                                                    Mark Refunded
                                                                </button>
                                                            )}
                                                            {selectedOrder.status === 'Cancelled' && selectedOrder.paymentStatus !== 'Paid' && selectedOrder.paymentStatus !== 'Refunded' && (
                                                                <span className="text-xs text-gray-500 italic">No payment actions for cancelled unpaid orders.</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Return Resolution Area */}
                                                {selectedOrder.status === 'Cancelled' && (
                                                    <div className={`mb-8 p-4 rounded-lg flex items-center justify-between border ${selectedOrder.returnStatus === 'Pending' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                                                        <div>
                                                            <h4 className={`text-sm font-bold ${selectedOrder.returnStatus === 'Pending' ? 'text-orange-900' : 'text-gray-900'}`}>
                                                                Return Status: <span className="uppercase">{selectedOrder.returnStatus || 'None'}</span>
                                                            </h4>
                                                            {selectedOrder.returnStatus === 'Pending' && (
                                                                <p className="text-xs text-orange-700 mt-1">
                                                                    Waiting for package return. Stock not yet restored.
                                                                </p>
                                                            )}
                                                            {selectedOrder.lossAmount && (
                                                                <p className="text-sm font-bold text-red-600 mt-1">
                                                                    Net Loss: Tk {Number(selectedOrder.lossAmount).toLocaleString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {selectedOrder.returnStatus === 'Pending' && (
                                                            <button
                                                                onClick={openResolveModal}
                                                                className="bg-black text-white px-3 py-2 rounded text-sm font-bold hover:bg-gray-800"
                                                            >
                                                                Resolve Return
                                                            </button>
                                                        )}
                                                    </div>
                                                )}


                                                {/* Verification Panel */}
                                                <div className="mb-8 bg-white border border-indigo-100 rounded-lg overflow-hidden">
                                                    <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
                                                        <div>
                                                            <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                                                <PhoneIcon className="h-4 w-4" />
                                                                Verification & CRM
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-indigo-700">Status:</span>
                                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedOrder.verificationStatus === 'Verified' ? 'bg-green-200 text-green-800' :
                                                                    selectedOrder.verificationStatus === 'Unreachable' ? 'bg-red-200 text-red-800' :
                                                                        'bg-gray-200 text-gray-800'
                                                                    }`}>
                                                                    {selectedOrder.verificationStatus || 'Pending'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setIsVerificationModalOpen(true)}
                                                            className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 flex items-center gap-1"
                                                        >
                                                            <PlusIcon className="h-3 w-3" /> Log Call
                                                        </button>
                                                    </div>

                                                    <div className="p-4 max-h-40 overflow-y-auto bg-gray-50/50">
                                                        {(selectedOrder.verificationLogs?.length || 0) === 0 ? (
                                                            <p className="text-xs text-gray-400 text-center italic">No interaction logs yet.</p>
                                                        ) : (
                                                            <ul className="space-y-3">
                                                                {selectedOrder.verificationLogs?.slice().reverse().map(log => (
                                                                    <li key={log.id} className="text-xs flex gap-3">
                                                                        <div className="flex-shrink-0 mt-0.5">
                                                                            {log.outcome === 'Confirmed' ? (
                                                                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                                                            ) : (
                                                                                <PhoneIcon className="h-4 w-4 text-gray-400" />
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-bold text-gray-900">{log.action} ({log.outcome})</span>
                                                                                <span className="text-gray-400">{new Date(log.date).toLocaleString()}</span>
                                                                            </div>
                                                                            {log.note && <p className="text-gray-600 mt-0.5">{log.note}</p>}
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 mb-2">Customer Details</h4>
                                                        <div className="text-sm text-gray-600 space-y-1">
                                                            <p>{selectedOrder.customerName}</p>
                                                            <p>{selectedOrder.email}</p>
                                                            <p>{selectedOrder.phone}</p>
                                                        </div>
                                                        <div className="mt-4">
                                                            <h4 className="font-bold text-gray-900 mb-2">Shipping Address</h4>
                                                            <div className="text-sm text-gray-600 whitespace-pre-line bg-gray-50/50 p-2 rounded border border-gray-100">
                                                                {(() => {
                                                                    const addr = selectedOrder.shippingAddress || {};
                                                                    // Check if address object is empty
                                                                    if (Object.keys(addr).length === 0) return <span className="text-gray-400 italic">No address details provided</span>;

                                                                    return (
                                                                        <>
                                                                            <span className="font-bold text-gray-900 block">{addr.name || addr.fullName || selectedOrder.customerName || 'N/A'}</span>
                                                                            <span className="block">{addr.street || addr.address || addr.addressLine1 || 'N/A'}</span>
                                                                            <span className="block">
                                                                                {[addr.city, addr.region || addr.state, addr.zip || addr.postalCode].filter(Boolean).join(', ')}
                                                                            </span>
                                                                            {addr.phone && <span className="block mt-1 text-gray-500">{addr.phone}</span>}
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>

                                                        {/* Delivery Instructions Display */}
                                                        {selectedOrder.instructions && (
                                                            <div className="mt-4">
                                                                <h4 className="font-bold text-gray-900 mb-2">Delivery Instructions</h4>
                                                                <div className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100 italic">
                                                                    "{selectedOrder.instructions}"
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <h4 className="font-bold text-gray-900 mb-2">Order Summary</h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Subtotal</span>
                                                                <span className="font-medium">Tk {(selectedOrder.subtotal || 0).toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Shipping</span>
                                                                <span className="font-medium">Tk {(selectedOrder.shipping || 0).toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Fees</span>
                                                                <span className="font-medium">Tk {(selectedOrder.fee || 0).toLocaleString()}</span>
                                                            </div>
                                                            <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-900">
                                                                <span>Total</span>
                                                                <span>Tk {(selectedOrder.total || 0).toLocaleString()}</span>
                                                            </div>
                                                            <div className="pt-2">
                                                                <span className="text-xs text-gray-500 uppercase tracking-wide">Payment Method</span>
                                                                <p className="font-medium">
                                                                    {['cod', 'bkash', 'nagad', 'rocket'].includes(selectedOrder.paymentMethod)
                                                                        ? (selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : selectedOrder.paymentMethod.charAt(0).toUpperCase() + selectedOrder.paymentMethod.slice(1))
                                                                        : selectedOrder.paymentMethod}
                                                                    {(selectedOrder.paymentMethod === 'bkash' || selectedOrder.paymentMethod === 'nagad' || selectedOrder.paymentMethod === 'rocket') ? ' (Manual)' : ''}
                                                                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${selectedOrder.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                                                                        selectedOrder.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                                                                            'bg-yellow-100 text-yellow-800'
                                                                        }`}>
                                                                        {selectedOrder.paymentStatus}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            {selectedOrder.transactionId && (
                                                                <div className="pt-2 border-t border-gray-100 mt-2">
                                                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Transaction ID</span>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <code className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-mono font-bold">{selectedOrder.transactionId}</code>
                                                                        <button
                                                                            onClick={() => {
                                                                                navigator.clipboard.writeText(selectedOrder.transactionId || '');
                                                                                alert('Transaction ID copied!');
                                                                            }}
                                                                            className="text-gray-400 hover:text-black"
                                                                            title="Copy ID"
                                                                        >
                                                                            <ClipboardDocumentIcon className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="font-bold text-gray-900">Items ({selectedOrder.items.length})</h4>
                                                    </div>

                                                    <div className="border rounded-lg overflow-hidden">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                                                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200">
                                                                {selectedOrder.items.map((item, i) => (
                                                                    <tr key={i}>
                                                                        <td className="px-4 py-2 text-sm text-gray-900">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="h-10 w-10 flex-shrink-0">
                                                                                    <img
                                                                                        className="h-10 w-10 rounded object-cover"
                                                                                        src={getMediaUrl(item.image)}
                                                                                        alt={item.productName || item.name}
                                                                                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <Link to={`/admin/products/${item.id}`} className="font-medium hover:text-indigo-600 hover:underline">
                                                                                        {item.productName || item.name}
                                                                                    </Link>
                                                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                                                        {item.variantInfo ? (
                                                                                            <div className="flex flex-wrap gap-1">
                                                                                                {Object.entries(item.variantInfo).map(([k, v]) => (
                                                                                                    <span key={k} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                                                        {k}: {v as string}
                                                                                                    </span>
                                                                                                ))}
                                                                                            </div>
                                                                                        ) : (
                                                                                            item.variantId && <span>Variant: {item.variantId}</span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-2 text-sm text-right text-gray-500">Tk {(item.price || 0).toLocaleString()}</td>
                                                                        <td className="px-4 py-2 text-sm text-center text-gray-900">
                                                                            {item.quantity}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">Tk {((item.price || 0) * (item.quantity || 0)).toLocaleString()}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}



                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>


            {/* Resolve Return Modal */}
            < Transition appear show={isResolveOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsResolveOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">
                                        Resolve Return Shipment
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Has the package been returned to your warehouse?
                                        </p>

                                        <div className="mt-4 space-y-3">
                                            <div
                                                className={`p-3 rounded-lg border cursor-pointer flex gap-3 ${resolveAction === 'Returned' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}
                                                onClick={() => setResolveAction('Returned')}
                                            >
                                                <div className="mt-0.5">
                                                    <input type="radio" checked={resolveAction === 'Returned'} readOnly className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900">Yes, Returned (Restock)</h4>
                                                    <p className="text-xs text-gray-500">Items will be added back to inventory. <br /> Loss = Shipping Cost (Tk {selectedOrder?.shipping})</p>
                                                </div>
                                            </div>

                                            <div
                                                className={`p-3 rounded-lg border cursor-pointer flex gap-3 ${resolveAction === 'Lost' ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'border-gray-200 hover:bg-gray-50'}`}
                                                onClick={() => setResolveAction('Lost')}
                                            >
                                                <div className="mt-0.5">
                                                    <input type="radio" checked={resolveAction === 'Lost'} readOnly className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900">No, Lost/Damaged</h4>
                                                    <p className="text-xs text-gray-500">Items will NOT be restocked. <br /> Loss = Full Order Value (Tk {selectedOrder?.total})</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                            onClick={() => setIsResolveOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 focus:outline-none"
                                            onClick={handleResolveSubmit}
                                        >
                                            Confirm Resolution
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition >
            {/* Verification Log Modal */}
            < Transition appear show={isVerificationModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsVerificationModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">
                                        Log Customer Interaction
                                    </Dialog.Title>

                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Outcome</label>
                                            <select
                                                className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 shadow-sm"
                                                value={logOutcome}
                                                onChange={e => setLogOutcome(e.target.value as any)}
                                            >
                                                <option value="Connected">Connected</option>
                                                <option value="Confirmed">Confirmed Order</option>
                                                <option value="No Answer">No Answer</option>
                                                <option value="Busy">Busy</option>
                                                <option value="Wrong Number">Wrong Number</option>
                                                <option value="Follow Up">Need Follow Up</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                                            <textarea
                                                className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 shadow-sm"
                                                rows={4}
                                                placeholder="e.g. Customer requested size change..."
                                                value={logNote}
                                                onChange={e => setLogNote(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                            onClick={() => setIsVerificationModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 focus:outline-none"
                                            onClick={handleAddVerificationLog}
                                        >
                                            Log Interaction
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition >



            {/* Cancel Confirmation Modal */}
            < Transition appear show={isCancelModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[60]" onClose={() => setIsCancelModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-red-600 mb-2">
                                    Confirm Cancellation
                                </Dialog.Title>
                                <div className="mt-2 text-sm text-gray-500">
                                    <p>Are you sure you want to cancel this order?</p>
                                    <p className="mt-2 font-medium">Order #{selectedOrder?.id}</p>
                                    <p className="mt-1 text-xs bg-yellow-50 p-2 rounded border border-yellow-200 text-yellow-800">
                                        Note: This will automatically restore stock for all items in this order.
                                    </p>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                        onClick={() => setIsCancelModalOpen(false)}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 focus:outline-none"
                                        onClick={confirmCancelOrder}
                                    >
                                        Yes, Cancel Order
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition >

            {/* Shipment Modal */}
            < Transition appear show={isShipModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[60]" onClose={() => setIsShipModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">
                                    Fulfill Order
                                </Dialog.Title>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Select Courier</label>
                                        <select
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                            value={selectedCourier}
                                            onChange={(e) => setSelectedCourier(e.target.value)}
                                        >
                                            <option value="Pathao">Pathao Courier</option>
                                            <option value="Steadfast">Steadfast Courier</option>
                                            <option value="RedX">RedX Delivery</option>
                                            <option value="Manual">Manual / Own Delivery</option>
                                        </select>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-500">
                                        <p><strong>Note:</strong> This will generate a tracking number and mark the order as Shipped.</p>
                                    </div>

                                    <div className="flex justify-end gap-2 mt-6">
                                        <button
                                            onClick={() => setIsShipModalOpen(false)}
                                            className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleShipSubmit}
                                            disabled={isShipping}
                                            className="px-4 py-2 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isShipping ? 'Processing...' : 'Confirm Shipment'}
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition >

        </div >
    );
}
