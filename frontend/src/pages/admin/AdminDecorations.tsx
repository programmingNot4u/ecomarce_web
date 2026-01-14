import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import type { CardStyle, ThemeConfig } from '../../context/ThemeContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
// Reuse the style from AdminTheme (inline for ensuring exact match as requested)
const showNotification = (message: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up font-medium flex items-center gap-2';
    notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        ${message}
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
};

const FONT_OPTIONS = [
    {
        label: "Modern Sans",
        options: [
            { label: "Outfit (Modern Clean)", value: "'Outfit', sans-serif" },
            { label: "Inter (Standard UI)", value: "'Inter', sans-serif" },
            { label: "Plus Jakarta (Geometric)", value: "'Plus Jakarta Sans', sans-serif" },
            { label: "Manrope (Grotesque)", value: "'Manrope', sans-serif" },
            { label: "DM Sans (Friendly)", value: "'DM Sans', sans-serif" },
        ]
    },
    {
        label: "Elegant Serif",
        options: [
            { label: "Playfair Display (Luxury)", value: "'Playfair Display', serif" },
            { label: "Cormorant Garamond (Classic)", value: "'Cormorant Garamond', serif" },
            { label: "DM Serif (Bold Editorial)", value: "'DM Serif Display', serif" },
        ]
    },
    {
        label: "Trendy Display",
        options: [
            { label: "Space Grotesk (Tech/Brutalist)", value: "'Space Grotesk', sans-serif" },
            { label: "Syne (Artistic)", value: "'Syne', sans-serif" },
        ]
    }
];

const FontSelector = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Find current label
    let currentLabel = value;
    for (const group of FONT_OPTIONS) {
        const found = group.options.find(opt => opt.value === value);
        if (found) {
            currentLabel = found.label;
            break;
        }
    }

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white rounded-lg border border-gray-200 text-sm py-2 px-3 focus:ring-1 focus:ring-black focus:border-black flex justify-between items-center text-left"
                style={{ fontFamily: value }}
            >
                <span className="truncate">{currentLabel}</span>
                <ChevronDownIcon className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {FONT_OPTIONS.map((group) => (
                        <div key={group.label} className="py-1">
                            <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-50/50">
                                {group.label}
                            </div>
                            {group.options.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${value === opt.value ? 'bg-gray-50 text-black' : 'text-gray-700'}`}
                                    style={{ fontFamily: opt.value }}
                                >
                                    <span>{opt.label}</span>
                                    {value === opt.value && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-black ml-2"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AdminDecorations = () => {
    const { theme, updateTheme, updateColors, resetTheme, saveThemeNow } = useTheme();
    const [logoUrl, setLogoUrl] = useState(theme.logo);
    const [activeTab, setActiveTab] = useState<'themes' | 'text'>('themes');
    const [isSaving, setIsSaving] = useState(false);

    // Sync local state when theme updates (e.g. reset or load)
    useEffect(() => {
        setLogoUrl(theme.logo);
    }, [theme.logo]);

    // Text Content State
    const { pages, updatePage, addPage } = useProducts();
    const [selectedPageSlug, setSelectedPageSlug] = useState<string>('about');
    const [pageContent, setPageContent] = useState('');

    // Load initial content when page changes
    useEffect(() => {
        const p = pages.find(page => page.slug === selectedPageSlug);
        if (p) {
            setPageContent(p.content);
        } else {
            setPageContent('');
        }
    }, [selectedPageSlug, pages]);

    const handlePageSave = async () => {
        const existingPage = pages.find(p => p.slug === selectedPageSlug);

        if (existingPage) {
            await updatePage(selectedPageSlug, pageContent);
            showNotification('Page content updated successfully!');
        } else {
            const titles: Record<string, string> = {
                about: 'About Us',
                terms: 'Terms of Service',
                privacy: 'Privacy Policy',
                shipping: 'Shipping Policy',
                returns: 'Returns Policy'
            };

            await addPage({
                title: titles[selectedPageSlug] || selectedPageSlug,
                slug: selectedPageSlug,
                content: pageContent
            });
            showNotification('Page created successfully!');
        }
    };

    const handleManualSave = async () => {
        setIsSaving(true);
        const success = await saveThemeNow();
        setIsSaving(false);
        if (success) {
            showNotification('Theme changes saved successfully!');
        } else {
            alert('Failed to save theme changes. Please try again.');
        }
    };

    const handleSnippetUpdate = (key: string, value: string) => {
        updateTheme({
            textSnippets: {
                ...theme.textSnippets,
                [key]: value
            }
        });
    };

    // Presets
    const applyPreset = (type: 'beauty' | 'genz' | 'electronics' | 'classic') => {
        let newTheme: Partial<ThemeConfig> = {};

        switch (type) {
            case 'beauty':
                newTheme = {
                    colors: {
                        primary: '#be185d', // Pink 700
                        secondary: '#fdf2f8', // Pink 50
                        accent: '#db2777',
                        background: '#ffffff',
                        text: '#831843'
                    },
                    cardStyle: 'minimal',
                    typography: {
                        headingFont: '"Playfair Display", serif',
                        bodyFont: '"Lato", sans-serif'
                    }
                };
                break;
            case 'genz':
                newTheme = {
                    colors: {
                        primary: '#7c3aed', // Violet
                        secondary: '#ddd6fe',
                        accent: '#10b981', // Emerald
                        background: '#fafafa',
                        text: '#111827'
                    },
                    cardStyle: 'border',
                    typography: {
                        headingFont: '"Space Grotesk", sans-serif',
                        bodyFont: '"Inter", sans-serif'
                    }
                };
                break;
            case 'electronics':
                newTheme = {
                    colors: {
                        primary: '#0f172a', // Slate 900
                        secondary: '#f1f5f9',
                        accent: '#3b82f6', // Blue 500
                        background: '#ffffff',
                        text: '#0f172a'
                    },
                    cardStyle: 'modern',
                    typography: {
                        headingFont: '"Inter", sans-serif',
                        bodyFont: '"Roboto", sans-serif'
                    }
                };
                break;
            case 'classic':
                newTheme = {
                    colors: {
                        primary: '#000000',
                        secondary: '#ffffff',
                        accent: '#d4af37', // Gold
                        background: '#ffffff',
                        text: '#1c1c1c'
                    },
                    cardStyle: 'glass',
                    typography: {
                        headingFont: '"Cinzel", serif',
                        bodyFont: '"Open Sans", sans-serif'
                    }
                };
                break;
        }
        updateTheme(newTheme);
    };

    const handleLogoSave = () => {
        updateTheme({ logo: logoUrl });
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-serif text-gray-900">Website Decorations</h1>
                    <p className="text-sm md:text-base text-gray-500 mt-1">Customize the look, feel, and content of your storefront.</p>
                </div>

                {/* Save & Reset Actions */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('themes')}
                            className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-shadow ${activeTab === 'themes' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Visual Theme
                        </button>
                        <button
                            onClick={() => setActiveTab('text')}
                            className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-shadow ${activeTab === 'text' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Text Content
                        </button>
                    </div>
                    <button
                        onClick={handleManualSave}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                    <button
                        onClick={resetTheme}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </div>

            {activeTab === 'themes' ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* Left Column: Controls */}
                    <div className="xl:col-span-1 space-y-6 md:space-y-8 order-2 xl:order-1">

                        {/* Presets */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Quick Themes</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => applyPreset('beauty')} className="p-3 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 hover:ring-2 ring-pink-500 transition-all text-sm font-medium">Beauty</button>
                                <button onClick={() => applyPreset('genz')} className="p-3 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 hover:ring-2 ring-violet-500 transition-all text-sm font-medium">Gen Z</button>
                                <button onClick={() => applyPreset('electronics')} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:ring-2 ring-slate-500 transition-all text-sm font-medium">Electronics</button>
                                <button onClick={() => applyPreset('classic')} className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 hover:ring-2 ring-amber-500 transition-all text-sm font-medium">Classic Luxury</button>
                            </div>
                        </div>

                        {/* Typography Settings */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Typography</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Heading Font', key: 'headingFont' },
                                    { label: 'Body Font', key: 'bodyFont' },
                                    { label: 'Product Card Font', key: 'cardFont' }
                                ].map((field) => (
                                    <FontSelector
                                        key={field.key}
                                        label={field.label}
                                        value={theme.typography[field.key as keyof typeof theme.typography] as string}
                                        onChange={(val) => updateTheme({ typography: { ...theme.typography, [field.key]: val } })}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Colors */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Brand Colors</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Primary Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={theme.colors.primary}
                                            onChange={(e) => updateColors({ primary: e.target.value })}
                                            className="h-9 w-9 rounded-lg border-0 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={theme.colors.primary}
                                            readOnly
                                            className="flex-1 rounded-lg border-gray-200 text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Accent Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={theme.colors.accent}
                                            onChange={(e) => updateColors({ accent: e.target.value })}
                                            className="h-9 w-9 rounded-lg border-0 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={theme.colors.accent}
                                            readOnly
                                            className="flex-1 rounded-lg border-gray-200 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Branding */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Branding</h3>

                            {/* Animation Toggle */}
                            <div className="mb-6 flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">Header Logo Animation</h4>
                                    <p className="text-xs text-gray-500">Enable scroll-based logo scaling and animation on homepage</p>
                                </div>
                                <button
                                    onClick={() => updateTheme({ enableLogoAnimation: !theme.enableLogoAnimation })}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${theme.enableLogoAnimation ? 'bg-black' : 'bg-gray-200'}`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme.enableLogoAnimation ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Main Logo (Navbar) */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-2">Main Site Logo (Navbar)</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={logoUrl}
                                            onChange={(e) => setLogoUrl(e.target.value)}
                                            className="flex-1 rounded-lg border-gray-200 text-sm"
                                            placeholder="https://..."
                                        />
                                        <button onClick={handleLogoSave} className="px-3 bg-black text-white rounded-lg text-sm">Set</button>
                                    </div>
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors text-center cursor-pointer group">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    try {
                                                        const res = await api.post('upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                        setLogoUrl(res.data.url);
                                                        updateTheme({ logo: res.data.url });
                                                    } catch (err: any) { alert(`Upload failed: ${err.message}`); }
                                                }
                                            }}
                                        />
                                        <div className="text-xs text-gray-400 group-hover:text-gray-600">Click to Upload Main Logo</div>
                                    </div>
                                    {logoUrl && logoUrl !== 'text' && (
                                        <div className="mt-2 bg-gray-100 p-2 rounded flex justify-center">
                                            <img src={logoUrl} alt="Logo Preview" className="h-8 object-contain" />
                                        </div>
                                    )}
                                </div>

                                {/* Footer Logo */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-2">Footer Logo</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={theme.footerLogo || ''}
                                            onChange={(e) => updateTheme({ footerLogo: e.target.value })}
                                            className="flex-1 rounded-lg border-gray-200 text-sm"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors text-center cursor-pointer group">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    try {
                                                        const res = await api.post('upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                        updateTheme({ footerLogo: res.data.url });
                                                    } catch (err: any) { alert(`Upload failed: ${err.message}`); }
                                                }
                                            }}
                                        />
                                        <div className="text-xs text-gray-400 group-hover:text-gray-600">Click to Upload Footer Logo</div>
                                    </div>
                                    {theme.footerLogo && (
                                        <div className="mt-2 bg-gray-100 p-2 rounded flex justify-center">
                                            <img src={theme.footerLogo} alt="Footer Logo Preview" className="h-8 object-contain" />
                                        </div>
                                    )}
                                </div>

                                {/* Admin Panel Logo */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-2">Admin Panel Logo</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={theme.adminLogo || ''}
                                            onChange={(e) => updateTheme({ adminLogo: e.target.value })}
                                            className="flex-1 rounded-lg border-gray-200 text-sm"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors text-center cursor-pointer group">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    try {
                                                        const res = await api.post('upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                        updateTheme({ adminLogo: res.data.url });
                                                    } catch (err: any) { alert(`Upload failed: ${err.message}`); }
                                                }
                                            }}
                                        />
                                        <div className="text-xs text-gray-400 group-hover:text-gray-600">Click to Upload Admin Logo</div>
                                    </div>
                                    {theme.adminLogo && (
                                        <div className="mt-2 bg-gray-800 p-2 rounded flex justify-center">
                                            <img src={theme.adminLogo} alt="Admin Logo Preview" className="h-8 object-contain" />
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="xl:col-span-2 order-1 xl:order-2">
                        <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                            <h3 className="font-semibold text-gray-400 mb-6 uppercase tracking-wider text-xs">Live Preview</h3>

                            {/* Preview Area */}
                            <div className="border border-dashed border-gray-200 rounded-xl p-4 md:p-8 bg-gray-50/50 min-h-[400px] md:min-h-[500px]" style={{ fontFamily: theme.typography.bodyFont }}>

                                {/* Fake Header */}
                                <div className="flex justify-between items-center mb-12 border-b border-gray-100 pb-4">
                                    {theme.logo && theme.logo !== 'text' ? (
                                        <img
                                            src={theme.logo}
                                            alt="Logo"
                                            className="h-8 object-contain"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.onerror = null;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <span className="text-xl font-bold tracking-tight" style={{ color: theme.colors.text }}>Store Name</span>
                                    )}
                                    <div className="hidden md:flex gap-6 text-sm font-medium" style={{ color: theme.colors.text }}>
                                        <span>Home</span>
                                        <span>Shop</span>
                                        <span>About</span>
                                    </div>
                                    <div className="md:hidden">
                                        <div className="w-6 h-0.5 bg-gray-800 mb-1"></div>
                                        <div className="w-6 h-0.5 bg-gray-800 mb-1"></div>
                                        <div className="w-6 h-0.5 bg-gray-800"></div>
                                    </div>
                                </div>

                                {/* Card Style Selector (Inside Preview for context) */}
                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-500 mb-3">Product Card Style</label>
                                    <div className="flex flex-wrap gap-2 md:gap-4">
                                        {(['minimal', 'modern', 'glass', 'border'] as CardStyle[]).map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => updateTheme({ cardStyle: style })}
                                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm capitalize transition-all ${theme.cardStyle === style ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-black'}`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sample Product Card */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto">
                                    {/* Card Construction based on Theme */}
                                    <div
                                        className={`group relative bg-white overflow-hidden transition-all duration-300
                                            ${theme.cardStyle === 'minimal' ? '' : ''}
                                            ${theme.cardStyle === 'modern' ? 'shadow-xl rounded-2xl' : ''}
                                            ${theme.cardStyle === 'border' ? 'border-2 border-black rounded-none p-4' : ''}
                                            ${theme.cardStyle === 'glass' ? 'backdrop-blur-md bg-white/40 border border-white/20 shadow-lg rounded-xl' : ''}
                                        `}
                                    >
                                        <div className={`aspect-[3/4] bg-gray-100 relative mb-4 overflow-hidden ${theme.cardStyle === 'modern' ? 'rounded-xl m-2' : ''}`}>
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-300">Product Image</div>
                                            {theme.cardStyle === 'modern' && (
                                                <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm">
                                                    <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className={`${theme.cardStyle === 'modern' ? 'px-4 pb-4' : ''}`}>
                                            <h4 className="font-medium text-lg mb-1" style={{ fontFamily: theme.typography.headingFont, color: theme.colors.text }}>Elegant Product</h4>
                                            <p className="text-gray-500 text-sm mb-3">Category Name</p>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold" style={{ color: theme.colors.text }}>$120.00</span>
                                                <button
                                                    className="px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                                                    style={{
                                                        backgroundColor: theme.colors.primary,
                                                        borderRadius: theme.cardStyle === 'rounded' || theme.cardStyle === 'modern' ? '0.5rem' : '0'
                                                    }}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Typography Preview */}
                                <div className="mt-12 text-center">
                                    <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: theme.typography.headingFont, color: theme.colors.text }}>
                                        Heading Font Preview
                                    </h1>
                                    <p className="max-w-md mx-auto leading-relaxed opacity-80 text-sm md:text-base" style={{ fontFamily: theme.typography.bodyFont, color: theme.colors.text }}>
                                        This is the body text preview. It demonstrates how your chosen typography settings will look with the rest of the theme.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Page Content Editor */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900">Page Content</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Page</label>
                                    <select
                                        value={selectedPageSlug}
                                        onChange={(e) => setSelectedPageSlug(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 py-2.5"
                                    >
                                        <option value="about">About Us</option>
                                        <option value="terms">Terms of Service</option>
                                        <option value="privacy">Privacy Policy</option>
                                        <option value="shipping">Shipping Policy</option>
                                        <option value="returns">Returns Policy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML allowed)</label>
                                    <textarea
                                        value={pageContent}
                                        onChange={(e) => setPageContent(e.target.value)}
                                        rows={20}
                                        className="w-full rounded-lg border-gray-300 font-mono text-sm"
                                        placeholder="<p>Enter your page content here...</p>"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handlePageSave}
                                        className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                                    >
                                        Save Page Content
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Static Text Snippets */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-6">Contact Information</h3>
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Phone Number</label>
                                        <input
                                            type="text"
                                            value={theme.textSnippets?.contact_phone || ''}
                                            onChange={(e) => handleSnippetUpdate('contact_phone', e.target.value)}
                                            className="w-full rounded-lg border-gray-200 text-sm py-3 px-4 shadow-sm border focus:ring-black focus:border-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Email Address</label>
                                        <input
                                            type="text"
                                            value={theme.textSnippets?.contact_email || ''}
                                            onChange={(e) => handleSnippetUpdate('contact_email', e.target.value)}
                                            className="w-full rounded-lg border-gray-200 text-sm py-3 px-4 shadow-sm border focus:ring-black focus:border-black"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">WhatsApp Number</label>
                                        <input
                                            type="text"
                                            value={theme.textSnippets?.contact_whatsapp || ''}
                                            onChange={(e) => handleSnippetUpdate('contact_whatsapp', e.target.value)}
                                            className="w-full rounded-lg border-gray-200 text-sm py-3 px-4 shadow-sm border focus:ring-black focus:border-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Messenger ID/Link</label>
                                        <input
                                            type="text"
                                            value={theme.textSnippets?.contact_messenger || ''}
                                            onChange={(e) => handleSnippetUpdate('contact_messenger', e.target.value)}
                                            className="w-full rounded-lg border-gray-200 text-sm py-3 px-4 shadow-sm border focus:ring-black focus:border-black"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Physical Address</label>
                                    <textarea
                                        rows={2}
                                        value={theme.textSnippets?.contact_address || ''}
                                        onChange={(e) => handleSnippetUpdate('contact_address', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 text-sm py-3 px-4 shadow-sm border focus:ring-black focus:border-black"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-6">Social Links</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Facebook Link</label>
                                    <input
                                        type="text"
                                        value={theme.textSnippets?.social_facebook || ''}
                                        onChange={(e) => handleSnippetUpdate('social_facebook', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 text-sm py-3 px-4 shadow-sm border focus:ring-black focus:border-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Instagram Link</label>
                                    <input
                                        type="text"
                                        value={theme.textSnippets?.social_instagram || ''}
                                        onChange={(e) => handleSnippetUpdate('social_instagram', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 text-sm py-3 px-4 shadow-sm border focus:ring-black focus:border-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">YouTube Link</label>
                                    <input
                                        type="text"
                                        value={theme.textSnippets?.social_youtube || ''}
                                        onChange={(e) => handleSnippetUpdate('social_youtube', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 text-sm py-3 px-4 shadow-sm border focus:ring-black focus:border-black"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-6">Site Text Snippets</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Footer Copyright Text</label>
                                    <input
                                        type="text"
                                        value={theme.textSnippets?.footer_copyright || ''}
                                        onChange={(e) => handleSnippetUpdate('footer_copyright', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 text-sm py-3 px-4 shadow-sm border focus:ring-black focus:border-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Header Help Text</label>
                                    <input
                                        type="text"
                                        value={theme.textSnippets?.header_help_text || ''}
                                        onChange={(e) => handleSnippetUpdate('header_help_text', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 text-sm py-3 px-4 shadow-sm border focus:ring-black focus:border-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">"Need Help?" Section Title</label>
                                    <input
                                        type="text"
                                        value={theme.textSnippets?.help_section_title || ''}
                                        onChange={(e) => handleSnippetUpdate('help_section_title', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 text-sm py-3 px-4 shadow-sm border focus:ring-black focus:border-black"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

        </div >
    );
};

export default AdminDecorations;
