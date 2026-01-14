import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import fullLogo from '../../assets/logos/full_logo.png';
import { useTheme } from '../../context/ThemeContext';

const FooterSection = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 md:border-none pb-4 md:pb-0">
      {/* Desktop Title */}
      <h3 className="hidden md:block text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">
        {title}
      </h3>

      {/* Mobile Title (Clickable) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex md:hidden items-center justify-between w-full py-2 text-left"
      >
        <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">{title}</span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Content */}
      <div className={`md:block ${isOpen ? 'block' : 'hidden'} space-y-3 pt-2 md:pt-0`}>
        {children}
      </div>
    </div>
  );
};

export default function Footer() {
  const { theme } = useTheme();
  return (
    <footer className="bg-white border-t border-gray-100 py-12 font-sans">
      <div className="mx-auto w-full px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand Column - Wider */}
          <div className="md:col-span-4 lg:col-span-4 space-y-6">
            <Link to="/">
              <img
                src={theme.footerLogo || theme.logo || fullLogo}
                alt="MARYONÉ.shop"
                className="h-20 w-auto object-contain"
                onError={(e) => { e.currentTarget.src = fullLogo; }}
              />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              {theme.textSnippets?.footer_about_text || "Elevating your lifestyle with curated premium products. Experience quality, style, and exceptional service with every order."}
            </p>
            <div className="flex gap-4">
              {/* Social Icons */}
              {theme.textSnippets?.social_facebook && (
                <a href={theme.textSnippets.social_facebook} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-black hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-1.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
              )}
              {theme.textSnippets?.social_instagram && (
                <a href={theme.textSnippets.social_instagram} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-black hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 4.123-.06h.08v.001zm0 1.962h-.038c-2.671 0-3.007.012-3.82.05-.815.038-1.39.141-1.921.348-.521.203-1.002.536-1.385.919-.383.383-.716.864-.919 1.385-.207.53-.31 1.106-.348 1.921-.037.813-.05 1.149-.05 3.82v.038c0 2.671.012 3.007.05 3.82.038.815.141 1.39.348 1.921.203.521.536 1.002.919 1.385.383.383.864.716 1.385.919.53.207 1.106.31 1.921.348.813.037 1.149.05 3.82.05h.038c2.671 0 3.007-.012 3.82-.05.815-.038 1.39-.141 1.921-.348.521-.203 1.002-.536 1.385-.919.383-.383.716-.864.919-1.385.207-.53.31-1.106.348-1.921.037-.813.05-1.149.05-3.82v-.038c0-2.671-.012-3.007-.05-3.82-.038-.815-.141-1.39-.348-1.921-.203-.521-.536-1.002-.919-1.385-.383-.383-.864-.716-1.385-.919-.53-.207-1.106-.31-1.921-.348-.813-.037-1.149-.05-3.82-.05zm3.246 3.116a1.218 1.218 0 110 2.436 1.218 1.218 0 010-2.436zM12.315 7.202a5.114 5.114 0 100 10.228 5.114 5.114 0 000-10.228zm0 1.962a3.152 3.152 0 110 6.304 3.152 3.152 0 010-6.304z" clipRule="evenodd" /></svg>
                </a>
              )}
              {theme.textSnippets?.social_youtube && (
                <a href={theme.textSnippets.social_youtube} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-black hover:text-white transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                </a>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div className="md:col-span-2 lg:col-span-2">
            <FooterSection title="Shop">
              <ul className="space-y-3">
                <li><Link to="/new-arrivals" className="text-gray-500 hover:text-black transition-colors text-sm">New Arrivals</Link></li>
                <li><Link to="/best-sellers" className="text-gray-500 hover:text-black transition-colors text-sm">Best Sellers</Link></li>
                <li><Link to="/accessories" className="text-gray-500 hover:text-black transition-colors text-sm">Accessories</Link></li>
                <li><Link to="/sale" className="text-red-500 hover:text-red-700 transition-colors font-medium text-sm">Sale</Link></li>
              </ul>
            </FooterSection>
          </div>

          {/* Get To Know Us */}
          <div className="md:col-span-3 lg:col-span-3">
            <FooterSection title="Get To Know Us">
              <ul className="space-y-3">
                <li><Link to="/about" className="text-sm text-gray-500 hover:text-black transition-colors">About Us</Link></li>
                <li><Link to="/faq" className="text-sm text-gray-500 hover:text-black transition-colors">FAQs</Link></li>
                <li><Link to="/contact" className="text-sm text-gray-500 hover:text-black transition-colors">Contact Us</Link></li>
                <li><Link to="/terms" className="text-sm text-gray-500 hover:text-black transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-sm text-gray-500 hover:text-black transition-colors">Privacy Policy</Link></li>
              </ul>
            </FooterSection>
          </div>

          {/* Policies */}
          <div className="md:col-span-3 lg:col-span-3">
            <FooterSection title="Policies">
              <ul className="space-y-3">
                <li><Link to="/shipping-policy" className="text-sm text-gray-500 hover:text-black transition-colors">Shipping Policy</Link></li>
                <li><Link to="/returns-policy" className="text-sm text-gray-500 hover:text-black transition-colors">Returns & Refunds</Link></li>
              </ul>
            </FooterSection>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex justify-center">
          <p className="text-xs text-gray-400">
            &copy; {theme.textSnippets?.footer_copyright || `${new Date().getFullYear()} MARYONÉ.shop. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
