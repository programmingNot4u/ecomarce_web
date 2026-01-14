import { Link, useParams } from 'react-router-dom';
import CategoryProductRow from '../components/CategoryProductRow';
import ProductCard from '../components/ProductCard';
import SubcategoryList from '../components/SubcategoryList';
import { useProducts } from '../context/ProductContext';
import { useTheme } from '../context/ThemeContext';
import { getMediaUrl } from '../services/api';

// Swiper Imports
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const CategoryLandingPage = () => {
    const { category } = useParams();
    const { categories, products, getProductsByCategory } = useProducts();
    const { theme } = useTheme();

    // 1. Resolve Current Category
    const categorySlug = category ? decodeURIComponent(category).toLowerCase() : '';

    // Helper to find category
    const findCategoryDeep = (cats: any[], slug: string): any | null => {
        for (const cat of cats) {
            if (cat.name.toLowerCase() === slug || cat.name.toLowerCase() === slug.replace(/-/g, ' & ')) return cat;
            if (cat.subCategories) {
                const found = findCategoryDeep(cat.subCategories, slug);
                if (found) return found;
            }
        }
        return null;
    };

    const currentCategory = findCategoryDeep(categories, categorySlug);

    if (!currentCategory) {
        return <div className="p-20 text-center">Category not found</div>;
    }

    // 2. Subcategories and nesting detection
    const immediateSubcategories = currentCategory.subCategories || [];

    // Check if any immediate subcategory has its own subcategories (multi-level nesting)
    const hasNestedSubcategories = immediateSubcategories.some(
        (sub: any) => sub.subCategories && sub.subCategories.length > 0
    );

    // Helper to get ALL subcategories (including nested ones) for gallery display and rows
    const getAllDescendants = (category: any): any[] => {
        let descendants: any[] = [];
        if (category.subCategories && category.subCategories.length > 0) {
            category.subCategories.forEach((sub: any) => {
                descendants.push(sub);
                descendants = descendants.concat(getAllDescendants(sub));
            });
        }
        return descendants;
    };

    const allSubcategories = getAllDescendants(currentCategory);

    // 3. Trending Products for this Category (Using helper for robust deep search)
    let categoryProducts = getProductsByCategory(currentCategory.name)
        .filter(p => p.status === 'published')
        .slice(0, 12);

    // FALLBACK: If no products found for this category, show ANY products so the slider is visible (User Request)
    if (categoryProducts.length === 0) {
        categoryProducts = products.filter(p => p.status === 'published').slice(0, 12);
    }

    return (
        <div className="bg-[#FAF9F6] min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
                {/* Background Image */}
                {currentCategory.image ? (
                    <img
                        src={getMediaUrl(currentCategory.image)}
                        alt={currentCategory.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/30" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6">
                    <h1
                        className="text-5xl md:text-7xl font-serif mb-4 uppercase tracking-widest"
                        style={{ fontFamily: theme.typography.headingFont }}
                    >
                        {currentCategory.name}
                    </h1>
                    <Link
                        to={`/shop?category=${encodeURIComponent(currentCategory.name)}`}
                        className="mt-8 px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-all uppercase tracking-widest text-sm"
                    >
                        Shop All {currentCategory.name}
                    </Link>
                </div>
            </div>

            {/* 3-State Logic */}
            {/* Content Logic: Always show flattened rows if subcategories exist */}
            {allSubcategories.length > 0 ? (
                <div className="py-16 mx-auto max-w-[1920px] px-6 lg:px-20">
                    {/* Top Navigation List */}
                    <div className="mb-12">
                        <SubcategoryList subcategories={allSubcategories} />
                    </div>

                    {allSubcategories.map((sub: any) => {
                        // Get products for this subcategory
                        const subProducts = getProductsByCategory(sub.name)
                            .filter(p => p.status === 'published')
                            .slice(0, 8); // Limit to 8 for 2 rows (4x2)

                        // Skip if no products
                        if (subProducts.length === 0) return null;

                        return (
                            <CategoryProductRow
                                key={sub.id}
                                categoryName={sub.name}
                                products={subProducts}
                            />
                        );
                    })}
                </div>
            ) : (
                // Leaf Category -> Show All Products Grid
                getProductsByCategory(currentCategory.name).length > 0 && (
                    <section className="py-16 mx-auto max-w-[1920px] px-6 lg:px-20">
                        <div className="flex flex-col items-center justify-center mb-12 text-center">
                            <h2
                                className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-black"
                                style={{ fontFamily: theme.typography.headingFont }}
                            >
                                All Products
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {getProductsByCategory(currentCategory.name)
                                .filter(p => p.status === 'published')
                                .map((p) => (
                                    <div key={p.id} className="bg-white">
                                        <ProductCard product={p} />
                                    </div>
                                ))}
                        </div>
                    </section>
                )
            )}

            {/* Separator Line */}
            <div className="w-full">
                <hr className="border-black" />
            </div>

            {/* Trending / Featured Section - Auto-sliding Swiper */}
            {/* FORCE VISIBILITY: Check > -1 so it effectively always renders if array exists, though logic above ensures it has items if products exist */}
            {categoryProducts.length > 0 && (
                <section className="py-20 bg-[#FAF9F6]">
                    <div className="mx-auto max-w-[1920px] px-6 lg:px-20 relative group">
                        <div className="flex flex-col items-center justify-center mb-12 text-center">
                            <h2
                                className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-black"
                                style={{ fontFamily: theme.typography.headingFont }}
                            >
                                TRENDING
                            </h2>
                        </div>

                        {/* Swiper Slider */}
                        <div className="relative px-4 md:px-12">
                            <Swiper
                                modules={[Autoplay, Navigation, Pagination]}
                                spaceBetween={24}
                                slidesPerView={1}
                                navigation={{
                                    nextEl: '.swiper-button-next-custom',
                                    prevEl: '.swiper-button-prev-custom',
                                }}
                                pagination={{
                                    clickable: true,
                                    dynamicBullets: true,
                                }}
                                autoplay={{
                                    delay: 3000,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: true,
                                }}
                                loop={true}
                                breakpoints={{
                                    640: {
                                        slidesPerView: 2,
                                    },
                                    1024: {
                                        slidesPerView: 4,
                                    },
                                }}
                                className="pb-12"
                            >
                                {categoryProducts.map((p) => (
                                    <SwiperSlide key={p.id} className="h-auto">
                                        <div className="bg-white p-4 h-full">
                                            <ProductCard product={p} />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Custom Navigation Arrows */}
                            <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 hover:bg-white shadow-md rounded-full text-gray-800 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 hidden md:block">
                                <ChevronLeftIcon className="w-6 h-6" />
                            </button>
                            <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 hover:bg-white shadow-md rounded-full text-gray-800 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 hidden md:block">
                                <ChevronRightIcon className="w-6 h-6" />
                            </button>
                        </div>


                        <div className="mt-8 text-center">
                            <Link
                                to={`/shop?category=${encodeURIComponent(currentCategory.name)}`}
                                className="bg-black text-white px-10 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all duration-300"
                            >
                                View More
                            </Link>
                        </div>
                    </div>
                </section>
            )}


        </div>
    );
};

export default CategoryLandingPage;
