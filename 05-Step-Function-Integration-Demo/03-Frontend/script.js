// script.js - Updated for your single API
const API_CONFIG = {
    BASE_API: 'https://htq0zqqe74.execute-api.us-east-1.amazonaws.com/Prod',
    REGION: 'us-east-1'
};

// Update these paths based on your actual API Gateway resources
const ENDPOINTS = {
    checkStock: `${API_CONFIG.BASE_API}/stock-checker`,  // Update path as needed
    buyStock: `${API_CONFIG.BASE_API}/buyer`,            // Update path as needed
    sellStock: `${API_CONFIG.BASE_API}/seller`,          // Update path as needed
};

class StockManager {
    constructor() {
        this.initializeEventListeners();
        this.loadTransactions();
    }

    initializeEventListeners() {
        document.getElementById('stockCheckerForm').addEventListener('submit', (e) => this.handleStockCheck(e));
        document.getElementById('buyerForm').addEventListener('submit', (e) => this.handleBuyOrder(e));
        document.getElementById('sellerForm').addEventListener('submit', (e) => this.handleSellOrder(e));
    }

    async handleStockCheck(event) {
        event.preventDefault();
        
        const stockSymbol = document.getElementById('stockSymbol').value.toUpperCase();
        const resultDiv = document.getElementById('stockResult');
        
        this.showLoading();
        
        try {
            const response = await fetch(ENDPOINTS.checkStock, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    stockSymbol: stockSymbol
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.displayStockResult(resultDiv, data);
                // Auto-populate buy/sell forms
                document.getElementById('buyStockSymbol').value = stockSymbol;
                document.getElementById('sellStockSymbol').value = stockSymbol;
            } else {
                this.displayError(resultDiv, data.message || 'Stock not found');
            }
        } catch (error) {
            this.displayError(resultDiv, 'Network error: Unable to check stock');
            console.error('Stock check error:', error);
        } finally {
            this.hideLoading();
        }
    }

    async handleBuyOrder(event) {
        event.preventDefault();
        
        const formData = {
            stockSymbol: document.getElementById('buyStockSymbol').value.toUpperCase(),
            quantity: parseInt(document.getElementById('buyQuantity').value),
            maxPrice: parseFloat(document.getElementById('buyPrice').value),
            buyerName: document.getElementById('buyerName').value,
            orderType: 'BUY'
        };
        
        const resultDiv = document.getElementById('buyResult');
        this.showLoading();
        
        try {
            const response = await fetch(ENDPOINTS.buyStock, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.displayOrderResult(resultDiv, data, 'success');
                document.getElementById('buyerForm').reset();
            } else {
                this.displayError(resultDiv, data.message || 'Failed to place buy order');
            }
        } catch (error) {
            this.displayError(resultDiv, 'Network error: Unable to place order');
            console.error('Buy order error:', error);
        } finally {
            this.hideLoading();
        }
    }

    async handleSellOrder(event) {
        event.preventDefault();
        
        const formData = {
            stockSymbol: document.getElementById('sellStockSymbol').value.toUpperCase(),
            quantity: parseInt(document.getElementById('sellQuantity').value),
            minPrice: parseFloat(document.getElementById('sellPrice').value),
            sellerName: document.getElementById('sellerName').value,
            orderType: 'SELL'
        };
        
        const resultDiv = document.getElementById('sellResult');
        this.showLoading();
        
        try {
            const response = await fetch(ENDPOINTS.sellStock, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.displayOrderResult(resultDiv, data, 'success');
                document.getElementById('sellerForm').reset();
            } else {
                this.displayError(resultDiv, data.message || 'Failed to place sell order');
            }
        } catch (error) {
            this.displayError(resultDiv, 'Network error: Unable to place order');
            console.error('Sell order error:', error);
        } finally {
            this.hideLoading();
        }
    }

    displayStockResult(container, data) {
        container.innerHTML = `
            <div class="alert alert-info">
                <h6><strong>${data.stockSymbol}</strong></h6>
                <p class="mb-1">Current Price: <strong>$${data.currentPrice || 'N/A'}</strong></p>
                <p class="mb-1">Available Shares: <strong>${data.availableShares || 'N/A'}</strong></p>
                <small class="text-muted">Last Updated: ${new Date().toLocaleString()}</small>
            </div>
        `;
    }

    displayOrderResult(container, data, type) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        container.innerHTML = `
            <div class="alert ${alertClass}">
                <h6>Order Submitted Successfully!</h6>
                <p class="mb-1">Order ID: <strong>${data.orderId || data.executionArn || 'Generated'}</strong></p>
                <p class="mb-1">Status: <strong>${data.status || 'PROCESSING'}</strong></p>
                <small class="text-muted">Submitted: ${new Date().toLocaleString()}</small>
            </div>
        `;
    }

    displayError(container, message) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <h6>Error</h6>
                <p class="mb-0">${message}</p>
            </div>
        `;
    }

    showLoading() {
        const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
        modal.show();
    }

    hideLoading() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
        if (modal) modal.hide();
    }

    loadTransactions() {
        // Placeholder for transaction loading
        console.log('Loading transactions...');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    new StockManager();
});
