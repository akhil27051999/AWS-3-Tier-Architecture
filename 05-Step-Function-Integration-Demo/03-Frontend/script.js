// script.js - Final version with your exact API paths
const API_CONFIG = {
    BASE_API: 'https://htq0zqqe74.execute-api.us-east-1.amazonaws.com/Prod',
    REGION: 'us-east-1'
};

const ENDPOINTS = {
    checkStock: `${API_CONFIG.BASE_API}/check`,
    buyStock: `${API_CONFIG.BASE_API}/buy`,
    sellStock: `${API_CONFIG.BASE_API}/sell`
};

class StockManager {
    constructor() {
        this.initializeEventListeners();
        console.log('Stock Manager initialized with endpoints:', ENDPOINTS);
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
        console.log(`Checking stock: ${stockSymbol}`);
        
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
            
            console.log('Stock check response status:', response.status);
            const data = await response.json();
            console.log('Stock check response data:', data);
            
            if (response.ok) {
                this.displayStockResult(resultDiv, data);
                // Auto-populate buy/sell forms
                document.getElementById('buyStockSymbol').value = stockSymbol;
                document.getElementById('sellStockSymbol').value = stockSymbol;
                if (data.currentPrice) {
                    document.getElementById('buyPrice').value = data.currentPrice;
                    document.getElementById('sellPrice').value = data.currentPrice;
                }
            } else {
                this.displayError(resultDiv, data.message || data.errorMessage || 'Stock not found');
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
            orderType: 'BUY',
            timestamp: new Date().toISOString()
        };
        
        const resultDiv = document.getElementById('buyResult');
        this.showLoading();
        console.log('Placing buy order:', formData);
        
        try {
            const response = await fetch(ENDPOINTS.buyStock, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            console.log('Buy order response status:', response.status);
            const data = await response.json();
            console.log('Buy order response data:', data);
            
            if (response.ok) {
                this.displayOrderResult(resultDiv, data, 'success');
                document.getElementById('buyerForm').reset();
                this.showSuccessToast('Buy order placed successfully!');
            } else {
                this.displayError(resultDiv, data.message || data.errorMessage || 'Failed to place buy order');
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
            orderType: 'SELL',
            timestamp: new Date().toISOString()
        };
        
        const resultDiv = document.getElementById('sellResult');
        this.showLoading();
        console.log('Placing sell order:', formData);
        
        try {
            const response = await fetch(ENDPOINTS.sellStock, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            console.log('Sell order response status:', response.status);
            const data = await response.json();
            console.log('Sell order response data:', data);
            
            if (response.ok) {
                this.displayOrderResult(resultDiv, data, 'success');
                document.getElementById('sellerForm').reset();
                this.showSuccessToast('Sell order placed successfully!');
            } else {
                this.displayError(resultDiv, data.message || data.errorMessage || 'Failed to place sell order');
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
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1"><strong>${data.stockSymbol || 'N/A'}</strong></h6>
                        <p class="mb-1">Current Price: <strong>$${data.currentPrice || data.price || 'N/A'}</strong></p>
                        <p class="mb-1">Available Shares: <strong>${data.availableShares || data.quantity || 'N/A'}</strong></p>
                        ${data.companyName ? `<p class="mb-1">Company: <strong>${data.companyName}</strong></p>` : ''}
                    </div>
                    <div class="text-end">
                        <small class="text-muted">Updated: ${new Date().toLocaleTimeString()}</small>
                    </div>
                </div>
            </div>
        `;
    }

    displayOrderResult(container, data, type) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        container.innerHTML = `
            <div class="alert ${alertClass}">
                <h6><i class="fas fa-check-circle me-2"></i>Order Submitted Successfully!</h6>
                <p class="mb-1">Order ID: <strong>${data.orderId || data.executionArn || data.transactionId || 'Generated'}</strong></p>
                <p class="mb-1">Status: <strong>${data.status || 'PROCESSING'}</strong></p>
                ${data.executionArn ? `<p class="mb-1">Execution: <small>${data.executionArn}</small></p>` : ''}
                <small class="text-muted">Submitted: ${new Date().toLocaleString()}</small>
            </div>
        `;
    }

    displayError(container, message) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <h6><i class="fas fa-exclamation-triangle me-2"></i>Error</h6>
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

    showSuccessToast(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999;">
                <i class="fas fa-check-circle me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Stock Manager...');
    new StockManager();
});
