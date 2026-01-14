import { ArrowDownIcon, ArrowUpIcon, ComputerDesktopIcon, EyeIcon, EyeSlashIcon, PlusIcon, ShoppingBagIcon, SparklesIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useProducts } from '../../context/ProductContext'; // Added import
import type { HomeSection } from '../../context/ThemeContext';
import { useTheme } from '../../context/ThemeContext';

import { LinkIcon, PhotoIcon } from '@heroicons/react/24/outline'; // Added icons

const CategoryRow = ({
    category,
    isSelected,
    onToggle,
    onUpdateImage
}: {
    category: any,
    isSelected: boolean,
    onToggle: (checked: boolean) => void,
    onUpdateImage: (img: string | File) => void
}) => {
    const [mode, setMode] = useState<'upload' | 'url'>('upload');
    const [url, setUrl] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Use preview image if set, otherwise use category.image
    const displayImage = previewImage || category.image;

    const handleUrlSubmit = () => {
        if (url) {
            setPreviewImage(url); // Update preview immediately
            onUpdateImage(url);
            setUrl(''); // Clear input after submitting
        }
    };

    const handleFileChange = (file: File) => {
        // Create a preview URL for the file
        const filePreview = URL.createObjectURL(file);
        setPreviewImage(filePreview);
        onUpdateImage(file);
    };

    return (
        <div className={`border rounded-xl transition-all duration-200 ${isSelected ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <div className="p-3 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-black border-black text-white' : 'bg-white border-gray-300'}`}>
                        {isSelected && <svg className="w-3.5 h-3.5" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 9L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onToggle(e.target.checked)}
                        className="hidden"
                    />
                    <span className={`font-bold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{category.name}</span>
                </label>

                <div className="flex items-center gap-3">
                    {displayImage ? (
                        <div className="relative group">
                            <img src={displayImage} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-200 shadow-sm" />
                            <div className="absolute inset-0 bg-black/10 rounded-lg" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                            <PhotoIcon className="w-4 h-4 text-gray-400" />
                        </div>
                    )}
                </div>
            </div>

            {isSelected && (
                <div className="px-3 pb-3 pt-0 animate-in slide-in-from-top-1 fade-in duration-200">
                    <div className="border-t border-gray-200 pt-3 mt-1">
                        <div className="flex gap-1 bg-gray-200 p-1 rounded-lg w-max mb-3">
                            <button
                                onClick={() => setMode('upload')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${mode === 'upload' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Upload
                            </button>
                            <button
                                onClick={() => setMode('url')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${mode === 'url' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Enter URL
                            </button>
                        </div>

                        {mode === 'upload' ? (
                            <div className="relative">
                                <input
                                    type="file"
                                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            handleFileChange(e.target.files[0]);
                                        }
                                    }}
                                />
                                <p className="text-[10px] text-gray-400 mt-2 px-1">Supports JPG, PNG, WEBP</p>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LinkIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="https://example.com/image.jpg"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="pl-9 block w-full rounded-lg border-gray-300 bg-white text-xs py-2 focus:ring-black focus:border-black border"
                                        onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                                    />
                                </div>
                                <button
                                    onClick={handleUrlSubmit}
                                    className="px-3 py-1 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800"
                                >
                                    Set
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};



const AdminTheme = () => {
    const { theme, updateTheme, saveThemeNow } = useTheme();
    const { categories, products, updateCategory } = useProducts(); // Added useProducts hook
    const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'branding'>('home'); // Modified activeTab state

    // Home Page Builder Handlers ---------------------------
    const moveSection = (index: number, direction: 'up' | 'down') => {
        if (!theme.homeSections) return;
        const newSections = [...theme.homeSections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newSections.length) {
            [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
            updateTheme({ homeSections: newSections });
        }
    };

    const removeSection = (id: string) => {
        if (!theme.homeSections) return;
        if (!confirm('Are you sure you want to remove this section?')) return;
        updateTheme({
            homeSections: theme.homeSections.filter(s => s.id !== id)
        });
    };

    const toggleVisibility = (id: string) => {
        if (!theme.homeSections) return;
        const updatedSections = theme.homeSections.map(s =>
            s.id === id ? { ...s, visible: s.visible === undefined ? false : !s.visible } : s
        );
        updateTheme({ homeSections: updatedSections });
    };

    const addSection = (type: HomeSection['type']) => {
        const newId = `${type}-${Date.now()}`;
        const newSection: HomeSection = {
            id: newId,
            type,
            visible: true,
            content: {},
            style: { padding: 'py-16' }
        };

        // Defaults per type
        if (type === 'text') {
            newSection.content = { title: 'New Text Section', text: 'Edit this text in the admin panel.' };
            newSection.style = { ...newSection.style, backgroundColor: 'bg-gray-50' };
        } else if (type === 'products') {
            newSection.content = { title: 'New Product Grid', count: 8 };
        } else if (type === 'marquee') {
            newSection.content = { text: 'SCROLLING TEXT HERE' };
            newSection.style = { ...newSection.style, backgroundColor: 'bg-black', textColor: 'text-white' };
        }

        updateTheme({
            homeSections: [...(theme.homeSections || []), newSection]
        });
    };

    // Other Layout Handlers ---------------------------
    const handleLayoutChange = (page: 'shop', layout: string) => {
        updateTheme({
            layouts: {
                ...theme.layouts,
                [page]: layout
            }
        });
    };

    const handleProductPageUpdate = (key: keyof typeof theme.productPage, value: any) => {
        updateTheme({
            productPage: {
                ...theme.productPage,
                [key]: value
            }
        });
    };

    const handleSave = async () => {
        const success = await saveThemeNow();
        if (success) {
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up font-medium flex items-center gap-2';
            notification.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Changes Saved Successfully
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.remove();
            }, 3000);
        } else {
            alert('Failed to save changes. Please try again.');
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure? This will delete all layout customization and restore defaults.')) {
            // Hard reset local storage
            localStorage.removeItem('site_theme_config');
            window.location.reload(); // Force reload to pick up code defaults
        }
    };

    // Editing Logic ---------------------------
    const [editingSection, setEditingSection] = useState<HomeSection | null>(null);

    const openEditModal = (section: HomeSection) => {
        setEditingSection({ ...section }); // Clone to avoid direct mutation
    };

    const saveEditedSection = () => {
        if (!editingSection || !theme.homeSections) return;
        const updatedSections = theme.homeSections.map(s => s.id === editingSection.id ? editingSection : s);
        updateTheme({ homeSections: updatedSections });
        setEditingSection(null);
    };

    const updateEditField = (field: 'content' | 'style' | 'settings', key: string, value: any) => {
        if (!editingSection) return;
        setEditingSection({
            ...editingSection,
            [field]: {
                ...editingSection[field],
                [key]: value
            }
        });
    };



    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {/* Edit Modal Overlay */}
            {editingSection && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 transition-all duration-300">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full h-[85vh] sm:h-auto sm:max-h-[85vh] sm:max-w-lg overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in duration-300 flex flex-col">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                            <div>
                                <h3 className="font-bold text-lg capitalize">{editingSection.type.replace('_', ' ')} Settings</h3>
                                <p className="text-xs text-gray-400 font-mono">{editingSection.id}</p>
                            </div>
                            <button onClick={() => setEditingSection(null)} className="text-gray-400 hover:text-black p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
                            {/* Dynamic Fields based on Type */}

                            {/* Hero Section Fields */}
                            {editingSection.type === 'hero' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <h4 className="text-sm font-bold text-gray-900 mb-2">Mobile Layout Control</h4>
                                        <p className="text-xs text-gray-500 mb-3">Control how the 4 promo grids are displayed on mobile devices.</p>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-gray-500">Grid Configuration</label>
                                            <select
                                                value={editingSection.settings?.mobileLayout || 'grid-1'}
                                                onChange={(e) => updateEditField('settings', 'mobileLayout', e.target.value)}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                                            >
                                                <option value="grid-1">Stacked (1 Column) - Default</option>
                                                <option value="grid-2">Grid (2 Columns)</option>
                                                <option value="mixed">Mixed (2 Cols Top, 1 Col Bottom)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Text Section Fields */}
                            {editingSection.type === 'text' && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Title</label>
                                        <input
                                            type="text"
                                            value={editingSection.content?.title || ''}
                                            onChange={(e) => updateEditField('content', 'title', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Body Text</label>
                                        <textarea
                                            rows={4}
                                            value={editingSection.content?.text || ''}
                                            onChange={(e) => updateEditField('content', 'text', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-gray-500">Link Text</label>
                                            <input
                                                type="text"
                                                value={editingSection.content.linkText || ''}
                                                onChange={(e) => updateEditField('content', 'linkText', e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-gray-500">Link URL</label>
                                            <input
                                                type="text"
                                                value={editingSection.content.linkUrl || ''}
                                                onChange={(e) => updateEditField('content', 'linkUrl', e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Category Section Fields (Shared for both Standard and KCBazar) */}
                            {(editingSection.type === 'category' || editingSection.type === 'kcbazar_category') && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Section Title</label>
                                        <input
                                            type="text"
                                            value={editingSection.content?.title || ''}
                                            onChange={(e) => updateEditField('content', 'title', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Select Categories (IDs)</label>
                                        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                                            {categories.map(cat => (
                                                <CategoryRow
                                                    key={cat.id}
                                                    category={cat}
                                                    isSelected={editingSection.content?.categoryIds?.includes(cat.id) || false}
                                                    onToggle={(checked) => {
                                                        const current = editingSection.content?.categoryIds || [];
                                                        let next;
                                                        if (checked) next = [...current, cat.id];
                                                        else next = current.filter((id: string) => id !== cat.id);
                                                        updateEditField('content', 'categoryIds', next);
                                                    }}
                                                    onUpdateImage={(img) => {
                                                        if (img instanceof File) {
                                                            const fd = new FormData();
                                                            fd.append('image', img);
                                                            fd.append('name', cat.name); // Include required field
                                                            updateCategory(cat.id, fd);
                                                        } else {
                                                            updateCategory(cat.id, { image: img, name: cat.name } as any); // Include required field
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Product Section Fields */}
                            {editingSection.type === 'products' && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Section Title</label>
                                        <input
                                            type="text"
                                            value={editingSection.content?.title || ''}
                                            onChange={(e) => updateEditField('content', 'title', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Selection Mode</label>
                                        <select
                                            value={editingSection.content?.mode || 'latest'}
                                            onChange={(e) => updateEditField('content', 'mode', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                        >
                                            <option value="latest">Latest Products (Auto)</option>
                                            <option value="manual">Select Manually</option>
                                        </select>
                                    </div>

                                    {editingSection.content?.mode === 'manual' && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-gray-500">Select Products</label>
                                            <div className="h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1 bg-white">
                                                {products.map(p => (
                                                    <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer border-b border-gray-50 last:border-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={editingSection.content?.productIds?.includes(p.id) || false}
                                                            onChange={(e) => {
                                                                const current = editingSection.content?.productIds || [];
                                                                let next;
                                                                if (e.target.checked) next = [...current, p.id];
                                                                else next = current.filter((id: string) => id !== p.id);
                                                                updateEditField('content', 'productIds', next);
                                                            }}
                                                            className="rounded text-black focus:ring-black h-4 w-4"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            {p.images && p.images[0] && (
                                                                <img src={p.images[0]} alt="" className="w-8 h-8 object-cover rounded bg-gray-100" />
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</span>
                                                                <span className="text-xs text-gray-500">৳{p.price}</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(!editingSection.content?.mode || editingSection.content?.mode === 'latest') && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-gray-500">Product Count</label>
                                            <input
                                                type="number"
                                                min={4} max={20} step={4}
                                                value={editingSection.content?.count || 8}
                                                onChange={(e) => updateEditField('content', 'count', parseInt(e.target.value))}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                            />
                                        </div>
                                    )}
                                    <div className="pt-4 border-t border-gray-100 space-y-3">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={editingSection.content?.showViewAll || false}
                                                onChange={(e) => updateEditField('content', 'showViewAll', e.target.checked)}
                                                className="rounded text-black focus:ring-black h-5 w-5"
                                            />
                                            <span className="text-sm font-bold text-gray-700">Show "View All" Button</span>
                                        </label>
                                        {editingSection.content?.showViewAll && (
                                            <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                                                <label className="text-xs font-bold uppercase text-gray-500">Link URL</label>
                                                <input
                                                    type="text"
                                                    value={editingSection.content?.viewAllLink || '/shop'}
                                                    onChange={(e) => updateEditField('content', 'viewAllLink', e.target.value)}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Marquee Section Fields */}
                            {/* Marquee Section Fields */}
                            {editingSection.type === 'marquee' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Marquee Text</label>
                                    <input
                                        type="text"
                                        value={editingSection.content?.text || ''}
                                        onChange={(e) => updateEditField('content', 'text', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                    />
                                </div>
                            )}

                            {/* Shipping Section Fields */}
                            {(editingSection.type === 'shipping') && (
                                <>
                                    {/* ... existing shipping fields ... */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Title</label>
                                        <input
                                            type="text"
                                            value={editingSection.content?.title || ''}
                                            onChange={(e) => updateEditField('content', 'title', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Body Text</label>
                                        <textarea
                                            rows={3}
                                            value={editingSection.content?.text || ''}
                                            onChange={(e) => updateEditField('content', 'text', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Phone Number</label>
                                        <input
                                            type="text"
                                            value={editingSection.content?.phone || ''}
                                            onChange={(e) => updateEditField('content', 'phone', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Image URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            value={editingSection.content?.image || ''}
                                            onChange={(e) => updateEditField('content', 'image', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                        />
                                        <p className="text-[10px] text-gray-400">Leave empty to use default image.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Layout</label>
                                        <select
                                            value={editingSection.content.layout || 'image_right'}
                                            onChange={(e) => updateEditField('content', 'layout', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                        >
                                            <option value="image_right">Image Right (Default)</option>
                                            <option value="image_left">Image Left</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* KCBazar Ads Section Fields */}
                            {editingSection.type === 'kcbazar_ads' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase text-gray-500">Ad Banners</label>
                                        <button
                                            onClick={() => {
                                                const currentAds = editingSection.content?.ads || [];
                                                const newAd = { id: Date.now().toString(), image: '', link: '' };
                                                updateEditField('content', 'ads', [...currentAds, newAd]);
                                            }}
                                            className="text-xs font-bold text-black border border-black px-2 py-1 rounded hover:bg-black hover:text-white transition-colors"
                                        >
                                            + Add Banner
                                        </button>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Layout Style</label>
                                        <select
                                            value={editingSection.content?.layout || 'grid-3'}
                                            onChange={(e) => updateEditField('content', 'layout', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                        >
                                            <option value="grid-3">Standard Grid (3 Columns)</option>
                                            <option value="mosaic-left">Mosaic (Large Left)</option>
                                            <option value="mosaic-right">Mosaic (Large Right)</option>
                                            <option value="split-2">Split (2 Columns)</option>
                                            <option value="full">Full Width (1 Column)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {(editingSection.content?.ads || []).map((ad: any, index: number) => (
                                            <div key={ad.id || index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2 relative group">
                                                <button
                                                    onClick={() => {
                                                        const currentAds = editingSection.content?.ads || [];
                                                        const nextAds = currentAds.filter((_: any, i: number) => i !== index);
                                                        updateEditField('content', 'ads', nextAds);
                                                    }}
                                                    className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove Banner"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold uppercase text-gray-400">Image URL</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={ad.image || ''}
                                                            onChange={(e) => {
                                                                const currentAds = [...(editingSection.content?.ads || [])];
                                                                currentAds[index] = { ...currentAds[index], image: e.target.value };
                                                                updateEditField('content', 'ads', currentAds);
                                                            }}
                                                            placeholder="https://..."
                                                            className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded text-sm"
                                                        />
                                                        {ad.image && <img src={ad.image} alt="" className="w-8 h-8 object-cover rounded bg-gray-200" />}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold uppercase text-gray-400">Link URL</label>
                                                    <input
                                                        type="text"
                                                        value={ad.link || ''}
                                                        onChange={(e) => {
                                                            const currentAds = [...(editingSection.content?.ads || [])];
                                                            currentAds[index] = { ...currentAds[index], link: e.target.value };
                                                            updateEditField('content', 'ads', currentAds);
                                                        }}
                                                        placeholder="/shop"
                                                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {(!editingSection.content?.ads || editingSection.content.ads.length === 0) && (
                                            <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                                                No banners added yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Common Style Fields */}
                            <div className="pt-6 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 mb-4">Appearance</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Background Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={editingSection.style?.backgroundColor?.startsWith('#') ? editingSection.style.backgroundColor : '#ffffff'}
                                                onChange={(e) => updateEditField('style', 'backgroundColor', e.target.value)}
                                                className="h-10 w-10 p-1 rounded border border-gray-200 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                placeholder="e.g. bg-gray-50"
                                                value={editingSection.style?.backgroundColor || ''}
                                                onChange={(e) => updateEditField('style', 'backgroundColor', e.target.value)}
                                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Text Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={editingSection.style?.textColor?.startsWith('#') ? editingSection.style.textColor : '#000000'}
                                                onChange={(e) => updateEditField('style', 'textColor', e.target.value)}
                                                className="h-10 w-10 p-1 rounded border border-gray-200 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                placeholder="e.g. text-white"
                                                value={editingSection.style?.textColor || ''}
                                                onChange={(e) => updateEditField('style', 'textColor', e.target.value)}
                                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-gray-500">Padding</label>
                                        <select
                                            value={editingSection.style?.padding || 'py-16'}
                                            onChange={(e) => updateEditField('style', 'padding', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                        >
                                            <option value="py-0">None (py-0)</option>
                                            <option value="py-4">Small (py-4)</option>
                                            <option value="py-8">Medium (py-8)</option>
                                            <option value="py-16">Large (py-16)</option>
                                            <option value="py-24">Extra Large (py-24)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingSection(null)}
                                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEditedSection}
                                className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-gray-900">Theme Settings</h1>
                        <p className="text-gray-500 mt-2">Configure independent page layouts.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Reset Defaults
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar / Tabs */}
                <div className="w-full md:w-64 flex-shrink-0 flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <button
                        onClick={() => setActiveTab('home')}
                        className={`md:w-full flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-full md:rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'home' ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 md:border-transparent'}`}
                    >
                        <ComputerDesktopIcon className="w-5 h-5" />
                        Home Page
                    </button>
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={`md:w-full flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-full md:rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'shop' ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 md:border-transparent'}`}
                    >
                        <ShoppingBagIcon className="w-5 h-5" />
                        Shop Page
                    </button>
                    <button
                        onClick={() => setActiveTab('product')}
                        className={`md:w-full flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-full md:rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'product' ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 md:border-transparent'}`}
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Product Details
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm min-h-[500px]">

                    {activeTab === 'home' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Home Page Builder</h2>
                                    <p className="text-gray-500 text-sm">Drag and drop sections to rearrange your home page.</p>
                                </div>
                                <div className="relative group">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                                        <PlusIcon className="w-4 h-4" /> Add Section
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 hidden group-hover:block z-10 py-2 h-64 overflow-y-auto">
                                        {['hero', 'products', 'category', 'kcbazar_category', 'kcbazar_ads', 'text', 'marquee', 'brands', 'shipping', 'flash_sale', 'bundle', 'loyalty'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => addSection(type as HomeSection['type'])}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize"
                                            >
                                                {type.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sections List */}
                            <div className="space-y-3 mt-6">
                                {theme.homeSections?.length === 0 && (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        <p className="text-gray-500">No sections added. Add one to get started.</p>
                                    </div>
                                )}

                                {theme.homeSections?.map((section, index) => (
                                    <div key={section.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group">
                                        {/* Content Header (Index + Text) */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="p-2 bg-gray-100 rounded-lg text-gray-400 cursor-move flex-shrink-0">
                                                <span className="font-mono text-xs">{index + 1}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-bold text-gray-900 capitalize truncate text-sm">{section.type.replace('_', ' ')}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono hidden sm:inline">{section.id}</span>
                                                </div>
                                                {(section.content?.title || section.content?.text) ? (
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {section.content?.title || section.content?.text}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-400 italic">No content configured</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions Toolbar */}
                                        <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 mt-1 sm:mt-0">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => toggleVisibility(section.id)}
                                                    className={`p-2 rounded-full ${section.visible === false ? 'text-gray-400 bg-gray-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}
                                                    title={section.visible === false ? "Show Section" : "Hide Section"}
                                                >
                                                    {section.visible === false ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(section)}
                                                    className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full bg-gray-50 sm:bg-transparent"
                                                    title="Edit Settings"
                                                >
                                                    <SparklesIcon className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="w-px h-6 bg-gray-200 hidden sm:block mx-1" />

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => moveSection(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:hover:bg-transparent"
                                                    title="Move Up"
                                                >
                                                    <ArrowUpIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => moveSection(index, 'down')}
                                                    disabled={index === (theme.homeSections?.length || 0) - 1}
                                                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:hover:bg-transparent"
                                                    title="Move Down"
                                                >
                                                    <ArrowDownIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => removeSection(section.id)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full ml-1"
                                                    title="Remove"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'shop' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Shop Page Layout</h2>
                            <p className="text-gray-500 text-sm">Control how products are displayed in the catalog.</p>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                {['grid-4', 'grid-3', 'list', 'sidebar'].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleLayoutChange('shop', opt)}
                                        className={`p-4 border rounded-xl text-center capitalize transition-all ${theme.layouts.shop === opt ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                                    >
                                        {opt.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'product' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Product Details Layout</h2>
                            <p className="text-gray-500 text-sm">Choose the arrangement of the product gallery and info.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                <button
                                    onClick={() => handleProductPageUpdate('layout', 'classic')}
                                    className={`p-6 border-2 rounded-xl flex flex-col items-center gap-4 transition-all ${theme.productPage.layout === 'classic' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
                                >
                                    <div className="flex gap-2 w-full h-24">
                                        <div className="w-1/2 bg-gray-200 rounded"></div>
                                        <div className="w-1/2 bg-gray-200 rounded flex flex-col gap-1 p-1">
                                            <div className="h-2 bg-gray-300 w-3/4"></div>
                                            <div className="h-2 bg-gray-300 w-full"></div>
                                        </div>
                                    </div>
                                    <span className="font-medium">Split (Default)</span>
                                </button>
                                <button
                                    onClick={() => handleProductPageUpdate('layout', 'modern_centered')}
                                    className={`p-6 border-2 rounded-xl flex flex-col items-center gap-4 transition-all ${theme.productPage.layout === 'modern_centered' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
                                >
                                    <div className="flex flex-col gap-2 w-full h-24 items-center">
                                        <div className="w-1/2 h-16 bg-gray-200 rounded"></div>
                                        <div className="h-2 bg-gray-300 w-3/4"></div>
                                    </div>
                                    <span className="font-medium">Centered</span>
                                </button>
                                <button
                                    onClick={() => handleProductPageUpdate('layout', 'immersive')}
                                    className={`p-6 border-2 rounded-xl flex flex-col items-center gap-4 transition-all ${theme.productPage.layout === 'immersive' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
                                >
                                    <div className="w-full h-24 flex flex-col gap-1">
                                        <div className="w-full h-16 bg-gray-200 rounded"></div>
                                        <div className="flex gap-2">
                                            <div className="w-full h-2 bg-gray-300"></div>
                                        </div>
                                    </div>
                                    <span className="font-medium">Full Width</span>
                                </button>
                            </div>

                            <div className="mt-8 border-t border-gray-100 pt-8 space-y-4">
                                <h3 className="font-bold text-gray-900">Components Visibility</h3>

                                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <span className="font-medium text-gray-700">Show Related Products</span>
                                    <input
                                        type="checkbox"
                                        checked={theme.productPage.showRelatedProducts}
                                        onChange={(e) => handleProductPageUpdate('showRelatedProducts', e.target.checked)}
                                        className="rounded text-black focus:ring-black h-5 w-5"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <span className="font-medium text-gray-700">Show "You May Also Like"</span>
                                    <input
                                        type="checkbox"
                                        checked={theme.productPage.showYouMayLike}
                                        onChange={(e) => handleProductPageUpdate('showYouMayLike', e.target.checked)}
                                        className="rounded text-black focus:ring-black h-5 w-5"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <span className="font-medium text-gray-700">Show Breadcrumbs</span>
                                    <input
                                        type="checkbox"
                                        checked={theme.productPage.showBreadcrumbs}
                                        onChange={(e) => handleProductPageUpdate('showBreadcrumbs', e.target.checked)}
                                        className="rounded text-black focus:ring-black h-5 w-5"
                                    />
                                </label>
                            </div>

                            <div className="mt-8 border-t border-gray-100 pt-8 space-y-4">
                                <h3 className="font-bold text-gray-900">Gallery Style</h3>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleProductPageUpdate('galleryStyle', 'slider')}
                                        className={`px-4 py-2 border rounded-lg ${theme.productPage.galleryStyle === 'slider' ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
                                    >
                                        Slider (Default)
                                    </button>
                                    <button
                                        onClick={() => handleProductPageUpdate('galleryStyle', 'grid')}
                                        className={`px-4 py-2 border rounded-lg ${theme.productPage.galleryStyle === 'grid' ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
                                    >
                                        Grid View
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminTheme;
