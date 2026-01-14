import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';
import ProductCard from '../ProductCard';

interface Props {
    content: {
        title?: string;
        count?: number;
        showViewAll?: boolean;
        viewAllLink?: string;
        mode?: 'latest' | 'manual';
        productIds?: string[];
    };
    style?: {
        backgroundColor?: string;
        padding?: string;
    }
}

const ProductSection = ({ content, style }: Props) => {
    // ... existing logic ...
    const { products } = useProducts();
    const { theme } = useTheme();

    const displayProducts = (() => {
        if (content.mode === 'manual' && content.productIds?.length) {
            return products.filter(p => content.productIds?.includes(p.id));
        }
        // Default / Latest Mode
        return products
            .filter(p => p.status === 'published' || !p.status)
            .slice(0, content.count || 8);
    })();

    return (
        <section className={`mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 ${style?.padding || 'py-16'} ${style?.backgroundColor || ''}`}>
            {content.title && (
                <div className="flex flex-col items-center justify-center mb-12">
                    <h2
                        className="text-3xl font-bold uppercase tracking-tight"
                        style={{ fontFamily: theme.typography.headingFont, color: theme.colors.text }}
                    >
                        {content.title}
                    </h2>
                    <div className="w-20 h-1 mt-4" style={{ backgroundColor: theme.colors.primary }} />
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
                {displayProducts.map((product) => (
                    <div key={product.id} className="bg-white border-b border-r border-gray-100 p-4">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>

            {content.showViewAll && (
                <div className="mt-12 flex justify-center">
                    <Link
                        to={content.viewAllLink || '/shop'}
                        className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold uppercase tracking-widest border border-black hover:bg-black hover:text-white transition-colors duration-300"
                        style={{ borderColor: theme.colors.primary }}
                    >
                        View All Products
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                        </svg>
                    </Link>
                </div>
            )}
        </section>
    );
};

export default ProductSection;
