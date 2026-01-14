import api from './api';

export const loginUser = async (credentials: any) => {
    const response = await api.post('/users/login/', credentials);
    return response.data;
};

export const registerUser = async (userData: any) => {
    const response = await api.post('/users/register/', userData);
    return response.data;
};
