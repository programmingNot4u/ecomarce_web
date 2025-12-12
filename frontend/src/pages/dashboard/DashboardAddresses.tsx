import { useEffect, useState } from 'react';

interface Address {
    name: string;
    company: string;
    street: string;
    city: string;
    phone: string;
}

const defaultBilling: Address = {
    name: 'Md Hossain Imam',
    company: 'MARYONE',
    street: 'jamtola,tanpara,nikunja-2,road-1,dhaka-1229',
    city: 'Dhaka',
    phone: ''
};

const defaultShipping: Address = {
    name: 'Md Hossain Imam',
    company: '',
    street: 'jamtola,tanpara,nikunja-2,road-1,dhaka-1229',
    city: 'Dhaka',
    phone: ''
};

const AddressForm = ({ 
    address, 
    setAddress, 
    onSave, 
    onCancel 
}: { 
    address: Address, 
    setAddress: (addr: Address) => void, 
    onSave: (e: React.FormEvent) => void,
    onCancel: () => void
}) => (
    <form onSubmit={onSave} className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
                type="text" 
                value={address.name} 
                onChange={(e) => setAddress({...address, name: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                required
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Company Name (Optional)</label>
            <input 
                type="text" 
                value={address.company} 
                onChange={(e) => setAddress({...address, company: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Street Address</label>
            <textarea 
                value={address.street} 
                onChange={(e) => setAddress({...address, street: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                rows={3}
                required
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Town / City</label>
            <input 
                type="text" 
                value={address.city} 
                onChange={(e) => setAddress({...address, city: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                required
            />
        </div>

        <div className="flex gap-2 pt-2">
            <button 
                type="submit" 
                className="bg-[#b91c1c] text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-800 transition-colors"
            >
                Save Address
            </button>
            <button 
                type="button" 
                onClick={onCancel}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm font-bold hover:bg-gray-300 transition-colors"
            >
                Cancel
            </button>
        </div>
    </form>
);

const AddressDisplay = ({ 
    title, 
    address, 
    onEdit 
}: { 
    title: string, 
    address: Address, 
    onEdit: () => void 
}) => (
    <div>
        <header className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
            <button 
                onClick={onEdit}
                className="text-sm font-medium text-blue-500 hover:text-blue-700 flex items-center gap-1 group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:scale-110 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Edit {title}
            </button>
        </header>
        <div className="text-gray-600 italic">
            <p className="not-italic font-bold text-gray-900 mb-1">{address.name}</p>
            {address.company && <p className="mb-1">{address.company}</p>}
            <p className="mb-1">{address.street}</p>
            <p className="mb-1">{address.city}</p>
        </div>
    </div>
);

export default function DashboardAddresses() {
    const [billingAddress, setBillingAddress] = useState<Address>(defaultBilling);
    const [shippingAddress, setShippingAddress] = useState<Address>(defaultShipping);
    
    // Edit modes
    const [isEditingBilling, setIsEditingBilling] = useState(false);
    const [isEditingShipping, setIsEditingShipping] = useState(false);

    // Form states (temp storage while editing)
    const [tempBilling, setTempBilling] = useState<Address>(defaultBilling);
    const [tempShipping, setTempShipping] = useState<Address>(defaultShipping);

    useEffect(() => {
        const storedBilling = localStorage.getItem('billingAddress');
        const storedShipping = localStorage.getItem('shippingAddress');
        
        if (storedBilling) {
            const parsed = JSON.parse(storedBilling);
            setBillingAddress(parsed);
            setTempBilling(parsed);
        }
        if (storedShipping) {
            const parsed = JSON.parse(storedShipping);
            setShippingAddress(parsed);
            setTempShipping(parsed);
        }
    }, []);

    const handleSaveBilling = (e: React.FormEvent) => {
        e.preventDefault();
        setBillingAddress(tempBilling);
        localStorage.setItem('billingAddress', JSON.stringify(tempBilling));
        setIsEditingBilling(false);
    };

    const handleSaveShipping = (e: React.FormEvent) => {
        e.preventDefault();
        setShippingAddress(tempShipping);
        localStorage.setItem('shippingAddress', JSON.stringify(tempShipping));
        setIsEditingShipping(false);
    };

    return (
      <div>
        <p className="text-gray-600 mb-8">
            The following addresses will be used on the checkout page by default.
        </p>
  
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* Billing Address */}
            {isEditingBilling ? (
                <div>
                     <h3 className="text-2xl font-semibold text-gray-900 mb-4">Billing address</h3>
                     <AddressForm 
                        address={tempBilling} 
                        setAddress={setTempBilling} 
                        onSave={handleSaveBilling}
                        onCancel={() => {
                            setTempBilling(billingAddress);
                            setIsEditingBilling(false);
                        }}
                    />
                </div>
            ) : (
                <AddressDisplay 
                    title="Billing address" 
                    address={billingAddress} 
                    onEdit={() => setIsEditingBilling(true)}
                />
            )}
  
             {/* Shipping Address */}
             {isEditingShipping ? (
                <div>
                     <h3 className="text-2xl font-semibold text-gray-900 mb-4">Shipping address</h3>
                     <AddressForm 
                        address={tempShipping} 
                        setAddress={setTempShipping} 
                        onSave={handleSaveShipping}
                        onCancel={() => {
                            setTempShipping(shippingAddress);
                            setIsEditingShipping(false);
                        }}
                    />
                </div>
            ) : (
                <AddressDisplay 
                    title="Shipping address" 
                    address={shippingAddress} 
                    onEdit={() => setIsEditingShipping(true)}
                />
            )}
        </div>
      </div>
    );
}
