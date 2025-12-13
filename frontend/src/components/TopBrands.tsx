import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';

export default function TopBrands() {
  const { brands } = useProducts();
  
  // Sort by popularity (product count) and take top 8
  const topBrands = [...brands].sort((a, b) => b.count - a.count).slice(0, 8);

  return (
    <div className="bg-white py-12">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Top Brands</h2>
          <Link to="/brands" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors">
            All Brands
            <span aria-hidden="true"> &rsaquo;</span>
          </Link>
        </div>

          {/* Bordered Grid with darker borders */}
        <div className="border border-gray-400 rounded-sm overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {topBrands.length > 0 ? (
                topBrands.map((brand, index) => (
                <div
                    key={`${brand.id}-${index}`}
                    className="relative flex items-center justify-center p-8 h-32 bg-white border-r border-b border-gray-400 hover:bg-gray-50 transition-colors last:border-r-0 sm:[&:nth-child(4n)]:border-r-0"
                >
                    {brand.image ? (
                        <img
                        className="max-h-16 w-auto object-contain"
                        src={brand.image}
                        alt={brand.name}
                        />
                    ) : (
                        <span className="text-gray-900 font-bold text-lg uppercase tracking-wider text-center">{brand.name}</span>
                    )}
                </div>
                ))
            ) : (
                /* Empty state placeholders if no brands */
                [...Array(4)].map((_, i) => (
                    <div
                    key={`placeholder-${i}`}
                    className="relative flex items-center justify-center p-8 h-32 bg-white border-r border-b border-gray-400 sm:[&:nth-child(4n)]:border-r-0"
                    >
                        <span className="text-gray-300 font-bold text-xl uppercase tracking-widest text-center text-xs">No Brands<br/>Added</span>
                    </div>
                ))
            )}
             
            {/* Fill remaining slots to maintain grid if needed - simplified to just show what we have */}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end sm:hidden">
             <Link to="/brands" className="flex items-center gap-1 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors">
                All Brands
                <span aria-hidden="true"> &rsaquo;</span>
              </Link>
        </div>
      </div>
    </div>
  );
}
