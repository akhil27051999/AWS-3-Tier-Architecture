// config.js - Your single API configuration
const API_CONFIG = {
    BASE_API: 'https://htq0zqqe74.execute-api.us-east-1.amazonaws.com/Prod',
    REGION: 'us-east-1'
};

// Configure endpoints based on your API Gateway resources
// Replace the paths with your actual resource names
const ENDPOINTS = {
    // If your resources are named like this:
    checkStock: `${API_CONFIG.BASE_API}/stock-checker`,
    buyStock: `${API_CONFIG.BASE_API}/buyer`, 
    sellStock: `${API_CONFIG.BASE_API}/seller`,
    
    // OR if you have different resource names, update accordingly:
    // checkStock: `${API_CONFIG.BASE_API}/check`,
    // buyStock: `${API_CONFIG.BASE_API}/buy`,
    // sellStock: `${API_CONFIG.BASE_API}/sell`,
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
