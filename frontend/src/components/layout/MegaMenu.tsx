import { Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';

const navigation = [
  { 
    name: 'WOMEN', 
    href: '/category/women',
    featuredImage: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?q=80&w=1000&auto=format&fit=crop', // Saree/Traditional vibe
    sections: [
        {
            heading: 'New Arrivals',
            items: [
                { name: 'All New', href: '#' },
                { name: 'Trending Now', href: '#' },
            ]
        },
        {
            heading: 'Saree',
            items: [
                { name: 'Cotton', href: '#' },
                { name: 'Muslin', href: '#' },
                { name: 'Silk', href: '#' },
                { name: 'Katan', href: '#' },
                { name: 'Jamdani', href: '#' },
            ]
        },
        {
            heading: 'Salwar Kameez',
            items: [
                { name: 'Cotton & Blends', href: '#' },
                { name: 'Silk', href: '#' },
                { name: 'Muslin', href: '#' },
            ]
        },
        {
            heading: 'Apparel',
             items: [
                { name: 'Kurtas', href: '#' },
                { name: 'Tops', href: '#' },
                { name: 'Pants', href: '#' },
                { name: 'Scarves', href: '#' },
            ]
        }
    ]
  },
  { 
    name: 'MEN', 
    href: '/category/men',
    featuredImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
    sections: [
         {
            heading: 'Clothing',
            items: [
                { name: 'Panjabi', href: '#' },
                { name: 'Shirts', href: '#' },
                { name: 'T-Shirts', href: '#' },
                { name: 'Pants', href: '#' },
            ]
         },
         {
            heading: 'Accessories',
             items: [
                { name: 'Wallets', href: '#' },
                { name: 'Belts', href: '#' },
                { name: 'Footwear', href: '#' },
            ]
         }
    ]
  },
   { 
    name: 'SKIN & HAIR', 
    href: '/category/skin-hair',
    featuredImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
    sections: [
         {
            heading: 'Skincare',
            items: [
                { name: 'Face Washes', href: '#' },
                { name: 'Moisturizers', href: '#' },
                { name: 'Serums', href: '#' },
                { name: 'Sunscreen', href: '#' },
            ]
         },
         {
            heading: 'Haircare',
             items: [
                { name: 'Shampoo', href: '#' },
                { name: 'Conditioner', href: '#' },
                { name: 'Hair Oils', href: '#' },
            ]
         },
         {
            heading: 'Body',
             items: [
                { name: 'Body Lotions', href: '#' },
                { name: 'Soaps', href: '#' },
                { name: 'Scrubs', href: '#' },
            ]
         }
    ]
  },
  { name: 'JEWELLERY', href: '/category/jewellery' },
  { name: 'HOME DÉCOR', href: '/category/home-decor' },
  { name: 'GIFTS', href: '/category/gifts' },
];

export default function MegaMenu() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="hidden lg:flex space-x-8 h-full items-center">
            {navigation.map((category, index) => (
                <div 
                    key={category.name} 
                    className="relative h-full flex items-center"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <Link
                        to={category.href}
                        className="text-xs font-bold text-gray-900 hover:text-gray-600 tracking-widest uppercase transition-colors relative z-10 py-6"
                    >
                        {category.name}
                        {/* Underline effect */}
                        {hoveredIndex === index && (
                             <span className="absolute bottom-4 left-0 w-full h-[2px] bg-black" />
                        )}
                    </Link>

                    {/* Mega Menu Dropdown */}
                    <Transition
                        show={hoveredIndex === index && !!category.sections}
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                         {/* 
                            Using fixed positioning to ensure full width relative to the viewport.
                            Top is calculated roughly based on standard header height (approx 80px-100px).
                            Ideally, we'd use a ref to measure, but fixed top-[xx] is stable enough for fixed headers.
                            The header is sticky, so fixed works well.
                        */}
                        <div 
                            className="fixed left-0 right-0 top-[115px] w-full bg-white shadow-xl border-t border-gray-100 z-40 max-h-[70vh] overflow-y-auto"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        > 
                            <div className="mx-auto max-w-[1920px] px-6 md:px-20 py-12">
                                <div className="grid grid-cols-12 gap-8">
                                    {/* Columns */}
                                    <div className="col-span-9 grid grid-cols-4 gap-8 border-r border-gray-100 pr-8">
                                        {category.sections?.map((section) => (
                                            <div key={section.heading}>
                                                <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">{section.heading}</h3>
                                                <ul className="space-y-3">
                                                    {section.items.map((item) => (
                                                        <li key={item.name}>
                                                            <Link to={item.href} className="text-sm text-gray-500 hover:text-black">
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Featured Image */}
                                    <div className="col-span-3">
                                        {category.featuredImage && (
                                            <div className="group relative overflow-hidden rounded-sm aspect-[3/4]">
                                                <img 
                                                    src={category.featuredImage} 
                                                    alt={category.name} 
                                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                                <div className="absolute bottom-6 left-6 text-white">
                                                    <p className="font-bold text-lg">New in {category.name}</p>
                                                    <span className="text-xs uppercase tracking-wider underline mt-2 block">Shop Now</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            ))}
        </div>
    );
}
