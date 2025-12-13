import {
    ArrowDownTrayIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useProducts } from '../../context/ProductContext';

export default function AdminProducts() {
  const { products, deleteProduct, categories, brands, addProduct } = useProducts();
  const { showNotification } = useNotification();
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStock, setFilterStock] = useState('all'); // all, in_stock, out_of_stock

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id: number) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pId => pId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory ? p.category === filterCategory : true;
    const matchesBrand = filterBrand ? p.brand === filterBrand : true;
    const matchesStock = filterStock === 'all' 
        ? true 
        : filterStock === 'in_stock' 
            ? p.inStock 
            : !p.inStock;

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  const clearFilters = () => {
      setFilterCategory('');
      setFilterBrand('');
      setFilterStock('all');
      setSearchQuery('');
  };

  const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredProducts, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", "products.json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const importedProducts = JSON.parse(json);
        if (Array.isArray(importedProducts)) {
            let count = 0;
            importedProducts.forEach((p: any) => {
                // Strip ID to let context assign new ones to avoid collisions
                const { id, ...productData } = p;
                addProduct(productData);
                count++;
            });
            showNotification(`Successfully imported ${count} products.`, 'success');
            // Optionally reload or state updates automatically via context
        } else {
            showNotification('Invalid JSON format. Expected an array of products.', 'error');
        }
      } catch (err) {
        console.error(err);
        showNotification('Failed to parse JSON file.', 'error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
       {/* Hidden File Input */}
       <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden" 
       />

       {/* Header */}
       <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">Products {products.length}</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your product catalog, inventory, and pricing.</p>
        </div>
        <div className="flex gap-x-3">
             <button 
                type="button" 
                onClick={handleExport}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
             >
                <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                Export
             </button>
             <button 
                type="button" 
                onClick={handleImportClick}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
             >
                <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400 transform rotate-180" aria-hidden="true" />
                Import
             </button>
             <Link to="/admin/products/new" className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Add Product
             </Link>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white p-4 rounded-t-lg border-b border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center flex-1 gap-2">
                   <div className="relative flex-1 max-w-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                        placeholder="Search by Name, SKU, Category..."
                      />
                    </div>
                    <button 
                        type="button" 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset hover:bg-gray-50 ${showFilters ? 'bg-gray-100 ring-gray-400 text-gray-900' : 'bg-white ring-gray-300 text-gray-900'}`}
                    >
                        <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                        Filters
                    </button>
                    {(filterCategory || filterBrand || filterStock !== 'all' || searchQuery) && (
                        <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-black underline">
                            Clear
                        </button>
                    )}
              </div>
              
              {selectedProducts.length > 0 && (
                 <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-md">
                     <span className="text-sm text-indigo-700 font-medium">{selectedProducts.length} selected</span>
                     <select 
                        className="block w-full rounded-md border-0 py-1 pl-2 pr-8 text-indigo-700 font-semibold bg-transparent ring-0 focus:ring-0 sm:text-sm sm:leading-6"
                        onChange={(e) => {
                            if (e.target.value === 'delete') {
                                if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
                                    selectedProducts.forEach(id => deleteProduct(id));
                                    setSelectedProducts([]);
                                }
                                e.target.value = 'Bulk Actions'; // Reset dropdown
                            }
                        }}
                     >
                        <option>Bulk Actions</option>
                        <option value="delete">Delete</option>
                     </select>
                 </div>
              )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                  <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                      <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                      >
                          <option value="">All Categories</option>
                          {categories.map(c => (
                              <optgroup key={c.id} label={c.name}>
                                  <option value={c.name}>{c.name}</option>
                                  {c.subCategories?.map(sub => (
                                      <option key={sub.id} value={sub.name}>&nbsp;&nbsp;{sub.name}</option>
                                  ))}
                              </optgroup>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Brand</label>
                      <select 
                        value={filterBrand}
                        onChange={(e) => setFilterBrand(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                      >
                          <option value="">All Brands</option>
                          {brands.map(b => (
                              <option key={b.id} value={b.name}>{b.name}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Stock Status</label>
                      <select 
                        value={filterStock}
                        onChange={(e) => setFilterStock(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                      >
                          <option value="all">All Status</option>
                          <option value="in_stock">In Stock</option>
                          <option value="out_of_stock">Out of Stock</option>
                      </select>
                  </div>
              </div>
          )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-sm rounded-b-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Product</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Brand & Cat</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Stock</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Price</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">Status</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredProducts.map((product) => (
              <tr key={product.id} className={selectedProducts.includes(product.id) ? 'bg-gray-50' : ''}>
                <td className="relative px-7 sm:w-12 sm:px-6">
                  {selectedProducts.includes(product.id) && (
                    <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />
                  )}
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleSelectProduct(product.id)}
                  />
                </td>
                <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-0">
                  <div className="flex items-center ml-4">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img className="h-10 w-10 rounded-md object-cover border border-gray-200" src={product.image} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900 hover:text-indigo-600 cursor-pointer">{product.name}</div>
                      <div className="text-gray-500 text-xs">
                          {product.sku ? `SKU: ${product.sku}` : `ID: ${product.id}`}
                      </div> 
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                    <div className="flex flex-col">
                        <span>{product.brand}</span>
                        <span className="text-xs text-gray-400">{product.category}</span>
                    </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                    {product.stockQuantity !== undefined ? (
                        <span className={product.stockQuantity < 10 ? 'text-orange-600 font-medium' : ''}>
                            {product.stockQuantity} units
                        </span>
                    ) : (
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset 
                            ${product.inStock ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                              'bg-red-50 text-red-700 ring-red-600/10'}`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                    )}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-gray-900">
                    {product.salePrice && product.salePrice < product.price ? (
                        <div className="flex flex-col">
                             <span className="text-red-600">Tk {product.salePrice}</span>
                             <span className="text-xs text-gray-400 line-through">Tk {product.price}</span>
                        </div>
                    ) : (
                        <span>Tk {product.price}</span>
                    )}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                     <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-green-50 text-green-700 ring-green-600/20`}>
                        Active
                    </span>
                </td>
                <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex items-center justify-end gap-2">
                       <Link to={`/admin/products/${product.id}`} className="text-gray-400 hover:text-indigo-600">
                           <PencilSquareIcon className="h-5 w-5" />
                       </Link>
                       <button 
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => {
                                if(confirm('Are you sure?')) deleteProduct(product.id)
                            }}
                        >
                           <TrashIcon className="h-5 w-5" />
                       </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">
                        No products found matching your filters.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
        
        {/* Simple Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
             <div className="text-sm text-gray-700">
                Showing {filteredProducts.length} results
             </div>
        </div>
      </div>
    </div>
  );
}
