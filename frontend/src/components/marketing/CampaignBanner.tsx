
import { ArrowLongRightIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { getMediaUrl } from '../../services/api';
import ProductSlider from '../ui/ProductSlider';

interface CampaignBannerProps {
    type: 'flash_sale' | 'bundle' | 'loyalty';
    style?: {
        backgroundColor?: string;
        textColor?: string;
        padding?: string;
        className?: string;
    };
}

export default function CampaignBanner({ type, style }: CampaignBannerProps) {
    const { campaigns, products } = useProducts();
    const campaign = campaigns.find(c => c.type === type && (c.status === 'active' || c.status === 'Active'));
    const [timeLeft, setTimeLeft] = useState<{ h: number, m: number, s: number } | null>(null);



    useEffect(() => {
        if (!campaign) return;

        // Only calculate countdown if it's a flash sale or has an end date
        if (type === 'flash_sale' || campaign.endDate) {
            const interval = setInterval(() => {
                const now = new Date().getTime();
                const end = new Date(campaign.endDate).getTime();
                const distance = end - now;
                if (distance < 0) {
                    clearInterval(interval);
                    setTimeLeft(null);
                } else {
                    setTimeLeft({
                        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                        s: Math.floor((distance % (1000 * 60)) / 1000)
                    });
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [campaign, type]);

    if (!campaign) {
        // Option: Render a placeholder or nothing. For now, render nothing if no active campaign.
        return null;
    }

    // Use campaign_products from backend to find matching products
    const saleProducts = products
        .filter(p => campaign.campaign_products?.some(cp => String(cp.product) === String(p.id)));

    // Filter logic update: Backend provides campaign_products with specific discounts.
    // If list is empty, picking top 4 products for demo if it's store-wide (check logic).

    // Assuming backend handles logic, but frontend filtering relies on affectedProducts.
    // If affectedProducts is empty/undefined, maybe show all (risky) or none.
    // Let's fallback to "on sale" products if defined, otherwise empty.

    // UI Variations based on type
    const defaultBg = {
        flash_sale: 'bg-red-50',
        bundle: 'bg-blue-50',
        loyalty: 'bg-purple-50'
    };

    const defaultAccent = {
        flash_sale: 'text-red-600',
        bundle: 'text-blue-600',
        loyalty: 'text-purple-600'
    };

    // Use passed style or defaults
    // Note: style.backgroundColor might be a class (bg-gray-50) or hex. If hex, we need style={{ backgroundColor: ... }}
    const bgClass = style?.backgroundColor?.startsWith('#') ? '' : (style?.backgroundColor || defaultBg[type] || 'bg-gray-50');
    const bgStyle = style?.backgroundColor?.startsWith('#') ? { backgroundColor: style.backgroundColor } : {};

    // For text color, if it's meant to override the accent color only, or the whole text?
    // Usually theme.textColor applies to body text. Here we have headers and specific accents.
    // Let's apply style.textColor to the container, and if it's present, maybe force it on headers?
    // Actually, usually textColor in theme is for the section text.
    // Let's use it to override the accent color if provided, or just add it to the container.
    const textClass = style?.textColor?.startsWith('#') ? '' : (style?.textColor || '');
    const textStyle = style?.textColor?.startsWith('#') ? { color: style.textColor } : {};

    // Padding: style.padding comes from admin (e.g., 'py-16').
    // But we have our own structure: border-t, rounded, etc.
    // The admin padding usually applies to the SECTION wrapper. Here we are inside the section.
    // But CampaignBanner IS the section content.
    // Ideally, the padding should be applied to the outer container if we want to control vertical spacing.
    // However, the current code has `my-6 sm:my-12` on the section tag.
    // Let's use style.padding if available, otherwise default margin.

    const containerPadding = style?.padding ? style.padding : 'my-6 sm:my-12';

    return (
        <section className={`w-full max-w-[1400px] mx-auto px-0 sm:px-6 md:px-12 ${containerPadding}`} style={textStyle}>
            <div
                className={`flex flex-col lg:flex-row gap-6 lg:gap-12 items-start border-t border-gray-100 pt-6 lg:pt-12 rounded-none sm:rounded-3xl p-0 pb-4 sm:p-8 ${bgClass} ${textClass}`}
                style={bgStyle}
            >

                {/* Header Side */}
                <div className="lg:w-1/3 pt-2 p-6 sm:p-0">
                    <div className={`flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest ${style?.textColor ? '' : (defaultAccent[type] || 'text-gray-900')}`}>
                        {type === 'flash_sale' && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                        {type.replace('_', ' ')}
                    </div>

                    <h2 className="text-xl sm:text-4xl font-serif text-gray-900 leading-tight mb-1 sm:mb-4">
                        {campaign.name}
                    </h2>

                    <p className="text-[10px] sm:text-sm text-gray-500 leading-relaxed max-w-xs mb-2 sm:mb-8 line-clamp-2 sm:line-clamp-none">
                        {campaign.description || "Limited time offer. Don't miss out!"}
                    </p>

                    {timeLeft && (
                        <div className="flex gap-2 sm:gap-4 mb-2 sm:mb-8">
                            <div className="flex flex-col items-center">
                                <span className={`text-base sm:text-2xl font-bold font-mono ${style?.textColor ? '' : (defaultAccent[type] || 'text-gray-900')}`}>{String(timeLeft.h).padStart(2, '0')}</span>
                                <span className="text-[8px] sm:text-[10px] uppercase tracking-wider text-gray-400">Hours</span>
                            </div>
                            <div className="text-base sm:text-xl font-bold text-gray-300 self-start mt-0.5 sm:mt-1">:</div>
                            <div className="flex flex-col items-center">
                                <span className={`text-base sm:text-2xl font-bold font-mono ${style?.textColor ? '' : (defaultAccent[type] || 'text-gray-900')}`}>{String(timeLeft.m).padStart(2, '0')}</span>
                                <span className="text-[8px] sm:text-[10px] uppercase tracking-wider text-gray-400">Mins</span>
                            </div>
                            <div className="text-base sm:text-xl font-bold text-gray-300 self-start mt-0.5 sm:mt-1">:</div>
                            <div className="flex flex-col items-center">
                                <span className={`text-base sm:text-2xl font-bold font-mono ${style?.textColor ? '' : (defaultAccent[type] || 'text-gray-900')}`}>{String(timeLeft.s).padStart(2, '0')}</span>
                                <span className="text-[8px] sm:text-[10px] uppercase tracking-wider text-gray-400">Secs</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <Link to={`/shop?campaign=${campaign.id}`} className="group flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black hover:text-gray-600 transition-colors">
                            View Offers
                            <ArrowLongRightIcon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Product Carousel */}
                <div className="lg:w-2/3 w-full min-w-0 pb-8 sm:pb-0 px-2 sm:px-0">
                    {saleProducts.length > 0 ? (
                        <ProductSlider
                            items={[...saleProducts, ...(saleProducts.length < 8 ? [...saleProducts, ...saleProducts] : [])]}
                            renderItem={(product) => {
                                const campaignProduct = campaign.campaign_products?.find(cp => String(cp.product) === String(product.id));
                                const discountType = campaignProduct?.discount_type || 'percentage';
                                const discountValue = campaignProduct?.discount_value || 0;

                                let discountedPrice = product.price;
                                if (discountType === 'percentage') {
                                    discountedPrice = product.price - (product.price * (discountValue / 100));
                                } else {
                                    discountedPrice = product.price - discountValue;
                                }

                                return (
                                    <Link
                                        to={`/products/${product.id}`}
                                        className="group block h-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
                                    >
                                        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                                            <img
                                                src={getMediaUrl(product.image)}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                            {/* Gradient Overlay matching Flash Sale */}
                                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {discountValue > 0 && (
                                                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm border border-gray-100">
                                                    -{discountType === 'percentage' ? `${discountValue}%` : `Tk ${discountValue}`}
                                                </div>
                                            )}

                                            {/* Action Button Overlay */}
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 shadow-sm hover:bg-gray-50">
                                                <ArrowLongRightIcon className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div className="p-3 sm:p-5 flex flex-col gap-1 sm:gap-1.5">
                                            <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate tracking-wide group-hover:text-primary transition-colors">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-baseline gap-1.5 sm:gap-2.5">
                                                <span className="text-sm sm:text-base font-bold text-gray-900">
                                                    Tk {discountedPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </span>
                                                {discountValue > 0 && (
                                                    <span className="text-[10px] sm:text-xs text-gray-400 line-through decoration-gray-300">
                                                        Tk {product.price.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            }}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-2xl min-h-[200px] bg-gray-50">
                            No specific products assigned to this campaign.
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}
