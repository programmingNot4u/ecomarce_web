import { RadioGroup } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import FloatingLabelInput from '../components/ui/FloatingLabelInput';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const deliveryMethods = [
  { id: 1, title: 'Standard Shipping', turnaround: 'within 3-4 days inside Dhaka, within 4-7 days outside Dhaka', price: 180.00 },
];

const paymentMethods = [
    { id: 'card', title: 'Debit/Credit cards and mobile money' },
    { id: 'bkash', title: 'bKash' },
    { id: 'cod', title: 'Cash on delivery' },
]

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const shipping = 180.00;
  
  const vatRate = 0.05; 
  const vat = total * vatRate;
  const grandTotal = total + shipping + vat;

  // Stagger animation steps
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  const handlePlaceOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const formData = new FormData(e.currentTarget);
    
    // Construct Address
    const address = {
        name: `${formData.get('first-name')} ${formData.get('last-name')}`,
        street: `${formData.get('address')} ${formData.get('address2') || ''}`,
        city: `${formData.get('city')}, ${formData.get('region')}`,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
    };

    const newOrder = {
        id: '#' + Math.floor(10000 + Math.random() * 90000).toString(), // Random 5 digit ID
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        status: 'Processing',
        items: cart,
        subtotal: total,
        shipping: shipping,
        fee: 0, // COD fee could be added here
        total: grandTotal,
        billingAddress: address,
        shippingAddress: address, // For now assuming same
        paymentMethod: 'Cash on delivery' // Since it's default
    };

    // Save to localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    localStorage.setItem('orders', JSON.stringify([newOrder, ...existingOrders]));

    // Clear cart
    clearCart();

    // Redirect
    navigate('/account/orders');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 pt-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <h1 className="sr-only">Checkout</h1>

          <form onSubmit={handlePlaceOrder} className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
            {/* Left Column: Steps */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
                {/* Step 1: Shipping Address */}
                <motion.div variants={itemVariants} className="border border-gray-200 bg-white p-6 shadow-sm mb-6 rounded-lg">
                    <h2 className="flex items-center text-lg font-bold text-gray-900 border-b border-gray-200 pb-4 mb-6">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-sm font-bold mr-3">1</span>
                        SHIPPING ADDRESS
                    </h2>

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                         <div className="sm:col-span-2">
                            <FloatingLabelInput id="email" name="email" label="Email Address" type="email" defaultValue={user?.email} required />
                            <p className="mt-1 text-xs text-gray-500 ml-1">You can create an account after checkout</p>
                        </div>

                        <div>
                             <FloatingLabelInput id="first-name" name="first-name" label="First Name" defaultValue={user?.name?.split(' ')[0]} required />
                        </div>

                        <div>
                             <FloatingLabelInput id="last-name" name="last-name" label="Last Name" defaultValue={user?.name?.split(' ')[1]} required />
                        </div>

                        <div className="sm:col-span-2">
                             <FloatingLabelInput id="phone" name="phone" label="Mobile Number" required />
                        </div>

                        <div className="sm:col-span-2">
                             <FloatingLabelInput id="address" name="address" label="Street Address" required />
                             <div className="mt-2">
                                <FloatingLabelInput id="address2" name="address2" label="Apartment, suite, etc. (optional)" />
                             </div>
                        </div>

                        <div>
                            <div className="relative">
                                <select id="country" name="country" className="peer block w-full rounded-md border-gray-300 px-3 pt-5 pb-2 text-gray-900 focus:border-black focus:ring-black focus:outline-none shadow-sm appearance-none bg-transparent">
                                    <option>Bangladesh</option>
                                </select>
                                <label htmlFor="country" className="absolute left-3 top-1 text-xs text-gray-500">Country <span className="text-red-500">*</span></label>
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <select id="region" name="region" className="peer block w-full rounded-md border-gray-300 px-3 pt-5 pb-2 text-gray-900 focus:border-black focus:ring-black focus:outline-none shadow-sm appearance-none bg-transparent">
                                    <option>Select a region</option>
                                    <option>Dhaka</option>
                                    <option>Chittagong</option>
                                </select>
                                <label htmlFor="region" className="absolute left-3 top-1 text-xs text-gray-500">District/State <span className="text-red-500">*</span></label>
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <select id="city" name="city" className="peer block w-full rounded-md border-gray-300 px-3 pt-5 pb-2 text-gray-900 focus:border-black focus:ring-black focus:outline-none shadow-sm appearance-none bg-transparent">
                                    <option>Select city</option>
                                    <option>Dhaka North</option>
                                </select>
                                <label htmlFor="city" className="absolute left-3 top-1 text-xs text-gray-500">City/Area <span className="text-red-500">*</span></label>
                            </div>
                        </div>

                        <div>
                            <FloatingLabelInput id="postal-code" name="postal-code" label="Zip/Postal Code" required />
                        </div>
                        
                        <div className="sm:col-span-2 flex items-center mt-2 group cursor-pointer">
                             <input type="checkbox" id="same-address" className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black transition-transform duration-200 group-hover:scale-110" defaultChecked />
                             <label htmlFor="same-address" className="ml-2 text-sm text-gray-500 group-hover:text-gray-900 transition-colors">My billing and shipping address are the same</label>
                        </div>
                    </div>
                </motion.div>

                {/* Step 2: Shipping Method */}
                <motion.div variants={itemVariants} className="border border-gray-200 bg-white p-6 shadow-sm mb-6 rounded-lg">
                     <h2 className="flex items-center text-lg font-bold text-gray-900 border-b border-gray-200 pb-4 mb-6">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 text-white text-sm font-bold mr-3">2</span>
                        SHIPPING METHOD
                    </h2>

                    <RadioGroup defaultValue={1}>
                        <div className="space-y-4">
                            {deliveryMethods.map((method) => (
                                <RadioGroup.Option key={method.id} value={method.id} className={({ active, checked }) => `
                                    relative block cursor-pointer rounded-lg border bg-white px-6 py-4 shadow-sm focus:outline-none sm:flex sm:justify-between transition-all duration-200 ease-in-out
                                    ${checked ? 'border-black ring-1 ring-black bg-gray-50 transform scale-[1.01]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                                `}>
                                    {({ checked }) => (
                                        <>
                                            <div className="flex items-center">
                                                <div className="flex items-center">
                                                    <span className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${checked ? 'border-black' : 'border-gray-300'}`}>
                                                        <span className={`h-2.5 w-2.5 rounded-full bg-black transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`} />
                                                    </span>
                                                </div>
                                                <div className="ml-3 text-sm">
                                                    <RadioGroup.Label as="span" className="font-bold text-gray-900">
                                                        {method.title}
                                                    </RadioGroup.Label>
                                                    <RadioGroup.Description as="span" className="ml-2 text-gray-500">
                                                        {method.turnaround}
                                                    </RadioGroup.Description>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex text-sm sm:mt-0 sm:ml-4 sm:flex-col sm:text-right">
                                                <span className="font-medium text-gray-900">Tk {method.price.toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                </RadioGroup.Option>
                            ))}
                        </div>
                    </RadioGroup>
                    
                    <div className="mt-4">
                         <a href="#" className="text-sm text-black underline hover:text-gray-700 transition-colors">Add Instructions for Delivery</a>
                    </div>
                </motion.div>

                {/* Step 3: Payment Method */}
                 <motion.div variants={itemVariants} className="border border-gray-200 bg-white p-6 shadow-sm mb-6 rounded-lg">
                     <h2 className="flex items-center text-lg font-bold text-gray-900 border-b border-gray-200 pb-4 mb-6">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 text-white text-sm font-bold mr-3">3</span>
                        PAYMENT METHOD
                    </h2>
                     <div className="space-y-4">
                        {paymentMethods.map((method) => (
                            <div key={method.id} className="flex items-center group cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors">
                                <input
                                    id={method.id}
                                    name="payment-method"
                                    type="radio"
                                    defaultChecked={method.id === 'cod'}
                                    className="h-4 w-4 border-gray-300 text-black focus:ring-black cursor-pointer"
                                />
                                <label htmlFor={method.id} className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer group-hover:text-black">
                                    {method.title}
                                </label>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* Right Column: Order Review */}
            <motion.div 
                className="mt-10 lg:mt-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                <div className="border border-gray-200 bg-white shadow-sm rounded-lg overflow-hidden sticky top-6">
                     <h2 className="flex items-center text-lg font-bold text-white bg-gray-700 p-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-gray-700 text-sm font-bold mr-3">4</span>
                        ORDER REVIEW
                    </h2>
                    
                    {/* Product List */}
                    <div className="p-6 border-b border-gray-200 max-h-96 overflow-y-auto">
                         <div className="flex justify-between text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
                            <span>Product</span>
                            <span>Subtotal</span>
                        </div>
                         
                        <ul role="list" className="divide-y divide-gray-200">
                            {cart.map((product) => (
                            <li key={product.id} className="flex py-6 space-x-4">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-20 w-20 flex-none rounded-md object-cover object-center bg-gray-100"
                                />
                                <div className="flex flex-auto flex-col justify-between">
                                     <div>
                                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                                        <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
                                     </div>
                                </div>
                                <div className="flex flex-col items-end">
                                     <p className="font-medium text-gray-900">Tk {product.price.toFixed(2)}</p>
                                </div>
                            </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Summary */}
                    <div className="p-6 bg-gray-50">
                        <dl className="space-y-4 text-sm text-gray-900">
                             <div className="flex justify-between">
                                <dt className="text-gray-500">SUBTOTAL</dt>
                                <dd className="font-medium">Tk {total?.toFixed(2) || '0.00'}</dd>
                            </div>
                             <div className="flex justify-between">
                                <dt className="text-gray-500">SHIPPING</dt>
                                <dd className="font-medium">Tk {shipping.toFixed(2)}</dd>
                            </div>
                            <div className="flex justify-between pb-4 border-b border-gray-200">
                                <div className="text-gray-500 text-xs">
                                    <p>Standard Shipping: within 3-4 days inside Dhaka, within 4-7 days outside Dhaka</p>
                                </div>
                            </div>
                             <div className="flex justify-between">
                                <dt className="text-gray-500">VAT (5%)</dt>
                                <dd className="font-medium">Tk {vat.toFixed(2)}</dd>
                            </div>
                             <div className="flex justify-between items-center bg-gray-200 p-3 -mx-6 mt-4 font-bold text-gray-900">
                                <dt className="pl-6 uppercase">Total</dt>
                                <dd className="pr-6 text-red-600">Tk {grandTotal.toFixed(2)}</dd>
                            </div>
                        </dl>
                        
                        {/* Disclaimers & Action */}
                        <div className="mt-6">
                            <button
                                type="submit"
                                className="w-full bg-black border border-transparent py-4 px-4 text-sm font-bold text-white shadow-sm hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 uppercase tracking-wide rounded-sm"
                            >
                                Place Order
                            </button>

                             <div className="mt-6 text-[10px] text-gray-500 space-y-2 leading-tight">
                                <p>By clicking Place Order, you agree to Maryone's <Link to="#" className="text-blue-600 underline">Terms & Conditions</Link> and <Link to="#" className="text-blue-600 underline">Return & Exchange</Link> policy.</p>
                             </div>
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
