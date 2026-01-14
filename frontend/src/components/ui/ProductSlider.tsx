
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRef } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Autoplay, Navigation } from 'swiper/modules';
import type { SwiperRef } from 'swiper/react';
import { Swiper, SwiperSlide } from 'swiper/react';

interface ProductSliderProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    slidesPerView?: number | 'auto';
    spaceBetween?: number;
    className?: string;
}

export default function ProductSlider<T extends { id: string | number }>({
    items,
    renderItem,
    slidesPerView = 'auto',
    spaceBetween = 16,
    className = ""
}: ProductSliderProps<T>) {
    const swiperRef = useRef<SwiperRef>(null);

    return (
        <div className={`relative group/slider ${className}`}>
            {/* Custom Navigation Buttons */}
            <button
                onClick={() => swiperRef.current?.swiper.slidePrev()}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover/slider:opacity-100 transition-all duration-300 disabled:opacity-0 hover:bg-gray-50 focus:outline-none"
                aria-label="Previous slide"
            >
                <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
                onClick={() => swiperRef.current?.swiper.slideNext()}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover/slider:opacity-100 transition-all duration-300 disabled:opacity-0 hover:bg-gray-50 focus:outline-none"
                aria-label="Next slide"
            >
                <ChevronRightIcon className="w-5 h-5" />
            </button>

            <Swiper
                ref={swiperRef}
                modules={[Navigation, Autoplay]}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                loop={true}
                speed={800}
                spaceBetween={16}
                slidesPerView={'auto'}
                className="!p-4 -m-4" // Compensate for shadow clipping
                breakpoints={{
                    320: { slidesPerView: 2, spaceBetween: 8 }, // Mobile: 2 cards, tighter gap
                    640: { slidesPerView: 2.5, spaceBetween: 16 }, // Large Phone/Tablet
                    768: { slidesPerView: 3, spaceBetween: 20 }, // Tablet: 3 full cards (decompressed)
                    1024: { slidesPerView: 3, spaceBetween: 24 }, // Desktop: 3 fixed
                    1280: { slidesPerView: 3, spaceBetween: 24 },
                    1536: { slidesPerView: 4, spaceBetween: 24 },
                }}
            >
                {items.map((item, idx) => (
                    <SwiperSlide key={`${item.id}-${idx}`} className="h-auto w-auto">
                        <div className="w-full h-full"> {/* Full width relative to slide */}
                            {renderItem(item)}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
