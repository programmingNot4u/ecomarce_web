import { Disclosure } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'; // Accordion icons & Nav icons
import { HeartIcon, MinusIcon, PlusIcon, ShareIcon } from '@heroicons/react/24/outline'; // Need different icons
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import ImageMagnifier from '../components/ImageMagnifier';
// @ts-ignore
import logo from '../assets/logos/maryone_logo.png';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { products } from '../mocks/products';


function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Mock Similar Products
const getRelatedProducts = (currentId: number) => {
    return products.filter(p => p.id !== currentId).slice(0, 4);
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === Number(id));
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 

  if (!product) {
    return <div className="p-10 text-center">Product not found</div>;
  }
  
  const relatedProducts = getRelatedProducts(product.id);
  const youMayAlsoLike = products.slice(4, 8); 

  const productImages = product.images && product.images.length > 0 
      ? product.images 
      : [product.image, product.image, product.image, product.image];

  const handleQuantityChange = (delta: number) => {
      setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1920px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12">
          
          {/* Image Gallery Section */}
          <div className="flex flex-col relative group">
            
        {/* Main Image Viewer */}
            <div className="w-full relative rounded-sm overflow-hidden bg-gray-100 group">
                {/* Dynamic Blurred Background */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <img 
                        src={productImages[currentImageIndex]} 
                        alt="" 
                        className="w-full h-full object-cover blur-2xl scale-110 opacity-60 transition-all duration-700 ease-in-out"
                    />
                     <div className="absolute inset-0 bg-white/20" /> {/* Light overlay for brightness */}
                </div>

               <div className="h-[600px] w-full relative z-10 cursor-pointer flex items-center justify-center p-8 transition-transform duration-500" onClick={() => setOpenLightbox(true)}>
                    {/* Using Custom ImageMagnifier with 'contain' to avoid distortion */}
                    <div className="relative h-full w-full flex items-center justify-center shadow-2xl rounded-sm"> 
                        <ImageMagnifier
                            src={productImages[currentImageIndex]}
                            // Key change: Remove external sizing constraints that break the flex container
                            className="relative shadow-sm"
                            onClick={() => setOpenLightbox(true)}
                            watermarkSrc={logo}
                        />
                    </div>

                    {/* Navigation Arrows - Minimalist Black Chevrons */}
                    <button
                        onClick={handlePrevImage}
                        className="absolute left-0 top-1/2 -translate-y-1/2 p-4 text-black hover:text-gray-600 focus:outline-none transition-colors duration-300 z-10"
                        aria-label="Previous image"
                    >
                        <ChevronLeftIcon className="w-10 h-10 font-light" />
                    </button>
                    
                    <button
                        onClick={handleNextImage}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-black hover:text-gray-600 focus:outline-none transition-colors duration-300 z-10"
                        aria-label="Next image"
                    >
                        <ChevronRightIcon className="w-10 h-10 font-light" />
                    </button>

                    {/* Dot Indicators - Orange Active, Gray Inactive */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10 pointer-events-auto"> 
                        {productImages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                    currentImageIndex === idx 
                                        ? 'bg-orange-500 scale-110' 
                                        : 'bg-gray-300 hover:bg-gray-400' 
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
               </div>
            </div>
          </div>

          {/* Product Info (Right Column) */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0 lg:pl-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="mt-4">
              <h2 className="sr-only">Product information</h2>
              <p className="text-2xl text-gray-900 font-normal">Tk {product.price.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</p>
            </div>

            {/* Quantity Selector */}
            <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center border border-gray-300 w-fit rounded-sm">
                    <button 
                        onClick={() => handleQuantityChange(-1)} 
                        className="p-3 text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
                    >
                        <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="px-6 py-2 text-gray-900 font-medium min-w-[3.5rem] text-center border-x border-gray-300">
                        {quantity}
                    </span>
                     <button 
                        onClick={() => handleQuantityChange(1)} 
                        className="p-3 text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
                    >
                        <PlusIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="mt-8 border-t border-gray-200">
                {/* Product Code */}
                 <div className="flex justify-between py-4 text-sm border-b border-gray-200">
                    <span className="font-bold text-gray-900">Product Code</span>
                    <span className="text-gray-500">2222000000051</span>
                </div>

                {/* Accordions */}
                <Disclosure as="div" className="border-b border-gray-200">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between py-4 text-left text-sm font-bold text-gray-900 hover:text-gray-600 focus:outline-none">
                        <span>Product Description</span>
                        <ChevronRightIcon
                          className={classNames(open ? 'rotate-90 text-gray-500' : 'text-gray-400', 'h-5 w-5 transform transition-transform duration-200')}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="pb-4 pt-2 text-sm text-gray-600 leading-relaxed">
                         <p>{product.description ?? "Experience the finest quality with our signature collection. Meticulously crafted for style and comfort."}</p>
                         <ul className="list-disc pl-5 mt-4 space-y-1">
                             <li>Deeply hydrates to soften skin.</li>
                             <li>Restore skin's suppleness.</li>
                             <li>Natural ingredients.</li>
                         </ul>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>

                <Disclosure as="div" className="border-b border-gray-200">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between py-4 text-left text-sm font-bold text-gray-900 hover:text-gray-600 focus:outline-none">
                        <span>Reviews</span>
                        <ChevronRightIcon
                          className={classNames(open ? 'rotate-90 text-gray-500' : 'text-gray-400', 'h-5 w-5 transform transition-transform duration-200')}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="pb-4 pt-2 text-sm text-gray-600">
                        <div className="flex items-center mb-4">
                            <span className="text-yellow-400 text-lg">★★★★★</span>
                            <span className="ml-2 text-xs text-gray-500">(15 Reviews)</span>
                        </div>
                        <p>No reviews yet. Be the first to review this product!</p>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
            </div>
            
            <div className="mt-8">
                 <button type="button" className="text-sm font-bold uppercase tracking-wide text-black hover:underline mb-6 block">
                    Find in Store
                </button>

                <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => addToCart(product, quantity)}
                      className="flex-1 items-center justify-center rounded-sm bg-black px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-gray-800 focus:outline-none uppercase tracking-widest transition-colors"
                    >
                      Add to Bag
                    </button>
                    
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-sm border border-gray-300 px-3.5 py-3.5 text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <HeartIcon className="h-6 w-6" aria-hidden="true" />
                      <span className="sr-only">Add to favorites</span>
                    </button>

                     <button
                      type="button"
                      className="flex items-center justify-center rounded-sm border border-gray-300 px-3.5 py-3.5 text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <ShareIcon className="h-6 w-6" aria-hidden="true" />
                      <span className="sr-only">Share</span>
                    </button>
                </div>
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
    </div>
  );
}
