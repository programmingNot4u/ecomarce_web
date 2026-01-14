import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useProducts } from '../../context/ProductContext';
import { getMediaUrl } from '../../services/api';

export default function AdminProducts() {
  const { products, deleteProduct, categories, brands, addProduct, pagination, fetchProducts } = useProducts();
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

  // Helper functions to resolve names
  const findCategoryName = (id: any) => {
    if (!id) return '';
    const findInTree = (cats: any[]): string | null => {
      for (const c of cats) {
        if (String(c.id) === String(id)) return c.name;
        if (c.subCategories) {
          const found = findInTree(c.subCategories);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(categories) || '';
  };

  const findBrandName = (id: any) => {
    if (!id) return '';
    const brand = brands.find(b => String(b.id) === String(id));
    return brand ? brand.name : '';
  };

  // Filter Logic
  // Server-side Filtering Trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts({
        page: 1, // Reset to page 1 on filter change
        search: searchQuery,
        category: filterCategory,
        brand: filterBrand,
        in_stock: filterStock === 'in_stock' ? 'True' : (filterStock === 'out_of_stock' ? 'False' : undefined),
        on_sale: filterStock === 'on_sale' ? 'True' : undefined
      });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filterCategory, filterBrand, filterStock]);

  const handlePageChange = (newPage: number) => {
    fetchProducts({
      page: newPage,
      search: searchQuery,
      category: filterCategory,
      brand: filterBrand,
      in_stock: filterStock === 'in_stock' ? 'True' : (filterStock === 'out_of_stock' ? 'False' : undefined),
      on_sale: filterStock === 'on_sale' ? 'True' : undefined
    });
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterBrand('');
    setFilterStock('all');
    setSearchQuery('');
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
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
    <div className="flex flex-col h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900">Products <span className="text-gray-500 text-lg font-normal">({products.length})</span></h1>
          <p className="mt-1 text-sm text-gray-500">Manage your product catalog, inventory, and pricing.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 sm:flex-none inline-flex justify-center items-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              Export
            </button>
            <button
              type="button"
              onClick={handleImportClick}
              className="flex-1 sm:flex-none inline-flex justify-center items-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400 transform rotate-180" aria-hidden="true" />
              Import
            </button>
          </div>
          <Link to="/admin/products/new" className="hidden sm:inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all">
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Add Product
          </Link>
          {/* Mobile Floating Action Button for Add Product or Top Block */}
          <Link to="/admin/products/new" className="sm:hidden w-full inline-flex items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all">
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Controls Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Search & Main Controls */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                placeholder="Search products..."
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 sm:flex-none inline-flex justify-center items-center rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm ring-1 ring-inset transition-all ${showFilters ? 'bg-gray-100 ring-gray-400 text-gray-900' : 'bg-white ring-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                Filters
              </button>
              {(filterCategory || filterBrand || filterStock !== 'all' || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-black font-medium transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="flex items-center justify-between bg-indigo-50 px-4 py-3 rounded-lg border border-indigo-100 animate-in fade-in slide-in-from-top-2">
              <span className="text-sm text-indigo-700 font-semibold">{selectedProducts.length} selected</span>
              <div className="flex items-center gap-3">
                <select
                  className="block w-32 sm:w-48 rounded-md border-0 py-1.5 pl-3 pr-8 text-indigo-700 font-medium bg-white ring-1 ring-indigo-200 focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                  onChange={(e) => {
                    if (e.target.value === 'delete') {
                      if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
                        selectedProducts.forEach(id => deleteProduct(id));
                        setSelectedProducts([]);
                      }
                      e.target.value = 'Bulk Actions';
                    }
                  }}
                >
                  <option>Bulk Actions</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button onClick={toggleSelectAll} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  Unselect All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 py-2 text-gray-900 focus:ring-black focus:border-black sm:text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <optgroup key={c.id} label={c.name}>
                      <option value={c.id}>{c.name}</option>
                      {c.subCategories?.map(sub => (
                        <option key={sub.id} value={sub.id}>&nbsp;&nbsp;{sub.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Brand</label>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 py-2 text-gray-900 focus:ring-black focus:border-black sm:text-sm"
                >
                  <option value="">All Brands</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Stock Status</label>
                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 py-2 text-gray-900 focus:ring-black focus:border-black sm:text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="on_sale">On Sale</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading & Empty States */}
      {products.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
          <div className="mt-6">
            <button
              onClick={clearFilters}
              className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Mobile Card View (Hidden on sm screens and up) */}
      <div className="sm:hidden space-y-4">
        {products.map((product) => (
          <div key={product.id} className={`bg-white rounded-xl p-4 shadow-sm border ${selectedProducts.includes(product.id) ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'}`}>
            <div className="flex gap-4">
              {/* Checkbox & Image */}
              <div className="flex flex-col gap-2 items-center">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => toggleSelectProduct(product.id)}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <div className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                  <img
                    src={getMediaUrl(product.image)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Img'}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{product.sku || '#' + product.id}</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      className="text-gray-400 p-1 rounded-full hover:bg-gray-100 ml-[-0.5rem]"
                      onClick={() => { if (confirm('Delete product?')) deleteProduct(product.id); }}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    <Link to={`/admin/products/${product.id}`} className="text-gray-400 p-1 rounded-full hover:bg-gray-100 hover:text-indigo-600">
                      <PencilSquareIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </div>

                <div className="mt-2 text-sm font-semibold text-gray-900">
                  Tk {product.salePrice && product.salePrice < product.price ? product.salePrice : product.price}
                  {product.salePrice && product.salePrice < product.price && (
                    <span className="ml-2 text-xs text-gray-400 line-through font-normal">Tk {product.price}</span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${product.inStock ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/10'}`}>
                    {product.inStock ? 'In Stock' : 'Out'} ({product.stockQuantity})
                  </span>
                  <span className="text-xs text-gray-500">
                    {findCategoryName(product.category) || product.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden sm:block overflow-hidden bg-white shadow-sm rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/80 backdrop-blur-sm">
            <tr>
              <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category & Brand</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {products.map((product) => (
              <tr key={product.id} className={`group hover:bg-gray-50 transition-colors ${selectedProducts.includes(product.id) ? 'bg-indigo-50/30' : ''}`}>
                <td className="relative px-7 sm:w-12 sm:px-6">
                  {selectedProducts.includes(product.id) && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-indigo-600 rounded-r" />
                  )}
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleSelectProduct(product.id)}
                  />
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                  <div className="flex items-center ml-4">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                      <img
                        className="h-full w-full object-cover"
                        src={getMediaUrl(product.image)}
                        alt=""
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=No+Img'; }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                        {product.type === 'combo' && (
                          <span className="ml-2 inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">Combo</span>
                        )}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5 font-mono">
                        {product.sku ? product.sku : `ID: ${product.id}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-900">
                      {product.brand_name || findBrandName(product.brand) || product.brand}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                      {product.category_name || findCategoryName(product.category) || product.category}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="flex flex-col gap-1">
                    {product.manageStock && product.stockQuantity !== undefined ? (
                      <span className={`text-xs font-bold ${product.stockQuantity < (product.lowStockThreshold || 5) ? 'text-orange-600' : 'text-gray-700'}`}>
                        {product.stockQuantity} units
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Unlimited</span>
                    )}
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset w-fit
                            ${product.inStock ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/10'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                  {product.salePrice && product.salePrice < product.price ? (
                    <div className="flex flex-col">
                      <span className="text-red-600">Tk {product.salePrice}</span>
                      <span className="text-xs text-gray-400 line-through">Tk {product.price}</span>
                    </div>
                  ) : (
                    <span>Tk {product.price}</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset 
                      ${product.status === 'published' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                        product.status === 'draft' ? 'bg-gray-50 text-gray-600 ring-gray-500/10' :
                          'bg-red-50 text-red-700 ring-red-600/10'}`}>
                      {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Draft'}
                    </span>
                    {product.onSale && (
                      <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-orange-50 text-orange-700 ring-orange-600/20">
                        Sale
                      </span>
                    )}
                  </div>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/admin/products/${product.id}`} className="text-gray-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-full transition-all">
                      <PencilSquareIcon className="h-5 w-5" />
                    </Link>
                    <button
                      className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all"
                      onClick={() => {
                        if (confirm('Are you sure?')) deleteProduct(product.id)
                      }}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl shadow-sm mt-0.5">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={!pagination.previous}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={!pagination.next}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-semibold text-gray-900">{pagination.current_page}</span> of <span className="font-semibold text-gray-900">{pagination.total_pages}</span> ({pagination.count} results)
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={!pagination.previous}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={!pagination.next}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
