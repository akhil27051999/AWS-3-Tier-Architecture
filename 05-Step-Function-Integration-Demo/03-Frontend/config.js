// config.js - Replace with your actual API Gateway URLs
const API_CONFIG = {
    // Replace these URLs with your actual API Gateway invoke URLs
    STOCK_CHECKER_API: 'https://your-stock-checker-api.execute-api.us-east-1.amazonaws.com/prod',
    BUYER_API: 'https://your-buyer-api.execute-api.us-east-1.amazonaws.com/prod', 
    SELLER_API: 'https://your-seller-api.execute-api.us-east-1.amazonaws.com/prod',
    REGION: 'us-east-1'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
