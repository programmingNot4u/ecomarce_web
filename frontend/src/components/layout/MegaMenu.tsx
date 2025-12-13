import { Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';

export default function MegaMenu() {
    const { categories } = useProducts();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="hidden lg:flex space-x-8 h-full items-center">
            {categories.map((category, index) => {
                const hasSubs = category.subCategories && category.subCategories.length > 0;
                // Generate URL slug for main category
                const categorySlug = encodeURIComponent(category.name).toLowerCase();

                return (
                    <div 
                        key={category.id} 
                        className="relative h-full flex items-center"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <Link
                            to={`/category/${categorySlug}`}
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
                            show={hoveredIndex === index && hasSubs}
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <div 
                                className="fixed left-0 right-0 top-[115px] w-full bg-white shadow-xl border-t border-gray-100 z-40 max-h-[70vh] overflow-y-auto"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            > 
                                <div className="mx-auto max-w-[1920px] px-6 md:px-20 py-12">
                                    <div className="grid grid-cols-12 gap-8">
                                        {/* Columns - Render Level 2 Categories as Headers */}
                                        <div className="col-span-9 grid grid-cols-4 gap-8 border-r border-gray-100 pr-8">
                                            {category.subCategories?.map((subCat) => (
                                                <div key={subCat.id}>
                                                    <Link to={`/category/${encodeURIComponent(subCat.name).toLowerCase()}`}>
                                                        <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider hover:text-gray-600">{subCat.name}</h3>
                                                    </Link>
                                                    {/* Render Level 3 Categories as Items if they exist */}
                                                    {subCat.subCategories && subCat.subCategories.length > 0 && (
                                                        <ul className="space-y-3">
                                                            {subCat.subCategories.map((level3) => (
                                                                <li key={level3.id}>
                                                                    <Link 
                                                                        to={`/category/${encodeURIComponent(level3.name).toLowerCase()}`} 
                                                                        className="text-sm text-gray-500 hover:text-black"
                                                                    >
                                                                        {level3.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Featured Image - Static/Placeholder or could be added to Category model later */}
                                        <div className="col-span-3">
                                             <div className="group relative overflow-hidden rounded-sm aspect-[3/4] bg-gray-100 flex items-center justify-center text-gray-400">
                                                {/* Placeholder for dynamic image future impl */}
                                                <p className="text-xs uppercase tracking-widest">New in {category.name}</p>
                                             </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Transition>
                    </div>
                );
            })}
        </div>
    );
}
