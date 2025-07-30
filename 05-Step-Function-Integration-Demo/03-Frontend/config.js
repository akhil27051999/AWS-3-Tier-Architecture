// config.js - Single API with multiple endpoints
const API_CONFIG = {
    BASE_API: 'https://htq0zqqe74.execute-api.us-east-1.amazonaws.com/Prod',
    REGION: 'us-east-1'
};

const ENDPOINTS = {
    checkStock: `${API_CONFIG.BASE_API}/stock/check`,
    buyStock: `${API_CONFIG.BASE_API}/stock/buy`, 
    sellStock: `${API_CONFIG.BASE_API}/stock/sell`,
    getTransactions: `${API_CONFIG.BASE_API}/transactions`
};
