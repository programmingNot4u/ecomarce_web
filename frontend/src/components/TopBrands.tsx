import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { getMediaUrl } from '../services/api';

interface Props {
    content?: {
        title?: string;
        showTitle?: boolean;
    };
    style?: {
        animated?: boolean;
        animationSpeed?: number; // Duration in seconds
        backgroundColor?: string;
        padding?: string;
    }
}

export default function TopBrands({ content, style }: Props) {
    const { brands } = useProducts();
    const animated = style?.animated !== false; // Default to true if not specified? Or false? Let's default to false for backward compat, unless user specifically enables it. Actually user asked for customizable. Let's default false.
    const isAnimated = style?.animated === true;
    const speed = style?.animationSpeed || 20;

    // Sort by popularity (product count) and take top 8
    const topBrands = isAnimated ? brands : [...brands].sort((a, b) => b.count - a.count).slice(0, 8);

    return (
        <div className={`bg-white ${style?.padding || 'py-12'}`} style={style?.backgroundColor ? { backgroundColor: style.backgroundColor } : {}}>
            <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 overflow-hidden">
                {(content?.showTitle !== false) && (
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">{content?.title || "Top Brands"}</h2>
                        <Link to="/brands" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors">
                            All Brands
                            <span aria-hidden="true"> &rsaquo;</span>
                        </Link>
                    </div>
                )}

                {isAnimated ? (
                    /* Animated Marquee Layout */
                    <div className="flex space-x-12 overflow-hidden py-4 fade-mask-x">
                        <motion.div
                            className="flex space-x-16 items-center flex-nowrap"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ repeat: Infinity, duration: speed, ease: "linear" }}
                            style={{ width: "max-content" }}
                        >
                            {/* Duplicate list for seamless loop */}
                            {[...topBrands, ...topBrands].map((brand, i) => (
                                <div key={`${brand.id}-${i}`} className="flex-shrink-0 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100 cursor-pointer">
                                    {brand.logo ? (
                                        <img src={getMediaUrl(brand.logo)} alt={brand.name} className="h-12 w-auto object-contain" />
                                    ) : (
                                        <span className="text-xl font-bold text-gray-400 uppercase">{brand.name}</span>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    </div>
                ) : (
                    /* Static Grid Layout */
                    <div className="border border-gray-400 rounded-sm overflow-hidden">
                        <div className="grid grid-cols-2 sm:grid-cols-4">
                            {topBrands.length > 0 ? (
                                topBrands.map((brand, index) => (
                                    <div
                                        key={`${brand.id}-${index}`}
                                        className="relative flex items-center justify-center p-8 h-32 bg-white border-r border-b border-gray-400 hover:bg-gray-50 transition-colors last:border-r-0 sm:[&:nth-child(4n)]:border-r-0"
                                    >
                                        {brand.logo ? (
                                            <img
                                                className="max-h-16 w-auto object-contain"
                                                src={getMediaUrl(brand.logo)}
                                                alt={brand.name}
                                            />
                                        ) : (
                                            <span className="text-gray-900 font-bold text-lg uppercase tracking-wider text-center">{brand.name}</span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                [...Array(4)].map((_, i) => (
                                    <div
                                        key={`placeholder-${i}`}
                                        className="relative flex items-center justify-center p-8 h-32 bg-white border-r border-b border-gray-400 sm:[&:nth-child(4n)]:border-r-0"
                                    >
                                        <span className="text-gray-300 font-bold text-xl uppercase tracking-widest text-center text-xs">No Brands<br />Added</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-end sm:hidden">
                    <Link to="/brands" className="flex items-center gap-1 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors">
                        All Brands
                        <span aria-hidden="true"> &rsaquo;</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
