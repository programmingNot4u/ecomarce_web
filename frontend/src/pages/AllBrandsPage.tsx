import { Link } from 'react-router-dom';

const allBrands = [
  { name: 'ANJO', logo: 'https://placehold.co/200x80?text=ANJO' },
  { name: 'Anua', logo: 'https://placehold.co/200x80?text=Anua' },
  { name: 'AXIS-Y', logo: 'https://placehold.co/200x80?text=AXIS-Y' },
  { name: 'COSRX', logo: 'https://placehold.co/200x80?text=COSRX' },
  { name: 'DABO', logo: 'https://placehold.co/200x80?text=DABO' },
  { name: 'Nature Skin', logo: 'https://placehold.co/200x80?text=Nature+Skin' },
  { name: 'ILLIYOON', logo: 'https://placehold.co/200x80?text=ILLIYOON' },
  { name: 'MISSHA', logo: 'https://placehold.co/200x80?text=MISSHA' },
  { name: 'RYO', logo: 'https://placehold.co/200x80?text=RYO' },
  { name: 'The Abnormal Beauty Company', logo: 'https://placehold.co/200x80?text=Abnormal+Beauty' },
  { name: 'The Face Shop', logo: 'https://placehold.co/200x80?text=Face+Shop' },
  { name: 'TonyMoly', logo: 'https://placehold.co/200x80?text=TonyMoly' },
  { name: 'Some By Mi', logo: 'https://placehold.co/200x80?text=Some+By+Mi' },
  { name: 'Laneige', logo: 'https://placehold.co/200x80?text=Laneige' },
  { name: 'Innisfree', logo: 'https://placehold.co/200x80?text=Innisfree' },
  { name: 'Etude House', logo: 'https://placehold.co/200x80?text=Etude+House' },
  { name: 'Mediheal', logo: 'https://placehold.co/200x80?text=Mediheal' },
  { name: 'Banila Co', logo: 'https://placehold.co/200x80?text=Banila+Co' },
  { name: 'Dr. Jart+', logo: 'https://placehold.co/200x80?text=Dr.+Jart+' },
  { name: 'Sulwhasoo', logo: 'https://placehold.co/200x80?text=Sulwhasoo' },
];

export default function AllBrandsPage() {
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
        <div className="border border-gray-400 rounded-sm overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {allBrands.map((brand, index) => (
              <div
                key={`${brand.name}-${index}`}
                className="relative flex items-center justify-center p-8 h-40 bg-white border-r border-b border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <img
                  className="max-h-12 w-auto object-contain"
                  src={brand.logo}
                  alt={brand.name}
                />
              </div>
            ))}
             {/* Fill remaining slots to keep borders clean if needed, or CSS grid handles it well enough */}
          </div>
        </div>

        <div className="mt-12 text-center">
            <Link to="/" className="text-sm font-semibold text-gray-900 hover:text-gray-600 border-b border-gray-900 pb-1">
                &larr; Back to Home
            </Link>
        </div>

      </div>
    </div>
  );
}
