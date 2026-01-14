
import { ArrowLongRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { getMediaUrl } from '../../services/api';
import ProductSlider from '../ui/ProductSlider';

interface FlashSaleBannerProps {
    style?: {
        backgroundColor?: string;
        textColor?: string;
        padding?: string;
        className?: string;
    };
}

export default function FlashSaleBanner({ style }: FlashSaleBannerProps) {
    const { campaigns, products } = useProducts();
    const flashSale = campaigns.find(c => c.type === 'flash_sale' && c.status === 'active');
    const [timeLeft, setTimeLeft] = useState<{ h: number, m: number, s: number } | null>(null);

    useEffect(() => {
        if (!flashSale) return;
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(flashSale.endDate).getTime();
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
    }, [flashSale]);

    if (!flashSale || !timeLeft) return null;

    const saleProducts = products
        .filter(p => flashSale.campaign_products?.some(cp => cp.product === p.id));

    // Styling Logic
    const hasCustomBg = style?.backgroundColor ? true : false;

    // If custom BG is provided (hex or class), we rely on it.
    // If it's a hex, we use inline style.
    // If it's a class, we add it.

    // Default: 'bg-gradient-to-br from-red-50 to-white'
    // If custom: use that instead.

    const bgClass = hasCustomBg
        ? (style!.backgroundColor!.startsWith('#') ? '' : style!.backgroundColor)
        : 'bg-gradient-to-br from-red-50 to-white';

    const bgStyle = style?.backgroundColor?.startsWith('#') ? { backgroundColor: style.backgroundColor } : {};

    const textClass = style?.textColor?.startsWith('#') ? '' : (style?.textColor || '');
    const textStyle = style?.textColor?.startsWith('#') ? { color: style.textColor } : {};

    const containerPadding = style?.padding ? style.padding : 'my-6 sm:my-12';

    return (
        <section className={`w-full max-w-[1400px] mx-auto px-0 sm:px-6 md:px-12 ${containerPadding}`} style={textStyle}>
            <div className={`flex flex-col lg:flex-row gap-6 lg:gap-12 items-start ${bgClass} ${textClass} border border-red-100 rounded-none sm:rounded-3xl p-0 pb-4 sm:p-8 shadow-sm`} style={bgStyle}>

                {/* Minimal Header Side */}
                <div className="lg:w-1/3 pt-2 p-6 sm:p-0">
                    <div className={`flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest ${style?.textColor ? '' : 'text-red-600'}`}>
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        Live Event
                    </div>

                    <h2 className="text-xl sm:text-4xl font-serif text-gray-900 leading-tight mb-1 sm:mb-4">
                        {flashSale.name}
                    </h2>

                    <p className="text-[10px] sm:text-sm text-gray-500 leading-relaxed max-w-xs mb-2 sm:mb-8 line-clamp-2 sm:line-clamp-none">
                        Exclusive pricing on selected items for a limited time.
                    </p>

                    <div className="inline-flex items-center gap-3 sm:gap-6 border border-gray-200 px-3 sm:px-6 py-1.5 sm:py-3 rounded-full bg-white shadow-sm mb-2 sm:mb-8">
                        <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <div className={`flex gap-1.5 sm:gap-4 font-mono text-sm sm:text-lg font-medium ${style?.textColor ? '' : 'text-gray-900'}`}>
                            <span>{String(timeLeft.h).padStart(2, '0')}<span className="text-gray-300 text-[8px] sm:text-xs ml-0.5">H</span></span>
                            <span className="text-gray-300">:</span>
                            <span>{String(timeLeft.m).padStart(2, '0')}<span className="text-gray-300 text-[8px] sm:text-xs ml-0.5">M</span></span>
                            <span className="text-gray-300">:</span>
                            <span>{String(timeLeft.s).padStart(2, '0')}<span className="text-gray-300 text-[8px] sm:text-xs ml-0.5">S</span></span>
                        </div>
                    </div>

                    <div>
                        <Link to={`/shop?campaign=${flashSale.id}`} className="group flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black hover:text-gray-600 transition-colors">
                            View All Products
                            <ArrowLongRightIcon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Minimal Product Grid */}
                <div className="lg:w-2/3 w-full min-w-0 pb-8 sm:pb-0 px-2 sm:px-0">
                    {/* Product Slider for Flash Sale */}
                    <ProductSlider
                        items={[...saleProducts, ...(saleProducts.length < 8 ? [...saleProducts, ...saleProducts] : [])]}
                        renderItem={(product) => (
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
                                    {/* Flash Sale Gradient Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-red-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                                        -{Math.round((flashSale.discountValue / product.price) * 100)}%
                                    </div>

                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 shadow-sm hover:bg-red-50">
                                        <ArrowLongRightIcon className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="p-3 sm:p-5 flex flex-col gap-1 sm:gap-1.5">
                                    <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate tracking-wide group-hover:text-red-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-baseline gap-1.5 sm:gap-2.5">
                                        <span className="text-sm sm:text-base font-bold text-gray-900">
                                            Tk {Math.round(product.price - flashSale.discountValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-gray-400 line-through decoration-gray-300">
                                            Tk {product.price.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )}
                    />
                </div>

            </div>
        </section>
    );
}
