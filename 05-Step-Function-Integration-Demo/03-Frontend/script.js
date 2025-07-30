// Configuration - Replace with your actual API Gateway URL
const API_BASE_URL = 'https://your-api-gateway-url.amazonaws.com/prod';

// API endpoints
const ENDPOINTS = {
    checkStock: `${API_BASE_URL}/stock/check`,
    buyStock: `${API_BASE_URL}/stock/buy`,
    sellStock: `${API_BASE_URL}/stock/sell`,
    getTransactions: `${API_BASE_URL}/transactions`
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadTransactions();
});

// Event listeners
function initializeEventListeners() {
    document.getElementById('stockCheckerForm').addEventListener('submit', handleStockCheck);
    document.getElementById('buyerForm').addEventListener('submit', handleBuyOrder);
    document.getElementById('sellerForm').addEventListener('submit', handleSellOrder);
}

// Stock Checker Handler
async function handleStockCheck(event) {
    event.preventDefault();
    
    const stockSymbol = document.getElementById('stockSymbol').value.toUpperCase();
    const resultDiv = document.getElementById('stockResult');
    
    showLoading();
    
    try {
        const response = await fetch(ENDPOINTS.checkStock, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                stockSymbol: stockSymbol
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayStockResult(resultDiv, data);
        } else {
            displayError(resultDiv, data.message || 'Failed to check stock');
        }
    } catch (error) {
        displayError(resultDiv, 'Network error occurred');
        console.error('Stock check error:', error);
    } finally {
        hideLoading();
    }
}

// Buy Order Handler
async function handleBuyOrder(event) {
    event.preventDefault();
    
    const formData = {
        stockSymbol: document.getElementById('buyStockSymbol').value.toUpperCase(),
        quantity: parseInt(document.getElementById('buyQuantity').value),
        maxPrice: parseFloat(document.getElementById('buyPrice').value),
        buyerName: document.getElementById('buyerName').value,
        orderType: 'BUY'
    };
    
    const resultDiv = document.getElementById('buyResult');
    
    showLoading();
    
    try {
        const response = await fetch(ENDPOINTS.buyStock, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayOrderResult(resultDiv, data, 'success');
            document.getElementById('buyerForm').reset();
            loadTransactions(); // Refresh transaction history
        } else {
            displayError(resultDiv, data.message || 'Failed to place buy order');
        }
    } catch (error) {
        displayError(resultDiv, 'Network error occurred');
        console.error('Buy order error:', error);
    } finally {
        hideLoading();
    }
}

// Sell Order Handler
async function handleSellOrder(event) {
    event.preventDefault();
    
    const formData = {
        stockSymbol: document.getElementById('sellStockSymbol').value.toUpperCase(),
        quantity: parseInt(document.getElementById('sellQuantity').value),
        minPrice: parseFloat(document.getElementById('sellPrice').value),
        sellerName: document.getElementById('sellerName').value,
        orderType: 'SELL'
    };
    
    const resultDiv = document.getElementById('sellResult');
    
    showLoading();
    
    try {
        const response = await fetch(ENDPOINTS.sellStock, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayOrderResult(resultDiv, data, 'success');
            document.getElementById('sellerForm').reset();
            loadTransactions(); // Refresh transaction history
        } else {
            displayError(resultDiv, data.message || 'Failed to place sell order');
        }
    } catch (error) {
        displayError(resultDiv, 'Network error occurred');
        console.error('Sell order error:', error);
    } finally {
        hideLoading();
    }
}

// Load Transactions
async function loadTransactions() {
    try {
        const response = await fetch(ENDPOINTS.getTransactions);
        const data = await response.json();
        
        if (response.ok) {
            displayTransactions(data.transactions || []);
        }
    } catch (error) {
        console.error('Failed to load transactions:', error);
    }
}

// Display Functions
function displayStockResult(container, data) {
    container.innerHTML = `
        <div class="alert alert-info">
            <h6><strong>${data.stockSymbol}</strong></h6>
            <p class="mb-1">Current Price: <strong>$${data.currentPrice}</strong></p>
            <p class="mb-1">Available Shares: <strong>${data.availableShares}</strong></p>
            <small class="text-muted">Last Updated: ${new Date(data.timestamp).toLocaleString()}</small>
        </div>
    `;
}

function displayOrderResult(container, data, type) {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    container.innerHTML = `
        <div class="alert ${alertClass}">
            <h6>Order Submitted Successfully!</h6>
            <p class="mb-1">Order ID: <strong>${data.orderId}</strong></p>
            <p class="mb-1">Status: <strong>${data.status}</strong></p>
            <small class="text
