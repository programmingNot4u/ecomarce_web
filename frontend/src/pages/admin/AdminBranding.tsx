import { PaintBrushIcon, PhotoIcon, SwatchIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const AdminBranding = () => {
    const { theme, updateTheme, updateColors, resetTheme } = useTheme();
    const [logoUrl, setLogoUrl] = useState(theme.logo);

    const handleLogoSave = () => {
        updateTheme({ logo: logoUrl });
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
             <div className="mb-8 flex justify-between items-center">
                <div>
                     <h1 className="text-3xl font-bold font-serif text-gray-900">Branding & Decorations</h1>
                     <p className="text-gray-500 mt-2">Manage your visual identity and aesthetic details.</p>
                </div>
                <button 
                    onClick={resetTheme}
                    className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                    Reset Defaults
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Identity Column */}
                <div className="space-y-8">
                     {/* Logo Section */}
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <PhotoIcon className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-gray-900">Brand Assets</h3>
                        </div>
                        <div className="space-y-6">
                            {/* Logo Upload */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">Logo Image</label>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 800 * 1024) { // 800KB limit
                                                            alert("File too large. Please upload an image under 800KB.");
                                                            return;
                                                        }
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            const base64 = reader.result as string;
                                                            setLogoUrl(base64);
                                                            updateTheme({ logo: base64 });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-lg file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-black file:text-white
                                                    file:cursor-pointer hover:file:bg-gray-800"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* URL Fallback */}
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="w-full border-t border-gray-200" />
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-white px-2 text-xs text-gray-400 uppercase">Or use URL</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={logoUrl} 
                                            onChange={(e) => setLogoUrl(e.target.value)} 
                                            className="flex-1 rounded-lg border-gray-200 text-sm"
                                            placeholder="https://..."
                                        />
                                        <button 
                                            onClick={handleLogoSave}
                                            className="px-4 bg-gray-100 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-200"
                                        >
                                            Save URL
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Recommended size: 200x50px transparent PNG. Max 800KB.</p>
                            </div>
                            
                            {/* Preview */}
                            <div className="p-6 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-200 min-h-[100px]">
                                {(logoUrl && logoUrl !== 'text') ? (
                                    <img 
                                        src={logoUrl} 
                                        alt="Logo Preview" 
                                        className="h-12 object-contain"
                                        onError={(e) => (e.currentTarget.style.display = 'none')} 
                                    />
                                ) : (
                                    <span className="text-sm text-gray-400 italic">No logo image set. Using text logo.</span>
                                )}
                            </div>

                            {/* Animation Toggle */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">Logo Animation</span>
                                    <span className="text-xs text-gray-500">Animate logo on homepage scroll</span>
                                </div>
                                <button
                                    role="switch"
                                    aria-checked={theme.enableLogoAnimation}
                                    onClick={() => updateTheme({ enableLogoAnimation: !theme.enableLogoAnimation })}
                                    className={`${
                                        theme.enableLogoAnimation ? 'bg-black' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`${
                                            theme.enableLogoAnimation ? 'translate-x-5' : 'translate-x-0'
                                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                    />
                                </button>
                            </div>
                        </div>
                     </div>

                     {/* Colors Section */}
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <SwatchIcon className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-gray-900">Color Palette</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Primary</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color" 
                                            value={theme.colors.primary} 
                                            onChange={(e) => updateColors({ primary: e.target.value })} 
                                            className="h-10 w-10 rounded-lg border-0 cursor-pointer p-0 overflow-hidden"
                                        />
                                        <span className="text-xs font-mono text-gray-500">{theme.colors.primary}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Secondary</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color" 
                                            value={theme.colors.secondary} 
                                            onChange={(e) => updateColors({ secondary: e.target.value })} 
                                            className="h-10 w-10 rounded-lg border-0 cursor-pointer p-0 overflow-hidden"
                                        />
                                        <span className="text-xs font-mono text-gray-500">{theme.colors.secondary}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Accent</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color" 
                                            value={theme.colors.accent} 
                                            onChange={(e) => updateColors({ accent: e.target.value })} 
                                            className="h-10 w-10 rounded-lg border-0 cursor-pointer p-0 overflow-hidden"
                                        />
                                        <span className="text-xs font-mono text-gray-500">{theme.colors.accent}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Background</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color" 
                                            value={theme.colors.background} 
                                            onChange={(e) => updateColors({ background: e.target.value })} 
                                            className="h-10 w-10 rounded-lg border-0 cursor-pointer p-0 overflow-hidden"
                                        />
                                        <span className="text-xs font-mono text-gray-500">{theme.colors.background}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>

                {/* Decorations Column */}
                <div className="space-y-8">
                     {/* Typography */}
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <span className="text-xl font-serif">Aa</span>
                            <h3 className="font-semibold text-gray-900">Typography</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">Heading Font</label>
                                <select 
                                    className="w-full rounded-lg border-gray-200 text-sm"
                                    value={theme.typography.headingFont}
                                    onChange={(e) => updateTheme({ typography: { ...theme.typography, headingFont: e.target.value } })}
                                >
                                    <option value="ui-serif, Georgia, serif">System Serif</option>
                                    <option value='"Playfair Display", serif'>Playfair Display (Elegant)</option>
                                    <option value='"Cinzel", serif'>Cinzel (Luxury)</option>
                                    <option value='"Inter", sans-serif'>Inter (Modern)</option>
                                    <option value='"Space Grotesk", sans-serif'>Space Grotesk (Bold)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">Body Font</label>
                                <select 
                                    className="w-full rounded-lg border-gray-200 text-sm"
                                    value={theme.typography.bodyFont}
                                    onChange={(e) => updateTheme({ typography: { ...theme.typography, bodyFont: e.target.value } })}
                                >
                                    <option value="ui-sans-serif, system-ui, sans-serif">System Sans</option>
                                    <option value='"Lato", sans-serif'>Lato (Clean)</option>
                                    <option value='"Roboto", sans-serif'>Roboto (Standard)</option>
                                    <option value='"Open Sans", sans-serif'>Open Sans (Readable)</option>
                                </select>
                            </div>
                        </div>
                     </div>

                     {/* Product Card Style */}
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <PaintBrushIcon className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-gray-900">Card Styles</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             {['minimal', 'modern', 'glass', 'border'].map((style) => (
                                <button
                                    key={style}
                                    onClick={() => updateTheme({ cardStyle: style as any })}
                                    className={`p-3 rounded-lg text-sm border transition-all ${theme.cardStyle === style ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                >
                                    {style.charAt(0).toUpperCase() + style.slice(1)}
                                </button>
                             ))}
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBranding;
