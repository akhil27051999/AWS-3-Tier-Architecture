// config.js - Your exact API configuration
const API_CONFIG = {
    BASE_API: 'https://dmkxlju409.execute-api.us-east-1.amazonaws.com/prod',
    REGION: 'us-east-1'
};

// Your exact endpoints based on your resource paths
const ENDPOINTS = {
    checkStock: `${API_CONFIG.BASE_API}/check`,
    buyStock: `${API_CONFIG.BASE_API}/buy`, 
    sellStock: `${API_CONFIG.BASE_API}/sell`
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
