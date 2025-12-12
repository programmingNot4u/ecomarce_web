import { PhoneIcon } from '@heroicons/react/24/solid';
import deliveryImage from '../assets/delevery_image.png';

export default function ShippingBanner() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 md:p-12 shadow-sm border border-gray-100 rounded-sm flex flex-col lg:flex-row items-center justify-between gap-12">
            
          {/* Text Content */}
          <div className="flex-1 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Shipping & Delivery
            </h2>
            <div className="space-y-2 text-gray-600">
                <p className="text-lg">
                সারা বাংলাদেশে আমরা ৪৮-৭২ ঘণ্টার মধ্যে হোম ডেলিভারী দিচ্ছি। 
                </p>
                <p className="text-sm text-gray-500">
                যেকোনো সমস্যায় সরাসরি ফোন করুন আমাদের হটলাইন নাম্বারে (সকাল ১০.০০ থেকে রাত ৮.০০ টা পর্যন্ত)
                </p>
            </div>
            
            <div className="mt-8">
              <a
                href="tel:09613660321"
                className="inline-flex items-center gap-3 bg-white border-2 border-gray-800 rounded-md px-6 py-3 text-lg font-bold text-gray-900 hover:bg-gray-50 transition-colors"
                style={{ borderRadius: '6px' }} // Slightly rounded, not pill
              >
                <PhoneIcon className="h-6 w-6 text-pink-500" />
                09613660321
              </a>
            </div>
          </div>
          
          {/* Image Content */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <img
              className="w-full max-w-lg object-contain"
              src={deliveryImage}
              alt="Delivery Service Illustration"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
