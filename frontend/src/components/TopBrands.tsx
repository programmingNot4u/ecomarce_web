import { Link } from 'react-router-dom';

const brands = [
  { name: 'ANJO', logo: 'https://placehold.co/200x80?text=ANJO' },
  { name: 'Anua', logo: 'https://placehold.co/200x80?text=Anua' },
  { name: 'AXIS-Y', logo: 'https://placehold.co/200x80?text=AXIS-Y' },
  { name: 'COSRX', logo: 'https://placehold.co/200x80?text=COSRX' },
  { name: 'DABO', logo: 'https://placehold.co/200x80?text=DABO' },
  { name: 'Nature Skin', logo: 'https://placehold.co/200x80?text=Nature+Skin' },
  { name: 'ILLIYOON', logo: 'https://placehold.co/200x80?text=ILLIYOON' },
  { name: 'MISSHA', logo: 'https://placehold.co/200x80?text=MISSHA' },
];

export default function TopBrands() {
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
            {brands.map((brand, index) => (
              <div
                key={`${brand.name}-${index}`}
                className="relative flex items-center justify-center p-8 h-32 bg-white border-r border-b border-gray-400 hover:bg-gray-50 transition-colors last:border-r-0 sm:[&:nth-child(4n)]:border-r-0"
              >
                <img
                  className="max-h-8 w-auto object-contain"
                  src={brand.logo}
                  alt={brand.name}
                />
              </div>
            ))}
            {/* Adding 4 more dummy slots to match 3 rows if needed, or just 8 is fine. The reference had 3 rows. */}
             {[...Array(4)].map((_, i) => (
                 <div
                 key={`placeholder-${i}`}
                 className="relative flex items-center justify-center p-8 h-32 bg-white border-r border-b border-gray-400 hover:bg-gray-50 transition-colors sm:[&:nth-child(4n)]:border-r-0"
               >
                   <span className="text-gray-300 font-bold text-xl uppercase tracking-widest">Brand</span>
               </div>
             ))}
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
