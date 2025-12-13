import { Dialog, Transition } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon as StarIconSolid, XMarkIcon } from '@heroicons/react/20/solid';
import { HeartIcon, MinusIcon, PlusIcon, ShareIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
// @ts-ignore
// @ts-ignore
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';


function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { products } = useProducts();
  const product = products.find((p) => p.id === Number(id));
  const { addToCart } = useCart();
  
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
  const { addReview, getProductReviews } = useProducts();
  const productReviews = product ? getProductReviews(product.id) : [];

  // Review Form State
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Add to Cart Animation State
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
      setIsAdding(true);
      addToCart(product, quantity);
      setTimeout(() => setIsAdding(false), 1000);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
      e.preventDefault();
      if (!product) return;
      setIsSubmittingReview(true);
      
      addReview({
          productId: product.id,
          userName: 'Guest User', // Replace with auth user if available
          rating: newReviewRating,
          comment: newReviewComment
      });

      setNewReviewComment('');
      setNewReviewRating(5);
      setIsSubmittingReview(false);
  };


  const closeDrawer = () => setActiveDrawer(null);

  // Use products from context for "related"
  const relatedProducts = products.filter(p => p.id !== Number(id)).slice(0, 4);
  const youMayAlsoLike = products.slice(4, 8); 

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
      ? product.images 
      : [product.image, product.image, product.image, product.image].filter(Boolean); // Fallback to main image repeated or single if others missing.

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
        <nav aria-label="Breadcrumb" className="mb-8">
            <ol role="list" className="flex items-center space-x-2 text-sm text-gray-500">
                <li><a href="/" className="hover:text-gray-900">Home</a></li>
                <li><ChevronRightIcon className="h-4 w-4 text-gray-400" /></li>
                <li><a href="/shop" className="hover:text-gray-900">Shop</a></li>
                {product.category && (
                    <>
                        <li><ChevronRightIcon className="h-4 w-4 text-gray-400" /></li>
                        <li><a href={`/shop/category/${product.category.toLowerCase()}`} className="hover:text-gray-900">{product.category}</a></li>
                    </>
                )}
                <li><ChevronRightIcon className="h-4 w-4 text-gray-400" /></li>
                <li className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</li>
            </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12">
          
          {/* Image Gallery Section */}
          <div className="flex flex-col relative group">
            
        {/* Main Image Viewer */}
            <div className="w-full max-w-[500px] mx-auto relative rounded-sm overflow-hidden bg-gray-50 aspect-[4/5]">
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
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    currentImageIndex === idx 
                                        ? 'bg-black w-4' 
                                        : 'bg-black/30 hover:bg-black/50' 
                                }`}
                            />
                        ))}
                    </div>
               </div>
            </div>
          </div>

          {/* Product Info (Right Column) */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0 lg:pl-8">
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
                                            ? 'border-black bg-black text-white' 
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
            </div>

            <div className="mb-6">
                 <button type="button" className="text-xs font-bold uppercase tracking-widest text-black hover:underline block">
                    Find in Store
                </button>
            </div>

            <div className="flex gap-4">
                 <motion.button
                   type="button"
                   whileTap={{ scale: 0.95 }}
                   onClick={handleAddToCart}
                   animate={{ 
                       backgroundColor: isAdding ? '#16a34a' : '#000000', 
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
                                Add to Bag
                            </motion.span>
                        )}
                   </AnimatePresence>
                 </motion.button>
                 
                 <button type="button" className="h-12 w-12 flex items-center justify-center border border-black hover:bg-gray-50 transition-colors">
                   <HeartIcon className="h-6 w-6 text-black" strokeWidth={1.5} />
                 </button>

                  <button type="button" className="h-12 w-12 flex items-center justify-center border border-black hover:bg-gray-50 transition-colors">
                   <ShareIcon className="h-6 w-6 text-black" strokeWidth={1.5} />
                 </button>
            </div>
            
                </div> 
            </div>
        
        {/* Similar Products Section */}
        <div className="mt-24 border-t border-gray-200 pt-16">
             <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8 capitalize">Similar Products</h2>
             <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 lg:gap-x-8">
                {relatedProducts.map((product) => (
                    <div key={product.id} className="relative group">
                         <ProductCard product={product} />
                    </div>
                ))}
             </div>
        </div>

        {/* You May Also Like Section */}
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
                                    <div className="flex items-center">
                                        <span className="text-3xl font-bold text-gray-900 mr-3">{product.rating}</span>
                                        <div>
                                            <div className="flex text-yellow-500">
                                                {[0,1,2,3,4].map(r => <StarIconSolid key={r} className="h-4 w-4" />)}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Based on {productReviews.length} reviews</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Write Review Form */}
                                <div className="mb-10 bg-gray-50 p-6 rounded-lg border border-gray-100">
                                    <h5 className="font-bold text-gray-900 mb-4 text-sm uppercase">Write a Review</h5>
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rating</label>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setNewReviewRating(star)}
                                                        className={`p-1 rounded-sm focus:outline-none ${newReviewRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    >
                                                        <StarIconSolid className="h-6 w-6" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Review</label>
                                            <textarea
                                                required
                                                rows={3}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-3"
                                                placeholder="Share your thoughts..."
                                                value={newReviewComment}
                                                onChange={(e) => setNewReviewComment(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingReview}
                                            className="w-full bg-black text-white text-xs font-bold uppercase py-3 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                                        >
                                            {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </form>
                                </div>

                                <div className="space-y-8">
                                    {productReviews.length > 0 ? productReviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className="font-bold text-gray-900">{review.userName}</h5>
                                                <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                                            </div>
                                             <div className="flex text-yellow-500 mb-3 gap-1">
                                                 {[0,1,2,3,4].map(r => (
                                                     <StarIconSolid 
                                                        key={r} 
                                                        className={`h-3 w-3 ${review.rating > r ? 'text-yellow-400' : 'text-gray-200'}`} 
                                                     />
                                                 ))}
                                            </div>
                                            <p className="text-sm text-gray-600">{review.comment}</p>
                                        </div>
                                    )) : (
                                        <p className="text-center text-gray-500 py-4">No reviews yet. Be the first to write one!</p>
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
