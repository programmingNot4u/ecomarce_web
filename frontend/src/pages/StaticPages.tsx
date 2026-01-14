import { Disclosure } from '@headlessui/react';
import { ChatBubbleLeftRightIcon, ChatBubbleOvalLeftEllipsisIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, type FAQ } from '../context/ProductContext';
import { useTheme } from '../context/ThemeContext';

const ContentPageLayout = ({ title, content, lastUpdated }: { title: string, content: string, lastUpdated?: string }) => (
    <div className="bg-white min-h-screen pt-16 pb-24">
        {/* Header Section - Centered & Constrained */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6 text-center">{title}</h1>
            {lastUpdated && <p className="text-sm text-gray-500 text-center">Last Updated: {new Date(lastUpdated).toLocaleDateString()}</p>}
        </div>

        {/* Content Section - Full Width capability */}
        {/* The blocks themselves have max-width constraints (4xl, 5xl, 6xl) so we just provide a large canvas */}
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 text-gray-600">
            {/* Safe render of content - In production use a sanitizer like DOMPurify */}
            <div dangerouslySetInnerHTML={{ __html: content || '<p className="text-center">No content available.</p>' }} />
        </div>
    </div>
);

export const AboutPage = () => {
    const { pages } = useProducts();
    const page = pages.find(p => p.slug === 'about');
    return <ContentPageLayout title={page?.title || "About Us"} content={page?.content || ""} lastUpdated={page?.lastUpdated} />;
};

export const TermsPage = () => {
    const { pages } = useProducts();
    const page = pages.find(p => p.slug === 'terms');
    return <ContentPageLayout title={page?.title || "Terms of Service"} content={page?.content || ""} lastUpdated={page?.lastUpdated} />;
};

export const PrivacyPage = () => {
    const { pages } = useProducts();
    const page = pages.find(p => p.slug === 'privacy');
    return <ContentPageLayout title={page?.title || "Privacy Policy"} content={page?.content || ""} lastUpdated={page?.lastUpdated} />;
};

export const ShippingPage = () => {
    const { pages } = useProducts();
    const page = pages.find(p => p.slug === 'shipping');
    return <ContentPageLayout title={page?.title || "Shipping Policy"} content={page?.content || ""} lastUpdated={page?.lastUpdated} />;
};

export const ReturnsPage = () => {
    const { pages } = useProducts();
    const page = pages.find(p => p.slug === 'returns');
    return <ContentPageLayout title={page?.title || "Returns Policy"} content={page?.content || ""} lastUpdated={page?.lastUpdated} />;
};


export const FAQPage = () => {
    const { faqs } = useProducts();
    
    // Group FAQs by category
    const groupedFaqs = faqs.reduce((acc, faq) => {
        const cat = faq.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(faq);
        return acc;
    }, {} as Record<string, FAQ[]>);

    return (
        <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-serif font-bold text-center text-gray-900 mb-4">Frequently Asked Questions</h1>
                <p className="text-center text-gray-500 mb-12">Have questions? We're here to help.</p>
                
                <div className="space-y-12">
                    {Object.entries(groupedFaqs).length === 0 ? (
                         <div className="text-center text-gray-500">No FAQs available at the moment.</div>
                    ) : (
                        Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                            <div key={category}>
                                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">{category}</h2>
                                <div className="space-y-4">
                                    {categoryFaqs.map((faq) => (
                                        <Disclosure key={faq.id} as="div" className="border border-gray-200 rounded-lg">
                                            {({ open }) => (
                                                <>
                                                    <Disclosure.Button className="flex w-full justify-between rounded-lg px-4 py-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-black focus-visible:ring-opacity-75">
                                                        <span>{faq.question}</span>
                                                        <ChevronUpIcon
                                                            className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
                                                        />
                                                    </Disclosure.Button>
                                                    <Disclosure.Panel className="px-4 pb-4 pt-2 text-sm text-gray-500 leading-relaxed">
                                                        {faq.answer}
                                                    </Disclosure.Panel>
                                                </>
                                            )}
                                        </Disclosure>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                <div className="mt-16 text-center bg-gray-50 rounded-xl p-8">
                     <h3 className="text-lg font-bold text-gray-900 mb-2">Still have questions?</h3>
                     <p className="text-gray-500 mb-6">Can't find the answer you're looking for? Please seek our support.</p>
                     <Link to="/contact" className="inline-block bg-black text-white px-8 py-3 rounded-md font-bold text-sm hover:bg-gray-800 transition-colors">
                         Contact Us
                     </Link>
                </div>
            </div>
        </div>
    );
};
export const ContactPage = () => {
    const { addSupportTicket } = useProducts();
    const { theme } = useTheme();
    const [formData, setFormData] = useState({ name: '', email: '', message: '', subject: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        
        try {
            addSupportTicket({
                name: formData.name,
                email: formData.email,
                message: formData.message,
                subject: formData.subject || 'General Inquiry',
                priority: 'Medium'
            });
            setStatus('success');
            setFormData({ name: '', email: '', message: '', subject: '' });
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            setStatus('error');
        }
    };

    return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form Section */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Send us a message</h2>
                {status === 'success' ? (
                     <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6">
                        Thank you! Your message has been sent. Our support team will respond shortly.
                    </div>
                ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input 
                            type="text" 
                            id="name" 
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-3 px-4 border" 
                            placeholder="Your Name" 
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            required
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-3 px-4 border" 
                            placeholder="you@example.com" 
                        />
                    </div>
                     <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input 
                            type="text" 
                            id="subject" 
                            value={formData.subject}
                            onChange={e => setFormData({...formData, subject: e.target.value})}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-3 px-4 border" 
                            placeholder="Order Inquiry, Product Question, etc." 
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea 
                            id="message" 
                            rows={4} 
                            required
                            value={formData.message}
                            onChange={e => setFormData({...formData, message: e.target.value})}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-3 px-4 border" 
                            placeholder="How can we help?"
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        disabled={status === 'submitting'}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                        {status === 'submitting' ? 'Sending...' : 'Send Message'}
                    </button>
                    {status === 'error' && <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>}
                </form>
                )}
            </div>

            {/* Contact Info Section - "Exact Image" Style */}
            <div className="flex flex-col justify-start"> 
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-900 font-medium mb-6">{theme.textSnippets?.help_section_title || "Need a Help?"}</h3>
                    
                    <div className="space-y-4">
                        {theme.textSnippets?.contact_phone && (
                            <div className="flex items-center gap-3">
                                <PhoneIcon className="h-5 w-5 text-teal-500" />
                                <span className="text-sm font-medium text-gray-700">{theme.textSnippets.contact_phone}</span>
                            </div>
                        )}
                        
                        {theme.textSnippets?.contact_messenger && (
                            <div className="flex items-center gap-3">
                                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-medium text-gray-700">{theme.textSnippets.contact_messenger}</span>
                            </div>
                        )}

                        {theme.textSnippets?.contact_whatsapp && (
                             <div className="flex items-center gap-3">
                                <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 text-green-500" />
                                <span className="text-sm font-medium text-gray-700">{theme.textSnippets.contact_whatsapp}</span>
                            </div>
                        )}

                        {theme.textSnippets?.contact_email && (
                             <div className="flex items-center gap-3">
                                <EnvelopeIcon className="h-5 w-5 text-sky-500" />
                                <span className="text-sm font-medium text-gray-700">{theme.textSnippets.contact_email}</span>
                            </div>
                        )}

                        {theme.textSnippets?.contact_address && (
                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                                <span className="text-sm text-gray-500">{theme.textSnippets.contact_address}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <h3 className="text-gray-900 font-medium mb-4">Subscribe us</h3>
                        <div className="flex gap-3">
                             {/* Social Icons - Colored Circles */}
                            {theme.textSnippets?.social_facebook && (
                                <a href={theme.textSnippets.social_facebook} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-blue-900 flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <span className="sr-only">Facebook</span>
                                    <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                                </a>
                            )}
                            {theme.textSnippets?.social_instagram && (
                                 <a href={theme.textSnippets.social_instagram} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <span className="sr-only">Instagram</span>
                                    <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" /></svg>
                                </a>
                            )}
                            {theme.textSnippets?.social_youtube && (
                                <a href={theme.textSnippets.social_youtube} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-red-600 flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <span className="sr-only">YouTube</span>
                                    <svg fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                </a>
                            )}
                             {theme.textSnippets?.contact_whatsapp && (
                                <a href={`https://wa.me/${theme.textSnippets.contact_whatsapp}`} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <span className="sr-only">WhatsApp</span>
                                    <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                </a>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};





import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import errorAnimation from '../assets/lottie_animations/Error.json?url';

export const NotFoundPage = () => (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-0 sm:px-6 lg:px-8 overflow-hidden">
        <div className="w-[150%] sm:w-full md:max-w-3xl">
             <DotLottieReact
                src={errorAnimation}
                loop
                autoplay
            />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 mb-8 text-center max-w-md">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <a href="/" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors">
            Go Home
        </a>
    </div>
);
