import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { NotFoundPage } from './StaticPages';

export default function DynamicPage() {
    const { slug } = useParams<{ slug: string }>();
    const { pages, isLoaded } = useProducts();
    const [page, setPage] = useState<any>(null);

    useEffect(() => {
        if (isLoaded && slug) {
            const found = pages.find(p => p.slug === slug);
            setPage(found || null);
        }
    }, [pages, slug, isLoaded]);

    if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!page) {
        // Optional: Ensure we aren't just missing it because it wasn't statically loaded yet?
        // But context loads all pages. So if not found, it's 404.
        return <NotFoundPage />;
    }

    return (
        <div className="bg-white min-h-screen pt-16 pb-24 animate-in fade-in duration-700">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6 text-center">{page.title}</h1>
                {page.lastUpdated && <p className="text-sm text-gray-500 text-center">Last Updated: {new Date(page.lastUpdated).toLocaleDateString()}</p>}
            </div>
            <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 text-gray-600">
                <div dangerouslySetInnerHTML={{ __html: page.content || '<p class="text-center text-gray-400">No content available.</p>' }} className="prose max-w-none prose-lg mx-auto" />
            </div>
        </div>
    );
}
