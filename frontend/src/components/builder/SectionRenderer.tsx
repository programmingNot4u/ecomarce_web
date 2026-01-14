import { useTheme } from '../../context/ThemeContext';
import CampaignBanner from '../marketing/CampaignBanner';
import FlashSaleBanner from '../marketing/FlashSaleBanner';
import CategorySection from '../sections/CategorySection';
import HeroSection from '../sections/HeroSection';
import KCBazarAdsSection from '../sections/KCBazarAdsSection';
import KCBazarCategorySection from '../sections/KCBazarCategorySection';
import MarqueeSection from '../sections/MarqueeSection';
import ProductSection from '../sections/ProductSection';
import TextSection from '../sections/TextSection';
import ShippingBanner from '../ShippingBanner';
import TopBrands from '../TopBrands';

const SectionRenderer = () => {
    const { theme } = useTheme();

    if (!theme.homeSections || theme.homeSections.length === 0) {
        return <div className="p-10 text-center text-gray-500 border-2 border-dashed border-gray-300 m-8 rounded-xl">No sections configured in Theme Settings.</div>;
    }

    return (
        <div className="flex flex-col w-full">
            {theme.homeSections.map((section) => {
                // Respect visibility setting (default to true if undefined)
                if (section.visible === false) return null;

                let Component = null;
                switch (section.type) {
                    case 'hero': Component = <HeroSection key={section.id} content={section.content} style={section.style} settings={section.settings} />; break;
                    case 'category': Component = <CategorySection key={section.id} content={section.content} style={section.style} />; break;
                    case 'kcbazar_category': Component = <KCBazarCategorySection key={section.id} content={section.content} style={section.style} />; break;
                    case 'kcbazar_ads': Component = <KCBazarAdsSection key={section.id} content={section.content} style={section.style} />; break;
                    case 'flash_sale': Component = <FlashSaleBanner key={section.id} style={section.style} />; break;
                    case 'bundle': Component = <CampaignBanner key={section.id} type="bundle" style={section.style} />; break; // Added
                    case 'loyalty': Component = <CampaignBanner key={section.id} type="loyalty" style={section.style} />; break; // Added
                    case 'marquee': Component = <MarqueeSection key={section.id} content={section.content} style={section.style} />; break;
                    case 'products': Component = <ProductSection key={section.id} content={section.content} style={section.style} />; break;
                    case 'text': Component = <TextSection key={section.id} content={section.content} style={section.style} />; break;
                    case 'brands': Component = <TopBrands key={section.id} content={section.content} style={section.style} />; break;
                    case 'shipping': Component = <ShippingBanner key={section.id} content={section.content} style={section.style} />; break;
                    default: Component = <div className="p-4 bg-red-100 text-red-600 border border-red-300 m-4 rounded">Unknown Section Type: {section.type}</div>;
                }

                return <div key={section.id}>{Component}</div>;
            })}
        </div>
    );
};

export default SectionRenderer;
