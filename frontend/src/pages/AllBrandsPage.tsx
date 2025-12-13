import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';

export default function AllBrandsPage() {
  const { brands } = useProducts();

  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">Our Brands</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our curated collection of premium beauty and skincare brands from around the world.
            </p>
        </div>

        {/* Brands Grid - Darker borders */}
        {brands.length > 0 ? (
            <div className="border border-gray-400 rounded-sm overflow-hidden">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {brands.map((brand, index) => (
                    <div
                        key={`${brand.id}-${index}`}
                        className="relative flex items-center justify-center p-8 h-40 bg-white border-r border-b border-gray-400 hover:bg-gray-50 transition-colors"
                    >
                        {brand.image ? (
                             <img
                             className="max-h-20 w-auto object-contain"
                             src={brand.image}
                             alt={brand.name}
                           />
                        ) : (
                             <div className="flex flex-col items-center gap-2">
                                <BuildingStorefrontIcon className="h-8 w-8 text-gray-300" />
                                <span className="text-gray-900 font-bold text-sm uppercase tracking-wider text-center">{brand.name}</span>
                             </div>
                        )}
                    </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">No brands available yet.</p>
                <Link to="/" className="text-black underline mt-4 inline-block">Go Home</Link>
            </div>
        )}

        <div className="mt-12 text-center">
            <Link to="/" className="text-sm font-semibold text-gray-900 hover:text-gray-600 border-b border-gray-900 pb-1">
                &larr; Back to Home
            </Link>
        </div>

      </div>
    </div>
  );
}
