import { Dialog, Transition } from '@headlessui/react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Fragment, useState } from 'react';
import type { InventoryLog } from '../../context/ProductContext';
import { useProducts } from '../../context/ProductContext';

export default function AdminInventory() {
  const { products, updateStock, inventoryLogs } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  // Stock Adjustment Modal State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ productId: number, combinationId?: string, currentStock: number, name: string } | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0); // positive or negative
  const [adjustmentReason, setAdjustmentReason] = useState<InventoryLog['reason']>('Restock');
  const [adjustmentNote, setAdjustmentNote] = useState('');

  // Flatten Inventory Items (Product + Combinations)
  const inventoryItems = products.flatMap(product => {
      const items = [];
      const basePrice = product.price || 0;
      
      // If product has combinations, they are the stock keeping units
      if (product.combinations && product.combinations.length > 0) {
          product.combinations.forEach(combo => {
              items.push({
                  id: product.id,
                  uniqueId: `${product.id}-${combo.id}`,
                  name: product.name,
                  sku: combo.sku || 'N/A',
                  variant: Object.values(combo.attributes).join(' / '),
                  stock: combo.stockQuantity || 0,
                  price: combo.price || basePrice,
                  image: product.image,
                  combinationId: combo.id,
                  type: 'Variant',
                  category: product.category // Propagate category
              });
          });
      } else {
          // Single product
          items.push({
              id: product.id,
              uniqueId: `${product.id}`,
              name: product.name,
              sku: product.sku || 'N/A',
              variant: '-',
              stock: product.stockQuantity || 0,
              price: basePrice, 
              image: product.image,
              combinationId: undefined,
              type: 'Simple',
               category: product.category
          });
      }
      return items;
  });

  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get Unique Categories
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const filteredItems = inventoryItems.filter(item => {
      // Robust Search: Name, SKU, or Variant Name
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        item.name.toLowerCase().includes(searchLower) || 
        item.sku.toLowerCase().includes(searchLower) ||
        item.variant.toLowerCase().includes(searchLower);

      // Category Filter
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      // Status Filter
      let matchesStatus = true;
      if (filter === 'low') matchesStatus = item.stock > 0 && item.stock <= 5;
      if (filter === 'out') matchesStatus = item.stock === 0;

      return matchesSearch && matchesCategory && matchesStatus;
  });

  const openAdjustment = (item: typeof inventoryItems[0]) => {
      setSelectedItem({
          productId: item.id,
          combinationId: item.combinationId,
          currentStock: item.stock,
          name: `${item.name} ${item.variant !== '-' ? `(${item.variant})` : ''}`
      });
      setAdjustmentAmount(0);
      setAdjustmentReason('Restock');
      setAdjustmentNote('');
      setIsAdjustOpen(true);
  };

  const handleSaveAdjustment = () => {
      if (!selectedItem || adjustmentAmount === 0) return;
      updateStock(selectedItem.productId, adjustmentAmount, adjustmentReason, adjustmentNote, selectedItem.combinationId);
      setIsAdjustOpen(false);
  };

  // Stats
  const totalStockValue = inventoryItems.reduce((sum, item) => sum + (item.stock * item.price), 0);
  const lowStockCount = inventoryItems.filter(i => i.stock > 0 && i.stock <= 5).length;
  const outOfStockCount = inventoryItems.filter(i => i.stock === 0).length;

  return (
    <div className="space-y-6 animate-fadeIn">
       {/* Header & Stats */}
       <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b border-gray-200 pb-5">
        <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">Inventory Manager</h1>
            <p className="mt-1 text-sm text-gray-500">Track stock levels, manage variants, and view history.</p>
        </div>
        <div className="flex gap-4">
             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                 <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                     <ExclamationTriangleIcon className="h-6 w-6" /> {/* Reusing icon or change to currency */}
                 </div>
                 <div>
                     <p className="text-xs text-gray-500 font-bold uppercase">Total Value</p>
                     <p className="text-xl font-bold text-gray-900">Tk {totalStockValue.toLocaleString()}</p>
                 </div>
             </div>
             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                 <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                     <ExclamationTriangleIcon className="h-6 w-6" />
                 </div>
                 <div>
                     <p className="text-xs text-gray-500 font-bold uppercase">Low Stock</p>
                     <p className="text-xl font-bold text-gray-900">{lowStockCount}</p>
                 </div>
             </div>
             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                 <div className="p-2 bg-red-50 rounded-lg text-red-600">
                     <ArrowDownTrayIcon className="h-6 w-6" />
                 </div>
                 <div>
                     <p className="text-xs text-gray-500 font-bold uppercase">Out of Stock</p>
                     <p className="text-xl font-bold text-gray-900">{outOfStockCount}</p>
                 </div>
             </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
              <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
              />
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          <div className="flex gap-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
              >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                  ))}
              </select>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="block rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
              >
                  <option value="all">Status: All</option>
                  <option value="low">Status: Low Stock</option>
                  <option value="out">Status: Out of Stock</option>
              </select>
          </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                        <tr key={item.uniqueId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0">
                                        <img className="h-10 w-10 rounded-lg object-cover" src={item.image} alt="" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-500">{item.type}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.variant !== '-' ? <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">{item.variant}</span> : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">{item.stock}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {item.stock === 0 ? (
                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Out of Stock</span>
                                ) : item.stock <= 5 ? (
                                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">Low Stock</span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">In Stock</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                    onClick={() => openAdjustment(item)}
                                    className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                >
                                    Adjust
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredItems.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                No items found matching your criteria.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
      </div>

       {/* Adjustment Modal */}
       <Transition appear show={isAdjustOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsAdjustOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-gray-900"
                  >
                    Adjust Stock Level
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Update stock for <span className="font-bold text-gray-900">{selectedItem?.name}</span>.
                      Current level: <span className="font-bold text-gray-900">{selectedItem?.currentStock}</span>
                    </p>

                    <div className="mt-6 space-y-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
                             <div className="grid grid-cols-2 gap-3">
                                 <button 
                                    onClick={() => setAdjustmentAmount(Math.abs(adjustmentAmount))}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${adjustmentAmount >= 0 ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'border-gray-200 text-gray-600'}`}
                                 >
                                     <ArrowUpTrayIcon className="h-5 w-5" />
                                     Add Stock
                                 </button>
                                 <button 
                                    onClick={() => setAdjustmentAmount(-Math.abs(adjustmentAmount))}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${adjustmentAmount < 0 ? 'bg-red-50 border-red-200 text-red-700 font-bold' : 'border-gray-200 text-gray-600'}`}
                                 >
                                     <ArrowDownTrayIcon className="h-5 w-5" />
                                     Remove Stock
                                 </button>
                             </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input 
                                type="number" 
                                min="1"
                                value={Math.abs(adjustmentAmount)}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setAdjustmentAmount(adjustmentAmount < 0 ? -val : val);
                                }}
                                className="block w-full rounded-md border-0 py-2 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                            <select 
                                value={adjustmentReason}
                                onChange={(e) => setAdjustmentReason(e.target.value as any)}
                                className="block w-full rounded-md border-0 py-2 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                            >
                                <option value="Restock">Restock (Received Shipment)</option>
                                <option value="Correction">Inventory Correction</option>
                                <option value="Damage">Damaged / Expired</option>
                                <option value="Return">Customer Return</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                            <textarea 
                                rows={2}
                                value={adjustmentNote}
                                onChange={(e) => setAdjustmentNote(e.target.value)}
                                className="block w-full rounded-md border-0 py-2 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                placeholder="Details about this change..."
                            />
                        </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setIsAdjustOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                      onClick={handleSaveAdjustment}
                    >
                      Update Stock
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
