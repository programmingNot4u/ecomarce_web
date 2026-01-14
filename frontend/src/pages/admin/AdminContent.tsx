import {
    ArrowUpTrayIcon,
    EyeIcon,
    PhotoIcon,
    PlusIcon,
    QuestionMarkCircleIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, type Banner } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

// --- COMMON UI COMPONENTS ---
const InputParams = ({ label, value, onChange, placeholder }: any) => (
    <div className="group">
        <label className="block text-xs font-bold uppercase text-gray-400 mb-1 group-focus-within:text-black transition-colors">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:ring-black sm:text-sm py-3 px-4 transition-all shadow-sm"
            placeholder={placeholder}
        />
    </div>
);

export default function AdminContent() {
    const { banners, addBanner, updateBanner, deleteBanner } = useProducts();
    const { theme, updateTheme, saveThemeNow } = useTheme();

    // Find Hero Section for Settings
    const heroSection = theme.homeSections.find(s => s.type === 'hero');
    const updateHeroSettings = (settings: any) => {
        const updatedSections = theme.homeSections.map(s =>
            s.type === 'hero' ? { ...s, settings: { ...s.settings, ...settings } } : s
        );
        updateTheme({ homeSections: updatedSections });
        // Auto-save or wait for explicit save? ThemeContext auto-saves with debounce, but we can also trigger manual if needed.
    };

    // --- BANNERS STATE & LOGIC ---
    const [showBannerForm, setShowBannerForm] = useState(false);
    const [bannerForm, setBannerForm] = useState<Partial<Banner>>({
        title: '', subtitle: '', image: '', link: '', ctaText: '', position: 'hero', active: true, order: 0,
        backgroundColor: '#ffffff', textColor: '#000000', buttonColor: '#000000', buttonTextColor: '#ffffff'
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [imageWarning, setImageWarning] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await api.post('/upload/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setBannerForm(prev => ({ ...prev, image: res.data.url }));
            } catch (err) {
                console.error("Upload failed", err);
                alert('Upload failed');
            }
        }
    };

    const handleSaveBanner = () => {
        if (!bannerForm.title) return alert('Title required');

        const bannerData: Banner = {
            id: editingId || Date.now().toString(),
            title: bannerForm.title!,
            subtitle: bannerForm.subtitle || '',
            image: bannerForm.image || '',
            link: bannerForm.link || '/shop',
            ctaText: bannerForm.ctaText || 'Shop Now',
            position: bannerForm.position as any || 'hero',
            order: bannerForm.order || banners.length + 1,
            active: bannerForm.active !== undefined ? bannerForm.active : true,
            backgroundColor: bannerForm.backgroundColor || '#ffffff',
            textColor: bannerForm.textColor || '#000000',
            buttonColor: bannerForm.buttonColor || '#000000',
            buttonTextColor: bannerForm.buttonTextColor || '#ffffff'
        };

        if (editingId) {
            updateBanner(editingId, bannerData);
        } else {
            addBanner(bannerData);
        }

        setShowBannerForm(false);
        setEditingId(null);
        setBannerForm({
            title: '', subtitle: '', image: '', link: '', ctaText: '', position: 'hero', active: true, order: 0,
            backgroundColor: '#ffffff', textColor: '#000000', buttonColor: '#000000', buttonTextColor: '#ffffff'
        });
    };

    const handleEditBanner = (banner: Banner) => {
        setBannerForm({
            ...banner
        });
        setEditingId(banner.id);
        setShowBannerForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteBanner = (id: string) => {
        if (window.confirm('Are you sure you want to delete this content block?')) {
            deleteBanner(id);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">Content Manager</h1>
                    <p className="mt-1 sm:mt-2 text-sm text-gray-500">Manage your store's banners and hero sliders.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">

                    {/* Mobile Layout Control */}
                    <div className="flex items-center justify-between sm:justify-start gap-2 bg-white px-3 py-2 sm:py-1.5 rounded-lg border border-gray-200 shadow-sm sm:shadow-none">
                        <label className="text-xs font-bold uppercase text-gray-500 whitespace-nowrap">Mobile Grid:</label>
                        <select
                            value={heroSection?.settings?.mobileLayout || 'grid-1'}
                            onChange={(e) => updateHeroSettings({ mobileLayout: e.target.value })}
                            className="bg-transparent text-sm font-medium border-none focus:ring-0 p-0 cursor-pointer text-right sm:text-left"
                        >
                            <option value="grid-1">Single (1x4)</option>
                            <option value="grid-2">Grid (2x2)</option>
                            <option value="mixed">Mixed (2+1+1)</option>
                        </select>
                    </div>

                    <Link to="/" className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                        <EyeIcon className="h-4 w-4" /> <span className="sm:hidden">View Site</span><span className="hidden sm:inline">View Live Site</span>
                    </Link>
                </div>
            </div>

            {/* --- BANNERS CONTENT (Formerly Tab Content, now main content) --- */}
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Add New Banner Section */}
                {showBannerForm ? (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-lg">{editingId ? 'Edit Content Block' : 'Create New Content Block'}</h3>
                            <button onClick={() => { setShowBannerForm(false); setEditingId(null); }} className="text-gray-400 hover:text-red-500 rounded-full p-1 hover:bg-red-50 transition-colors"><XMarkIcon className="h-6 w-6" /></button>
                        </div>
                        <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
                            {/* Form */}
                            <div className="lg:col-span-7 space-y-6">
                                <div className="space-y-4">
                                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-black transition-colors cursor-pointer text-center bg-gray-50 group" onClick={() => fileInputRef.current?.click()}>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        {bannerForm.image ? (
                                            <img src={bannerForm.image} alt="Preview" className="h-48 w-full object-cover rounded-lg shadow-sm" />
                                        ) : (
                                            <div className="py-8">
                                                <ArrowUpTrayIcon className="h-10 w-10 text-gray-300 mx-auto mb-2 group-hover:text-black transition-colors" />
                                                <p className="text-sm font-bold text-gray-500">Click to upload image</p>
                                                <p className="text-xs text-gray-400 mt-1">or drag and drop here</p>
                                            </div>
                                        )}
                                    </div>
                                    {imageWarning && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                                            <QuestionMarkCircleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                                            <p className="text-xs text-yellow-700 font-medium">{imageWarning}</p>
                                        </div>
                                    )}

                                    {/* Image URL OR Upload */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Or Paste Image URL</label>
                                        <input
                                            type="text"
                                            value={bannerForm.image}
                                            onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 text-xs py-2 px-3 focus:bg-white transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputParams label="Title" value={bannerForm.title} onChange={(e: any) => setBannerForm({ ...bannerForm, title: e.target.value })} placeholder="e.g. Summer Sale" />
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Position</label>
                                            <select
                                                className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:ring-black sm:text-sm py-3 px-4 transition-all shadow-sm"
                                                value={bannerForm.position}
                                                onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value as any })}
                                            >
                                                <option value="hero">Main Hero Slider</option>
                                                <option value="grid-1">Grid Slot 1 (Top Left)</option>
                                                <option value="grid-2">Grid Slot 2 (Top Right)</option>
                                                <option value="grid-3">Grid Slot 3 (Bottom Left)</option>
                                                <option value="grid-4">Grid Slot 4 (Bottom Right)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <InputParams label="Subtitle" value={bannerForm.subtitle} onChange={(e: any) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} placeholder="e.g. 50% Off Everything" />

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputParams label="Button Text" value={bannerForm.ctaText} onChange={(e: any) => setBannerForm({ ...bannerForm, ctaText: e.target.value })} placeholder="Shop Now" />
                                        <InputParams label="Link URL" value={bannerForm.link} onChange={(e: any) => setBannerForm({ ...bannerForm, link: e.target.value })} placeholder="/shop/summer" />
                                    </div>

                                    {/* Styling Options */}
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <h4 className="text-xs font-bold uppercase text-gray-900 mb-3">Custom Colors (Optional)</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Background</label>
                                                <div className="flex items-center gap-2">
                                                    <input type="color" value={bannerForm.backgroundColor || '#ffffff'} onChange={(e) => setBannerForm({ ...bannerForm, backgroundColor: e.target.value })} className="h-8 w-8 rounded cursor-pointer border-0 p-0" />
                                                    <input type="text" value={bannerForm.backgroundColor || ''} onChange={(e) => setBannerForm({ ...bannerForm, backgroundColor: e.target.value })} placeholder="#hex" className="w-full text-xs rounded border-gray-200" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Text Color</label>
                                                <div className="flex items-center gap-2">
                                                    <input type="color" value={bannerForm.textColor || '#000000'} onChange={(e) => setBannerForm({ ...bannerForm, textColor: e.target.value })} className="h-8 w-8 rounded cursor-pointer border-0 p-0" />
                                                    <input type="text" value={bannerForm.textColor || ''} onChange={(e) => setBannerForm({ ...bannerForm, textColor: e.target.value })} placeholder="#hex" className="w-full text-xs rounded border-gray-200" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Button Color</label>
                                                <div className="flex items-center gap-2">
                                                    <input type="color" value={bannerForm.buttonColor || '#000000'} onChange={(e) => setBannerForm({ ...bannerForm, buttonColor: e.target.value })} className="h-8 w-8 rounded cursor-pointer border-0 p-0" />
                                                    <input type="text" value={bannerForm.buttonColor || ''} onChange={(e) => setBannerForm({ ...bannerForm, buttonColor: e.target.value })} placeholder="#hex" className="w-full text-xs rounded border-gray-200" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Button Text Color</label>
                                                <div className="flex items-center gap-2">
                                                    <input type="color" value={bannerForm.buttonTextColor || '#ffffff'} onChange={(e) => setBannerForm({ ...bannerForm, buttonTextColor: e.target.value })} className="h-8 w-8 rounded cursor-pointer border-0 p-0" />
                                                    <input type="text" value={bannerForm.buttonTextColor || ''} onChange={(e) => setBannerForm({ ...bannerForm, buttonTextColor: e.target.value })} placeholder="#hex" className="w-full text-xs rounded border-gray-200" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800">
                                        <h4 className="font-bold mb-1 flex items-center gap-1"><PhotoIcon className="h-3 w-3" /> Image Tips</h4>
                                        <ul className="space-y-1 ml-4 list-disc opacity-80">
                                            {bannerForm.position === 'hero' ? (
                                                <li>Recommended size: <strong>1920 x 1080 px</strong> (16:9)</li>
                                            ) : (
                                                <li>Recommended size: <strong>600 x 600 px</strong> (Square)</li>
                                            )}
                                            <li>Images will be automatically cropped to fit the container.</li>
                                            <li>Use high-quality JPEG or PNG files.</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                    <button onClick={handleSaveBanner} className="flex-1 bg-black text-white py-3 rounded-lg font-bold shadow-lg hover:bg-gray-900 transition-all">{editingId ? 'Update & Publish' : 'Save & Publish'}</button>
                                    <button onClick={() => { setShowBannerForm(false); setEditingId(null); }} className="px-6 py-3 rounded-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors bg-white border border-gray-200 sm:border-transparent">Cancel</button>
                                </div>
                            </div>

                            {/* Live Preview */}
                            <div className="lg:col-span-5">
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-3">
                                    Preview ({bannerForm.position === 'hero' ? 'Hero Slide' : 'Grid Block'})
                                </label>
                                <div
                                    className={`rounded-2xl overflow-hidden shadow-2xl relative
                                        ${bannerForm.position === 'hero' ? 'aspect-[16/9]' : 'aspect-square'}
                                    `}
                                    style={{ backgroundColor: bannerForm.backgroundColor || '#f9fafb' }}
                                >

                                    {/* Mock Content */}
                                    <div className="h-full w-full relative flex flex-col justify-between p-6">
                                        {bannerForm.image && (
                                            <img
                                                src={bannerForm.image}
                                                className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 z-0`}
                                                alt=""
                                            />
                                        )}

                                        <div className="relative z-10" style={{ color: bannerForm.textColor || '#000000' }}>
                                            <h2 className="text-2xl font-bold leading-tight mb-2">{bannerForm.title || "Title"}</h2>
                                            <p className="text-xs opacity-80 mb-4">{bannerForm.subtitle || "Subtitle text..."}</p>
                                            <div
                                                className="inline-block px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm"
                                                style={{
                                                    backgroundColor: bannerForm.buttonColor || '#000000',
                                                    color: bannerForm.buttonTextColor || '#ffffff'
                                                }}
                                            >
                                                {bannerForm.ctaText || "Shop Now"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowBannerForm(true)}
                        className="w-full py-8 sm:py-12 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black hover:bg-gray-50 transition-all group active:scale-[0.99]"
                    >
                        <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-white group-hover:shadow-md transition-all">
                            <PlusIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                        <span className="font-bold text-base sm:text-lg">Add New Content Block</span>
                    </button>
                )}

                {/* Existing Banners Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map(b => (
                        <div key={b.id} className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                                <img src={b.image} alt={b.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                            <div className="p-4 sm:p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900 line-clamp-1 text-sm sm:text-base">{b.title}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${b.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {b.active ? 'Active' : 'Hidden'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-2 h-8 leading-relaxed">{b.subtitle}</p>
                                <div className="text-[10px] text-gray-400 mb-4 flex items-center gap-2">
                                    <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200 truncate max-w-[50%]">{b.ctaText || 'Shop Now'}</span>
                                    <span className="truncate flex-1">{b.link}</span>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => updateBanner(b.id, { active: !b.active })} className="flex-1 py-2 rounded-lg bg-gray-50 text-xs font-bold hover:bg-black hover:text-white transition-colors border border-gray-200 hover:border-black">
                                        {b.active ? 'Hide' : 'Show'}
                                    </button>
                                    <button onClick={() => handleEditBanner(b)} className="flex-1 py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors border border-blue-100 hover:border-blue-600">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDeleteBanner(b.id)} className="px-3 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-100 hover:border-red-500">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
