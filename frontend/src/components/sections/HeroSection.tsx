import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { getMediaUrl } from '../../services/api';

// Swiper
import { Autoplay, EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/effect-fade';

import type { Swiper as SwiperType } from 'swiper';

interface Props {
    content?: {
        bannerIds?: string[]; // Optional: if we want to pick specific banners
        height?: string;
    };
    style?: {
        padding?: string;
    };
    settings?: {
        mobileLayout?: 'grid-1' | 'grid-2' | 'mixed';
    };
}

const HeroSection = ({ content, style, settings }: Props) => {
    const { banners } = useProducts();

    // Sort and Filter Banners
    // If content.bannerIds is provided, filter by those. Otherwise default logic.
    // Sort and Filter Banners
    // If content.bannerIds is provided, filter by those. Otherwise default logic.
    const heroSlides = banners
        .filter(b => b.active && b.position === 'hero')
        .filter(b => content?.bannerIds ? content.bannerIds.includes(b.id) : true)
        .sort((a, b) => a.order - b.order)
        .map(b => ({
            id: b.id,
            image: b.image,
            headline: b.title,
            description: b.subtitle,
            cta: b.ctaText || 'Shop Now',
            link: b.link,
            textColor: b.textColor || '#ffffff',
            buttonColor: b.buttonColor || '#000000',
            buttonTextColor: b.buttonTextColor
        }));

    // Fallback if no banners are active from Admin
    const displaySlides = heroSlides.length > 0 ? heroSlides : [
        {
            id: 'default-1',
            image: "https://images.unsplash.com/photo-1556228720-1957be91923b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2600&q=80",
            headline: "All-Day Lash Hold.",
            description: "Lash Curl Finisher is a clear styling gel that sets curled lashes in place.",
            cta: "Shop Lash Curl",
            link: "/shop",
            textColor: '#ffffff',
            buttonColor: '#000000'
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

    return (
        <section className={`mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 ${style?.padding || 'py-6 lg:py-8'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[750px]">

                {/* Left Slider - spans 8 cols */}
                <div className="lg:col-span-8 h-[500px] lg:h-full rounded-2xl overflow-hidden relative shadow-sm group">
                    <Swiper
                        modules={[Autoplay, EffectFade]}
                        effect="fade"
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        loop={displaySlides.length > 1}
                        onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
                        onSwiper={(swiper) => setSwiperInstance(swiper)}
                        className="h-full w-full"
                    >
                        {displaySlides.map((slide) => (
                            <SwiperSlide key={slide.id}>
                                <div className="relative h-full w-full">
                                    <img
                                        src={getMediaUrl(slide.image)}
                                        className="h-full w-full object-cover object-center"
                                        alt={slide.headline}
                                    />
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

                                    <div
                                        className="absolute inset-0 flex flex-col justify-start pt-[24vh] md:pt-[35vh] px-8 md:px-16 max-w-2xl"
                                        style={{ color: slide.textColor }}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 tracking-tight leading-tight">
                                                {slide.headline}
                                            </h1>
                                            <p className="text-lg md:text-xl mb-6 md:mb-8 font-light leading-relaxed line-clamp-3 md:line-clamp-none opacity-90">
                                                {slide.description}
                                            </p>
                                            <Link
                                                to={slide.link}
                                                className="inline-block px-8 py-3 font-bold rounded-full hover:shadow-lg transition-all"
                                                style={{
                                                    backgroundColor: slide.buttonColor,
                                                    color: slide.buttonTextColor || (slide.textColor === '#000000' ? '#ffffff' : '#000000')
                                                }}
                                            >
                                                {slide.cta}
                                            </Link>
                                        </motion.div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Indicators */}
                    <div className="absolute bottom-8 left-8 md:left-16 flex space-x-3 z-10">
                        {displaySlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => swiperInstance?.slideToLoop(index)}
                                className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === index
                                    ? 'w-8 bg-white'
                                    : 'w-2.5 bg-white/50 hover:bg-white/80'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Promo Grid - spans 4 cols */}
                <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-rows-2 gap-6 h-full">
                    {(() => {
                        const getBanner = (pos: string) => {
                            // Find the LAST active banner for this position (most recently added)
                            return [...banners].reverse().find(b => b.position === pos && b.active);
                        };

                        const renderGridSlot = (pos: string, defaultTitle: string, defaultColor: string, defaultCtaColor: string, defaultImageText: string) => {
                            const b = getBanner(pos);
                            return (
                                <Link to={b?.link || '/shop'} className="min-h-[250px] md:min-h-0 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group cursor-pointer transition-transform hover:-translate-y-1 duration-300" style={{ backgroundColor: b?.backgroundColor || defaultColor }}>
                                    <div className="z-10 relative">
                                        <h3 className="text-xl font-bold" style={{ color: b?.textColor || '#111827' }}>{b?.title || defaultTitle}</h3>
                                        <p className="text-sm mt-1 mb-4 opacity-80" style={{ color: b?.textColor || '#4b5563' }}>{b?.subtitle || 'Authorized distributor'}</p>
                                        <button className="text-xs font-bold px-4 py-2 rounded-md shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: b?.buttonColor || defaultCtaColor, color: '#ffffff' }}>{b?.ctaText || 'Get Yours'}</button>
                                    </div>
                                    <img
                                        src={b?.image ? getMediaUrl(b.image) : `https://placehold.co/150x200/png?text=${defaultImageText}`}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 z-0 opacity-100"
                                        alt={b?.title || defaultTitle}
                                    />
                                    {b?.image && <div className="absolute inset-0 bg-black/10 z-0 pointer-events-none" />}
                                </Link>
                            );
                        };

                        /* Dynamic Mobile Layout Logic */
                        const mobileLayout = settings?.mobileLayout || 'grid-1';

                        // Row 1 Columns: 'mixed' or 'grid-2' -> 2 cols. 'grid-1' -> 1 col.
                        const row1Cols = (mobileLayout === 'mixed' || mobileLayout === 'grid-2') ? 'grid-cols-2' : 'grid-cols-1';

                        // Row 2 Columns: 'grid-2' -> 2 cols. 'mixed' or 'grid-1' -> 1 col.
                        const row2Cols = (mobileLayout === 'grid-2') ? 'grid-cols-2' : 'grid-cols-1';

                        return (
                            <>
                                {/* Grid Row 1 (Top) */}
                                <div className={`grid ${row1Cols} md:grid-cols-2 gap-4 h-full`}>
                                    {renderGridSlot('grid-1', 'Add Banner (Slot 1)', '#f3f4f6', '#000000', 'Slot 1')}
                                    {renderGridSlot('grid-2', 'Add Banner (Slot 2)', '#f3f4f6', '#000000', 'Slot 2')}
                                </div>

                                {/* Grid Row 2 (Bottom) */}
                                <div className={`grid ${row2Cols} md:grid-cols-2 gap-4 h-full`}>
                                    {renderGridSlot('grid-3', 'Add Banner (Slot 3)', '#f3f4f6', '#000000', 'Slot 3')}
                                    {renderGridSlot('grid-4', 'Add Banner (Slot 4)', '#f3f4f6', '#000000', 'Slot 4')}
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
