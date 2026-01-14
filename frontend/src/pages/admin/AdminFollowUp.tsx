import { Dialog, Transition } from '@headlessui/react';
import { StarIcon as StarIconSolid } from '@heroicons/react/20/solid';
import {
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClipboardDocumentListIcon,
    MapPinIcon,
    PhoneIcon,
    StarIcon,
    UserCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Fragment, useEffect, useState } from 'react';
import api from '../../services/api';

interface Order {
    id: number;
    customer_name?: string;
    customerName?: string; // Support camelCase
    phone: string;
    email: string;
    total: number;
    created_at?: string;
    createdAt?: string; // Support camelCase
    // Support date alias if backend sends it
    date?: string;
    status: string;
    shipping_address?: any;
    shippingAddress?: any; // Support camelCase
    items: any[];
}

interface FollowUp {
    id: number;
    customerName: string;
    customerPhone: string;
    orderDate?: string;
    orderTotal?: number;
    status: string;
    rating: number;
    notes: string;
    isInterestedInNewProducts: boolean;
    createdAt: string;
    followupType?: string;
}

interface Customer {
    id: number;
    customerName: string;
    phone: string;
    email: string;
    last_order_date: string;
    last_followup_date: string;
    total_spent: number;
    order_count: number;
}

export default function AdminFollowUp() {
    const [activeTab, setActiveTab] = useState<'pending' | 'recurring'>('pending');
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 50;

    // Data
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [recurringCustomers, setRecurringCustomers] = useState<Customer[]>([]);

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerHistory, setCustomerHistory] = useState<FollowUp[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // History Modal State
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyLogs, setHistoryLogs] = useState<FollowUp[]>([]);
    const [isHistoryLogsLoading, setIsHistoryLogsLoading] = useState(false);
    const [historyFilter, setHistoryFilter] = useState<'today' | 'all'>('all');
    const [formData, setFormData] = useState({
        status: 'Called - Successful',
        rating: 5,
        notes: '',
        is_interested_in_new_products: false
    });

    const [statsData, setStatsData] = useState({
        pendingCount: 0,
        recurringCount: 0,
        callsToday: 0,
        avgRating: 0
    });

    // Helper to extract city safely
    const getCity = (order: Order) => {
        const addr = order.shipping_address || order.shippingAddress;
        if (!addr) return 'Unknown City';
        if (typeof addr === 'string') {
            try { return JSON.parse(addr).city || 'Unknown City'; } catch (e) { return 'Unknown City'; }
        }
        return addr.city || 'Unknown City';
    };

    const getStreet = (order: Order) => {
        const addr = order.shipping_address || order.shippingAddress;
        if (!addr) return 'No Address';
        if (typeof addr === 'string') {
            try { return JSON.parse(addr).street || 'No Address'; } catch (e) { return 'No Address'; }
        }
        return addr.street || 'No Address';
    };

    const getDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString();
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const normalizeFollowUp = (data: any): FollowUp => ({
        id: data.id,
        customerName: data.customerName || data.customer_name || 'Unknown',
        customerPhone: data.customerPhone || data.customer_phone || 'N/A',
        orderDate: data.orderDate || data.order_date,
        orderTotal: data.orderTotal || data.order_total,
        status: data.status,
        rating: data.rating,
        notes: data.notes,
        isInterestedInNewProducts: data.isInterestedInNewProducts || data.is_interested_in_new_products,
        createdAt: data.createdAt || data.created_at,
        followupType: data.followupType || data.followup_type || 'Post-Purchase'
    });

    const normalizeStats = (data: any) => ({
        pendingCount: data.pendingCount ?? data.pending_count ?? 0,
        recurringCount: data.recurringCount ?? data.recurring_count ?? 0,
        callsToday: data.callsToday ?? data.calls_today ?? 0,
        avgRating: data.avgRating ?? data.avg_rating ?? 0
    });

    const normalizeCustomer = (data: any): Customer => ({
        id: data.id,
        customerName: data.customerName || data.customer_name || 'Unknown',
        phone: data.phone || data.customer_phone || '',
        email: data.email || '',
        last_order_date: data.lastOrderDate || data.last_order_date,
        last_followup_date: data.lastFollowupDate || data.last_followup_date,
        total_spent: data.totalSpent || data.total_spent,
        order_count: data.orderCount || data.order_count
    });

    const fetchStats = async () => {
        try {
            const res = await api.get('/followups/stats/');
            setStatsData(normalizeStats(res.data));
        } catch (e) {
            console.error("Failed to fetch stats", e);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchData();
        // Pre-fetch completed count for stats if on pending tab (optional optimization)
    }, [activeTab, page]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            let endpoint = '';
            if (activeTab === 'pending') endpoint = '/followups/pending/';
            else if (activeTab === 'recurring') endpoint = '/followups/recurring/';
            else endpoint = '/followups/';

            const response = await api.get(endpoint, {
                params: { page }
            });

            const results = response.data.results || [];
            // If API doesn't return count in a standard way, fallback to results length (non-paginated assumption)
            const count = response.data.count !== undefined ? response.data.count : results.length;

            setTotalCount(count);

            if (activeTab === 'pending') {
                // Orders usually come as snake_case from Django standard serializer unless wrapped
                setPendingOrders(results);
            } else if (activeTab === 'recurring') {
                setRecurringCustomers(results.map(normalizeCustomer));
            }
        } catch (error) {
            console.error("Failed to fetch follow-ups", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Stats Display
    const statsCards = [
        {
            name: 'Pending Orders',
            value: statsData.pendingCount,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            action: () => { setActiveTab('pending'); setPage(1); } // Click to go to Pending
        },
        {
            name: 'Due Relationships',
            value: statsData.recurringCount,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            action: () => { setActiveTab('recurring'); setPage(1); } // Click to go to Recurring
        },
        {
            name: 'Calls Made Today',
            value: statsData.callsToday,
            color: 'text-green-600',
            bg: 'bg-green-50',
            action: () => openHistoryModal('today')
        },
        {
            name: 'Avg Satisfaction',
            value: statsData.avgRating,
            icon: StarIconSolid,
            color: 'text-yellow-500',
            bg: 'bg-yellow-50',
            action: () => openHistoryModal('all')
        }
    ];

    const openHistoryModal = async (filter: 'today' | 'all') => {
        setHistoryFilter(filter);
        setIsHistoryModalOpen(true);
        setIsHistoryLogsLoading(true);

        try {
            let params: any = {};
            if (filter === 'today') {
                const today = new Date().toISOString().split('T')[0];
                params['created_at__gte'] = today;
            }
            // Fetch logs (limit to last 50 for simplicity in modal)
            const res = await api.get('/followups/', { params });
            const rawLogs = res.data.results || res.data;
            setHistoryLogs(Array.isArray(rawLogs) ? rawLogs.map(normalizeFollowUp) : []);
        } catch (e) {
            console.error("Failed to fetch history logs", e);
        } finally {
            setIsHistoryLogsLoading(false);
        }
    };



    const openModal = async (order: Order | null, customer: Customer | null) => {
        setSelectedOrder(order);
        setSelectedCustomer(customer);

        setFormData({
            status: 'Called - Successful',
            rating: 5,
            notes: '',
            is_interested_in_new_products: false
        });

        // Fetch History
        setCustomerHistory([]);
        // Try to get customer ID
        const customerId = order ? (order as any).customer : customer?.id;

        if (customerId) {
            setIsHistoryLoading(true);
            try {
                const res = await api.get(`/followups/?customer=${customerId}`);
                const rawHistory = res.data.results || res.data;
                setCustomerHistory(Array.isArray(rawHistory) ? rawHistory.map(normalizeFollowUp) : []);
            } catch (e) {
                console.error("Failed to fetch history", e);
            } finally {
                setIsHistoryLoading(false);
            }
        }

        setIsModalOpen(true);
    };

    const handleStartFollowUp = (order: Order) => {
        openModal(order, null);
    };

    const handleStartRecurring = (customer: Customer) => {
        openModal(null, customer);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Allow if either order or customer is present
        if (!selectedOrder && !selectedCustomer) return;

        setIsSubmitting(true);
        try {
            await api.post('/followups/', {
                order: selectedOrder ? selectedOrder.id : null,
                customer: selectedCustomer ? selectedCustomer.id : null,
                followup_type: selectedOrder ? 'Post-Purchase' : 'Recurring',
                status: formData.status,
                rating: formData.rating,
                notes: formData.notes,
                is_interested_in_new_products: formData.is_interested_in_new_products
            });

            setIsModalOpen(false);
            fetchData();
            fetchStats();
        } catch (error) {
            console.error("Failed to submit follow-up", error);
            alert("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-col gap-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold leading-7 text-gray-900 font-serif">Customer Follow-Up</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage post-purchase customer satisfaction and feedback.</p>
                    </div>
                </div>

                {/* Stats Cards - Horizontal Scroll on Mobile */}
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
                    {statsCards.map((stat) => (
                        <div
                            key={stat.name}
                            onClick={stat.action}
                            className={`min-w-[240px] sm:min-w-0 rounded-xl px-4 py-3 border border-gray-100 shadow-sm flex items-center gap-3 bg-white 
                            ${stat.action ? 'cursor-pointer hover:border-black hover:shadow-md transition-all' : ''}`}
                        >
                            <div className={`p-2 rounded-lg ${stat.bg} shrink-0`}>
                                {stat.icon ? <stat.icon className={`h-5 w-5 ${stat.color}`} /> : <ClipboardDocumentListIcon className={`h-5 w-5 ${stat.color}`} />}
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.name}</p>
                                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto no-scrollbar" aria-label="Tabs">
                    <button
                        onClick={() => { setActiveTab('pending'); setPage(1); }}
                        className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold capitalize transition-colors
                        ${activeTab === 'pending' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                    >
                        Pending Orders
                    </button>
                    <button
                        onClick={() => { setActiveTab('recurring'); setPage(1); }}
                        className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold capitalize transition-colors
                        ${activeTab === 'recurring' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                    >
                        Relationship Check-in
                    </button>
                </nav>
            </div>

            {/* Content Display */}
            {isLoading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div></div>
            ) : (
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden min-h-[400px]">

                    {/* Pending Orders View */}
                    {activeTab === 'pending' && (
                        <>
                            {pendingOrders.length === 0 ? (
                                <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                                    <div className="bg-green-50 p-4 rounded-full mb-3">
                                        <CheckCircleIcon className="h-8 w-8 text-green-500" />
                                    </div>
                                    <p className="text-gray-900 font-medium">All caught up!</p>
                                    <p className="text-sm text-gray-500">No pending follow-up calls.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table View */}
                                    <div className="hidden sm:block overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500 sm:pl-6">Customer</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Order Details</th>
                                                    <th scope="col" className="hidden lg:table-cell px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Items</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {pendingOrders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                                    {(order.customerName || 'U').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="font-medium text-gray-900">{order.customerName || 'Unknown Customer'}</div>
                                                                    <div className="text-gray-500 text-xs flex items-center gap-1">
                                                                        <PhoneIcon className="h-3 w-3" /> {order.phone}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4">
                                                            <div className="text-gray-900 font-medium">#{order.id}</div>
                                                            <div className="text-gray-500 text-xs">
                                                                {getDate(order.createdAt)} • Tk {Math.round(Number(order.total)).toLocaleString()}
                                                            </div>
                                                        </td>
                                                        <td className="hidden lg:table-cell px-3 py-4 text-xs text-gray-500 max-w-xs truncate">
                                                            {order.items?.length ? `${order.items.length} items (${order.items.map((i: any) => i.productName || 'Product').join(', ').slice(0, 30)}...)` : 'View details'}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                            <button
                                                                onClick={() => handleStartFollowUp(order)}
                                                                className="inline-flex items-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors ring-1 ring-inset ring-black"
                                                            >
                                                                <PhoneIcon className="h-4 w-4" /> Call Now
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="sm:hidden grid grid-cols-1 gap-4 p-4 bg-gray-50">
                                        {pendingOrders.map((order) => (
                                            <div key={order.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-lg">
                                                            {(order.customerName || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 text-lg">{order.customerName || 'Unknown'}</h3>
                                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                <PhoneIcon className="h-3 w-3" />
                                                                <a href={`tel:${order.phone}`} className="hover:underline">{order.phone}</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-gray-900">Tk {Math.round(Number(order.total)).toLocaleString()}</span>
                                                        <span className="text-xs text-gray-500">{getDate(order.createdAt)}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-bold text-gray-500 uppercase">Order #{order.id}</span>
                                                        <span className="text-xs font-bold text-gray-500 uppercase">{order.items?.length || 0} ITEMS</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 truncate">
                                                        {order.items?.map((i: any) => i.productName).join(', ') || 'No item details'}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => handleStartFollowUp(order)}
                                                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-bold text-white shadow-md active:scale-[0.98] transition-all"
                                                >
                                                    <PhoneIcon className="h-4 w-4" /> Start Follow-Up Call
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}


                    {/* Recurring / Relationship View */}
                    {activeTab === 'recurring' && (
                        <>
                            {recurringCustomers.length === 0 ? (
                                <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                                    <div className="bg-purple-50 p-4 rounded-full mb-3">
                                        <CheckCircleIcon className="h-8 w-8 text-purple-500" />
                                    </div>
                                    <p className="text-gray-900 font-medium">All caught up!</p>
                                    <p className="text-sm text-gray-500">No relationship calls due.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table View */}
                                    <div className="hidden sm:block overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500 sm:pl-6">Customer</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">History Stats</th>
                                                    <th scope="col" className="hidden lg:table-cell px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Last Contact</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {recurringCustomers.map((customer) => (
                                                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                                                                    {(customer.customerName || 'U').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="font-medium text-gray-900">{customer.customerName || 'Unknown Customer'}</div>
                                                                    <div className="text-gray-500 text-xs flex items-center gap-1">
                                                                        <PhoneIcon className="h-3 w-3" /> {customer.phone}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4">
                                                            <div className="text-gray-900 font-medium">{customer.order_count} Orders</div>
                                                            <div className="text-gray-500 text-xs">
                                                                Total: Tk {Math.round(customer.total_spent).toLocaleString()}
                                                            </div>
                                                        </td>
                                                        <td className="hidden lg:table-cell px-3 py-4 text-xs text-gray-500">
                                                            {customer.last_followup_date ? getDate(customer.last_followup_date) : <span className="text-red-500">Never Called</span>}
                                                            <span className="block text-gray-400">Last Order: {getDate(customer.last_order_date)}</span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                            <button
                                                                onClick={() => handleStartRecurring(customer)}
                                                                className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <PhoneIcon className="h-4 w-4" /> Check-in
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="sm:hidden grid grid-cols-1 gap-4 p-4 bg-gray-50">
                                        {recurringCustomers.map((customer) => (
                                            <div key={customer.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-700 font-bold text-lg">
                                                            {(customer.customerName || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 text-lg">{customer.customerName || 'Unknown'}</h3>
                                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                <PhoneIcon className="h-3 w-3" />
                                                                <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone}</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 mb-4 border-t border-b border-gray-50 py-3">
                                                    <div className="flex-1 text-center border-r border-gray-50">
                                                        <p className="text-xs text-gray-400 uppercase font-bold">Spent</p>
                                                        <p className="font-bold text-gray-900">Tk {Math.round(customer.total_spent).toLocaleString()}</p>
                                                    </div>
                                                    <div className="flex-1 text-center">
                                                        <p className="text-xs text-gray-400 uppercase font-bold">Orders</p>
                                                        <p className="font-bold text-gray-900">{customer.order_count}</p>
                                                    </div>
                                                </div>

                                                <div className="text-xs text-gray-500 mb-4 flex justify-between px-1">
                                                    <span>Last Order: {getDate(customer.last_order_date)}</span>
                                                    <span>Last Call: {customer.last_followup_date ? getDate(customer.last_followup_date) : 'Never'}</span>
                                                </div>

                                                <button
                                                    onClick={() => handleStartRecurring(customer)}
                                                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-3 text-sm font-bold text-gray-900 shadow-sm active:bg-gray-50 transition-all"
                                                >
                                                    <PhoneIcon className="h-4 w-4" /> Relationship Check-in
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                </div>
            )}


            {/* Pagination Controls */}
            {
                !isLoading && totalCount > 0 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page * pageSize >= totalCount}
                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, totalCount)}</span> of{' '}
                                    <span className="font-medium">{totalCount}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                                        Page {page}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page * pageSize >= totalCount}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Next</span>
                                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Enhanced Pro Modal - Split View */}
            <Transition.Root show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform rounded-2xl bg-white text-left shadow-2xl transition-all w-full h-[100dvh] sm:h-auto sm:my-8 sm:w-full sm:max-w-4xl overflow-hidden flex flex-col sm:block">
                                    <div className="flex flex-col md:flex-row h-full md:h-auto overflow-hidden">

                                        {/* Left Panel: Customer Context (Gray Bg) */}
                                        <div className="w-full md:w-1/3 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-4 md:p-6 flex flex-col gap-4 md:gap-6 overflow-y-auto shrink-0 max-h-[40vh] md:max-h-none">
                                            <div>
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl md:text-2xl font-bold text-gray-700 shadow-sm shrink-0">
                                                        {(selectedOrder?.customerName || selectedCustomer?.customerName || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-base md:text-lg font-bold text-gray-900 leading-tight">{selectedOrder?.customerName || selectedCustomer?.customerName || 'Unknown'}</p>
                                                        <a href={`tel:${selectedOrder?.phone || selectedCustomer?.phone}`} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                                                            <PhoneIcon className="h-3.5 w-3.5" /> {selectedOrder?.phone || selectedCustomer?.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedOrder && (
                                                <div className="space-y-1">
                                                    <div className="text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
                                                        <div className="flex items-start gap-2">
                                                            <MapPinIcon className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                                                            <div>
                                                                <p className="font-medium">{getCity(selectedOrder)}</p>
                                                                <p className="text-xs text-gray-500 line-clamp-2 leading-tight">{getStreet(selectedOrder)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* History Section */}
                                            <div className="flex-1 min-h-[100px] md:min-h-[150px]">
                                                <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Past Follow-Ups</p>
                                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-full max-h-40 md:max-h-60 overflow-y-auto">
                                                    {isHistoryLoading ? (
                                                        <div className="p-4 text-center text-xs text-gray-500">Loading history...</div>
                                                    ) : customerHistory.length === 0 ? (
                                                        <div className="p-4 text-center text-xs text-gray-400 italic">No previous follow-up history found.</div>
                                                    ) : (
                                                        <ul className="divide-y divide-gray-100">
                                                            {customerHistory.map(h => (
                                                                <li key={h.id} className="p-2.5 md:p-3 text-xs hover:bg-gray-50">
                                                                    <div className="flex justify-between font-medium mb-1">
                                                                        <span className="text-gray-900">{getDate(h.createdAt)}</span>
                                                                        <span className="flex items-center gap-1">
                                                                            {h.rating}<StarIconSolid className="h-3 w-3 text-yellow-500" />
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${h.status.includes('Successful') ? 'bg-green-50 text-green-700 border-green-200' :
                                                                            h.status.includes('Late') ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                                                'bg-gray-50 text-gray-600 border-gray-200'
                                                                            }`}>
                                                                            {h.status}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-gray-600 break-words line-clamp-2">{h.notes || <i>No notes</i>}</div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="hidden md:block flex-1">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Order Summary (#{selectedOrder?.id})</p>
                                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                                    <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                                        <span className="text-xs font-medium text-gray-500">Date: {selectedOrder ? getDate(selectedOrder.createdAt) : ''}</span>
                                                        <span className="text-xs font-bold text-gray-900">Tk {Math.round(Number(selectedOrder?.total || 0)).toLocaleString()}</span>
                                                    </div>
                                                    <div className="p-3 text-sm text-gray-600">
                                                        {selectedOrder?.items && selectedOrder.items.length > 0 ? (
                                                            <ul className="space-y-2">
                                                                {selectedOrder.items.slice(0, 3).map((item, idx) => (
                                                                    <li key={idx} className="flex justify-between text-xs">
                                                                        <span>{item.quantity}x {item.productName || 'Unknown Product'}</span>
                                                                    </li>
                                                                ))}
                                                                {selectedOrder.items.length > 3 && (
                                                                    <li className="text-xs text-gray-400 italic">...and {selectedOrder.items.length - 3} more</li>
                                                                )}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-xs text-gray-500 italic">No item details available.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Panel: Action Form (White Bg) */}
                                        <div className="w-full md:w-2/3 p-4 md:p-8 flex flex-col h-full overflow-hidden">
                                            <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0">
                                                <Dialog.Title className="text-lg md:text-xl font-bold text-gray-900">Log Follow-Up Call</Dialog.Title>
                                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 p-2 -mr-2">
                                                    <XMarkIcon className="h-6 w-6" />
                                                </button>
                                            </div>

                                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 md:gap-6 overflow-y-auto">
                                                {/* Script Hint */}
                                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 text-xs md:text-sm text-blue-800 shrink-0">
                                                    <UserCircleIcon className="h-5 w-5 shrink-0 mt-0.5 hidden sm:block" />
                                                    <p><strong>Script Tip:</strong> "Hi, I'm calling from [Store Name] to check if your recent order arrived safely and if you're happy with the products."</p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 shrink-0">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Call Outcome</label>
                                                        <select
                                                            value={formData.status}
                                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                                            className="block w-full rounded-md border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                                                        >
                                                            <option value="Called - Successful">Connected & Surveyed</option>
                                                            <option value="Called - No Answer">No Answer / Busy</option>
                                                            <option value="Not Interested">Not Interested</option>
                                                            <option value="Follow Later">Call Later/Reschedule</option>
                                                        </select>
                                                    </div>

                                                    {formData.status === 'Called - Successful' && (
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Customer Satisfaction</label>
                                                            <div className="flex gap-1.5 mt-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <button
                                                                        key={star}
                                                                        type="button"
                                                                        onClick={() => setFormData({ ...formData, rating: star })}
                                                                        className="focus:outline-none transition-transform hover:scale-110"
                                                                    >
                                                                        {star <= formData.rating ? (
                                                                            <StarIconSolid className="h-8 w-8 md:h-9 md:w-9 text-yellow-400 drop-shadow-sm" />
                                                                        ) : (
                                                                            <StarIcon className="h-8 w-8 md:h-9 md:w-9 text-gray-200" />
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-h-[100px]">
                                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Call Notes / Feedback</label>
                                                    <textarea
                                                        rows={4}
                                                        value={formData.notes}
                                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                        className="block w-full h-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 resize-none"
                                                        placeholder="Record any specific feedback, complaints, or compliments..."
                                                    />
                                                </div>

                                                {formData.status === 'Called - Successful' && (
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer shrink-0" onClick={() => setFormData({ ...formData, is_interested_in_new_products: !formData.is_interested_in_new_products })}>
                                                        <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 ${formData.is_interested_in_new_products ? 'bg-black border-black' : 'border-gray-300 bg-white'}`}>
                                                            {formData.is_interested_in_new_products && <CheckCircleIcon className="h-3.5 w-3.5 text-white" />}
                                                        </div>
                                                        <span className="text-xs md:text-sm font-medium text-gray-900">Customer is interested in upcoming products/offers</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 shrink-0 mb-safe">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsModalOpen(false)}
                                                        className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 min-w-[120px]"
                                                    >
                                                        {isSubmitting ? 'Saving...' : 'Complete Log'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* History Logs Modal */}
            < Transition.Root show={isHistoryModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsHistoryModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl max-h-[80vh] flex flex-col">
                                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                                                {historyFilter === 'today' ? "Today's Calls" : "Recent Call History"}
                                            </Dialog.Title>
                                            <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-0">
                                        {isHistoryLogsLoading ? (
                                            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div></div>
                                        ) : historyLogs.length === 0 ? (
                                            <div className="py-20 text-center text-gray-500">No calls found for this period.</div>
                                        ) : (
                                            <table className="min-w-full divide-y divide-gray-300">
                                                <thead className="bg-gray-50 sticky top-0 z-10">
                                                    <tr>
                                                        <th scope="col" className="py-3 px-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Customer</th>
                                                        <th scope="col" className="py-3 px-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Date</th>
                                                        <th scope="col" className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Rating</th>
                                                        <th scope="col" className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Outcome</th>
                                                        <th scope="col" className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Notes</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {historyLogs.map((log) => (
                                                        <tr key={log.id} className="hover:bg-gray-50">
                                                            <td className="whitespace-nowrap py-3 px-3 text-sm font-medium text-gray-900">
                                                                {log.customerName || 'Unknown'}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500">
                                                                {new Date(log.createdAt).toLocaleString()}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-3">
                                                                <div className="flex items-center text-yellow-500">
                                                                    {log.rating > 0 ? (
                                                                        <>
                                                                            <span className="text-sm font-bold text-gray-700 mr-1">{log.rating}</span>
                                                                            <StarIconSolid className="h-4 w-4" />
                                                                        </>
                                                                    ) : <span className="text-xs text-gray-400">N/A</span>}
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-3 text-sm">
                                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset 
                                                                    ${log.status.includes('Successful') ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                                        log.status.includes('No Answer') ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                                                                            'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
                                                                    {log.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-3 text-sm text-gray-500 max-w-xs truncate">
                                                                {log.notes || '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() => setIsHistoryModalOpen(false)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root >
        </div >
    );
}
