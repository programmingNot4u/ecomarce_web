import { ArrowPathIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import { useProducts } from '../../context/ProductContext';

export default function AdminDelivery() {
    const { orders, updateOrder, fetchOrders } = useProducts();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [trackingInput, setTrackingInput] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchOrders();
        setIsRefreshing(false);
    };

    const activeDeliveries = useMemo(() => {
        return orders.filter(o => ['Processing', 'Shipped'].includes(o.status));
    }, [orders]);

    const updateTracking = (id: string) => {
        if (!trackingInput.trim()) return;
        updateOrder(id, { trackingNumber: trackingInput, status: 'Shipped' });
        setEditingId(null);
        setTrackingInput('');
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-gray-900">Delivery & Logistics</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage shipments and tracking numbers.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className={`flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 w-full sm:w-auto justify-center ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                    Refresh
                </button>
            </div>

            {/* Active Shipments Card */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-base font-semibold leading-6 text-gray-900 flex items-center gap-2">
                        <span>Active Shipments</span>
                        <span className="inline-flex items-center rounded-full bg-black px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
                            {activeDeliveries.length}
                        </span>
                    </h3>
                </div>
                <ul role="list" className="divide-y divide-gray-100">
                    {activeDeliveries.length === 0 ? (
                        <li className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.5a1.5 1.5 0 01-3 0 9.375 9.375 0 00-7.5 0 1.5 1.5 0 01-3 0H2" />
                                </svg>
                            </div>
                            <p className="font-medium text-gray-900">All caught up!</p>
                            <p className="text-sm mt-1">No active deliveries to process at the moment.</p>
                        </li>
                    ) : (
                        activeDeliveries.map((order) => (
                            <li key={order.id} className="group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-x-6 gap-y-4 py-5 px-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                {/* Order Info */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between sm:justify-start sm:gap-x-3 mb-2 sm:mb-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-gray-900">#{order.id}</span>
                                            <span className="sm:hidden inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                {new Date(order.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${order.status === 'Shipped'
                                            ? 'bg-blue-50 text-blue-700 ring-blue-600/20'
                                            : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                                            }`}>
                                            {order.status}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 mt-1 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5 font-medium text-gray-900">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                            {order.customerName}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-500 truncate">
                                            <MapPinIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                            {order.shippingAddress.city}
                                            <span className="text-gray-300 mx-1">|</span>
                                            <span className="truncate max-w-[150px]">{order.shippingAddress.address}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions / Tracking */}
                                <div className="flex flex-none items-center justify-end w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                                    {editingId === order.id ? (
                                        <div className="flex items-center gap-2 w-full sm:w-auto animate-fadeIn">
                                            <div className="relative flex-grow sm:flex-grow-0">
                                                <input
                                                    type="text"
                                                    placeholder="Tracking #"
                                                    className="block w-full sm:w-48 rounded-lg border-0 py-1.5 pl-3 pr-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 bg-white"
                                                    value={trackingInput}
                                                    onChange={e => setTrackingInput(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                            <button
                                                onClick={() => updateTracking(order.id)}
                                                className="bg-black text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                                                title="Cancel"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                                            {order.trackingNumber ? (
                                                <>
                                                    <span className="text-xs text-gray-500 sm:mb-0.5">Tracking Number</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm select-all">
                                                            {order.trackingNumber}
                                                        </span>
                                                        <button
                                                            onClick={() => { setEditingId(order.id); setTrackingInput(order.trackingNumber || ''); }}
                                                            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => { setEditingId(order.id); setTrackingInput(''); }}
                                                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-gray-800 transition-all active:scale-95"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                    Add Tracking
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
