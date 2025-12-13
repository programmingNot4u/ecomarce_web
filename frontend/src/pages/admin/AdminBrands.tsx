import {
    BuildingStorefrontIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { type Brand, useProducts } from '../../context/ProductContext';

export default function AdminBrands() {
  const { brands, addBrand, deleteBrand, products } = useProducts();
  const [isAdding, setIsAdding] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandImage, setNewBrandImage] = useState('');
  
  const handleAdd = () => {
     if (!newBrandName) return;
     const newBrand: Brand = {
         id: `brand-${Date.now()}`,
         name: newBrandName,
         count: 0,
         image: newBrandImage || undefined
     };
     addBrand(newBrand);
     setNewBrandName('');
     setNewBrandImage('');
     setIsAdding(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
        <div className="p-6 border-b border-gray-200 bg-white flex justify-between items-center">
             <div>
                <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
                <p className="text-sm text-gray-500">Manage your product brands and partners.</p>
             </div>
             <button 
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
             >
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                Add Brand
             </button>
        </div>

        <div className="p-6">
             {/* Add Form */}
             {isAdding && (
                 <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-indigo-100 flex items-center gap-4 animate-fadeIn">
                     <div className="flex-1 space-y-2">
                         <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Brand Name</label>
                            <input 
                                type="text"
                                value={newBrandName}
                                onChange={(e) => setNewBrandName(e.target.value)}
                                placeholder="e.g. Nike"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-2 px-3 border"
                                autoFocus
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Brand Logo URL</label>
                            <input 
                                type="text"
                                value={newBrandImage}
                                onChange={(e) => setNewBrandImage(e.target.value)}
                                placeholder="https://..."
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-2 px-3 border"
                            />
                         </div>
                     </div>
                     <div className="pt-5 flex items-center gap-2">
                         <button onClick={() => setIsAdding(false)} className="p-2 text-gray-400 hover:text-gray-600">Cancel</button>
                         <button onClick={handleAdd} className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800">Save</button>
                     </div>
                 </div>
             )}

             {/* Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {brands.map((brand) => {
                     const productCount = products.filter(p => p.brand === brand.name).length;
                     return (
                         <div key={brand.id} className="relative group bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                             <div className="h-24 w-full bg-white rounded-md flex items-center justify-center mb-4 overflow-hidden">
                                 {brand.image ? (
                                    <img src={brand.image} alt={brand.name} className="h-full w-full object-contain" />
                                 ) : (
                                    <BuildingStorefrontIcon className="h-10 w-10 text-gray-300" />
                                 )}
                             </div>
                             <h3 className="text-sm font-medium text-gray-900 truncate w-full">{brand.name}</h3>
                             <p className="text-xs text-gray-400 mt-1">{productCount} Products</p>
                             
                             <button 
                                onClick={() => { if(confirm('Delete brand?')) deleteBrand(brand.id) }}
                                className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                 <TrashIcon className="h-4 w-4" />
                             </button>
                         </div>
                     );
                 })}
             </div>
        </div>
    </div>
  );
}
