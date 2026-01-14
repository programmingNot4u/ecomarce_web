import { Dialog, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { Fragment, useMemo, useState } from 'react';
import { useProducts, type Order } from '../../context/ProductContext';
// @ts-ignore

// Helper to generate consistent avatar colors based on name
const getAvatarColor = (name: string) => {
    const colors = [
        'bg-red-100 text-red-800',
        'bg-green-100 text-green-800',
        'bg-blue-100 text-blue-800',
        'bg-yellow-100 text-yellow-800',
        'bg-purple-100 text-purple-800',
        'bg-pink-100 text-pink-800',
        'bg-indigo-100 text-indigo-800',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

interface MergedCustomer {
    id: string; // email as ID or generated UUID
    name: string;
    email: string;
    phone: string;
    image?: string;
    totalSpent: number;
    orderCount: number;
    lastOrderDate: string;
    firstOrderDate: string;
    status: 'Active' | 'Churned' | 'New'; // Logic: Active if order < 30 days, New if 1 order and < 7 days
    addresses: any[]; // Unique addresses
    orders: Order[];
}

export default function AdminCustomers() {
    const { orders } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<MergedCustomer | null>(null);

    // 1. Aggregate Orders into Customers
    const customers = useMemo(() => {
        const customerMap = new Map<string, MergedCustomer>();

        orders.forEach(order => {
            // Key by email (or phone if email missing, fallback to unique logic)
            // Assuming email is primary key for Guest/Auth separation in this simplified model
            // For guests with same email, we group them.
            const key = order.email?.toLowerCase() || order.phone || `unknown-${order.id}`;
            
            if (!customerMap.has(key)) {
                customerMap.set(key, {
                    id: key,
                    name: order.customerName,
                    email: order.email,
                    phone: order.phone,
                    totalSpent: 0,
                    orderCount: 0,
                    lastOrderDate: order.date,
                    firstOrderDate: order.date,
                    status: 'New',
                    addresses: [],
                    orders: []
                });
            }

            const customer = customerMap.get(key)!;
            
            // Update Aggregates
            customer.totalSpent += order.total;
            customer.orderCount += 1;
            customer.orders.push(order);
            
            // Date logic
            if (new Date(order.date) > new Date(customer.lastOrderDate)) {
                customer.lastOrderDate = order.date;
                // Update name/phone to latest if user changed it
                customer.name = order.customerName;
                customer.phone = order.phone;
            }
            if (new Date(order.date) < new Date(customer.firstOrderDate)) {
                customer.firstOrderDate = order.date;
            }

            // Address logic (simple uniq by stringifying)
            const addrStr = JSON.stringify(order.shippingAddress);
            if (!customer.addresses.some(a => JSON.stringify(a) === addrStr)) {
                customer.addresses.push(order.shippingAddress);
            }
        });

        // Post-process for Status
        const now = new Date();
        return Array.from(customerMap.values()).map(c => {
            const daysSinceLastOrder = (now.getTime() - new Date(c.lastOrderDate).getTime()) / (1000 * 3600 * 24);
            
            let status: MergedCustomer['status'] = 'Active';
            if (daysSinceLastOrder > 60) status = 'Churned';
            else if (c.orderCount === 1 && daysSinceLastOrder < 14) status = 'New';
            
            return { ...c, status };
        }).sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()); // Sort by recent activity
    }, [orders]);

    // 2. Filter
    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Total Customers</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{customers.length}</dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Active Members</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                        {customers.filter(c => c.status !== 'Churned').length}
                    </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Avg. Lifetime Value</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                        Tk {(customers.reduce((acc, c) => acc + c.totalSpent, 0) / (customers.length || 1)).toLocaleString('en-BD', { maximumFractionDigits: 0 })}
                    </dd>
                </div>
            </div>

            {/* Main Table */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight font-serif">Customer Directory</h1>
                <div className="relative w-full max-w-xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500 sm:pl-6">Customer</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Status</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Orders</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Total Spent</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Last Active</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Edit</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredCustomers.length === 0 ? (
                                <tr><td colSpan={6} className="py-10 text-center text-gray-500">No customers found.</td></tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr 
                                        key={customer.id} 
                                        onClick={() => setSelectedCustomer(customer)}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="flex items-center">
                                                <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${getAvatarColor(customer.name)}`}>
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">{customer.name}</div>
                                                    <div className="text-gray-500 text-xs">{customer.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset 
                                                ${customer.status === 'Active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                                                  customer.status === 'Churned' ? 'bg-red-50 text-red-700 ring-red-600/20' : 
                                                  'bg-blue-50 text-blue-700 ring-blue-600/20'}`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center pr-12">{customer.orderCount}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                            Tk {customer.totalSpent.toLocaleString('en-BD')}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {new Date(customer.lastOrderDate).toLocaleDateString()}
                                        </td>
                                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <button className="text-black hover:text-gray-600 font-bold">View</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Details Drawer */}
            <Transition.Root show={!!selectedCustomer} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setSelectedCustomer(null)}>
                     <Transition.Child
                        as={Fragment}
                        enter="ease-in-out duration-500"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-500"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                                <Transition.Child
                                    as={Fragment}
                                    enter="transform transition ease-in-out duration-500 sm:duration-700"
                                    enterFrom="translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transform transition ease-in-out duration-500 sm:duration-700"
                                    leaveFrom="translate-x-0"
                                    leaveTo="translate-x-full"
                                >
                                    <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                                        {selectedCustomer && (
                                            <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                                {/* Drawer Header */}
                                                <div className="px-4 py-6 sm:px-6 bg-gray-50 border-b border-gray-200">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-4">
                                                             <div className={`h-16 w-16 flex-shrink-0 rounded-full flex items-center justify-center text-2xl font-bold ${getAvatarColor(selectedCustomer.name)}`}>
                                                                {selectedCustomer.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <Dialog.Title className="text-xl font-semibold leading-6 text-gray-900">
                                                                    {selectedCustomer.name}
                                                                </Dialog.Title>
                                                                <p className="mt-1 text-sm text-gray-500">Customer since {new Date(selectedCustomer.firstOrderDate).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="ml-3 flex h-7 items-center">
                                                            <button
                                                                type="button"
                                                                className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                                                onClick={() => setSelectedCustomer(null)}
                                                            >
                                                                <span className="absolute -inset-2.5" />
                                                                <span className="sr-only">Close panel</span>
                                                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Drawer Body */}
                                                <div className="flex-1 px-4 py-6 sm:px-6">
                                                     {/* Quick Stats */}
                                                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                                        <div className="border rounded-lg p-4 text-center">
                                                            <dt className="text-xs font-medium text-gray-500 uppercase">Total Spent</dt>
                                                            <dd className="mt-1 text-xl font-bold text-gray-900">Tk {selectedCustomer.totalSpent.toLocaleString()}</dd>
                                                        </div>
                                                        <div className="border rounded-lg p-4 text-center">
                                                            <dt className="text-xs font-medium text-gray-500 uppercase">Orders</dt>
                                                            <dd className="mt-1 text-xl font-bold text-gray-900">{selectedCustomer.orderCount}</dd>
                                                        </div>
                                                        <div className="border rounded-lg p-4 text-center">
                                                            <dt className="text-xs font-medium text-gray-500 uppercase">Avg Order</dt>
                                                            <dd className="mt-1 text-xl font-bold text-gray-900">
                                                                Tk {Math.round(selectedCustomer.totalSpent / selectedCustomer.orderCount).toLocaleString()}
                                                            </dd>
                                                        </div>
                                                    </dl>

                                                    {/* Contact Info */}
                                                    <div className="mb-8">
                                                        <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">Contact Information</h3>
                                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                                                            <div className="flex items-center gap-3">
                                                                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                                                <span className="text-gray-900">{selectedCustomer.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <PhoneIcon className="h-5 w-5 text-gray-400" />
                                                                <span className="text-gray-900">{selectedCustomer.phone}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Addresses */}
                                                    <div className="mb-8">
                                                        <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">Addresses ({selectedCustomer.addresses.length})</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {selectedCustomer.addresses.map((addr, idx) => (
                                                                <div key={idx} className="border border-gray-200 rounded-lg p-4 text-sm relative">
                                                                    <MapPinIcon className="h-5 w-5 text-gray-400 absolute top-4 right-4" />
                                                                    <p className="font-medium text-gray-900 mb-1">{addr.name}</p>
                                                                    <p className="text-gray-500">{addr.street}</p>
                                                                    <p className="text-gray-500">{addr.city}, {addr.postalCode}</p>
                                                                    <p className="text-gray-500">{addr.phone}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Order History */}
                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">Order History</h3>
                                                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                                            <table className="min-w-full divide-y divide-gray-300">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900">Order ID</th>
                                                                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Date</th>
                                                                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Status</th>
                                                                        <th className="px-3 py-3.5 text-right text-xs font-semibold text-gray-900">Total</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                                    {selectedCustomer.orders.map((order) => (
                                                                        <tr key={order.id}>
                                                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black">#{order.id.slice(0,8)}</td>
                                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                                                 <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset 
                                                                                    ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                                                                                      order.status === 'Cancelled' ? 'bg-red-50 text-red-700 ring-red-600/20' : 
                                                                                      'bg-yellow-50 text-yellow-700 ring-yellow-600/20'}`}>
                                                                                    {order.status}
                                                                                </span>
                                                                            </td>
                                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">Tk {order.total.toLocaleString()}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
}

