import { Dialog, Transition } from '@headlessui/react';
import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon as StarIconSolid, XMarkIcon } from '@heroicons/react/20/solid';
import { HeartIcon, MinusIcon, PlusIcon, ShareIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
// @ts-ignore
// @ts-ignore
import BundleWidget from '../components/marketing/BundleWidget';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useTheme } from '../context/ThemeContext'; // Import Theme Context
import { getMediaUrl } from '../services/api';


function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { products } = useProducts();
    const product = products.find((p) => p.id === Number(id));
    const { addToCart } = useCart();
    const { theme } = useTheme();
    const { user, isAuthenticated } = useAuth(); // Get user from AuthContext

    // Safeguard: Fallback to default if theme.productPage is missing (e.g. during migration)
    const config = theme.productPage || {
        layout: 'classic',
        showRelatedProducts: true,
        showYouMayLike: true,
        showBreadcrumbs: true,
        galleryStyle: 'slider'
    };

    const [quantity, setQuantity] = useState(1);
    const [openLightbox, setOpenLightbox] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

    useEffect(() => {
        if (product?.variants) {
            const defaults: Record<string, string> = {};
            product.variants.forEach(v => {
                if (v.options.length > 0) defaults[v.name] = v.options[0];
            });
            setSelectedAttributes(defaults);
        }
    }, [product]);

    const activeCombination = product?.combinations?.find(c => {
        return selectedAttributes && Object.entries(selectedAttributes).every(([key, val]) => c.attributes[key] === val);
    });

    const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
    const { addReview, getProductReviews, getProductQuestions, addQuestion } = useProducts();
    const productReviews = product ? getProductReviews(product.id) : [];
    const productQuestions = product ? getProductQuestions(product.id) : [];

    // Review Form State
    const [newReviewRating, setNewReviewRating] = useState(5);
    const [newReviewComment, setNewReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [newReviewImages, setNewReviewImages] = useState<string[]>([]);

    // Q&A Form State
    const [newQuestionText, setNewQuestionText] = useState('');
    const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

    const handleSubmitQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || !newQuestionText.trim()) return;

        setIsSubmittingQuestion(true);
        addQuestion({
            productId: product.id,
            userName: isAuthenticated && user?.name ? user.name : 'Guest User',
            question: newQuestionText,
        });
        setNewQuestionText('');
        // Simulate delay/success message
        setTimeout(() => setIsSubmittingQuestion(false), 2000);
    };

    // Add to Cart Animation State
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = () => {
        setIsAdding(true);

        let cartItem = { ...product };

        if (activeCombination) {
            cartItem = {
                ...cartItem,
                id: product.id, // Keep base product ID or use combo ID? CartContext handles ID matching. 
                // Usually we want unique ID for cart item if variants differ, but CartContext logic checks logic.
                // CartContext: checks item.id === product.id && item.variantId === product.variantId?
                // Let's check CartContext. It matches by ID. 
                // We need to pass variantId.
                variantId: activeCombination.id,
                price: activeCombination.price || product.price,
                image: activeCombination.image ? getMediaUrl(activeCombination.image) : product.image ? getMediaUrl(product.image) : '',
                variantInfo: selectedAttributes,
                // Override name?
                // name: `${product.name} - ${Object.values(selectedAttributes).join('/')}`
            };
        }

        addToCart(cartItem, quantity);
        setTimeout(() => setIsAdding(false), 1000);
    };

    // Handle Image Upload (Simulation using FileReader)
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            // Limit to 3 images total including existing
            const remainingSlots = 3 - newReviewImages.length;
            const filesToProcess = files.slice(0, remainingSlots);

            filesToProcess.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewReviewImages(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setNewReviewImages(prev => prev.filter((_, i) => i !== index));
    };

    // ...

    const [reviewSuccess, setReviewSuccess] = useState(false);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;
        setIsSubmittingReview(true);
        setReviewSuccess(false);

        try {
            await addReview({
                productId: product.id,
                userName: isAuthenticated && user?.name ? user.name : 'Guest User',
                rating: newReviewRating,
                comment: newReviewComment,
                images: newReviewImages
            });
            setNewReviewComment('');
            setNewReviewImages([]);
            setReviewSuccess(true);
            setTimeout(() => setReviewSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to submit review");
        } finally {
            setIsSubmittingReview(false);
        }
    };


    const closeDrawer = () => setActiveDrawer(null);

    // Use products from context for "related"
    // Use products from context for "related"
    const relatedProducts = product
        ? products
            .filter(p => p.id !== product.id && (
                p.category === product.category ||
                p.category_name === product.category_name ||
                (typeof p.category === 'object' && typeof product.category === 'object' && (p.category as any).id === (product.category as any).id)
            ))
            .slice(0, 4)
        : [];

    // Fallback if no related found, show random
    const finalRelatedProducts = relatedProducts.length > 0 ? relatedProducts : products.filter(p => p.id !== Number(id)).slice(0, 4);

    const youMayAlsoLike = products.filter(p => !finalRelatedProducts.find(r => r.id === p.id) && p.id !== Number(id)).slice(0, 4);

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                <p className="text-gray-500 mb-6">The product you are looking for does not exist or has been removed.</p>
                <a href="/shop" className="text-white bg-black px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors">
                    Continue Shopping
                </a>
            </div>
        );
    }

    const productImages = product.images && product.images.length > 0
        ? product.images.map(getMediaUrl)
        : [getMediaUrl(product.image), getMediaUrl(product.image), getMediaUrl(product.image), getMediaUrl(product.image)].filter(Boolean); // Fallback to main image repeated or single if others missing.

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDirection(1);
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDirection(-1);
        setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    };

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-[1920px] px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                {config.showBreadcrumbs && (
                    <nav aria-label="Breadcrumb" className="mb-8">
                        <ol role="list" className="flex items-center space-x-2 text-sm text-gray-500">
                            <li><a href="/" className="hover:text-gray-900">Home</a></li>
                            <li><ChevronRightIcon className="h-4 w-4 text-gray-400" /></li>
                            <li><a href="/shop" className="hover:text-gray-900">Shop</a></li>
                            {(product.category_details?.name || typeof product.category === 'string' ? product.category : '') && (
                                <>
                                    <li><ChevronRightIcon className="h-4 w-4 text-gray-400" /></li>
                                    <li><a href={`/shop?category=${encodeURIComponent(product.category_details?.name || product.category || '')}`} className="hover:text-gray-900">{product.category_details?.name || product.category}</a></li>
                                </>
                            )}
                            <li><ChevronRightIcon className="h-4 w-4 text-gray-400" /></li>
                            <li className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</li>
                        </ol>
                    </nav>
                )}

                {/* Layout Switcher Container */}
                <div className={`
             ${config.layout === 'classic' ? 'lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12' : ''}
             ${config.layout === 'modern_centered' ? 'max-w-4xl mx-auto flex flex-col items-center text-center' : ''}
             ${config.layout === 'immersive' ? 'flex flex-col gap-12' : ''}
        `}>

                    {/* Image Gallery Section */}
                    <div className={`
              flex flex-col relative group 
              ${config.layout === 'immersive' ? 'w-full' : ''}
              ${config.layout === 'modern_centered' ? 'w-full mb-10' : ''}
          `}>

                        {/* Main Image Viewer */}
                        <div className={`
                relative rounded-sm overflow-hidden bg-gray-50 
                ${config.layout === 'immersive' ? 'aspect-[21/9] max-h-[70vh]' : 'aspect-[4/5] max-w-[500px] mx-auto w-full'}
            `}>
                            <div className="h-full w-full relative z-10 cursor-pointer flex items-center justify-center p-0" onClick={() => setOpenLightbox(true)}>
                                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                    <motion.img
                                        key={currentImageIndex}
                                        src={productImages[currentImageIndex]}
                                        custom={direction}
                                        variants={{
                                            enter: (direction: number) => ({
                                                x: direction > 0 ? 1000 : -1000,
                                                opacity: 0,
                                                scale: 0.95
                                            }),
                                            center: {
                                                zIndex: 1,
                                                x: 0,
                                                opacity: 1,
                                                scale: 1
                                            },
                                            exit: (direction: number) => ({
                                                zIndex: 0,
                                                x: direction < 0 ? 1000 : -1000,
                                                opacity: 0,
                                                scale: 0.95
                                            })
                                        }}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            x: { type: "spring", stiffness: 300, damping: 30 },
                                            opacity: { duration: 0.2 }
                                        }}
                                        className="absolute w-full h-full object-cover"
                                        alt={product.name}
                                    />
                                </AnimatePresence>

                                {/* Navigation Arrows */}
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white text-black shadow-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                                >
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>

                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white text-black shadow-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                                >
                                    <ChevronRightIcon className="w-6 h-6" />
                                </button>

                                {/* Dot Indicators */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20 pointer-events-auto">
                                    {productImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentImageIndex === idx
                                                ? 'bg-primary w-4'
                                                : 'bg-primary/30 hover:bg-primary/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Marketing: Bundle Widget (Moved here) */}
                        <BundleWidget productId={product.id} />
                    </div>

                    {/* Product Info (Right Column or Bottom) */}
                    <div className={`
                ${config.layout === 'classic' ? 'mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0 lg:pl-8' : ''}
                ${config.layout === 'modern_centered' ? 'w-full max-w-lg' : ''}
                ${config.layout === 'immersive' ? 'max-w-2xl mx-auto w-full px-4' : ''}
          `}>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                        {/* Reviews Summary */}
                        <div className="flex items-center mb-6">
                            <div className="flex items-center">
                                {[0, 1, 2, 3, 4].map((rating) => (
                                    <StarIconSolid
                                        key={rating}
                                        className={classNames(
                                            product.rating > rating ? 'text-yellow-400' : 'text-gray-200',
                                            'h-5 w-5 flex-shrink-0'
                                        )}
                                        aria-hidden="true"
                                    />
                                ))}
                            </div>
                            <span
                                className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
                                onClick={() => setActiveDrawer('reviews')}
                            >
                                {productReviews.length} reviews
                            </span>
                        </div>

                        {/* Price */}
                        <div className="mt-4 mb-8">
                            {product.salePrice && (activeCombination?.price ? activeCombination.price < product.salePrice : product.salePrice < product.price) ? (
                                <p className="text-2xl font-normal text-gray-900">Tk {(activeCombination?.price ?? product.salePrice).toLocaleString('en-BD')}</p>
                            ) : (
                                <div className="flex items-baseline gap-4">
                                    <p className="text-2xl font-normal text-gray-900">Tk {(activeCombination?.price ?? product.price).toLocaleString('en-BD', { minimumFractionDigits: 2 })}</p>
                                    {activeCombination?.price && activeCombination.price !== product.price && (
                                        <span className="text-sm text-gray-500 line-through">Tk {product.price.toLocaleString('en-BD')}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quantity and Variants Row */}
                        <div className="grid grid-cols-1 gap-6 mb-8">
                            {/* Variants Selectors */}
                            {product.variants?.map((variant) => (
                                <div key={variant.id}>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">{variant.name}</label>
                                    <div className="flex flex-wrap gap-3">
                                        {variant.options.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => setSelectedAttributes(prev => ({ ...prev, [variant.name]: opt }))}
                                                className={`
                                        px-4 py-3 text-sm font-medium border transition-all duration-200
                                        ${selectedAttributes[variant.name] === opt
                                                        ? 'border-primary bg-primary text-white'
                                                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'}
                                    `}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Quantity</label>
                                <div className="flex items-center border border-gray-300 h-12 w-32">
                                    <button onClick={() => handleQuantityChange(-1)} className="px-4 text-gray-500 hover:text-black hover:bg-gray-50 h-full flex items-center justify-center border-r border-gray-300 w-12"><MinusIcon className="h-4 w-4" /></button>
                                    <span className="flex-1 text-center font-medium text-gray-900">{quantity}</span>
                                    <button onClick={() => handleQuantityChange(1)} className="px-4 text-gray-500 hover:text-black hover:bg-gray-50 h-full flex items-center justify-center border-l border-gray-300 w-12"><PlusIcon className="h-4 w-4" /></button>
                                </div>
                            </div>
                        </div>


                        {/* Product Code */}
                        <div className="flex justify-between py-4 text-xs uppercase tracking-wide border-t border-gray-200">
                            <span className="font-bold text-gray-900">Product Code</span>
                            <span className="text-gray-500">{product.sku || '050253112001'}</span>
                        </div>

                        {/* Drawer Triggers List */}
                        <div className="border-t border-gray-200 divide-y divide-gray-200 mb-8">

                            {product.sections?.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveDrawer(section.id)}
                                    className="w-full flex-1 flex justify-between items-center py-4 text-sm font-bold text-gray-900 hover:text-gray-600 uppercase tracking-wide text-left"
                                >
                                    {section.title}
                                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                </button>
                            ))}

                            <button
                                onClick={() => setActiveDrawer('reviews')}
                                className="w-full flex justify-between items-center py-4 text-sm font-bold text-gray-900 hover:text-gray-600 uppercase tracking-wide text-left"
                            >
                                Reviews
                                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                            </button>

                            <button
                                onClick={() => setActiveDrawer('qa')}
                                className="w-full flex justify-between items-center py-4 text-sm font-bold text-gray-900 hover:text-gray-600 uppercase tracking-wide text-left"
                            >
                                Questions ({productQuestions.length})
                                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <button type="button" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline block">
                                Find in Store
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAddToCart}
                                disabled={isAdding || (activeCombination && product.manageStock && activeCombination.stockQuantity <= 0 && !product.allowBackorders)}
                                animate={{
                                    backgroundColor: isAdding ? '#16a34a' : (activeCombination && product.manageStock && activeCombination.stockQuantity <= 0 && !product.allowBackorders ? '#d1d5db' : '#828E87'),
                                    cursor: (activeCombination && product.manageStock && activeCombination.stockQuantity <= 0 && !product.allowBackorders) ? 'not-allowed' : 'pointer'
                                }}
                                className="flex-1 h-12 text-sm font-bold text-white uppercase tracking-widest transition-colors flex items-center justify-center overflow-hidden relative"
                            >
                                <AnimatePresence mode="wait">
                                    {isAdding ? (
                                        <motion.div
                                            key="added"
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                            Added
                                        </motion.div>
                                    ) : (
                                        <motion.span
                                            key="add"
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {activeCombination && product.manageStock && activeCombination.stockQuantity <= 0 && !product.allowBackorders
                                                ? 'Out of Stock'
                                                : 'Add to Bag'
                                            }
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            <button type="button" className="h-12 w-12 flex items-center justify-center border border-primary hover:bg-gray-50 transition-colors">
                                <HeartIcon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                            </button>

                            <button type="button" className="h-12 w-12 flex items-center justify-center border border-primary hover:bg-gray-50 transition-colors">
                                <ShareIcon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                            </button>
                        </div>

                    </div>
                </div>


                {/* Similar Products Section */}
                {config.showRelatedProducts && (
                    <div className="mt-24 border-t border-gray-200 pt-16">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8 capitalize">Similar Products</h2>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 lg:gap-x-8">
                            {finalRelatedProducts.map((product) => (
                                <div key={product.id} className="relative group">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* You May Also Like Section */}
                {config.showYouMayLike && (
                    <div className="mt-24 border-t border-gray-200 pt-16">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8 capitalize">You May Also Like</h2>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 lg:gap-x-8">
                            {youMayAlsoLike.map((product) => (
                                <div key={product.id} className="relative group">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lightbox Component */}
                <Lightbox
                    open={openLightbox}
                    close={() => setOpenLightbox(false)}
                    index={currentImageIndex} // Sync index
                    slides={productImages.map(src => ({ src }))}
                    plugins={[Zoom]} // Enable zoom plugin in lightbox
                    animation={{ fade: 0 }} // Instant open feel
                    controller={{ closeOnBackdropClick: true }}
                    on={{
                        view: ({ index }) => setCurrentImageIndex(index) // Sync back to state when sliding in lightbox
                    }}
                />

            </div>

            {/* Side Drawer Implementation using Headless UI Dialog */}
            <Transition.Root show={activeDrawer !== null} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeDrawer}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-in-out duration-500"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-500"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                                <Transition.Child
                                    as={Fragment}
                                    enter="transform transition ease-in-out duration-500 sm:duration-700"
                                    enterFrom="translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transform transition ease-in-out duration-500 sm:duration-700"
                                    leaveFrom="translate-x-0"
                                    leaveTo="translate-x-full"
                                >
                                    <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                        <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                            <div className="flex items-start justify-between px-4 py-6 sm:px-6 border-b border-gray-100">
                                                <Dialog.Title className="text-lg font-bold text-gray-900 uppercase tracking-widest">
                                                    {activeDrawer === 'reviews' && 'Reviews'}
                                                    {product.sections?.find(s => s.id === activeDrawer)?.title}
                                                </Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                                                        onClick={closeDrawer}
                                                    >
                                                        <span className="absolute -inset-0.5" />
                                                        <span className="sr-only">Close panel</span>
                                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="relative mt-6 flex-1 px-4 sm:px-6">
                                                {/* Drawer Content Logic */}

                                                {/* Description Content */}


                                                {/* Reviews Content */}
                                                {activeDrawer === 'reviews' && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-8">
                                                            <div>
                                                                <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                                                                <div className="flex items-center mt-2">
                                                                    <div className="flex items-center">
                                                                        {[0, 1, 2, 3, 4].map((rating) => (
                                                                            <StarIconSolid
                                                                                key={rating}
                                                                                className={classNames(
                                                                                    product.rating > rating ? 'text-yellow-400' : 'text-gray-200',
                                                                                    'h-5 w-5 flex-shrink-0'
                                                                                )}
                                                                                aria-hidden="true"
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <p className="ml-2 text-sm text-gray-500">{productReviews.length} reviews</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Write Review Form */}
                                                        <div className="bg-gray-50 p-6 rounded-lg mb-8">
                                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
                                                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                                                                    <div className="flex items-center mt-1 space-x-1">
                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                            <button
                                                                                key={star}
                                                                                type="button"
                                                                                onClick={() => setNewReviewRating(star)}
                                                                                className="focus:outline-none"
                                                                            >
                                                                                <StarIconSolid
                                                                                    className={classNames(
                                                                                        newReviewRating >= star ? 'text-yellow-400' : 'text-gray-300',
                                                                                        'h-8 w-8 hover:text-yellow-400 transition-colors'
                                                                                    )}
                                                                                />
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Review</label>
                                                                    <textarea
                                                                        id="comment"
                                                                        rows={4}
                                                                        required
                                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                                                        value={newReviewComment}
                                                                        onChange={(e) => setNewReviewComment(e.target.value)}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700">Add Photos</label>
                                                                    <div className="mt-2 flex items-center space-x-4">
                                                                        <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                                                                            <span>Upload</span>
                                                                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                                                        </label>
                                                                        <span className="text-xs text-gray-500">Max 3 photos</span>
                                                                    </div>
                                                                    {newReviewImages.length > 0 && (
                                                                        <div className="mt-4 flex space-x-2">
                                                                            {newReviewImages.map((img, idx) => (
                                                                                <div key={idx} className="relative h-20 w-20">
                                                                                    <img src={img} alt="Review" className="h-full w-full object-cover rounded-md" />
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => removeImage(idx)}
                                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                                                    >
                                                                                        <XMarkIcon className="h-3 w-3" />
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {reviewSuccess ? (
                                                                    <div className="bg-green-50 text-green-800 p-4 rounded-md border border-green-200 flex items-center gap-3">
                                                                        <CheckCircleIcon className="h-5 w-5" />
                                                                        <div>
                                                                            <p className="font-bold text-sm">Review Submitted!</p>
                                                                            <p className="text-xs mt-1">Thank you for your feedback.</p>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="submit"
                                                                        disabled={isSubmittingReview}
                                                                        className="w-full bg-black text-white px-4 py-3 rounded-md font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50"
                                                                    >
                                                                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                                                    </button>
                                                                )}
                                                            </form>
                                                        </div>

                                                        {/* Reviews List */}
                                                        <div className="space-y-8">
                                                            {productReviews.map((review) => (
                                                                <div key={review.id} className="border-b border-gray-200 pb-8 last:border-0">
                                                                    <div className="flex items-center mb-2">
                                                                        <div className="flex items-center">
                                                                            {[0, 1, 2, 3, 4].map((rating) => (
                                                                                <StarIconSolid
                                                                                    key={rating}
                                                                                    className={classNames(
                                                                                        review.rating > rating ? 'text-yellow-400' : 'text-gray-200',
                                                                                        'h-4 w-4'
                                                                                    )}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                        <span className="ml-2 text-sm font-bold text-gray-900">{review.userName}</span>
                                                                        <span className="ml-2 text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 mb-4">{review.comment}</p>
                                                                    {review.images && review.images.length > 0 && (
                                                                        <div className="flex gap-2 mt-2">
                                                                            {review.images.map((img, i) => (
                                                                                <img key={i} src={img} alt="Review attachment" className="h-16 w-16 object-cover rounded-md" />
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {productReviews.length === 0 && (
                                                                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Q&A Content */}
                                                {activeDrawer === 'qa' && (
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wider">Questions & Answers</h4>

                                                        {/* Ask Question Form */}
                                                        <div className="mb-10 bg-gray-50 p-6 rounded-lg border border-gray-100">
                                                            <h5 className="font-bold text-gray-900 mb-4 text-sm uppercase">Ask a Question</h5>
                                                            {isSubmittingQuestion ? (
                                                                <div className="bg-green-50 text-green-800 p-4 rounded-md border border-green-200 flex items-center gap-3">
                                                                    <CheckCircleIcon className="h-5 w-5" />
                                                                    <div>
                                                                        <p className="font-bold text-sm">Question Submitted!</p>
                                                                        <p className="text-xs mt-1">We will notify you when it's answered.</p>
                                                                    </div>
                                                                    <button onClick={() => setIsSubmittingQuestion(false)} className="ml-auto text-xs underline">Ask another</button>
                                                                </div>
                                                            ) : (
                                                                <form onSubmit={handleSubmitQuestion} className="space-y-4">
                                                                    <div>
                                                                        <textarea
                                                                            required
                                                                            rows={3}
                                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-3"
                                                                            placeholder="Ask something about this product..."
                                                                            value={newQuestionText}
                                                                            onChange={(e) => setNewQuestionText(e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        type="submit"
                                                                        className="w-full bg-black text-white text-xs font-bold uppercase py-3 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                                                                        disabled={!newQuestionText.trim()}
                                                                    >
                                                                        Submit Question
                                                                    </button>
                                                                </form>
                                                            )}
                                                        </div>

                                                        <div className="space-y-8">
                                                            {productQuestions.length > 0 ? productQuestions.map((q) => (
                                                                <div key={q.id} className="border-b border-gray-100 pb-6 last:border-0">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div>
                                                                            <span className="font-bold text-gray-900 text-sm">Q: {q.question}</span>
                                                                            <p className="text-xs text-gray-400 mt-1">{q.userName} - {new Date(q.date).toLocaleDateString()}</p>
                                                                        </div>
                                                                    </div>

                                                                    {q.answer ? (
                                                                        <div className="mt-3 ml-4 bg-gray-50 p-4 rounded-lg border-l-2 border-green-500">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Answer</span>
                                                                                <span className="text-[10px] text-gray-400">{new Date(q.answerDate || '').toLocaleDateString()}</span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-xs text-orange-500 mt-2 ml-4 italic">Waiting for answer...</p>
                                                                    )}
                                                                </div>
                                                            )) : (
                                                                <p className="text-center text-gray-500 py-4">No questions yet. Be the first to ask!</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dynamic Section Content */}
                                                {product.sections?.map(section => (
                                                    activeDrawer === section.id && (
                                                        <div key={section.id} className="space-y-6 text-sm text-gray-600">
                                                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
                                                        </div>
                                                    )
                                                ))}

                                            </div>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
}
