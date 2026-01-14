import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardAddresses() {
    const { user, updateUser } = useAuth();

    // Default structure for addresses
    const defaultAddress = {
        first_name: '',
        last_name: '',
        company_name: '',
        country: 'Bangladesh',
        street_address: '',
        apartment: '',
        city: '',
        district: 'Dhaka',
        postcode: '',
        phone: '',
        email: ''
    };

    const [billingAddress, setBillingAddress] = useState(defaultAddress);
    const [shippingAddress, setShippingAddress] = useState(defaultAddress);

    // Temp state for editing
    const [tempBilling, setTempBilling] = useState(defaultAddress);
    const [tempShipping, setTempShipping] = useState(defaultAddress);

    const [isEditingBilling, setIsEditingBilling] = useState(false);
    const [isEditingShipping, setIsEditingShipping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            // Helper: Map backend address format (street, name, city) to form format (street_address, first_name, last_name, etc.)
            const mapAddressToForm = (addr: any) => {
                if (!addr || Object.keys(addr).length === 0) return null;

                // If it already matches our form format (unlikely from backend but possible from local updates)
                if (addr.first_name && (addr.street_address || addr.address)) return { ...defaultAddress, ...addr };

                const fullName = addr.name || '';
                const parts = fullName.split(' ');
                const firstName = addr.first_name || parts[0] || '';
                const lastName = addr.last_name || parts.slice(1).join(' ') || '';

                // Handle City/Region "City, Region"
                let city = addr.city || '';
                let district = 'Dhaka'; // Default or attempt to parse
                if (city.includes(',')) {
                    const split = city.split(',').map((s: string) => s.trim());
                    city = split[0];
                    if (split.length > 1) district = split[1];
                }

                return {
                    first_name: firstName,
                    last_name: lastName,
                    company_name: addr.company_name || '',
                    country: 'Bangladesh',
                    street_address: addr.street || addr.street_address || addr.address || '',
                    apartment: addr.apartment || '',
                    city: city,
                    district: district,
                    postcode: addr.postcode || '',
                    phone: addr.phone || '',
                    email: addr.email || ''
                };
            };

            let newBilling = { ...defaultAddress };
            let newShipping = { ...defaultAddress };

            const backendBilling = mapAddressToForm(user.billing_address);
            const backendShipping = mapAddressToForm(user.shipping_address);

            const hasAddr = (a: any) => a && (a.street_address || a.first_name);

            // 1. Resolve Billing
            if (hasAddr(backendBilling)) {
                newBilling = { ...defaultAddress, ...backendBilling };
            } else if (hasAddr(backendShipping)) {
                newBilling = { ...defaultAddress, ...backendShipping };
            }

            // 2. Resolve Shipping
            if (hasAddr(backendShipping)) {
                newShipping = { ...defaultAddress, ...backendShipping };
            } else if (hasAddr(backendBilling)) {
                newShipping = { ...defaultAddress, ...backendBilling };
            }

            // 3. Fallback: If both empty, try top-level user data
            if (!hasAddr(newBilling) && !hasAddr(newShipping)) {
                const fallback = {
                    first_name: user?.first_name || '',
                    last_name: user?.last_name || '',
                    phone: user?.phone || user?.phone_number || '',
                    email: user?.email || '',
                    street_address: '',
                    city: '',
                    district: 'Dhaka',
                    postcode: '',
                    country: 'Bangladesh',
                    company_name: '',
                    apartment: ''
                };
                newBilling = { ...defaultAddress, ...fallback };
                newShipping = { ...defaultAddress, ...fallback };
            }

            setBillingAddress(newBilling);
            setTempBilling(newBilling);
            setShippingAddress(newShipping);
            setTempShipping(newShipping);
        }
    }, [user]);

    const handleSaveBilling = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateUser({ billing_address: tempBilling });
            setBillingAddress(tempBilling);
            setIsEditingBilling(false);
        } catch (error) {
            console.error("Failed to save billing address", error);
            alert("Failed to save address.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveShipping = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateUser({ shipping_address: tempShipping });
            setShippingAddress(tempShipping);
            setIsEditingShipping(false);
        } catch (error) {
            console.error("Failed to save shipping address", error);
            alert("Failed to save address.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderAddressForm = (
        type: 'billing' | 'shipping',
        data: typeof defaultAddress,
        setData: React.Dispatch<React.SetStateAction<typeof defaultAddress>>,
        saveHandler: (e: React.FormEvent) => void,
        cancelHandler: () => void
    ) => (
        <form onSubmit={saveHandler} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-gray-700">First Name *</label>
                <input required type="text" value={data.first_name} onChange={e => setData({ ...data, first_name: e.target.value })} className="mt-1 block w-full rounded border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black" />
            </div>
            <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-gray-700">Last Name *</label>
                <input required type="text" value={data.last_name} onChange={e => setData({ ...data, last_name: e.target.value })} className="mt-1 block w-full rounded border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black" />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Company Name (Optional)</label>
                <input type="text" value={data.company_name} onChange={e => setData({ ...data, company_name: e.target.value })} className="mt-1 block w-full rounded border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black" />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Country / Region *</label>
                <input type="text" disabled value="Bangladesh" className="mt-1 block w-full rounded border-gray-200 bg-gray-50 py-1.5 text-sm text-gray-500 shadow-sm" />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Street address *</label>
                <input required placeholder="House number and street name" type="text" value={data.street_address} onChange={e => setData({ ...data, street_address: e.target.value })} className="mt-1 block w-full rounded border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black" />
                <input placeholder="Apartment, suite, unit, etc. (optional)" type="text" value={data.apartment} onChange={e => setData({ ...data, apartment: e.target.value })} className="mt-2 block w-full rounded border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black" />
            </div>
            <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-gray-700">Town / City *</label>
                <input required type="text" value={data.city} onChange={e => setData({ ...data, city: e.target.value })} className="mt-1 block w-full rounded border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black" />
            </div>
            <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-gray-700">District *</label>
                <select value={data.district} onChange={e => setData({ ...data, district: e.target.value })} className="mt-1 block w-full rounded border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black">
                    <option>Dhaka</option>
                    <option>Chittagong</option>
                    <option>Sylhet</option>
                    <option>Khulna</option>
                    <option>Rajshahi</option>
                    <option>Barisal</option>
                    <option>Rangpur</option>
                    <option>Mymensingh</option>
                </select>
            </div>
            <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-gray-700">Postcode / ZIP *</label>
                <input required type="text" value={data.postcode} onChange={e => setData({ ...data, postcode: e.target.value })} className="mt-1 block w-full rounded border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black" />
            </div>
            <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-gray-700">Phone *</label>
                <input required type="tel" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} className="mt-1 block w-full rounded border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black" />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700">Email address *</label>
                <input required type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} className="mt-1 block w-full rounded border-gray-300 py-1.5 text-sm shadow-sm focus:border-black focus:ring-black" />
            </div>

            <div className="sm:col-span-2 flex gap-3 mt-2">
                <button type="submit" disabled={isLoading} className="bg-[#b91c1c] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-red-800 disabled:opacity-50">Save Address</button>
                <button type="button" onClick={cancelHandler} className="text-gray-600 px-4 py-2 hover:text-black text-sm">Cancel</button>
            </div>
        </form>
    );

    const renderDisplay = (data: typeof defaultAddress) => {
        if (!data.street_address) {
            return <p className="text-sm text-gray-500 italic mb-4">You have not set up this type of address yet.</p>;
        }
        return (
            <address className="not-italic text-sm text-gray-600 space-y-1 mb-4">
                <p className="font-medium text-gray-900">{data.first_name} {data.last_name}</p>
                {data.company_name && <p>{data.company_name}</p>}
                <p>{data.street_address}</p>
                {data.apartment && <p>{data.apartment}</p>}
                <p>{data.city}, {data.district} {data.postcode}</p>
                <p>Bangladesh</p>
            </address>
        );
    };

    return (
        <div className="max-w-4xl">
            <p className="text-sm text-gray-600 mb-8">
                The following addresses will be used on the checkout page by default.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Billing Address */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-serif text-gray-900">Billing address</h3>
                        {!isEditingBilling && (
                            <button
                                onClick={() => setIsEditingBilling(true)}
                                className="text-[#b91c1c] text-sm font-medium hover:underline"
                            >
                                {billingAddress.street_address ? 'Edit' : 'Add'}
                            </button>
                        )}
                    </div>

                    {isEditingBilling ? (
                        renderAddressForm('billing', tempBilling, setTempBilling, handleSaveBilling, () => {
                            setTempBilling(billingAddress); // Reset to current saved address
                            setIsEditingBilling(false);
                        })
                    ) : (
                        renderDisplay(billingAddress)
                    )}
                </div>

                {/* Shipping Address */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-serif text-gray-900">Shipping address</h3>
                        {!isEditingShipping && (
                            <button
                                onClick={() => setIsEditingShipping(true)}
                                className="text-[#b91c1c] text-sm font-medium hover:underline"
                            >
                                {shippingAddress.street_address ? 'Edit' : 'Add'}
                            </button>
                        )}
                    </div>

                    {isEditingShipping ? (
                        renderAddressForm('shipping', tempShipping, setTempShipping, handleSaveShipping, () => {
                            setTempShipping(shippingAddress); // Reset to current saved address
                            setIsEditingShipping(false);
                        })
                    ) : (
                        renderDisplay(shippingAddress)
                    )}
                </div>
            </div>
        </div>
    );
}
