import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { getMediaUrl } from '../../services/api';

interface Props {
    content: {
        title?: string;
        categoryIds?: string[];
    };
    style?: {
        backgroundColor?: string; // Section background
        padding?: string;
    }
}

const PASTEL_COLORS = [
    'bg-[#E6E6FA40]', // Light Purple
    'bg-[#E0F4E850]', // Mint
    'bg-[#FCE8D650]', // Peach
    'bg-[#FCF9D650]', // Light Yellow
    'bg-[#E6E6FA40]', // Light Blueish
    'bg-[#FADADD40]', // Pinkish
];

const KCBazarCategorySection = ({ content, style }: Props) => {
    const { categories } = useProducts();

    // Filter and Deduplicate Categories
    const displayCategories = useMemo(() => {
        let cats = content?.categoryIds && content.categoryIds.length > 0
            ? categories.filter(c => content.categoryIds?.includes(c.id))
            : categories.slice(0, 12); // Default to slightly more for this grid view

        // Deduplicate by Name (Case Insensitive)
        const seenNames = new Set();
        const uniqueCats = [];
        for (const cat of cats) {
            const normalizedName = cat.name.trim().toLowerCase();
            if (!seenNames.has(normalizedName)) {
                seenNames.add(normalizedName);
                uniqueCats.push(cat);
            }
        }

        return uniqueCats;
    }, [categories, content]);

    return (
        <section className={`mx-auto max-w-[1920px] px-4 md:px-6 lg:px-20 ${style?.padding || 'py-8'} ${style?.backgroundColor || 'bg-white'}`}>
            {content?.title && (
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        {content.title}
                    </h2>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {displayCategories.map((cat, index) => {
                    const bgColorClass = PASTEL_COLORS[index % PASTEL_COLORS.length];

                    return (
                        <Link
                            to={`/category/${encodeURIComponent(cat.name).toLowerCase()}`}
                            key={`${cat.id}-${index}`}
                            className="group flex flex-col items-center bg-white p-3 md:p-4 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all duration-300"
                        >
                            <div className={`w-full aspect-square mb-4 rounded-lg overflow-hidden relative ${bgColorClass} flex items-end justify-center`}>
                                {cat.image ? (
                                    <img
                                        src={getMediaUrl(cat.image)}
                                        alt={cat.name}
                                        className="w-full h-full object-cover transform md:group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <span className="text-3xl font-light opacity-50">{cat.name.charAt(0)}</span>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-sm md:text-base font-semibold text-gray-800 text-center group-hover:text-primary transition-colors line-clamp-2">
                                {cat.name}
                            </h3>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default KCBazarCategorySection;
