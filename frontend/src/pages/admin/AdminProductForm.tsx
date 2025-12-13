import { PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useProducts } from '../../context/ProductContext';

const tabs = [
  { name: 'General', id: 'general' },
  { name: 'Images & Media', id: 'images' },
  { name: 'Variants', id: 'variants' },
  { name: 'Pricing', id: 'pricing' },
  { name: 'Inventory', id: 'inventory' },
  { name: 'SEO', id: 'seo' },
  { name: 'Supplier', id: 'supplier' },
  { name: 'Guides & Info', id: 'sections' },
];

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { addProduct, updateProduct, products, categories, brands } = useProducts();
  const [activeTab, setActiveTab] = useState('general');

  // Form State
  const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: '',
      salePrice: '',
      category: '',
      brand: '',
      inStock: true,
      onSale: false,
      stockQuantity: '0',
      sku: '',
      image: '', 
      images: [] as string[], // Dynamic Images
      rating: 5,
      // Variants
      variants: [] as { id: string; name: string; options: string[] }[],
      // SEO
      seoTitle: '',
      seoDescription: '',
      // Supplier
      supplierName: '',
      supplierContact: '',
      // Dynamic Sections
      sections: [] as { id: string; title: string; content: string }[],
      combinations: [] as { id: string; sku: string; price: number; stockQuantity: number; attributes: Record<string, string> }[], 
  });

  const [newImageInput, setNewImageInput] = useState('');
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantOptions, setNewVariantOptions] = useState('');

  // Load existing if ID present
  useEffect(() => {
    if (id) {
        const product = products.find(p => p.id === Number(id));
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                salePrice: product.salePrice ? product.salePrice.toString() : '',
                category: product.category,
                categoryId: product.categoryId || '',
                brand: product.brand,
                status: (product.status as any) || 'published',
                inStock: product.inStock,
                onSale: product.onSale,
                stockQuantity: product.stockQuantity ? product.stockQuantity.toString() : '0',
                sku: product.sku || '',
                image: product.image,
                images: product.images || (product.image ? [product.image] : []),
                rating: product.rating,
                variants: product.variants || [],
                seoTitle: product.seoTitle || '',
                seoDescription: product.seoDescription || '',
                supplierName: product.supplierName || '',
                supplierContact: product.supplierContact || '',
                sections: product.sections || [],
                combinations: product.combinations || []
            });
        }
    }
  }, [id, products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = e.target.value;
      if (!selectedId) {
          setFormData(prev => ({ ...prev, category: '', categoryId: '' }));
          return;
      }

      // Find the category object to get its name
      const findCat = (cats: typeof categories): typeof categories[0] | null => {
          for (const cat of cats) {
              if (cat.id === selectedId) return cat;
              if (cat.subCategories) {
                  const found = findCat(cat.subCategories);
                  if (found) return found;
              }
          }
          return null;
      };

      const category = findCat(categories);
      if (category) {
          setFormData(prev => ({ ...prev, category: category.name, categoryId: category.id }));
      }
  };

  // Image Handlers
  const handleAddImage = () => {
    if (newImageInput.trim()) {
        setFormData(prev => ({ ...prev, images: [...prev.images, newImageInput.trim()] }));
        setNewImageInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
          Array.from(files).forEach(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  if (typeof reader.result === 'string') {
                      setFormData(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
                  }
              };
              reader.readAsDataURL(file);
          });
      }
      // Reset input
      e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
      setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSetMainImage = (img: string) => {
      setFormData(prev => ({ ...prev, image: img }));
  };

  // Section Handlers
  const handleAddSection = () => {
      setFormData(prev => ({
          ...prev,
          sections: [...prev.sections, { id: Date.now().toString(), title: '', content: '' }]
      }));
  };

  const handleUpdateSection = (id: string, field: 'title' | 'content', value: string) => {
      setFormData(prev => ({
          ...prev,
          sections: prev.sections.map(s => s.id === id ? { ...s, [field]: value } : s)
      }));
  };

  const handleRemoveSection = (id: string) => {
      setFormData(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
  };

  // Variant Handlers
  const handleAddVariant = () => {
      if (!newVariantName || !newVariantOptions) return;
      const optionsArray = newVariantOptions.split(',').map(s => s.trim()).filter(Boolean);
      const newVariant = {
          id: Date.now().toString(),
          name: newVariantName,
          options: optionsArray
      };
      setFormData(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
      setNewVariantName('');
      setNewVariantOptions('');
  };

  const handleRemoveVariant = (variantId: string) => {
      setFormData(prev => ({ ...prev, variants: prev.variants.filter(v => v.id !== variantId) }));
  };

  const generateCombinations = () => {
      let results: Record<string, string>[] = [{}];
      formData.variants.forEach(variant => {
          if (!variant.options.length) return;
          const newResults: Record<string, string>[] = [];
          results.forEach(res => {
              variant.options.forEach(opt => {
                  newResults.push({ ...res, [variant.name]: opt });
              });
          });
          results = newResults;
      });

      const newCombinations = results.map(attrs => {
          const existing = formData.combinations.find(c => 
             Object.entries(attrs).every(([k, v]) => c.attributes[k] === v)
          );
          if (existing) return existing;
          return {
              id: Date.now() + Math.random().toString(),
              attributes: attrs,
              price: formData.price ? Number(formData.price) : 0,
              stockQuantity: 0,
              sku: '' 
          };
      });

      setFormData(prev => ({ ...prev, combinations: newCombinations }));
  };

  const handleUpdateCombination = (id: string, field: 'price' | 'stockQuantity' | 'sku', value: string) => {
       setFormData(prev => ({
           ...prev,
           combinations: prev.combinations.map(c => c.id === id ? { ...c, [field]: field === 'sku' ? value : Number(value) } : c)
       }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
        showNotification('Product Name is required', 'error');
        return;
    }
    if (!formData.price) {
        showNotification('Product Price is required', 'error');
        return;
    }

    const priceNum = Number(formData.price);
    const salePriceNum = formData.salePrice ? Number(formData.salePrice) : undefined;
    
    // Auto-calculate onSale status
    let finalOnSale = formData.onSale;
    if (salePriceNum && salePriceNum < priceNum) {
        finalOnSale = true;
    }

    // Ensure we have at least one image if images array is populated, or fallback
    const mainImage = formData.image || formData.images[0] || 'https://placehold.co/600x600?text=No+Image';
    const hoverImage = formData.images[1] || mainImage; // Default hover to second image or main

    const productData = {
        ...formData,
        price: priceNum,
        salePrice: salePriceNum,
        categoryId: formData.categoryId,
        stockQuantity: Number(formData.stockQuantity),
        onSale: finalOnSale,
        status: formData.status as any,
        image: mainImage,
        hoverImage: hoverImage,
        hoverImage: hoverImage,
        images: formData.images.length > 0 ? formData.images : [mainImage],
        hoverImage: hoverImage,
        images: formData.images.length > 0 ? formData.images : [mainImage],
        sections: formData.sections,
        combinations: formData.combinations
    };

    if (id) {
        updateProduct(Number(id), productData);
    } else {
        addProduct(productData);
    }
    navigate('/admin/products');
  };

  // Shared Input Styles
  const inputClass = "block w-full rounded-lg border-0 py-3 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 transition-all duration-200";
  const labelClass = "block text-sm font-semibold leading-6 text-gray-900 mb-2";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-5 shrink-0 shadow-sm z-10">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">{id ? 'Edit Product' : 'Add Product'}</h1>
             <p className="text-sm text-gray-500 mt-1">Fill in the information to listed your product.</p>
        </div>
        <div className="flex items-center gap-x-4">
             <button type="button" onClick={() => navigate('/admin/products')} className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Discard</button>
             <button type="button" onClick={handleSave} className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gray-400/20 hover:bg-gray-800 transition-all transform hover:-translate-y-0.5">Save Changes</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
             <div className="flex gap-8">
                {/* Left Column (Forms) */}
                <div className="flex-1 space-y-8">
                    
                    {/* Tab Navigation */}
                     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                        <nav className="flex space-x-1" aria-label="Tabs">
                            {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2
                                ${activeTab === tab.id
                                    ? 'bg-black text-white shadow'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'}
                                `}
                            >
                                {tab.name}
                            </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Panels */}
                    <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-8 min-h-[600px]">
                        
                        {/* 1. General Tab */}
                        {activeTab === 'general' && (
                            <div className="space-y-8 max-w-3xl animate-fadeIn">
                                <div>
                                    <label className={labelClass}>Product Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="e.g. Luxurious Cotton T-Shirt" 
                                        autoFocus
                                    />
                                </div>

                            </div>
                        )}

                        {/* 2. Images Tab */}
                         {activeTab === 'images' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Gallery</h3>
                                    
                                    {/* Add Image Input */}
                                    <div className="flex flex-col gap-6 mb-8 max-w-2xl">
                                        
                                        {/* URL Input */}
                                        <div className="flex gap-4 items-start">
                                            <div className="flex-1">
                                                <input 
                                                    type="text" 
                                                    value={newImageInput}
                                                    onChange={(e) => setNewImageInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                                                    className={inputClass} 
                                                    placeholder="Paste image URL here..." 
                                                />
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={handleAddImage}
                                                className="mt-1 flex-shrink-0 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
                                            >
                                                Add URL
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-medium text-gray-400 uppercase">OR</span>
                                            <div className="h-px flex-1 bg-gray-100"></div>
                                        </div>

                                        {/* File Upload */}
                                        <div>
                                            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <PhotoIcon className="w-8 h-8 mb-3 text-gray-400" />
                                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-black">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x800px)</p>
                                                </div>
                                                <input id="file-upload" type="file" className="hidden" multiple accept="image/*" onChange={handleFileUpload} />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Image Grid */}
                                    {formData.images.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                            {formData.images.map((img, idx) => (
                                                <div key={idx} className="group relative aspect-square rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                    <img src={img} alt={`Product ${idx}`} className="h-full w-full object-cover" />
                                                    
                                                    {/* Actions Overlay */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                        {formData.image === img && (
                                                            <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Main</span>
                                                        )}
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleSetMainImage(img)}
                                                            className="text-white text-xs font-semibold hover:underline"
                                                        >
                                                            Set as Main
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveImage(idx)}
                                                            className="bg-white text-red-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                        >
                                                             <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" />
                                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No images yet</h3>
                                            <p className="mt-1 text-sm text-gray-500">Add URLs above to build your gallery.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* 3. Variants Tab */}
                        {activeTab === 'variants' && (
                            <div className="space-y-8 max-w-4xl animate-fadeIn">
                                <div>
                                    <div className="border border-gray-200 rounded-xl bg-gray-50/50 p-6 mb-8">
                                        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Add New Option</h4>
                                         <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                                            <div className="md:col-span-4">
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">Option Name</label>
                                                <input 
                                                    type="text" 
                                                    value={newVariantName}
                                                    onChange={(e) => setNewVariantName(e.target.value)}
                                                    placeholder="e.g. Size, Color"
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div className="md:col-span-6">
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">Values (comma separated)</label>
                                                <input 
                                                    type="text" 
                                                    value={newVariantOptions}
                                                    onChange={(e) => setNewVariantOptions(e.target.value)}
                                                    placeholder="e.g. S, M, L, XL"
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <button 
                                                    type="button"
                                                    onClick={handleAddVariant}
                                                    className="w-full flex items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-gray-800 transition-colors"
                                                >
                                                    <PlusIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Existing Variants List */}
                                    <div className="space-y-4">
                                        {formData.variants.map((variant) => (
                                            <div key={variant.id} className="flex items-start justify-between bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                                                <div>
                                                    <h5 className="font-bold text-gray-900 text-lg">{variant.name}</h5>
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {variant.options.map(opt => (
                                                            <span key={opt} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                                                                {opt}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveVariant(variant.id)}
                                                    className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.variants.length === 0 && (
                                            <p className="text-center text-gray-500 py-4 italic">No variants configured.</p>
                                        )}
                                    </div>

                                    {/* Combinations / Pricing Table */}
                                    {formData.variants.length > 0 && (
                                        <div className="mt-8 pt-8 border-t border-gray-200">
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="font-bold text-gray-900 text-lg">Variant Pricing & Stock</h4>
                                                <button 
                                                    type="button" 
                                                    onClick={generateCombinations}
                                                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                                                >
                                                    Generate / Refresh Combinations
                                                </button>
                                            </div>

                                            {formData.combinations.length > 0 ? (
                                                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Tk)</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {formData.combinations.map((combo) => (
                                                                <tr key={combo.id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                        {Object.entries(combo.attributes).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <input 
                                                                            type="number" 
                                                                            value={combo.price}
                                                                            onChange={(e) => handleUpdateCombination(combo.id, 'price', e.target.value)}
                                                                            className="block w-32 rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                                        />
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <input 
                                                                            type="number" 
                                                                            value={combo.stockQuantity}
                                                                            onChange={(e) => handleUpdateCombination(combo.id, 'stockQuantity', e.target.value)}
                                                                            className="block w-24 rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                                        />
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <input 
                                                                            type="text" 
                                                                            value={combo.sku}
                                                                            onChange={(e) => handleUpdateCombination(combo.id, 'sku', e.target.value)}
                                                                            className="block w-32 rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">Click &quot;Generate&quot; to configure pricing for your variants.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 4. Pricing Tab */}
                         {activeTab === 'pricing' && (
                            <div className="space-y-8 max-w-2xl animate-fadeIn">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                     <div>
                                        <label className={labelClass}>Regular Price</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                className={`pl-8 ${inputClass}`}
                                                placeholder="0.00" 
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Tk</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Sale Price</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                name="salePrice"
                                                value={formData.salePrice}
                                                onChange={handleChange}
                                                className={`pl-8 ${inputClass}`}
                                                placeholder="0.00" 
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Tk</span>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">Leaving empty means no sale.</p>
                                    </div>
                                 </div>
                            </div>
                        )}

                        {/* 5. Inventory Tab */}
                         {activeTab === 'inventory' && (
                            <div className="space-y-8 max-w-2xl animate-fadeIn">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className={labelClass}>SKU (Stock Keeping Unit)</label>
                                        <input 
                                            type="text" 
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="e.g. TSHIRT-001" 
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Stock Quantity</label>
                                        <input 
                                            type="number" 
                                            name="stockQuantity"
                                            value={formData.stockQuantity}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="0" 
                                        />
                                    </div>
                                 </div>
                            </div>
                        )}

                        {/* 6. SEO Tab */}
                        {activeTab === 'seo' && (
                           <div className="space-y-8 max-w-3xl animate-fadeIn">
                               <div>
                                   <label className={labelClass}>Meta Title</label>
                                   <input 
                                       type="text" 
                                       name="seoTitle"
                                       value={formData.seoTitle}
                                       onChange={handleChange}
                                       className={inputClass}
                                       placeholder="Title for search engines" 
                                   />
                               </div>
                               <div>
                                   <label className={labelClass}>Meta Description</label>
                                   <textarea 
                                       rows={4} 
                                       name="seoDescription"
                                       value={formData.seoDescription}
                                       onChange={handleChange}
                                       className={inputClass}
                                       placeholder="Brief description used in search results..."
                                   ></textarea>
                               </div>
                           </div>
                       )}

                       {/* 7. Supplier Tab */}
                       {activeTab === 'supplier' && (
                           <div className="space-y-8 max-w-3xl animate-fadeIn">
                               <div>
                                   <label className={labelClass}>Supplier Name</label>
                                   <input 
                                       type="text" 
                                       name="supplierName"
                                       value={formData.supplierName}
                                       onChange={handleChange}
                                       className={inputClass} 
                                   />
                               </div>
                               <div>
                                   <label className={labelClass}>Contact Info</label>
                                   <input 
                                       type="text" 
                                       name="supplierContact"
                                       value={formData.supplierContact}
                                       onChange={handleChange}
                                       className={inputClass}
                                   />
                               </div>
                           </div>
                       )}

                        {/* 8. Sections Tab */}
                        {activeTab === 'sections' && (
                            <div className="space-y-8 max-w-4xl animate-fadeIn">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">Custom Guides & Information</h3>
                                    <button 
                                        type="button" 
                                        onClick={handleAddSection}
                                        className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                                    >
                                        + Add Section
                                    </button>
                                </div>
                                
                                {formData.sections.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                        <p className="text-gray-500">No custom sections added yet.</p>
                                        <button onClick={handleAddSection} className="text-indigo-600 font-semibold text-sm mt-2 hover:underline">Add one now</button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {formData.sections.map((section, index) => (
                                            <div key={section.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 relative group">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveSection(section.id)}
                                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                                
                                                <div className="grid gap-6">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Section Title</label>
                                                        <input 
                                                            type="text" 
                                                            value={section.title}
                                                            onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)}
                                                            className={inputClass}
                                                            placeholder="e.g. Size Guide, Care Instructions"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Content</label>
                                                        <textarea 
                                                            rows={4} 
                                                            value={section.content}
                                                            onChange={(e) => handleUpdateSection(section.id, 'content', e.target.value)}
                                                            className={inputClass}
                                                            placeholder="Enter the content for this section..."
                                                        ></textarea>
                                                        <p className="mt-2 text-xs text-gray-400">Supports HTML for tables, lists, and formatting.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (Settings) */}
                <div className="w-80 shrink-0 space-y-6">
                     
                     {/* Publish Status */}
                     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Availability</h3>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleChange} className="peer sr-only"/>
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">In Stock</span>
                            </label>
                            
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input type="checkbox" name="onSale" checked={formData.onSale} onChange={handleChange} className="peer sr-only"/>
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">On Sale</span>
                            </label>
                        </div>
                     </div>

                     {/* Organization */}
                     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Product Status</h3>
                        <div className="space-y-4">
                            <select 
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                            <p className="text-xs text-gray-500">
                                {formData.status === 'published' && 'Visible to all customers.'}
                                {formData.status === 'draft' && 'Hidden, work in progress.'}
                                {formData.status === 'archived' && 'Hidden, discontinued.'}
                            </p>
                        </div>
                     </div>

                     {/* Organization */}
                     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Organization</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Category</label>
                                <select 
                                    name="categoryId"
                                    value={formData.categoryId || ''}
                                    onChange={handleCategoryChange}
                                    className={inputClass}
                                >
                                    <option value="">Select Category</option>
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
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Brand</label>
                                <select 
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className={inputClass}
                                >
                                    <option value="">Select Brand</option>
                                    {brands.map(b => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                     </div>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
}
