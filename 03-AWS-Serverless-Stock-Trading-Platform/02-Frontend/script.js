class StockManager {
    constructor() {
        this.apiBaseUrl = 'https://dmkxlju409.execute-api.us-east-1.amazonaws.com/prod';
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
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const rawData = await response.json();
            console.log('Raw API response:', rawData);
            console.log('Type of response:', typeof rawData);
            
            // Handle different response formats from Lambda
            let stocks;
            
            // If Lambda returns proxy integration format
            if (rawData.body) {
                try {
                    stocks = JSON.parse(rawData.body);
                    console.log('Parsed from body:', stocks);
                } catch (e) {
                    stocks = rawData.body;
                }
            } else {
                stocks = rawData;
            }
            
            // Ensure stocks is an array
            if (!Array.isArray(stocks)) {
                if (typeof stocks === 'object' && stocks !== null) {
                    stocks = [stocks]; // Convert single object to array
                } else {
                    // Create sample data if API returns unexpected format
                    stocks = [
                        {
                            symbol: 'GOOGL',
                            price: 150.25,
                            change: 2.5,
                            volume: 1000000
                        },
                        {
                            symbol: 'AAPL',
                            price: 175.50,
                            change: -1.2,
                            volume: 2000000
                        },
                        {
                            symbol: 'MSFT',
                            price: 380.75,
                            change: 0.8,
                            volume: 1500000
                        }
                    ];
                    console.log('Using sample data:', stocks);
                }
            }
            
            console.log('Final stocks data:', stocks);
            this.displayStocks(stocks);
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            this.showError('Failed to load stock data. Using sample data.');
            
            // Fallback to sample data
            const sampleStocks = [
                {
                    symbol: 'GOOGL',
                    price: 150.25,
                    change: 2.5,
                    volume: 1000000
                },
                {
                    symbol: 'AAPL',
                    price: 175.50,
                    change: -1.2,
                    volume: 2000000
                }
            ];
            this.displayStocks(sampleStocks);
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
                    action: 'buy',
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('Buy order result:', result);
            
            this.showSuccess(`Successfully bought ${quantity} shares of ${symbol.toUpperCase()}`);
            this.updatePortfolio(symbol.toUpperCase(), quantity, 'buy');
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

            // Check if user has enough shares
            const holding = this.portfolio.find(stock => stock.symbol === symbol.toUpperCase());
            if (!holding || holding.quantity < quantity) {
                this.showError(`You don't have enough shares of ${symbol.toUpperCase()} to sell`);
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
                    action: 'sell',
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('Sell order result:', result);
            
            this.showSuccess(`Successfully sold ${quantity} shares of ${symbol.toUpperCase()}`);
            this.updatePortfolio(symbol.toUpperCase(), quantity, 'sell');
            this.clearForm('sellForm');
            
        } catch (error) {
            console.error('Sell order error:', error);
            this.showError(`Failed to place sell order: ${error.message}`);
        }
    }

    displayStocks(stocks) {
        const container = document.getElementById('stockList');
        if (!container) {
            console.log('Stock list container not found');
            return;
        }

        container.innerHTML = '';
        
        if (Array.isArray(stocks) && stocks.length > 0) {
            stocks.forEach(stock => {
                console.log('Creating element for stock:', stock);
                const stockElement = this.createStockElement(stock);
                container.appendChild(stockElement);
            });
        } else {
            container.innerHTML = '<p>No stock data available</p>';
        }
    }

    createStockElement(stock) {
        const div = document.createElement('div');
        div.className = 'stock-item';
        
        // Handle different possible property names
        const symbol = stock.symbol || stock.Symbol || stock.ticker || 'N/A';
        const price = stock.price || stock.Price || stock.currentPrice || stock.last || 'N/A';
        const change = stock.change || stock.Change || stock.changePercent || stock.pctChange || 'N/A';
        const volume = stock.volume || stock.Volume || stock.totalVolume || 'N/A';
        
        div.innerHTML = `
            <div class="stock-info">
                <h3>${symbol}</h3>
                <p><strong>Current Price:</strong> $${price !== 'N/A' ? parseFloat(price).toFixed(2) : 'N/A'}</p>
                <p><strong>Change:</strong> ${change !== 'N/A' ? parseFloat(change).toFixed(2) : 'N/A'}%</p>
                <p><strong>Volume:</strong> ${volume !== 'N/A' ? parseInt(volume).toLocaleString() : 'N/A'}</p>
                <div class="stock-actions">
                    <button onclick="fillBuyForm('${symbol}')" class="btn-buy">Quick Buy</button>
                    <button onclick="fillSellForm('${symbol}')" class="btn-sell">Quick Sell</button>
                </div>
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

        container.innerHTML = '<h3>Your Portfolio</h3>';
        
        if (this.portfolio.length === 0) {
            container.innerHTML += '<p>No stocks in portfolio</p>';
            return;
        }
        
        this.portfolio.forEach(stock => {
            const div = document.createElement('div');
            div.className = 'portfolio-item';
            div.innerHTML = `
                <div class="portfolio-stock">
                    <span class="portfolio-symbol">${stock.symbol}</span>
                    <span class="portfolio-quantity">${stock.quantity} shares</span>
                </div>
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
            this.portfolio = [];
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

// Make functions globally accessible for onclick handlers
window.fillBuyForm = function(symbol) {
    const buySymbolInput = document.getElementById('buySymbol');
    if (buySymbolInput) {
        buySymbolInput.value = symbol;
    }
};

window.fillSellForm = function(symbol) {
    const sellSymbolInput = document.getElementById('sellSymbol');
    if (sellSymbolInput) {
        sellSymbolInput.value = symbol;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Stock Manager...');
    window.stockManager = new StockManager();
});

// Add CSS for better styling
const style = document.createElement('style');
style.textContent = `
    .message {
        padding: 12px 20px;
        margin: 10px;
        border-radius: 6px;
        font-weight: bold;
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
    .stock-item {
        padding: 15px;
        margin: 10px 0;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #f9f9f9;
        transition: box-shadow 0.2s;
    }
    .stock-item:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .stock-info h3 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 1.2em;
    }
    .stock-info p {
        margin: 5px 0;
        color: #666;
    }
    .stock-actions {
        margin-top: 10px;
    }
    .btn-buy, .btn-sell {
        padding: 6px 12px;
        margin-right: 8px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9em;
        transition: background-color 0.2s;
    }
    .btn-buy {
        background-color: #28a745;
        color: white;
    }
    .btn-buy:hover {
        background-color: #218838;
    }
    .btn-sell {
        background-color: #dc3545;
        color: white;
    }
    .btn-sell:hover {
        background-color: #c82333;
    }
    .portfolio-item {
        padding: 10px;
        margin: 5px 0;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: #f8f9fa;
    }
    .portfolio-stock {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .portfolio-symbol {
        font-weight: bold;
        color: #333;
    }
    .portfolio-quantity {
        color: #666;
    }
`;
document.head.appendChild(style);
