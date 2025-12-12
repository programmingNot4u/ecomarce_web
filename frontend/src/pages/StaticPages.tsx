
export const AboutPage = () => (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6">About MARYONÉ</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
                Welcome to MARYONÉ, your premier destination for curated lifestyle products. 
                We believe in the beauty of simplicity and the power of quality.
            </p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-100 rounded-lg aspect-w-4 aspect-h-3 h-80">
                {/* Placeholder for About Us Image */}
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                   Image Placeholder
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    Founded in 2024, MARYONÉ began with a simple mission: to bring high-quality, 
                    aesthetically pleasing products to the modern consumer. We scour the globe 
                    (and local artisans!) to find unique pieces that elevate your everyday life.
                </p>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
                <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                        <span className="h-2 w-2 bg-black rounded-full mr-3"></span>
                        Quality over Quantity
                    </li>
                    <li className="flex items-center">
                        <span className="h-2 w-2 bg-black rounded-full mr-3"></span>
                        Sustainable Practices
                    </li>
                    <li className="flex items-center">
                        <span className="h-2 w-2 bg-black rounded-full mr-3"></span>
                        Customer First Approach
                    </li>
                </ul>
            </div>
        </div>
    </div>
);

import { ChatBubbleLeftRightIcon, ChatBubbleOvalLeftEllipsisIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/solid';

export const ContactPage = () => (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form Section */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Send us a message</h2>
                <form className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input type="text" id="name" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-3 px-4 border" placeholder="Your Name" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="email" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-3 px-4 border" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea id="message" rows={4} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-3 px-4 border" placeholder="How can we help?"></textarea>
                    </div>
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black uppercase tracking-wider transition-colors">
                        Send Message
                    </button>
                </form>
            </div>

            {/* Contact Info Section - "Exact Image" Style */}
            <div className="flex flex-col justify-start"> 
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-900 font-medium mb-6">Need a Help?</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <PhoneIcon className="h-5 w-5 text-teal-500" />
                            <span className="text-sm font-medium text-gray-700">09613660321</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Messenger</span>
                        </div>

                         <div className="flex items-center gap-3">
                            <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">Whatsapp</span>
                        </div>

                         <div className="flex items-center gap-3">
                            <EnvelopeIcon className="h-5 w-5 text-sky-500" />
                            <span className="text-sm font-medium text-gray-700">kcbazar22@gmail.com</span>
                        </div>

                         <div className="flex items-center gap-3">
                             <EnvelopeIcon className="h-5 w-5 text-sky-500" />
                            <span className="text-sm font-medium text-gray-700">support@kcbazar.com</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-gray-900 font-medium mb-4">Subscribe us</h3>
                        <div className="flex gap-3">
                             {/* Social Icons - Colored Circles */}
                            <a href="#" className="h-9 w-9 rounded-full bg-blue-900 flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                <span className="sr-only">Facebook</span>
                                <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                            </a>
                             <a href="#" className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                <span className="sr-only">Instagram</span>
                                <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" /></svg>
                            </a>
                            <a href="#" className="h-9 w-9 rounded-full bg-red-600 flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                <span className="sr-only">YouTube</span>
                                <svg fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                            </a>
                             <a href="#" className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                <span className="sr-only">WhatsApp</span>
                                <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const FAQPage = () => (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-serif font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h1>
            <div className="space-y-8">
                {[
                    { q: "What is your return policy?", a: "We offer a 30-day return policy for all unused items in their original packaging." },
                    { q: "How long does shipping take?", a: "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days." },
                    { q: "Do you ship internationally?", a: "Yes, we ship to select countries worldwide. Shipping costs vary by location." },
                    { q: "How can I track my order?", a: "You can track your order using the 'Track Order' link in the footer or in your confirmation email." }
                ].map((faq, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.q}</h3>
                        <p className="text-gray-600">{faq.a}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const TermsPage = () => (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-black">
            <h1>Terms & Conditions</h1>
            <p>Last updated: December 13, 2025</p>
            <h3>1. Introduction</h3>
            <p>Welcome to MARYONÉ. By using our website, you agree to these terms and conditions.</p>
            <h3>2. Intellectual Property</h3>
            <p>All content on this site is the property of MARYONÉ and protected by copyright laws.</p>
            <h3>3. Product Information</h3>
            <p>We try to be as accurate as possible, but we do not warrant that product descriptions are error-free.</p>
        </div>
    </div>
);

export const PrivacyPage = () => (
     <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-black">
            <h1>Privacy Policy</h1>
            <p>Last updated: December 13, 2025</p>
            <h3>1. Data Collection</h3>
            <p>We collect information you provide directly to us when you make a purchase or sign up for our newsletter.</p>
            <h3>2. Data Usage</h3>
            <p>We use your information to process orders and improve our services.</p>
            <h3>3. Cookies</h3>
            <p>We use cookies to enhance your browsing experience.</p>
        </div>
    </div>
);

export const NotFoundPage = () => (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 mb-8 text-center max-w-md">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <a href="/" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors">
            Go Home
        </a>
    </div>
);
