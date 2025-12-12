import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ShippingBanner from '../components/ShippingBanner';
import TopBrands from '../components/TopBrands';
import { products } from '../mocks/products';

// Swiper for Hero
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { Autoplay, EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const HomePage = () => {
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 500], [1, 0.95]);

    // Dynamic Hero Data
    const heroSlides = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1556228720-1957be91923b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2600&q=80",
            headline: "All-Day Lash Hold.",
            description: "Lash Curl Finisher is a clear styling gel that sets curled lashes in place, coating each individual eyelash for lasting hold and natural definition.",
            cta: "Shop Lash Curl",
            link: "/shop"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=2600&q=80",
            headline: "Hydration Redefined.",
            description: "Experience the ultimate moisture surge with our Hyaluronic Acid 2% + B5 serum. Plumper, smoother skin instantly.",
            cta: "Discover Hydration",
            link: "/shop"
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=2600&q=80",
            headline: "Brighten & Balance.",
            description: "Vitamin C Suspension 23% + HA Spheres 2%. A water-free, silicone-free stable suspension of Vitamin C.",
            cta: "Shop Vitamin C",
            link: "/shop"
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

    return (
        <div className="bg-white">
             {/* Split Hero Section */}
            <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[750px]">
                    
                    {/* Left Slider - spans 8 cols */}
                    <div className="lg:col-span-8 h-[500px] lg:h-full rounded-2xl overflow-hidden relative shadow-sm group">
                        <Swiper
                            modules={[Autoplay, EffectFade]}
                            effect="fade"
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                            loop={true}
                            onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
                            onSwiper={(swiper) => setSwiperInstance(swiper)}
                            className="h-full w-full"
                        >
                            {heroSlides.map((slide) => (
                                <SwiperSlide key={slide.id}>
                                    <div className="relative h-full w-full">
                                        <img 
                                            src={slide.image} 
                                            className="h-full w-full object-cover object-center" 
                                            alt={slide.headline}
                                        />
                                        <div className="absolute inset-0 bg-black/20" /> {/* Slight overlay for readability */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                                        
                                        <div className="absolute inset-0 flex flex-col justify-start pt-[24vh] md:pt-[35vh] px-8 md:px-16 text-white max-w-2xl">
                                             <AnimatePresence mode='wait'>
                                                {currentSlide === (slide.id - 1) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ duration: 0.5 }}
                                                    >
                                                        <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 tracking-tight leading-tight">
                                                            {slide.headline}
                                                        </h1>
                                                        <p className="text-lg md:text-xl mb-6 md:mb-8 text-white/90 font-light leading-relaxed line-clamp-3 md:line-clamp-none">
                                                            {slide.description}
                                                        </p>
                                                        <Link 
                                                            to={slide.link}
                                                            className="inline-block px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors"
                                                        >
                                                            {slide.cta}
                                                        </Link>
                                                    </motion.div>
                                                )}
                                             </AnimatePresence>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        
                        {/* Custom Slider Indicators at bottom left */}
                        <div className="absolute bottom-8 left-8 md:left-16 flex space-x-3 z-10">
                            {heroSlides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => swiperInstance?.slideToLoop(index)}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                        currentSlide === index 
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
                        
                        <div className="grid grid-cols-2 gap-4 h-full">
                            {/* Card 1: Raip */}
                            <div className="bg-[#fadcb8] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group cursor-pointer transition-transform hover:-translate-y-1 duration-300">
                                <div className="z-10 relative">
                                    <h3 className="text-xl font-bold text-gray-900">Raip</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-4">Authorized distributor</p>
                                    <button className="bg-[#e05884] text-white text-xs font-bold px-4 py-2 rounded-md shadow-sm hover:bg-[#c94570] transition-colors">
                                        Get Yours
                                    </button>
                                </div>
                                <img 
                                    src="https://placehold.co/150x200/png?text=Argan+Oil" 
                                    className="absolute bottom-0 right-0 w-24 h-auto object-contain translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"
                                    alt="Raip"
                                />
                                {/* Decorative circle */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                            </div>

                            {/* Card 2: Nature Skin */}
                            <div className="bg-[#cbf0f5] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group cursor-pointer transition-transform hover:-translate-y-1 duration-300">
                                <div className="z-10 relative">
                                    <h3 className="text-xl font-bold text-gray-900">Nature Skin</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-4">Authorized distributor</p>
                                    <button className="bg-[#e05884] text-white text-xs font-bold px-4 py-2 rounded-md shadow-sm hover:bg-[#c94570] transition-colors">
                                        Get Yours
                                    </button>
                                </div>
                                <img 
                                    src="https://placehold.co/150x200/png?text=Sun+Cream" 
                                    className="absolute bottom-0 right-0 w-24 h-auto object-contain translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"
                                    alt="Nature Skin"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 h-full">
                            {/* Card 3: Dabo */}
                            <div className="bg-[#e1f7e3] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group cursor-pointer transition-transform hover:-translate-y-1 duration-300">
                                <div className="z-10 relative">
                                    <h3 className="text-xl font-bold text-gray-900">Dabo</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-4">Authorized distributor</p>
                                    <button className="bg-[#e05884] text-white text-xs font-bold px-4 py-2 rounded-md shadow-sm hover:bg-[#c94570] transition-colors">
                                        Get Yours
                                    </button>
                                </div>
                                <img 
                                    src="https://placehold.co/150x150/png?text=Cream" 
                                    className="absolute bottom-[-10px] right-[-10px] w-28 h-auto object-contain group-hover:scale-110 transition-transform duration-500"
                                    alt="Dabo"
                                />
                            </div>

                            {/* Card 4: Phytotree */}
                            <div className="bg-[#f2e2fa] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group cursor-pointer transition-transform hover:-translate-y-1 duration-300">
                                <div className="z-10 relative">
                                    <h3 className="text-xl font-bold text-gray-900">Phytotree</h3>
                                    <p className="text-sm text-gray-600 mt-1 mb-4">Authorized distributor</p>
                                    <button className="bg-[#e05884] text-white text-xs font-bold px-4 py-2 rounded-md shadow-sm hover:bg-[#c94570] transition-colors">
                                        Get Yours
                                    </button>
                                </div>
                                <img 
                                    src="https://placehold.co/150x200/png?text=Phyto" 
                                    className="absolute bottom-0 right-0 w-20 h-auto object-contain translate-x-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500"
                                    alt="Phytotree"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Scrolling Marquee - The "Cool Thing" */}
            <div className="bg-black py-4 overflow-hidden whitespace-nowrap">
                <motion.div 
                    animate={{ x: [0, -1000] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="flex space-x-12 items-center"
                >
                     {[...Array(10)].map((_, i) => (
                        <span key={i} className="text-white text-sm font-medium uppercase tracking-[0.2em]">
                            Clinical Formulations &bull; Integrity &bull; Maryone
                        </span>
                    ))}
                </motion.div>
            </div>
            

            {/* Grid Layout - Inspired by The Ordinary */}
            <section className="mx-auto max-w-[1920px] px-4 py-20 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center mb-16">
                     <h2 className="text-3xl font-bold uppercase tracking-tight text-gray-900">Curated Regimens</h2>
                     <div className="w-20 h-1 bg-black mt-4" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
                     {products.slice(0, 12).map((product) => (
                        <div key={product.id} className="bg-white border-b border-r border-gray-100 p-4">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </section>
            
            {/* Minimal Info Section */}
            <section className="bg-gray-50 py-24 px-6 text-center">
                 <div className="max-w-2xl mx-auto space-y-6">
                    <h3 className="text-2xl font-bold uppercase tracking-widest text-gray-900">Simplicity is the ultimate sophistication</h3>
                    <p className="text-gray-600 leading-relaxed max-w-lg mx-auto">
                        Maryone creates products that respect your skin and the environment. 
                        We believe in transparency, efficacy, and minimalist design.
                    </p>
                    <Link to="/about" className="inline-block border-b border-black pb-1 text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">
                        Learn More
                    </Link>
                 </div>
            </section>
            
            {/* Top Brands Section */}
            <TopBrands />
            
            {/* Shipping Banner Section */}
            <ShippingBanner />
        </div>
    );
};

export default HomePage;
