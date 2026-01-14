import {
    ArrowUpTrayIcon,
    BuildingStorefrontIcon,
    LinkIcon,
    PencilIcon,
    PhotoIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { type Brand, useProducts } from '../../context/ProductContext';
import api, { getMediaUrl } from '../../services/api';

export default function AdminBrands() {
    const { brands, addBrand, updateBrand, deleteBrand, products } = useProducts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        logo: '',
    });

    const [imageMode, setImageMode] = useState<'url' | 'upload'>('upload');
    const [isUploading, setIsUploading] = useState(false);

    const openAdd = () => {
        setEditingBrand(null);
        setFormData({ name: '', logo: '' });
        setImageMode('upload');
        setIsModalOpen(true);
    };

    const openEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setFormData({ name: brand.name, logo: brand.logo || '' });
        setImageMode(brand.logo && !brand.logo.startsWith('http') ? 'upload' : 'url');
        setIsModalOpen(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            try {
                const uploadData = new FormData();
                uploadData.append('file', file);
                const res = await api.post('/upload/', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setFormData(prev => ({ ...prev, logo: res.data.url }));
            } catch (err) {
                console.error("Upload failed", err);
                alert("Failed to upload image");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        const brandData: Partial<Brand> = {
            name: formData.name,
            logo: formData.logo || undefined
        };

        if (editingBrand) {
            await updateBrand(editingBrand.id, brandData);
        } else {
            await addBrand(brandData as Brand);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="p-6 border-b border-gray-200 bg-white flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
                    <p className="text-sm text-gray-500">Manage your product brands and partners.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                >
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                    Add Brand
                </button>
            </div>

            <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {brands.map((brand) => {
                        const productCount = products.filter(p => p.brand === brand.name || (p as any).brand === brand.id).length;
                        return (
                            <div key={brand.id} className="relative group bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                                <div className="h-24 w-full bg-gray-50 rounded-md flex items-center justify-center mb-4 overflow-hidden relative">
                                    {brand.logo ? (
                                        <img src={getMediaUrl(brand.logo)} alt={brand.name} className="h-full w-full object-contain p-2" />
                                    ) : (
                                        <BuildingStorefrontIcon className="h-10 w-10 text-gray-300" />
                                    )}

                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => openEdit(brand)}
                                            className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('Delete brand?')) deleteBrand(brand.id) }}
                                            className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-sm font-medium text-gray-900 truncate w-full">{brand.name}</h3>
                                <p className="text-xs text-gray-400 mt-1">{productCount} Products</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">{editingBrand ? 'Edit Brand' : 'Add New Brand'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-2 px-3 border"
                                    placeholder="e.g. Nike"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Logo</label>
                                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                                        <button
                                            type="button"
                                            onClick={() => setImageMode('upload')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${imageMode === 'upload' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Upload
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setImageMode('url')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${imageMode === 'url' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            URL
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    {/* Preview */}
                                    <div className="h-16 w-16 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                                        {formData.logo ? (
                                            <img src={getMediaUrl(formData.logo)} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <PhotoIcon className="h-8 w-8 text-gray-300" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        {imageMode === 'upload' ? (
                                            <label className={`flex flex-col items-center justify-center w-full h-16 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    {isUploading ? (
                                                        <span className="text-xs text-gray-500">Uploading...</span>
                                                    ) : (
                                                        <>
                                                            <ArrowUpTrayIcon className="w-5 h-5 mb-1 text-gray-400" />
                                                            <p className="text-xs text-gray-500">Click to upload</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                                            </label>
                                        ) : (
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <LinkIcon className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="url"
                                                    value={formData.logo}
                                                    onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-2 border"
                                                    placeholder="https://example.com/logo.png"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Cancel</button>
                                <button type="submit" disabled={isUploading} className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md shadow-sm disabled:bg-gray-400">
                                    {editingBrand ? 'Save Changes' : 'Create Brand'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

