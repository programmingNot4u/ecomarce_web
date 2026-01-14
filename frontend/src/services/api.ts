import axios from 'axios';

// Create an Axios instance with default config
export const API_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to attach the auth token if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Assuming you store token here
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors globally (optional)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized (e.g., redirect to login)
        if (error.response && error.response.status === 401) {
            // events.emit('logout'); // Example
        }
        return Promise.reject(error);
    }
);

// Helper to resolve full media URLs
export const MEDIA_URL = 'http://127.0.0.1:8000';

export const getMediaUrl = (path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // If path already contains /media/, just prepend base URL
    if (cleanPath.startsWith('/media/')) {
        return `${MEDIA_URL}${cleanPath}`;
    }
    
    // Otherwise, assume it's a relative path inside media root
    return `${MEDIA_URL}/media${cleanPath}`;
};

export const fetchOrders = async (params: any) => {
    const response = await api.get('orders/', { params });
    return response.data;
};

export const fetchPurchaseOrders = async (params: any) => {
    const response = await api.get('purchase-orders/', { params });
    return response.data;
};

export default api;
