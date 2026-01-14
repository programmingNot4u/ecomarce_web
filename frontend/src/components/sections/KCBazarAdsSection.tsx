import { Link } from 'react-router-dom';
import { getMediaUrl } from '../../services/api';

interface AdItem {
    id: string;
    image: string;
    link: string;
    title?: string; // Accessibilty/Alt text
}

interface Props {
    content: {
        ads: AdItem[];
        layout?: 'grid-3' | 'mosaic-left' | 'mosaic-right' | 'split-2' | 'full';
    };
    style?: {
        backgroundColor?: string;
        padding?: string;
    };
}

const KCBazarAdsSection = ({ content, style }: Props) => {
    // Ensure we have ads to display
    const ads = content?.ads || [];

    if (ads.length === 0) return null;

    return (
        <section className={`mx-auto max-w-[1920px] px-4 md:px-6 lg:px-20 ${style?.padding || 'py-8'} ${style?.backgroundColor || ''}`}>
            {/* Dynamic Layout Rendering */}
            {(() => {
                const layout = content.layout || 'grid-3';

                // Mosaic Left: One main image on left (2 row span), two smaller stacked on right
                if (layout === 'mosaic-left') {
                    return (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 h-auto md:h-[500px]">
                            {ads.map((ad, index) => {
                                // First item is large (span 2 cols, 2 rows if we had 4 cols.. for 3 cols: span 2 cols, 2 rows)
                                const isFirst = index === 0;
                                return (
                                    <Link
                                        to={ad.link || '#'}
                                        key={ad.id || index}
                                        className={`group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow w-full
                                            ${isFirst
                                                ? 'col-span-2 aspect-[16/9] md:aspect-auto md:col-span-2 md:row-span-2'
                                                : 'col-span-1 aspect-square md:aspect-auto md:col-span-1 md:row-span-1'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
                                        <img
                                            src={getMediaUrl(ad.image)}
                                            alt={ad.title || 'Ad Banner'}
                                            className="w-full h-full object-cover transform md:group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    </Link>
                                );
                            })}
                        </div>
                    );
                }

                // Mosaic Right: One main image on right, two smaller stacked on left
                if (layout === 'mosaic-right') {
                    return (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 h-auto md:h-[500px]">
                            {ads.map((ad, index) => {
                                const isFirst = index === 0;
                                return (
                                    <Link
                                        to={ad.link || '#'}
                                        key={ad.id || index}
                                        className={`group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow w-full
                                            ${isFirst
                                                ? 'col-span-2 aspect-[16/9] md:aspect-auto md:col-span-2 md:row-span-2 md:order-2'
                                                : 'col-span-1 aspect-square md:aspect-auto md:col-span-1 md:row-span-1 md:order-1'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
                                        <img
                                            src={getMediaUrl(ad.image)}
                                            alt={ad.title || 'Ad Banner'}
                                            className="w-full h-full object-cover transform md:group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    </Link>
                                );
                            })}
                        </div>
                    );
                }

                // Split: 2 Columns
                if (layout === 'split-2') {
                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {ads.map((ad, index) => (
                                <Link
                                    to={ad.link || '#'}
                                    key={ad.id || index}
                                    className="block group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow aspect-[16/9] md:aspect-[21/9]"
                                >
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
                                    <img
                                        src={getMediaUrl(ad.image)}
                                        alt={ad.title || 'Ad Banner'}
                                        className="w-full h-full object-cover transform md:group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                </Link>
                            ))}
                        </div>
                    );
                }

                // Full Width
                if (layout === 'full') {
                    return (
                        <div className="flex flex-col gap-6">
                            {ads.map((ad, index) => (
                                <Link
                                    to={ad.link || '#'}
                                    key={ad.id || index}
                                    className="block group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow w-full"
                                >
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
                                    <img
                                        src={getMediaUrl(ad.image)}
                                        alt={ad.title || 'Ad Banner'}
                                        className="w-full h-auto object-cover transform md:group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                </Link>
                            ))}
                        </div>
                    );
                }

                // Default: Grid 3
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {ads.map((ad, index) => (
                            <Link
                                to={ad.link || '#'}
                                key={ad.id || index}
                                className="block group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow aspect-[4/3] md:aspect-auto"
                            >
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
                                <img
                                    src={getMediaUrl(ad.image)}
                                    alt={ad.title || 'Ad Banner'}
                                    className="w-full h-auto object-cover transform md:group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                            </Link>
                        ))}
                    </div>
                );
            })()}
        </section>
    );
};

export default KCBazarAdsSection;
