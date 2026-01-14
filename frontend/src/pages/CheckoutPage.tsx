
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FloatingLabelInput from '../components/ui/FloatingLabelInput';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { useProducts, type Order } from '../context/ProductContext';
import { bangladeshLocations } from '../data/bangladeshLocations';


const deliveryMethods = [];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};


export default function CheckoutPage() {
    const { cart, total, clearCart } = useCart();
    const { addOrder, paymentMethods, shippingMethods, insideDhakaCities, paymentSettings } = useProducts();
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const { showNotification } = useNotification();
    const { user, checkOrCreateUser, refreshUser } = useAuth();
    const navigate = useNavigate();

    // Form State (Controlled)
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [region, setRegion] = useState('');

    // Effect to populate form when user data loads
    // Effect to populate form when user data loads
    useEffect(() => {
        if (user) {
            // Priority: 1. Profile Field (Normalized in AuthContext), 2. Address Field
            // Check normalized first_name (snake_case from AuthContext)

            // Helper to get address field (handle both cases in address object itself if not normalized)
            const getAddrField = (addr: any, key1: string, key2: string) => addr?.[key1] || addr?.[key2] || '';

            const fName = user.first_name || getAddrField(user.shipping_address, 'first_name', 'firstName');
            const lName = user.last_name || getAddrField(user.shipping_address, 'last_name', 'lastName');
            const ph = user.phone || user.phone_number || user.username || '';
            const em = user.email || '';

            const addr = getAddrField(user.shipping_address, 'street', 'address') || getAddrField(user.billing_address, 'street', 'address');
            const fullCity = getAddrField(user.shipping_address, 'city', 'city') || getAddrField(user.billing_address, 'city', 'city');

            let cityOnly = fullCity;
            let regionOnly = '';
            if (fullCity.includes(',')) {
                [cityOnly, regionOnly] = fullCity.split(',').map((s: string) => s.trim());
            }

            // Always update state if we have a value, prioritizing the latest user data
            // This ensures "Refresh" actually refreshes the form
            if (fName) setFirstName(fName);
            if (lName) setLastName(lName);
            if (ph) setPhone(ph);
            if (em) setEmail(em);
            if (addr) setAddress(addr);
            if (cityOnly) setCity(cityOnly);
            if (regionOnly) setRegion(regionOnly);
        }
    }, [user]);

    // Refresh user data on mount
    useEffect(() => {
        refreshUser();
    }, []);

    // State
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
    const [selectedShippingId, setSelectedShippingId] = useState<string>('inside_dhaka'); // Default
    const [instructions, setInstructions] = useState('');
    const [isInstructionOpen, setIsInstructionOpen] = useState(false);

    // Set default payment method once loaded
    if (!selectedPaymentMethod && paymentMethods.length > 0) {
        const defaultMethod = paymentMethods.find(m => m.isActive && m.type === 'cod') || paymentMethods.find(m => m.isActive);
        if (defaultMethod) setSelectedPaymentMethod(defaultMethod.id);
    }


    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [coupon, setCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const { validateCoupon } = useProducts();

    // Derived Values
    const shippingCost = selectedShippingId === 'inside_dhaka'
        ? paymentSettings?.insideDhakaShipping ?? 60
        : paymentSettings?.outsideDhakaShipping ?? 120;

    const vatRate = (paymentSettings?.vatPercentage ?? 5) / 100;
    const vat = total * vatRate;


    // Calculate Discount
    let discountAmount = 0;
    if (coupon) {
        if (coupon.type === 'percentage') {
            discountAmount = (total * coupon.value) / 100;
        } else {
            discountAmount = coupon.value;
        }
    }

    // Ensure total doesn't go below 0
    const grandTotal = Math.max(0, total + shippingCost + vat - discountAmount);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsValidatingCoupon(true);
        setCouponError('');
        setCoupon(null);

        try {
            const result = await validateCoupon(couponCode);
            if (result.valid) {
                // Check min purchase
                if (result.min_purchase > 0 && total < result.min_purchase) {
                    setCouponError(`Minimum purchase of Tk ${result.min_purchase} required.`);
                } else {
                    setCoupon(result);
                    showNotification('Coupon applied successfully!', 'success');
                }
            }
        } catch (err: any) {
            setCouponError(err.error || 'Invalid coupon code');
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (cart.length === 0) {
            showNotification("Your cart is empty!", 'error');
            return;
        }

        // --- STRICT VALIDATION START ---
        const formData = new FormData(e.currentTarget);
        const errors: string[] = [];

        const firstName = formData.get('first-name') as string;
        const phone = formData.get('phone') as string;
        const street = formData.get('address') as string;
        const cityVal = formData.get('city') as string;
        const region = formData.get('region') as string;
        const postalCode = formData.get('postal-code') as string;

        if (!firstName?.trim()) errors.push("First Name is required.");
        if (!phone?.trim()) errors.push("Phone Number is required.");
        if (!street?.trim()) errors.push("Street Address is required.");
        if (!cityVal?.trim() || cityVal === 'Select city') errors.push("City is required.");
        if (!region?.trim()) errors.push("Division/Region is required.");
        // Postal Code is now optional

        if (!selectedShippingId) errors.push("Please select a shipping method.");

        if (!selectedPaymentMethod) {
            errors.push("Please select a payment method.");
        } else {
            const methodConfig = paymentMethods.find(m => m.id === selectedPaymentMethod);
            if (methodConfig?.type === 'manual') {
                const trxId = formData.get('transaction-id') as string;
                if (!trxId?.trim()) errors.push("Transaction ID is required for this payment method.");
            }
        }

        if (errors.length > 0) {
            alert("Please fix the following errors:\n" + errors.join("\n"));
            return;
        }
        // --- STRICT VALIDATION END ---

        const methodConfig = paymentMethods.find(m => m.id === selectedPaymentMethod);
        if (!methodConfig) return;

        // Construct Address
        const lastName = formData.get('last-name') as string;
        const fullName = `${firstName} ${lastName} `.trim();

        const address = {
            name: fullName,
            street: `${street} ${formData.get('address2') || ''} `.trim(),
            city: `${cityVal}, ${region} `,
            phone: phone,
            email: (formData.get('email') as string) || '',
            instructions: instructions || '', // Add instructions here for backend persistence
        };

        // Get or Create User based on Phone Number
        const linkedUser = checkOrCreateUser(phone, fullName, address);

        // Transaction ID is already validated if manual
        const transactionId = formData.get('transaction-id') as string;

        const newOrder: Order = {
            id: '0', // Temporary ID, will be replaced by backend
            userId: linkedUser.id,
            customerName: address.name,
            email: address.email,
            phone: address.phone,
            date: new Date().toISOString(),
            status: 'Pending',
            paymentStatus: 'Pending',
            paymentMethod: methodConfig.id, // CHANGED: Send ID (e.g. 'bkash') instead of Name
            transactionId: transactionId || undefined,
            subtotal: total,
            shipping: shippingCost,
            fee: vat,
            total: grandTotal,
            billingAddress: address,
            shippingAddress: address,
            instructions: instructions,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                variantId: item.variantId,
                variantInfo: (item as any).variantInfo || (item as any).options || (item as any).selectedOptions
            }))
        };

        try {
            // Use Context to add order and get real ID
            const createdOrder = await addOrder(newOrder);

            // Clear cart and redirect
            clearCart();
            showNotification('Order placed successfully! Check email for details.', 'success');

            // Navigate with state
            if (createdOrder) {
                navigate('/order-success', {
                    state: {
                        orderId: createdOrder.id,
                        phone: createdOrder.phone
                    }
                });
            } else {
                navigate('/order-success');
            }
        } catch (error) {
            showNotification('Failed to place order. Please try again.', 'error');
        }
    };

    return (
        <div className="bg-gray-50/50 min-h-screen py-12">
            <div className="mx-auto max-w-7xl px-4 pt-4 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:max-w-none">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8 font-serif">Checkout</h1>

                    <form onSubmit={handlePlaceOrder} className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
                        {/* Left Column: Steps */}
                        <motion.div
                            className="lg:col-span-7"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                        >
                            {/* Step 1: Shipping Address */}
                            <motion.div variants={itemVariants as any} className="bg-white p-6 sm:p-8 shadow-sm rounded-xl border border-gray-100 mb-6">
                                <h2 className="flex items-center text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6 tracking-wide">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-black text-white text-xs font-bold mr-3">1</span>
                                    SHIPPING DETAILS
                                </h2>

                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    {/* Removed Email here to prioritize Name/Phone, or keeping but not auto-filling user.email if it's undefined */}
                                    {/* But let's check input fields */}

                                    {/* Calculated Default Values */}
                                    {/* Fields Start */}
                                    <div>
                                        <FloatingLabelInput
                                            id="first-name"
                                            name="first-name"
                                            label="First Name"
                                            value={firstName}
                                            onChange={e => setFirstName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <FloatingLabelInput
                                            id="last-name"
                                            name="last-name"
                                            label="Last Name"
                                            value={lastName}
                                            onChange={e => setLastName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <FloatingLabelInput
                                            id="phone"
                                            name="phone"
                                            label="Mobile Number"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <FloatingLabelInput
                                            id="email"
                                            name="email"
                                            label="Email Address (Optional)"
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <FloatingLabelInput
                                            id="address"
                                            name="address"
                                            label="Street Address"
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            required
                                        />
                                        <div className="mt-3">
                                            <FloatingLabelInput id="address2" name="address2" label="Apartment, suite, etc. (optional)" />
                                        </div>
                                    </div>
                                    {/* Fields End */}

                                    <div>
                                        <div className="relative">
                                            <select id="country" name="country" className="peer block w-full rounded-lg border-gray-200 bg-gray-50 px-4 pt-6 pb-2 text-gray-900 focus:border-black focus:ring-1 focus:ring-black focus:outline-none shadow-sm appearance-none cursor-pointer">
                                                <option>Bangladesh</option>
                                            </select>
                                            <label htmlFor="country" className="absolute left-4 top-1.5 text-xs text-gray-500 font-medium">Country <span className="text-red-500">*</span></label>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="relative">
                                            <select
                                                id="region"
                                                name="region"
                                                className="peer block w-full rounded-lg border-gray-200 bg-gray-50 px-4 pt-6 pb-2 text-gray-900 focus:border-black focus:ring-1 focus:ring-black focus:outline-none shadow-sm appearance-none cursor-pointer"
                                                onChange={(e) => {
                                                    const district = e.target.value;
                                                    // Reset shipping when district changes (optional default)
                                                    setSelectedShippingId('outside_dhaka');

                                                    // Clear the Area input when District changes
                                                    const areaSelect = document.getElementById('city') as HTMLSelectElement;
                                                    if (areaSelect) areaSelect.value = '';
                                                    setSelectedDistrict(district); // Assuming setSelectedDistrict is defined
                                                }}
                                            >
                                                <option value="">Select City</option>
                                                {bangladeshLocations.map((loc) => (
                                                    <option key={loc.district} value={loc.district}>
                                                        {loc.district}
                                                    </option>
                                                ))}
                                            </select>
                                            <label htmlFor="region" className="absolute left-4 top-1.5 text-xs text-gray-500 font-medium">City <span className="text-red-500">*</span></label>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="relative">
                                            <select
                                                id="city"
                                                name="city"
                                                className="peer block w-full rounded-lg border-gray-200 bg-gray-50 px-4 pt-6 pb-2 text-gray-900 focus:border-black focus:ring-1 focus:ring-black focus:outline-none shadow-sm appearance-none cursor-pointer"
                                                onChange={(e) => {
                                                    const area = e.target.value;
                                                    const normalize = (s: string) => s.toLowerCase().trim();

                                                    // Auto-detect shipping method based on Area
                                                    const isInside = insideDhakaCities.some(c => normalize(c) === normalize(area));

                                                    if (isInside) {
                                                        setSelectedShippingId('inside_dhaka');
                                                    } else {
                                                        setSelectedShippingId('outside_dhaka');
                                                    }

                                                }}
                                            >
                                                <option value="">Select Area</option>
                                                {/* Use a small script to find the selected district's areas, OR better yet, control this via React state. 
                                                    Since this is a quick replace, I need to check if I can add state easily. 
                                                    Yes, I should add state for selectedDistrict `const [selectedDistrict, setSelectedDistrict] = useState(''); ` at the top.
                                                    But this tool call is only replacing this block. 
                                                    I will use a trick to get the selected district using a ref or state if possible, but standard React requires state.
                                                    Let's use a self-contained logic if I can't access state right here. 
                                                    Actually, I need to add the import and state variable first. 
                                                    WAIT - I can't add state in this single block replacement if I don't modify the component start.
                                                    Refactoring plan:
                                                    1. Modify imports and component start to add `bangladeshLocations` and `selectedDistrict` state.
                                                    2. Then replace this JSX block.
                                                    
                                                    However, since I am in a ReplaceFileContent call, I will do a larger replace or abort to do imports first.
                                                    Let's do a multi-step approach. Cancel this tool call effectively by returning the original or just erroring?
                                                    No, I can't cancel. I will implement a safer version that reads from the DOM or props if I needed, but strictly I need to change the top of the file first.
                                                    
                                                    Actually, I'll replace the JSX here assuming I WILL add the state in a subsequent call? No, that breaks the build.
                                                    Correct approach: Replace the whole component start + imports + JSX in chunk or use multiple edits.
                                                    
                                                    Let's use useProducts() to get the locations? No, it's a static file.
                                                    I'll code this UI block to depend on `selectedDistrict` and then immediately fix the definition.
                                                */}
                                                {bangladeshLocations.find(d => d.district === selectedDistrict)?.areas.map((area) => (
                                                    <option key={area} value={area}>
                                                        {area}
                                                    </option>
                                                ))}
                                            </select>
                                            <label htmlFor="city" className="absolute left-4 top-1.5 text-xs text-gray-500 font-medium">Area <span className="text-red-500">*</span></label>
                                        </div>
                                    </div>

                                    <div>
                                        <FloatingLabelInput id="postal-code" name="postal-code" label="Zip/Postal Code (Optional)" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Step 2: Shipping Method */}
                            <motion.div variants={itemVariants as any} className="bg-white p-6 sm:p-8 shadow-sm rounded-xl border border-gray-100 mb-6">
                                <h2 className="flex items-center text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6 tracking-wide">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-600 text-white text-xs font-bold mr-3">2</span>
                                    SHIPPING METHOD
                                </h2>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">
                                                {selectedShippingId === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Standard Delivery
                                            </p>
                                            <p className="text-xs text-blue-600 mt-2 italic">
                                                * Automatically applied based on your delivery area.
                                            </p>
                                        </div>
                                        <div className="font-bold text-gray-900 text-sm">
                                            Tk {shippingCost.toFixed(0)}
                                        </div>
                                    </div>
                                </div>


                                <div className="mt-6">
                                    {!isInstructionOpen ? (
                                        <button
                                            type="button"
                                            onClick={() => setIsInstructionOpen(true)}
                                            className="text-sm font-medium text-black underline decoration-gray-400 hover:decoration-black underline-offset-4 transition-all"
                                        >
                                            + Add Delivery Instructions
                                        </button>
                                    ) : (
                                        <div className="animate-fadeIn">
                                            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">Delivery Instructions (Optional)</label>
                                            <textarea
                                                id="instructions"
                                                value={instructions}
                                                onChange={(e) => setInstructions(e.target.value)}
                                                rows={3}
                                                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-4 text-gray-700 bg-gray-50/50"
                                                placeholder="e.g. Leave with security guard, call before arriving..."
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Step 3: Payment Method */}
                            <motion.div variants={itemVariants as any} className="bg-white p-6 sm:p-8 shadow-sm rounded-xl border border-gray-100 mb-6">
                                <h2 className="flex items-center text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6 tracking-wide">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-600 text-white text-xs font-bold mr-3">3</span>
                                    PAYMENT
                                </h2>
                                <div className="space-y-4">
                                    {paymentMethods.filter(m => m.isActive).map((method) => (
                                        <div key={method.id} className={`border rounded - xl p - 5 transition - all duration - 200 ${selectedPaymentMethod === method.id ? 'border-black bg-gray-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'} `}>
                                            <div className="flex items-center group cursor-pointer" onClick={() => setSelectedPaymentMethod(method.id)}>
                                                <input
                                                    id={method.id}
                                                    name="payment-method"
                                                    type="radio"
                                                    checked={selectedPaymentMethod === method.id}
                                                    onChange={() => setSelectedPaymentMethod(method.id)}
                                                    className="h-4 w-4 border-gray-300 text-black focus:ring-black cursor-pointer"
                                                />
                                                <label htmlFor={method.id} className="ml-3 block text-base font-medium text-gray-900 cursor-pointer flex-1">
                                                    {method.name}
                                                </label>
                                            </div>

                                            {selectedPaymentMethod === method.id && method.type === 'manual' && (
                                                <div className="mt-4 pl-7 animate-fadeIn">
                                                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-sm text-gray-600 space-y-3">
                                                        {method.instructions && <p className="leading-relaxed">{method.instructions}</p>}
                                                        {method.number && (
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 p-3 rounded-md">
                                                                <span className="text-xs font-medium uppercase text-gray-500 tracking-wider">Send Money To:</span>
                                                                <div className="font-mono text-lg font-bold text-gray-900 tracking-wider selection:bg-black selection:text-white">
                                                                    {method.number}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="pt-2">
                                                            <label htmlFor="transaction-id" className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-1.5">
                                                                Transaction ID <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id="transaction-id"
                                                                name="transaction-id"
                                                                required
                                                                placeholder="Enter TrxID (e.g. 8N7X6...)"
                                                                className="block w-full rounded-md border-gray-300 py-2.5 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1.5">
                                                                Verify your payment by entering the transaction ID found in your SMS/App.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedPaymentMethod === method.id && method.type === 'cod' && (
                                                <div className="mt-3 pl-7 text-sm text-gray-500 animate-fadeIn">
                                                    {method.instructions}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right Column: Order Review */}
                        <motion.div
                            className="lg:col-span-5 mt-10 lg:mt-0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden sticky top-6 border border-gray-100">
                                <h2 className="flex items-center text-lg font-bold text-white bg-black p-5 tracking-wide">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-black text-xs font-bold mr-3">4</span>
                                    ORDER SUMMARY
                                </h2>

                                {/* Product List */}
                                <div className="p-6 border-b border-gray-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    <ul role="list" className="divide-y divide-gray-100 items-start">
                                        {cart.map((product) => (
                                            <li key={product.id} className="flex py-4 gap-4 items-start">
                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover object-center"
                                                    />
                                                </div>
                                                <div className="flex flex-1 flex-col">
                                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                                        <h3 className={`line - clamp - 2 pr - 2 leading - tight ${product.type === 'bundle' ? 'font-bold text-indigo-900' : ''} `}>
                                                            {product.name}
                                                        </h3>
                                                        <p className="whitespace-nowrap">Tk {Number(product.price).toFixed(0)}</p>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-500">Qty {product.quantity}</p>

                                                    {product.type === 'bundle' && product.bundleItems && (
                                                        <div className="mt-2 text-xs bg-gray-50 p-2 rounded-md">
                                                            <p className="font-semibold text-gray-500 uppercase mb-1">Bundle Includes:</p>
                                                            <ul className="list-disc pl-3 text-gray-500 space-y-0.5">
                                                                {product.bundleItems.map((sub, idx) => (
                                                                    <li key={idx}>
                                                                        <Link
                                                                            to={`/ products / ${sub.id} `}
                                                                            target="_blank" // Open in new tab for checkout to avoid losing state
                                                                            className="hover:text-black hover:underline transition-colors"
                                                                        >
                                                                            {sub.name}
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Summary */}
                                <div className="p-6 bg-gray-50/80 space-y-4">
                                    {/* Coupon Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Promo Code"
                                            className="uppercase font-mono flex-1 rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={isValidatingCoupon || !couponCode}
                                            className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isValidatingCoupon ? '...' : 'APPLY'}
                                        </button>
                                    </div>
                                    {couponError && <p className="text-xs text-red-500 font-bold">{couponError}</p>}
                                    {coupon && (
                                        <div className="text-xs text-green-600 font-bold flex justify-between items-center bg-green-50 px-2 py-1 rounded">
                                            <span>Coupon Applied: {coupon.code}</span>
                                            <button type="button" onClick={() => { setCoupon(null); setCouponCode(''); }} className="text-green-800 hover:underline">Remove</button>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-gray-900">Tk {total?.toFixed(0) || '0'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Shipping</span>
                                        <span className="font-medium text-gray-900">Tk {shippingCost.toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>VAT ({paymentSettings?.vatPercentage ?? 5}%)</span>
                                        <span className="font-medium text-gray-900">Tk {vat.toFixed(0)}</span>
                                    </div>


                                    {coupon && (
                                        <div className="flex justify-between text-sm text-green-600 font-bold">
                                            <span>Discount</span>
                                            <span>- Tk {discountAmount.toFixed(0)}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                        <span className="text-base font-bold text-gray-900">Total</span>
                                        <span className="text-xl font-bold text-black">Tk {grandTotal.toFixed(0)}</span>
                                    </div>

                                    {/* Action */}
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full bg-primary border border-transparent py-4 px-4 text-sm font-bold text-white shadow-lg shadow-primary/10 hover:bg-gray-800 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 uppercase tracking-wide rounded-lg flex items-center justify-center gap-2"
                                        >
                                            Place Order
                                            <span aria-hidden="true">&rarr;</span>
                                        </button>

                                        <p className="mt-4 text-[11px] text-center text-gray-500 leading-normal">
                                            Secure Checkout. By placing order you agree to our <Link to="#" className="text-black underline">Terms</Link> & <Link to="#" className="text-black underline">Policies</Link>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </form>
                </div>
            </div>
        </div>
    );
}
