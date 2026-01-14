
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductCard from './ProductCard';

interface CategoryProductRowProps {
    categoryName: string;
    products: any[];
}

const CategoryProductRow = ({ categoryName, products }: CategoryProductRowProps) => {
    if (!products || products.length === 0) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 last:mb-0"
        >
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-serif text-black uppercase tracking-wide">
                    {categoryName}
                </h2>
                <Link
                    to={`/shop?category=${encodeURIComponent(categoryName)}`}
                    className="group flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-black hover:text-gray-600 transition-colors"
                >
                    See All
                    <svg
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="bg-white h-full"
                    >
                        <ProductCard product={p} />
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
};

export default CategoryProductRow;
