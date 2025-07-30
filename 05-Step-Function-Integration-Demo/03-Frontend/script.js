class StockManager {
    constructor() {
        this.apiBaseUrl = 'https://htq0zqqe74.execute-api.us-east-1.amazonaws.com/Prod';
        this.portfolio = [];
        this.balance = 10000;
        this.init();
    }

    init() {
        this.loadPortfolio();
        this.setupEventListeners();
        this.loadStockData();
    }

    setupEventListeners() {
        const buyForm = document.getElementById('buyForm');
        const sellForm = document.getElementById('sellForm');
        
        if (buyForm) {
            buyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBuyOrder();
            });
        }
        
        if (sellForm) {
            sellForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSellOrder();
            });
        }
    }

    async loadStockData() {
        try {
            console.log('Loading stock data...');
            const response = await fetch(`${this.apiBaseUrl}/check`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const stocks = await response.json();
            console.log('Stock data loaded:', stocks);
            this.displayStocks(stocks);
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            this.showError('Failed to load stock data. Please try again.');
        }
    }

    async handleBuyOrder() {
        try {
            const symbol = document.getElementById('buySymbol')?.value;
            const quantity = parseInt(document.getElementById('buyQuantity')?.value);
            
            if (!symbol || !quantity || quantity <= 0) {
                this.showError('Please enter valid stock symbol and quantity');
                return;
            }

            console.log('Placing buy order:', { symbol, quantity });
            
            const response = await fetch(`${this.apiBaseUrl}/buy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    symbol: symbol.toUpperCase(),
                    quantity: quantity,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('Buy order successful:', result);
            
            this.showSuccess(`Successfully bought ${quantity} shares of ${symbol}`);
            this.updatePortfolio(symbol, quantity, 'buy');
            this.clearForm('buyForm');
            
        } catch (error) {
            console.error('Buy order error:', error);
            this.showError(`Failed to place buy order: ${error.message}`);
        }
    }

    async handleSellOrder() {
        try {
            const symbol = document.getElementById('sellSymbol')?.value;
            const quantity = parseInt(document.getElementById('sellQuantity')?.value);
            
            if (!symbol || !quantity || quantity <= 0) {
                this.showError('Please enter valid stock symbol and quantity');
                return;
            }

            console.log('Placing sell order:', { symbol, quantity });
            
            const response = await fetch(`${this.apiBaseUrl}/sell`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    symbol: symbol.toUpperCase(),
                    quantity: quantity,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('Sell order successful:', result);
            
            this.showSuccess(`Successfully sold ${quantity} shares of ${symbol}`);
            this.updatePortfolio(symbol, quantity, 'sell');
            this.clearForm('sellForm');
            
        } catch (error) {
            console.error('Sell order error:', error);
            this.showError(`Failed to place sell order: ${error.message}`);
        }
    }

    displayStocks(stocks) {
        const container = document.getElementById('stockList');
        if (!container) return;

        container.innerHTML = '';
        
        if (Array.isArray(stocks)) {
            stocks.forEach(stock => {
                const stockElement = this.createStockElement(stock);
                container.appendChild(stockElement);
            });
        } else {
            console.log('Stocks data is not an array:', stocks);
        }
    }

    createStockElement(stock) {
        const div = document.createElement('div');
        div.className = 'stock-item';
        div.innerHTML = `
            <div class="stock-info">
                <h3>${stock.symbol || 'N/A'}</h3>
                <p>Price: $${stock.price || '0.00'}</p>
                <p>Change: ${stock.change || '0.00'}%</p>
            </div>
        `;
        return div;
    }

    updatePortfolio(symbol, quantity, action) {
        const existingStock = this.portfolio.find(stock => stock.symbol === symbol);
        
        if (action === 'buy') {
            if (existingStock) {
                existingStock.quantity += quantity;
            } else {
                this.portfolio.push({ symbol, quantity });
            }
        } else if (action === 'sell') {
            if (existingStock) {
                existingStock.quantity -= quantity;
                if (existingStock.quantity <= 0) {
                    this.portfolio = this.portfolio.filter(stock => stock.symbol !== symbol);
                }
            }
        }
        
        this.savePortfolio();
        this.displayPortfolio();
    }

    displayPortfolio() {
        const container = document.getElementById('portfolio');
        if (!container) return;

        container.innerHTML = '';
        
        this.portfolio.forEach(stock => {
            const div = document.createElement('div');
            div.className = 'portfolio-item';
            div.innerHTML = `
                <span>${stock.symbol}: ${stock.quantity} shares</span>
            `;
            container.appendChild(div);
        });
    }

    loadPortfolio() {
        try {
            const saved = localStorage.getItem('stockPortfolio');
            if (saved) {
                this.portfolio = JSON.parse(saved);
                this.displayPortfolio();
            }
        } catch (error) {
            console.error('Error loading portfolio:', error);
        }
    }

    savePortfolio() {
        try {
            localStorage.setItem('stockPortfolio', JSON.stringify(this.portfolio));
        } catch (error) {
            console.error('Error saving portfolio:', error);
        }
    }

    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existing = document.querySelector('.message');
        if (existing) {
            existing.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Add to page
        document.body.insertBefore(messageDiv, document.body.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Stock Manager...');
    new StockManager();
});

// Add CSS for messages
const style = document.createElement('style');
style.textContent = `
    .message {
        padding: 10px;
        margin: 10px;
        border-radius: 4px;
        font-weight: bold;
    }
    .message.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    .message.error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    .stock-item, .portfolio-item {
        padding: 10px;
        margin: 5px 0;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
`;
document.head.appendChild(style);
