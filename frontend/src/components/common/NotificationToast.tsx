import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  const event = new CustomEvent('show-toast', { detail: { message, type } });
  window.dispatchEvent(event);
};

export default function NotificationToast() {
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      setToast(customEvent.detail);
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer); // Cleanup timeout on next toast or unmount
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  if (!toast) return null;

  const getIcon = () => {
      switch (toast.type) {
          case 'success': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
          case 'error': return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
          default: return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
      }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[200] animate-slide-in-right">
        <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-4 flex items-center gap-3 min-w-[300px]">
            {getIcon()}
            <p className="text-sm font-medium text-gray-800 flex-1">{toast.message}</p>
            <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
    </div>
  );
}
