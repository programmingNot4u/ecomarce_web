import { Link } from 'react-router-dom';
import fullLogo from '../../assets/logos/full_logo.png';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 font-sans">
      <div className="mx-auto w-full px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
           {/* Brand Column - Wider */}
           <div className="md:col-span-6 lg:col-span-6 space-y-6">
             <Link to="/">
                <img src={fullLogo} alt="MARYONÉ.shop" className="h-20 w-auto" />
             </Link>
             <p className="text-gray-500 text-sm leading-relaxed max-w-md">
               Elevating your lifestyle with curated premium products. Experience quality, style, and exceptional service with every order.
             </p>
             <div className="flex gap-4">
                  {/* Social Icons */}
                  <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-black hover:text-white transition-all duration-300">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-1.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                  </a>
                  <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-black hover:text-white transition-all duration-300">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 4.123-.06h.08v.001zm0 1.962h-.038c-2.671 0-3.007.012-3.82.05-.815.038-1.39.141-1.921.348-.521.203-1.002.536-1.385.919-.383.383-.716.864-.919 1.385-.207.53-.31 1.106-.348 1.921-.037.813-.05 1.149-.05 3.82v.038c0 2.671.012 3.007.05 3.82.038.815.141 1.39.348 1.921.203.521.536 1.002.919 1.385.383.383.864.716 1.385.919.53.207 1.106.31 1.921.348.813.037 1.149.05 3.82.05h.038c2.671 0 3.007-.012 3.82-.05.815-.038 1.39-.141 1.921-.348.521-.203 1.002-.536 1.385-.919.383-.383.716-.864.919-1.385.207-.53.31-1.106.348-1.921.037-.813.05-1.149.05-3.82v-.038c0-2.671-.012-3.007-.05-3.82-.038-.815-.141-1.39-.348-1.921-.203-.521-.536-1.002-.919-1.385-.383-.383-.864-.716-1.385-.919-.53-.207-1.106-.31-1.921-.348-.813-.037-1.149-.05-3.82-.05zm3.246 3.116a1.218 1.218 0 110 2.436 1.218 1.218 0 010-2.436zM12.315 7.202a5.114 5.114 0 100 10.228 5.114 5.114 0 000-10.228zm0 1.962a3.152 3.152 0 110 6.304 3.152 3.152 0 010-6.304z" clipRule="evenodd" /></svg>
                  </a>
                  <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-black hover:text-white transition-all duration-300">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                  </a>
             </div>
           </div>

           {/* Shop Links */}
           <div className="md:col-span-3 lg:col-span-3">
             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Shop</h3>
             <ul className="space-y-3">
               <li><Link to="/new-arrivals" className="text-gray-500 hover:text-black transition-colors text-sm">New Arrivals</Link></li>
               <li><Link to="/best-sellers" className="text-gray-500 hover:text-black transition-colors text-sm">Best Sellers</Link></li>
               <li><Link to="/accessories" className="text-gray-500 hover:text-black transition-colors text-sm">Accessories</Link></li>
               <li><Link to="/sale" className="text-red-500 hover:text-red-700 transition-colors font-medium text-sm">Sale</Link></li>
             </ul>
           </div>

           {/* Get To Know Us */}
           <div className="md:col-span-3 lg:col-span-3">
             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Get To Know Us</h3>
             <ul className="space-y-3">
               <li><Link to="/about" className="text-sm text-gray-500 hover:text-black transition-colors">About Us</Link></li>
               <li><Link to="/faq" className="text-sm text-gray-500 hover:text-black transition-colors">FAQs</Link></li>
               <li><Link to="/contact" className="text-sm text-gray-500 hover:text-black transition-colors">Contact Us</Link></li>
             </ul>
           </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex justify-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} MARYONÉ.shop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
