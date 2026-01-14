import { Dialog, Switch, Transition } from '@headlessui/react';
import { PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useProducts } from '../../context/ProductContext';
import api from '../../services/api';

export default function AdminPayments() {

    const { paymentMethods, updatePaymentMethod, paymentSettings, updatePaymentSettings } = useProducts();
    const [methods, setMethods] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { showNotification } = useNotification();

    // Global Settings State
    const [globalSettings, setGlobalSettings] = useState({
        vatPercentage: 5,
        insideDhakaShipping: 60,
        outsideDhakaShipping: 120
    });

    useEffect(() => {
        if (paymentSettings) {
            setGlobalSettings({
                vatPercentage: paymentSettings.vatPercentage,
                insideDhakaShipping: paymentSettings.insideDhakaShipping,
                outsideDhakaShipping: paymentSettings.outsideDhakaShipping
            });
        }
    }, [paymentSettings]);

    const handleSaveGlobalSettings = async () => {
        try {
            await updatePaymentSettings(globalSettings);
            showNotification("Global payment settings updated!", 'success');
        } catch (e) {
            showNotification("Failed to update settings", 'error');
        }
    };

    // Configuration Modal
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<any>(null);

    const loadPaymentMethods = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/payment-methods/');
            setMethods(res.data);
        } catch (e) {
            console.error("Failed to load payment methods", e);
            showNotification("Failed to load payment methods", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setMethods(prev => prev.map(m => m.id === id ? { ...m, isActive: !currentStatus } : m));

            await api.patch(`/payment-methods/${id}/`, { isActive: !currentStatus });
            showNotification("Status updated successfully", 'success');
        } catch (e) {
            console.error("Failed to update status", e);
            showNotification("Failed to update status", 'error');
            loadPaymentMethods(); // Revert
        }
    };

    const handleSaveMethod = async (method: any) => {
        try {
            // Sanitize payload
            const payload = {
                name: method.name,
                type: method.type,
                isActive: method.isActive,
                number: method.number,
                instructions: method.instructions
            };

            if (method.id) {
                await api.patch(`/payment-methods/${method.id}/`, payload);
                showNotification("Payment method updated successfully!", 'success');
            } else {
                await api.post('/payment-methods/', payload);
                showNotification("Payment method created successfully!", 'success');
            }
            setIsConfigOpen(false);
            loadPaymentMethods();
        } catch (e) {
            console.error("Failed to save method", e);
            showNotification("Failed to save payment method", 'error');
        }
    };

    const handleEditClick = (method: any) => {
        setEditingMethod({ ...method });
        setIsConfigOpen(true);
    };

    const handleAddNewClick = () => {
        setEditingMethod({
            name: '',
            type: 'manual',
            isActive: true,
            number: '',
            instructions: ''
        });
        setIsConfigOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this payment method?")) return;
        try {
            await api.delete(`/payment-methods/${id}/`);
            setMethods(prev => prev.filter(m => m.id !== id));
            showNotification("Payment method deleted", 'success');
        } catch (e) {
            console.error("Failed to delete", e);
            showNotification("Failed to delete payment method", 'error');
        }
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
                    <p className="text-gray-500 mt-1">Manage payment gateways and manual payment options</p>
                </div>
                <button
                    onClick={handleAddNewClick}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors w-full sm:w-auto justify-center"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Method
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Global Settings Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                        <span className="bg-black text-white p-1.5 rounded-lg"><PencilSquareIcon className="h-4 w-4" /></span>
                        Global Settings
                    </h2>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">VAT Percentage (%)</label>
                            <input
                                type="number"
                                value={globalSettings.vatPercentage}
                                onChange={(e) => setGlobalSettings({ ...globalSettings, vatPercentage: Number(e.target.value) })}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-black py-2.5 sm:text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Inside Dhaka (Tk)</label>
                                <input
                                    type="number"
                                    value={globalSettings.insideDhakaShipping}
                                    onChange={(e) => setGlobalSettings({ ...globalSettings, insideDhakaShipping: Number(e.target.value) })}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-black py-2.5 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Outside Dhaka (Tk)</label>
                                <input
                                    type="number"
                                    value={globalSettings.outsideDhakaShipping}
                                    onChange={(e) => setGlobalSettings({ ...globalSettings, outsideDhakaShipping: Number(e.target.value) })}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-black py-2.5 sm:text-sm"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleSaveGlobalSettings}
                            className="w-full py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-all active:scale-[0.98] text-sm font-bold shadow-lg shadow-black/10"
                        >
                            Update Settings
                        </button>
                    </div>
                </div>

                {/* Info Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-md text-white p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05 1.18 1.91 2.53 1.91 1.29 0 2.13-.72 2.13-1.71 0-2.43-5.32-1.53-5.32-4.55 0-1.74 1.44-3.09 3.21-3.48V4.92h2.67v1.93c1.42.34 2.72 1.28 3.19 2.97h-2.02c-.21-1.02-1.12-1.7-2.43-1.7-1.29 0-2.06.77-2.06 1.64 0 2.53 5.32 1.54 5.32 4.54 0 1.9-1.53 3.34-3.24 3.69z" /></svg>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-3 tracking-tight">Payment Setup</h3>
                        <p className="text-gray-300 mb-6 max-w-lg leading-relaxed text-sm sm:text-base">
                            Configure your store's payment ecosystem. Enable automated gateways for seamless transactions or set up manual payment methods like Bkash/Nagad with custom instructions.
                            <br /><br />
                            Don't forget to set your global shipping rates and VAT to ensure accurate checkout calculations.
                        </p>
                        <button onClick={() => window.open('https://stripe.com', '_blank')} className="w-fit px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
                            Learn about Gateways
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Methods List (Responsive) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Mobile Card View */}
                <div className="block sm:hidden divide-y divide-gray-100">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : methods.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No payment methods found.</div>
                    ) : (
                        methods.map((method) => (
                            <div key={method.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{method.name}</h3>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${method.type === 'gateway' ? 'bg-purple-100 text-purple-700' :
                                            method.type === 'cod' ? 'bg-blue-100 text-blue-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                            {method.type === 'cod' ? 'COD' :
                                                method.type === 'gateway' ? 'Gateway' : 'Manual'}
                                        </span>
                                    </div>
                                    <Switch
                                        checked={method.isActive}
                                        onChange={(val: boolean) => handleToggleStatus(method.id, val)}
                                        className={`${method.isActive ? 'bg-green-600' : 'bg-gray-200'
                                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0`}
                                    >
                                        <span
                                            className={`${method.isActive ? 'translate-x-6' : 'translate-x-1'
                                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                        />
                                    </Switch>
                                </div>

                                {(method.number || method.instructions) && (
                                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        {method.number && <div className="mb-1"><span className="font-semibold text-gray-800">Account:</span> {method.number}</div>}
                                        {method.instructions && <div className="text-xs line-clamp-2 italic">{method.instructions}</div>}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-1">
                                    <button
                                        onClick={() => handleEditClick(method)}
                                        className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                    >
                                        <PencilSquareIcon className="h-4 w-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(method.id)}
                                        className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                        <TrashIcon className="h-4 w-4" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-3 md:p-4 font-semibold text-gray-600">Method Name</th>
                                <th className="p-3 md:p-4 font-semibold text-gray-600">Type</th>
                                <th className="p-3 md:p-4 font-semibold text-gray-600">Details</th>
                                <th className="p-3 md:p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-3 md:p-4 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
                            ) : methods.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No payment methods found.</td></tr>
                            ) : (
                                methods.map((method) => (
                                    <tr key={method.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-3 md:p-4 font-medium text-gray-900">{method.name}</td>
                                        <td className="p-3 md:p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${method.type === 'gateway' ? 'bg-purple-100 text-purple-700' :
                                                method.type === 'cod' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {method.type === 'cod' ? 'Cash on Delivery' :
                                                    method.type === 'gateway' ? 'Automated Gateway' : 'Manual Transfer'}
                                            </span>
                                        </td>
                                        <td className="p-3 md:p-4 text-sm text-gray-500 max-w-xs">
                                            {method.number && <div><span className="font-medium text-gray-700">Account:</span> {method.number}</div>}
                                            {method.instructions && <div className="truncate text-xs mt-0.5" title={method.instructions}>{method.instructions}</div>}
                                        </td>
                                        <td className="p-3 md:p-4">
                                            <Switch
                                                checked={method.isActive}
                                                onChange={(val: boolean) => handleToggleStatus(method.id, val)}
                                                className={`${method.isActive ? 'bg-green-600' : 'bg-gray-200'
                                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                                            >
                                                <span
                                                    className={`${method.isActive ? 'translate-x-6' : 'translate-x-1'
                                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                />
                                            </Switch>
                                        </td>
                                        <td className="p-3 md:p-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEditClick(method)}
                                                className="text-gray-400 hover:text-blue-600 transition-colors bg-transparent border-0 cursor-pointer p-1"
                                                title="Edit"
                                            >
                                                <PencilSquareIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(method.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors bg-transparent border-0 cursor-pointer p-1"
                                                title="Delete"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Config Modal */}
            <Transition appear show={isConfigOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsConfigOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30" />
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
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center">
                                        {editingMethod?.id ? 'Edit Payment Method' : 'Add New Payment Method'}
                                        <button onClick={() => setIsConfigOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </Dialog.Title>

                                    {editingMethod && (
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Method Name</label>
                                                <input
                                                    type="text"
                                                    value={editingMethod.name}
                                                    onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-black"
                                                    placeholder="e.g. Bkash Personal"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                                <select
                                                    value={editingMethod.type}
                                                    onChange={(e) => setEditingMethod({ ...editingMethod, type: e.target.value })}
                                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-black"
                                                >
                                                    <option value="manual">Manual Transfer (Bkash/Nagad/Rocket)</option>
                                                    <option value="cod">Cash on Delivery</option>
                                                    <option value="gateway">Payment Gateway (Stripe/SSLCommerz)</option>
                                                </select>
                                            </div>

                                            {editingMethod.type === 'manual' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                                    <input
                                                        type="text"
                                                        value={editingMethod.number || ''}
                                                        onChange={(e) => setEditingMethod({ ...editingMethod, number: e.target.value })}
                                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-black"
                                                        placeholder="e.g. 01700000000"
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Instructions / Note</label>
                                                <textarea
                                                    value={editingMethod.instructions || ''}
                                                    onChange={(e) => setEditingMethod({ ...editingMethod, instructions: e.target.value })}
                                                    rows={3}
                                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-black"
                                                    placeholder="e.g. Send money to this number using 'Send Money' option."
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={editingMethod.isActive}
                                                    onChange={(val: boolean) => setEditingMethod({ ...editingMethod, isActive: val })}
                                                    className={`${editingMethod.isActive ? 'bg-green-600' : 'bg-gray-200'
                                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                                                >
                                                    <span
                                                        className={`${editingMethod.isActive ? 'translate-x-6' : 'translate-x-1'
                                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                    />
                                                </Switch>
                                                <span className="text-sm text-gray-700">Active</span>
                                            </div>

                                            <div className="mt-6 flex justify-end gap-3">
                                                <button
                                                    onClick={() => setIsConfigOpen(false)}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleSaveMethod(editingMethod)}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                                                >
                                                    Save Method
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
