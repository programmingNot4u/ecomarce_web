import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const useMetaPixel = () => {
  const location = useLocation();
  const [pixelId, setPixelId] = useState<string | null>(null);

  // Fetch Pixel ID
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('marketing-settings/');
        if (response.data && response.data.meta_pixel_id) {
            setPixelId(response.data.meta_pixel_id);
        }
      } catch (error) {
        // Silent fail for public users if not configured or error
        // console.error('Failed to load Meta Pixel ID', error);
      }
    };
    fetchSettings();
  }, []);

  // Initialize Pixel
  useEffect(() => {
    if (!pixelId) return;

    if (window.fbq) return; // Already initialized

    // Inject Script
    /* eslint-disable */
    // @ts-ignore
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }, [pixelId]);

  // Track PageView on route change
  useEffect(() => {
    if (pixelId && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location, pixelId]);
};
