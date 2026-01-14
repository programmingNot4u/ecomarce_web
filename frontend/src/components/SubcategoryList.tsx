
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { getMediaUrl } from '../services/api';

interface SubcategoryListProps {
    subcategories: any[];
}

const SubcategoryList = ({ subcategories }: SubcategoryListProps) => {
    if (!subcategories || subcategories.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full mb-12"
        >
            {/* Relative container for positioning arrows */}
            <div className="relative group px-4 md:px-12">
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={12}
                    slidesPerView={3}
                    navigation={{
                        nextEl: '.sub-next',
                        prevEl: '.sub-prev',
                    }}
                    breakpoints={{
                        640: { slidesPerView: 4, spaceBetween: 20 },
                        768: { slidesPerView: 5, spaceBetween: 24 },
                        1024: { slidesPerView: 6, spaceBetween: 24 },
                        1280: { slidesPerView: 7, spaceBetween: 24 },
                    }}
                    className="w-full !px-2 py-4"
                >
                    {subcategories.map((sub) => (
                        <SwiperSlide key={sub.id}>
                            <Link
                                to={sub.subCategories && sub.subCategories.length > 0
                                    ? `/category/${encodeURIComponent(sub.name)}`
                                    : `/shop?category=${encodeURIComponent(sub.name)}`
                                }
                                className="group/item flex flex-col items-center gap-3 p-2 md:p-4 cursor-pointer hover:bg-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="w-20 h-20 md:w-36 md:h-36 rounded-full overflow-hidden border-[3px] md:border-4 border-transparent group-hover/item:border-black transition-all shadow-md">
                                    {sub.image ? (
                                        <img
                                            src={getMediaUrl(sub.image)}
                                            alt={sub.name}
                                            className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-[10px] md:text-xs text-center p-1">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs md:text-base font-bold text-center uppercase tracking-wider group-hover/item:text-black text-gray-800 transition-colors line-clamp-2">
                                    {sub.name}
                                </span>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Custom Navigation Arrows */}
                <button className="sub-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-800 hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-0 disabled:cursor-not-allowed -ml-2 md:-ml-4 border border-gray-100">
                    <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button className="sub-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-800 hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-0 disabled:cursor-not-allowed -mr-2 md:-mr-4 border border-gray-100">
                    <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5" />
                </button>
            </div>
        </motion.div>
    );
};

export default SubcategoryList;
