import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';
import { getMediaUrl } from '../../services/api';

interface Props {
    content: {
        title?: string;
        categoryIds?: string[];
    };
    style?: {
        backgroundColor?: string;
        padding?: string;
    }
}

const CategorySection = ({ content, style }: Props) => {
    const { categories } = useProducts();
    const { theme } = useTheme();

    // Filter and Deduplicate Categories
    const displayCategories = useMemo(() => {
        let cats = content?.categoryIds && content.categoryIds.length > 0
            ? categories.filter(c => content.categoryIds?.includes(c.id))
            : categories;

        // Deduplicate by Name (Case Insensitive) to prevent "Men" appearing multiple times
        const seenNames = new Set();
        const uniqueCats = [];
        for (const cat of cats) {
            const normalizedName = cat.name.trim().toLowerCase();
            if (!seenNames.has(normalizedName)) {
                seenNames.add(normalizedName);
                uniqueCats.push(cat);
            }
        }

        // Return all selected or top 10 for default view
        return content?.categoryIds?.length ? uniqueCats : uniqueCats.slice(0, 10);
    }, [categories, content]);

    const sectionStyle = {
        backgroundColor: style?.backgroundColor?.startsWith('#') ? style.backgroundColor : undefined,
    };

    return (
        <section
            className={`mx-auto max-w-[1920px] px-4 md:px-6 lg:px-20 ${style?.padding || 'py-12 md:py-20'} ${!style?.backgroundColor?.startsWith('#') ? (style?.backgroundColor || '') : ''}`}
            style={sectionStyle}
        >
            {content?.title && (
                <div className="flex flex-col items-center justify-center mb-6 md:mb-16 text-center">
                    <span className="text-secondary text-[10px] md:text-sm font-medium tracking-[0.2em] uppercase mb-2 md:mb-4">Our Collections</span>
                    <h2
                        className="text-2xl md:text-4xl lg:text-5xl font-serif text-primary"
                        style={{ fontFamily: theme.typography.headingFont }}
                    >
                        {content.title}
                    </h2>
                </div>
            )}

            {/* Mobile View: Horizontal Scroll with Circular Icons */}
            <div className="md:hidden -mx-4 px-4 overflow-hidden py-2">
                <div
                    className="flex overflow-x-auto gap-5 pb-4 no-scrollbar items-center pl-2"
                    style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                        @keyframes gradient-xy {
                            0% { background-position: 0% 50%; }
                            50% { background-position: 100% 50%; }
                            100% { background-position: 0% 50%; }
                        }
                    `}} />
                    {displayCategories.map((cat, index) => (
                        <Link
                            to={`/category/${encodeURIComponent(cat.name).toLowerCase()}`}
                            key={`${cat.id}-${index}`}
                            className="flex-shrink-0 flex flex-col items-center w-[80px] group"
                        >
                            {/* Animated Gradient Border Container */}
                            <div className="w-[76px] h-[76px] p-[2px] rounded-full mb-3 bg-gradient-to-tr from-[#ff9a9e] via-[#fad0c4] to-[#fad0c4] animate-[gradient-xy_3s_ease_infinite] bg-[length:200%_200%] shadow-sm group-active:scale-95 transition-transform duration-300">
                                <div className="w-full h-full rounded-full overflow-hidden bg-white border border-white relative">
                                    {cat.image ? (
                                        <img
                                            src={getMediaUrl(cat.image)}
                                            alt={cat.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                            <span className="text-xl font-light opacity-50">{cat.name.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="text-[13px] font-medium text-gray-800 text-center leading-4 line-clamp-2 w-full px-1 tracking-tight group-active:text-primary transition-colors">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                    {/* Spacer for right padding */}
                    <div className="w-2 flex-shrink-0" />
                </div>
            </div>

            {/* Desktop View: Original Grid Layout */}
            <div className="hidden md:grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {displayCategories.map((cat) => (
                    <Link to={`/category/${encodeURIComponent(cat.name).toLowerCase()}`} key={cat.id} className="group block cursor-pointer">
                        <div className="relative overflow-hidden aspect-[3/4] mb-6 bg-[#F0F0F0]">
                            {/* Image Wrapper with subtle Zoom */}
                            {cat.image ? (
                                <img
                                    src={getMediaUrl(cat.image)}
                                    alt={cat.name}
                                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                                    <span className="text-4xl font-light">?</span>
                                </div>
                            )}
                        </div>

                        {/* Minimal Label Below Image */}
                        <div className="text-center">
                            <h3 className="text-lg text-primary font-medium tracking-wide uppercase group-hover:text-accent transition-colors duration-300">
                                {cat.name}
                            </h3>
                            <span className="text-xs text-secondary mt-1 block">View Collection</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
