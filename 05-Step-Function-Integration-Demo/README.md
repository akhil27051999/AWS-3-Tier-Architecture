# 🚀 AWS Serverless Stock Trading Platform
A complete serverless stock trading application built on AWS using Lambda, API Gateway, S3, and CloudFront. This project demonstrates modern cloud architecture with real-time stock data simulation, buy/sell functionality, and a responsive web interface.

## 📋 Table of Contents
- Project Overview
- Architecture
- Features
- Prerequisites
- AWS Services Used
- Project Structure
- Step-by-Step Setup Guide
- Lambda Functions
- API Gateway Configuration
- Frontend Implementation
- Deployment
- Testing
- Troubleshooting
- Cost Optimization
- Security Best Practices
- Future Enhancements
- Contributing
- License 

## 🎯 Project Overview
This serverless stock trading platform allows users to:

View real-time stock prices for major companies (GOOGL, AAPL, MSFT, TSLA, AMZN)
Execute buy and sell orders with transaction tracking
Maintain a portfolio view
Experience a responsive, modern web interface
The application is built entirely on AWS serverless services, ensuring high availability, scalability, and cost-effectiveness.

##🏗️ Architecture
<img width="1604" height="654" alt="diagram-export-7-31-2025-4_29_16-AM" src="https://github.com/user-attachments/assets/884085db-6df9-4f7e-82f9-ba40c539afb4" />

## ✨ Features

### Core Functionality
- Real-time Stock Data: Dynamic price generation with realistic market simulation
- Trading Operations: Buy and sell stocks with transaction confirmation
- Portfolio Management: Track owned stocks and transaction history
- Responsive Design: Mobile-friendly interface with modern UI/UX

### Technical Features
- Serverless Architecture: No server management required
- Auto-scaling: Handles traffic spikes automatically
- Global CDN: Fast content delivery worldwide
- CORS Support: Secure cross-origin resource sharing
- Error Handling: Comprehensive error management and user feedback

## 📋 Prerequisites
- AWS Account Requirements
- Active AWS account with appropriate permissions
- AWS CLI installed and configured (optional but recommended)
- Basic understanding of AWS services
- Development Environment
- Text editor or IDE (VS Code recommended)
- Web browser for testing
- Basic knowledge of:
  - JavaScript (ES6+)
  - HTML5 & CSS3
  - REST APIs
  - JSON

### AWS Permissions Required
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "lambda:*",
                "apigateway:*",
                "s3:*",
                "cloudfront:*",
                "iam:CreateRole",
                "iam:AttachRolePolicy",
                "iam:PassRole"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🛠️ AWS Services Used

| **Service**     | **Purpose**              | **Configuration**          |
| --------------- | ------------------------ | -------------------------- |
| **AWS Lambda**  | Backend logic execution  | 3 functions (Node.js 18.x) |
| **API Gateway** | REST API management      | CORS enabled, 3 endpoints  |
| **Amazon S3**   | Static website hosting   | Public read access         |
| **CloudFront**  | Content delivery network | Global distribution        |
| **IAM**         | Security and permissions | Lambda execution roles     |
| **CloudWatch**  | Monitoring and logging   | Automatic log collection   |

## 📁 Project Structure

aws-stock-trading-platform/
├── README.md
├── lambda-functions/
│   ├── stock-checker/
│   │   └── index.js
│   ├── buy-function/
│   │   └── index.js
│   └── sell-function/
│       └── index.js
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── api-gateway/
│   └── swagger.yaml
├── cloudformation/
│   └── template.yaml
└── docs/
    ├── architecture-diagram.png
    └── api-documentation.md

# 🚀 Step-by-Step Setup Guide

## Phase 1: Lambda Functions Setup
### 1.1 Create Stock Checker Function

1. Navigate to AWS Lambda Console

https://console.aws.amazon.com/lambda/

2. Create Function
  - Click "Create function"
  - Choose "Author from scratch"
  - Function name: StockCheckerFunction
  - Runtime: Node.js 18.x
  - Architecture: x86_64

3. Configure Function Code
```
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

export const handler = async (event, context) => {
    try {
        console.log('Event:', JSON.stringify(event, null, 2));
        
        const stockData = [
            {
                symbol: 'GOOGL',
                price: 140 + getRandomInt(30),
                change: (Math.random() * 10 - 5).toFixed(2),
                volume: 800000 + getRandomInt(500000)
            },
            {
                symbol: 'AAPL',
                price: 170 + getRandomInt(20),
                change: (Math.random() * 8 - 4).toFixed(2),
                volume: 1500000 + getRandomInt(1000000)
            },
            {
                symbol: 'MSFT',
                price: 370 + getRandomInt(25),
                change: (Math.random() * 6 - 3).toFixed(2),
                volume: 1200000 + getRandomInt(800000)
            },
            {
                symbol: 'TSLA',
                price: 240 + getRandomInt(40),
                change: (Math.random() * 12 - 6).toFixed(2),
                volume: 2000000 + getRandomInt(1500000)
            },
            {
                symbol: 'AMZN',
                price: 130 + getRandomInt(20),
                change: (Math.random() * 7 - 3.5).toFixed(2),
                volume: 900000 + getRandomInt(600000)
            }
        ];
        
        return { 
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            body: JSON.stringify(stockData)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
```
4. Deploy Function
   - Click "Deploy"
   - Test the function using the Test tab
   
## 1.2 Create Buy Function

1. Create Function
   - Function name: BuyFunction
   - Runtime: Node.js 18.x
     
2. Function Code
```
import crypto from "crypto";

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max)) + 1;
}

export const handler = async (event, context) => {
    try {
        console.log('Event:', JSON.stringify(event, null, 2));
        
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
                },
                body: JSON.stringify({ message: 'CORS preflight successful' })
            };
        }
        
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        console.log('Parsed body:', body);
        
        const symbol = body.symbol || 'UNKNOWN';
        const quantity = body.quantity || getRandomInt(10);
        const action = body.action || 'buy';
        const stock_price = body.stock_price || (150 + getRandomInt(50));
        
        const date = new Date();
        const transaction_result = {
            'id': crypto.randomBytes(16).toString("hex"),
            'symbol': symbol,
            'price': parseFloat(stock_price).toFixed(2),
            'type': action,
            'quantity': parseInt(quantity),
            'timestamp': date.toISOString(),
            'total_cost': (parseFloat(stock_price) * parseInt(quantity)).toFixed(2),
            'success': true,
            'message': `Successfully bought ${quantity} shares of ${symbol} at $${parseFloat(stock_price).toFixed(2)} each`
        };
        
        console.log('Transaction result:', transaction_result);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            body: JSON.stringify(transaction_result)
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message,
                success: false
            })
        };
    }
};
```

### 1.3 Create Sell Function

1. Create Function
   - Function name: SellFunction
   - Runtime: Node.js 18.x
     
2. Function Code

```
import crypto from "crypto";

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max)) + 1;
}

export const handler = async (event, context) => {
    try {
        console.log('Event:', JSON.stringify(event, null, 2));
        
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
                },
                body: JSON.stringify({ message: 'CORS preflight successful' })
            };
        }
        
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        console.log('Parsed body:', body);
        
        const symbol = body.symbol || 'UNKNOWN';
        const quantity = body.quantity || getRandomInt(10);
        const action = body.action || 'sell';
        const stock_price = body.stock_price || (150 + getRandomInt(50));
        
        const date = new Date();
        const transaction_result = {
            'id': crypto.randomBytes(16).toString("hex"),
            'symbol': symbol,
            'price': parseFloat(stock_price).toFixed(2),
            'type': action,
            'quantity': parseInt(quantity),
            'timestamp': date.toISOString(),
            'total_received': (parseFloat(stock_price) * parseInt(quantity)).toFixed(2),
            'success': true,
            'message': `Successfully sold ${quantity} shares of ${symbol} at $${parseFloat(stock_price).toFixed(2)} each`
        };
        
        console.log('Transaction result:', transaction_result);
        
        return { 
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            body: JSON.stringify(transaction_result)
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message,
                success: false
            })
        };
    }
};
```

## Phase 2: API Gateway Setup

### 2.1 Create REST API

1. Navigate to API Gateway Console
   - https://console.aws.amazon.com/apigateway/
2. Create API
   - Choose "REST API" (not private)
   - Click "Build"
   - API name: StockTradingAPI
   - Description: API for stock trading platform
   - Endpoint Type: Regional
     
2.2 Create Resources and Methods

1. Create /check Resource
   - Click "Actions" → "Create Resource"
   - Resource Name: check
   - Resource Path: /check
   - Enable CORS: ✓
 
 2. Create GET Method for /check
    - Select /check resource
    - Click "Actions" → "Create Method"
    - Choose GET
    - Integration type: Lambda Function
    - Use Lambda Proxy integration: ✓
    - Lambda Region: us-east-1 (or your region)
    - Lambda Function: StockCheckerFunction
    - Click "Save"
    - Grant permission when prompted
      
3. Create /buy Resource
   - Click "Actions" → "Create Resource"
   - Resource Name: buy
   - Resource Path: /buy
   - Enable CORS: ✓
     
4. Create POST Method for /buy
   - Select /buy resource
   - Click "Actions" → "Create Method"
   - Choose POST
   - Integration type: Lambda Function
   - Use Lambda Proxy integration: ✓
   - Lambda Function: BuyFunction
   - Click "Save"

5. Create /sell Resource
   - Click "Actions" → "Create Resource"
   - Resource Name: sell
   - Resource Path: /sell
   - Enable CORS: ✓

6. Create POST Method for /sell
   - Select /sell resource
   - Click "Actions" → "Create Method"
   - Choose POST
   - Integration type: Lambda Function
   - Use Lambda Proxy integration: ✓
   - Lambda Function: SellFunction
   - Click "Save"
     
### 2.3 Enable CORS for All Resources

1. For each resource (/check, /buy, /sell):
   - Select the resource
   - Click "Actions" → "Enable CORS"
   - Access-Control-Allow-Origin: *
   - Access-Control-Allow-Headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
   - Access-Control-Allow-Methods: Select all methods
   - Click "Enable CORS and replace existing CORS headers"
     
### 2.4 Deploy API
1. Deploy API
   - Click "Actions" → "Deploy API"
   - Deployment stage: [New Stage]
   - Stage name: Prod
   - Stage description: Production stage
   - Click "Deploy"
   - Note Your API URL
     - Copy the Invoke URL (e.g., https://abc123.execute-api.us-east-1.amazonaws.com/Prod)
     - You'll need this for the frontend configuration
    
       
## Phase 3: S3 Static Website Setup

### 3.1 Create S3 Bucket
1. Navigate to S3 Console
   - https://console.aws.amazon.com/s3/
2. Create Bucket
   - Bucket name: stock-trading-platform-[your-unique-id]
   - Region: Same as your Lambda functions
   - Uncheck "Block all public access"
   - Acknowledge the warning
   - Click "Create bucket"

### 3.2 Configure Static Website Hosting
1. Enable Static Website Hosting
   - Select your bucket
   - Go to "Properties" tab
   - Scroll to "Static website hosting"
   - Click "Edit"
   - Enable: Enable
   - Index document: index.html
   - Click "Save changes"
   - Set Bucket Policy

2. Go to "Permissions" tab
   - Click "Bucket Policy"
- Add this policy (replace YOUR-BUCKET-NAME):
```   
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

## Phase 4: Frontend Implementation

### 4.1 Create index.html
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stock Trading Platform</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }
        
        h2, h3 {
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        
        .trading-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .form-group {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
        }
        
        .form-group h3 {
            margin-top: 0;
            color: #495057;
            border-bottom: 1px solid #dee2e6;
        }
        
        .form-row {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #495057;
        }
        
        input[type="text"], input[type="number"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 16px;
            box-sizing: border-box;
        }
        
        input[type="text"]:focus, input[type="number"]:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        
        button {
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: background-color 0.2s;
            width: 100%;
        }
        
        button:hover {
            background-color: #0056b3;
        }
        
        button:active {
            transform: translateY(1px);
        }
        
        .buy-button {
            background-color: #28a745;
        }
        
        .buy-button:hover {
            background-color: #218838;
        }
        
        .sell-button {
            background-color: #dc3545;
        }
        
        .sell-button:hover {
            background-color: #c82333;
        }
        
        #stockList {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stock-item {
            background-color: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .stock-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .stock-info h3 {
            margin: 0 0 15px 0;
            color: #007bff;
            font-size: 1.5em;
            border-bottom: none;
        }
        
        .stock-info p {
            margin: 8px 0;
            font-size: 14px;
        }
        
        .stock-actions {
            margin-top: 15px;
            display: flex;
            gap: 10px;
        }
        
        .stock-actions button {
            flex: 1;
            padding: 8px 12px;
            font-size: 14px;
            width: auto;
        }
        
        #portfolio {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
        }
        
        .portfolio-item {
            background-color: white;
            margin: 10px 0;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #dee2e6;
        }
        
        .portfolio-stock {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .portfolio-symbol {
            font-weight: bold;
            color: #007bff;
            font-size: 1.1em;
        }
        
        .portfolio-quantity {
            color: #6c757d;
            font-weight: 500;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #6c757d;
            font-style: italic;
        }
        
        .error {
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #f5c6cb;
            margin: 10px 0;
        }
        
        .success {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #c3e6cb;
            margin: 10px 0;
        }
        
        @media (max-width: 768px) {
            .trading-section {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            #stockList {
                grid-template-columns: 1fr;
            }
            
            .stock-actions {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Stock Trading Platform</h1>
        
        <div class="container">
            <h2>📈 Available Stocks</h2>
            <div id="stockList" class="loading">
                Loading stock data...
            </div>
        </div>
        
        <div class="container">
            <h2>💰 Trading</h2>
            <div class="trading-section">
                <div class="form-group">
                    <h3>🟢 Buy Stocks</h3>
                    <form id="buyForm">
                        <div class="form-row">
                            <label for="buySymbol">Stock Symbol:</label>
                            <input type="text" id="buySymbol" placeholder="e.g., GOOGL" required>
                        </div>
                        <div class="form-row">
                            <label for="buyQuantity">Quantity:</label>
                            <input type="number" id="buyQuantity" placeholder="Number of shares" min="1" required>
                        </div>
                        <button type="submit" class="buy-button">Buy Shares</button>
                    </form>
                </div>
                
                <div class="form-group">
                    <h3>🔴 Sell Stocks</h3>
                    <form id="sellForm">
                        <div class="form-row">
                            <label for="sellSymbol">Stock Symbol:</label>
                            <input type="text" id="sellSymbol" placeholder="e.g., AAPL" required>
                        </div>
                        <div class="form-row">
                            <label for="sellQuantity">Quantity:</label>
                            <input type="number" id="sellQuantity" placeholder="Number of shares" min="1" required>
                        </div>
                        <button type="submit" class="sell-button">Sell Shares</button>
                    </form>
                </div>
            </div>
        </div>
        
        <div class="container">
            <div id="portfolio">
                <h3>📊 Your Portfolio</h3>
                <p>No stocks in portfolio</p>
            </div>
        </div>
    </div>
    
    <script src="script.js"></script>
</body>
</html>
```

### 4.2 Create script.js
```
// Configuration - Replace with your actual API Gateway URL
const API_BASE_URL = 'https://YOUR-API-ID.execute-api.YOUR-REGION.amazonaws.com/Prod';

// Global variables
let currentStocks = [];
let portfolio = JSON.parse(localStorage.getItem('portfolio')) || {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Stock Manager...');
    
    // Load initial stock data
    loadStockData();
    
    // Set up form event listeners
    setupEventListeners();
    
    // Update portfolio display
    updatePortfolioDisplay();
    
    // Refresh stock data every 30 seconds
    setInterval(loadStockData, 30000);
});

// Load stock data from API
async function loadStockData() {
    console.log('Loading stock data...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/check`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('Raw API response:', response);
        console.log('Type of response:', typeof response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let stockData;
        
        // Handle different response formats
        if (response.body) {
            const text = await response.text();
            console.log('Response text:', text);
            
            try {
                const parsed = JSON.parse(text);
                console.log('Parsed from text:', parsed);
                
                if (parsed.body) {
                    stockData = JSON.parse(parsed.body);
                } else {
                    stockData = parsed;
                }
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                stockData = [{ symbol: 'ERROR', price: 0, change: 0, volume: 0 }];
            }
        } else {
            stockData = await response.json();
        }
        
        console.log('Final stocks data:', stockData);
        
        // Ensure stockData is an array
        if (!Array.isArray(stockData)) {
            console.warn('Stock data is not an array, wrapping it');
            stockData = [stockData];
        }
        
        currentStocks = stockData;
        displayStocks(stockData);
        
    } catch (error) {
        console.error('Error loading stock data:', error);
        displayError('Failed to load stock data. Please try again later.');
    }
}

// Display stocks in the UI 
function displayStocks(stocks) {
    const stockList = document.getElementById('stockList');
    
    if (!stockList) {
        console.error('Stock list container not found');
        return;
    }
    
    if (!stocks || stocks.length === 0) {
        stockList.innerHTML = '<div class="error">No stock data available</div>';
        return;
    }
    
    stockList.innerHTML = stocks.map(stock => {
        const changeClass = parseFloat(stock.change) >= 0 ? 'positive' : 'negative';
        const changeSymbol = parseFloat(stock.change) >= 0 ? '+' : '';
        
        return `
            <div class="stock-item">
                <div class="stock-info">
                    <h3>${stock.symbol}</h3>
                    <p><strong>Price:</strong> $${parseFloat(stock.price).toFixed(2)}</p>
                    <p><strong>Change:</strong> <span class="${changeClass}">${changeSymbol}${stock.change}%</span></p>
                    <p><strong>Volume:</strong> ${parseInt(stock.volume).toLocaleString()}</p>
                </div>
                <div class="stock-actions">
                    <button class="buy-button" onclick="quickBuy('${stock.symbol}', ${stock.price})">
                        Quick Buy
                    </button>
                    <button class="sell-button" onclick="quickSell('${stock.symbol}', ${stock.price})">
                        Quick Sell
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Set up event listeners
function setupEventListeners() {
    // Buy form
    const buyForm = document.getElementById('buyForm');
    if (buyForm) {
        buyForm.addEventListener('submit', handleBuySubmit);
    }
    
    // Sell form
    const sellForm = document.getElementById('sellForm');
    if (sellForm) {
        sellForm.addEventListener('submit', handleSellSubmit);
    }
}

// Handle buy form submission
async function handleBuySubmit(event) {
    event.preventDefault();
    
    const symbol = document.getElementById('buySymbol').value.toUpperCase();
    const quantity = parseInt(document.getElementById('buyQuantity').value);
    
    if (!symbol || !quantity || quantity <= 0) {
        showMessage('Please enter valid stock symbol and quantity', 'error');
        return;
    }
    
    // Get current price for the stock
    const stock = currentStocks.find(s => s.symbol === symbol);
    const price = stock ? stock.price : 150; // Default price if stock not found
    
    await executeTrade('buy', symbol, quantity, price);
}

// Handle sell form submission
async function handleSellSubmit(event) {
    event.preventDefault();
    
    const symbol = document.getElementById('sellSymbol').value.toUpperCase();
    const quantity = parseInt(document.getElementById('sellQuantity').value);
    
    if (!symbol || !quantity || quantity <= 0) {
        showMessage('Please enter valid stock symbol and quantity', 'error');
        return;
    }
    
    // Check if user has enough shares to sell
    if (!portfolio[symbol] || portfolio[symbol] < quantity) {
        showMessage(`You don't have enough ${symbol} shares to sell`, 'error');
        return;
    }
    
    // Get current price for the stock
    const stock = currentStocks.find(s => s.symbol === symbol);
    const price = stock ? stock.price : 150; // Default price if stock not found
    
    await executeTrade('sell', symbol, quantity, price);
}

// Quick buy function
async function quickBuy(symbol, price) {
    const quantity = 1; // Default to 1 share for quick buy
    await executeTrade('buy', symbol, quantity, price);
}

// Quick sell function
async function quickSell(symbol, price) {
    if (!portfolio[symbol] || portfolio[symbol] <= 0) {
        showMessage(`You don't own any ${symbol} shares`, 'error');
        return;
    }
    
    const quantity = 1; // Default to 1 share for quick sell
    await executeTrade('sell', symbol, quantity, price);
}

// Execute trade (buy or sell)
async function executeTrade(action, symbol, quantity, price) {
    console.log(`Executing ${action}:`, { symbol, quantity, price });
    
    try {
        const endpoint = action === 'buy' ? '/buy' : '/sell';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                symbol: symbol,
                quantity: quantity,
                stock_price: price,
                action: action
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Trade result:', result);
        
        if (result.success) {
            // Update portfolio
            updatePortfolio(action, symbol, quantity);
            
            // Show success message
            showMessage(result.message, 'success');
            
            // Clear form
            if (action === 'buy') {
                document.getElementById('buyForm').reset();
            } else {
                document.getElementById('sellForm').reset();
            }
            
            // Update portfolio display
            updatePortfolioDisplay();
            
        } else {
            showMessage(result.message || 'Trade failed', 'error');
        }
        
    } catch (error) {
        console.error('Trade execution error:', error);
        showMessage('Failed to execute trade. Please try again.', 'error');
    }
}

// Update portfolio
function updatePortfolio(action, symbol, quantity) {
    if (action === 'buy') {
        portfolio[symbol] = (portfolio[symbol] || 0) + quantity;
    } else if (action === 'sell') {
        portfolio[symbol] = (portfolio[symbol] || 0) - quantity;
        if (portfolio[symbol] <= 0) {
            delete portfolio[symbol];
        }
    }
    
    // Save to localStorage
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
}

// Update portfolio display
function updatePortfolioDisplay() {
    const portfolioDiv = document.getElementById('portfolio');
    
    if (!portfolioDiv) {
        console.error('Portfolio container not found');
        return;
    }
    
    const portfolioKeys = Object.keys(portfolio);
    
    if (portfolioKeys.length === 0) {
        portfolioDiv.innerHTML = `
            <h3>📊 Your Portfolio</h3>
            <p>No stocks in portfolio</p>
        `;
        return;
    }
    
    let totalValue = 0;
    const portfolioItems = portfolioKeys.map(symbol => {
        const quantity = portfolio[symbol];
        const stock = currentStocks.find(s => s.symbol === symbol);
        const currentPrice = stock ? parseFloat(stock.price) : 0;
        const value = quantity * currentPrice;
        totalValue += value;
        
        return `
            <div class="portfolio-item">
                <div class="portfolio-stock">
                    <span class="portfolio-symbol">${symbol}</span>
                    <span class="portfolio-quantity">${quantity} shares</span>
                </div>
                <div class="portfolio-value">
                    Current Price: $${currentPrice.toFixed(2)} | 
                    Total Value: $${value.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
    
    portfolioDiv.innerHTML = `
        <h3>📊 Your Portfolio</h3>
        <div class="portfolio-summary">
            <strong>Total Portfolio Value: $${totalValue.toFixed(2)}</strong>
        </div>
        ${portfolioItems}
    `;
}

// Show message to user
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the first container
    const firstContainer = document.querySelector('.container');
    if (firstContainer) {
        firstContainer.insertBefore(messageDiv, firstContainer.firstChild);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Display error message
function displayError(message) {
    const stockList = document.getElementById('stockList');
    if (stockList) {
        stockList.innerHTML = `<div class="error">${message}</div>`;
    }
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Utility function to format numbers
function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
}
```

### 4.3 Update API Configuration

**IMPORTANT**: In script.js, replace the API_BASE_URL with your actual API Gateway URL:
```
// Replace this line with your actual API Gateway URL
const API_BASE_URL = 'https://YOUR-API-ID.execute-api.YOUR-REGION.amazonaws.com/Prod';
```

## Phase 5: Deployment

### 5.1 Upload Files to S3

1. Upload Frontend Files
   - Upload index.html to your S3 bucket
   - Upload script.js to your S3 bucket
   - Make sure both files are publicly readable
     
2. Test S3 Website
   - Go to your S3 bucket properties
   - Find the "Static website hosting" section
   - Click the website endpoint URL
   - Verify the site loads (may show API errors until configured)
     
5.2 Update API Configuration

1. Get Your API Gateway URL
   - Go to API Gateway console
   - Select your API
   - Note the Invoke URL from the stage
   - Update script.js
   - Replace YOUR-API-ID and YOUR-REGION in the API_BASE_URL
   - Re-upload script.js to S3
     
5.3 Final Testing

1. Test All Endpoints
   - Visit your website
   - Verify stock data loads
   - Test buy functionality
   - Test sell functionality
   - Check portfolio updates
     
## 6. 🧪 Testing
### Manual Testing Checklist

1. Stock Data Loading
   - Page loads without errors
   - 5 stocks display (GOOGL, AAPL, MSFT, TSLA, AMZN)
   - Prices are realistic and random
   - Data refreshes every 30 seconds
     
2. Buy Functionality
   - Buy form accepts valid input
   - Buy form validates required fields
   - Buy transaction returns success message
   - Portfolio updates after buy
   - Quick buy buttons work
     
3. Sell Functionality
   - Sell form accepts valid input
   - Sell form prevents overselling
   - Sell transaction returns success message
   - Portfolio updates after sell
   - Quick sell buttons work
     
 4. Portfolio Management
    - Portfolio persists in localStorage
    - Portfolio displays current values
    - Portfolio updates in real-time
      
## API Testing with cURL

```
# Test stock data endpoint
curl -X GET "https://YOUR-API-ID.execute-api.YOUR-REGION.amazonaws.com/Prod/check"

# Test buy endpoint
curl -X POST "https://YOUR-API-ID.execute-api.YOUR-REGION.amazonaws.com/Prod/buy" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"GOOGL","quantity":5,"stock_price":150}'

# Test sell endpoint
curl -X POST "https://YOUR-API-ID.execute-api.YOUR-REGION.amazonaws.com/Prod/sell" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","quantity":3,"stock_price":175}'
```

## 🔧 Troubleshooting

### Common Issues and Solutions

1. "exports is not defined" Error
Problem: Lambda function uses CommonJS syntax Solution: Use ES6 modules:
```
// Wrong
exports.handler = async (event) => { ... }

// Correct
export const handler = async (event) => { ... }
```
2. CORS Errors
Problem: Browser blocks API requests Solution: Ensure CORS headers in Lambda responses:
```
headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}
```
3. API Gateway 502 Errors
Problem: Lambda function errors Solution: Check CloudWatch logs:
  - Go to CloudWatch Console
  - Navigate to Log Groups
  - Find /aws/lambda/[FunctionName]
  - Check recent log streams for errors
    
4. Stock Data Not Loading
Problem: API URL misconfiguration Solution: Verify API_BASE_URL in script.js matches your API Gateway URL

5. S3 Access Denied
Problem: Bucket policy not configured Solution: Ensure bucket policy allows public read access

**Debugging Steps**
1. Check Browser Console
   - Open Developer Tools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests
     
2. Verify API Responses
   - Test API endpoints directly in browser
   - Use Postman or cURL for testing
   - Check response format and status codes
     
3. Check AWS CloudWatch Logs
   - Lambda function logs
   - API Gateway access logs
   - Error patterns and stack traces
     
## 💰 Cost Optimization

| **Service**     | **Free Tier Limit**           | **Estimated Monthly Cost** |
| --------------- | ----------------------------- | -------------------------- |
| **Lambda**      | 1M requests, 400K GB-seconds  | \$0.00                     |
| **API Gateway** | 1M API calls                  | \$0.00                     |
| **S3**          | 5GB storage, 20K GET requests | \$0.00                     |
| **CloudFront**  | 50GB data transfer            | \$0.00                     |
| **Total**       |                               | **\$0.00**                 |

### Cost Monitoring
1. Set Up Billing Alerts
   - Go to AWS Billing Console
   - Create billing alarm for $1.00
   - Get notified if costs exceed free tier
     
2. Monitor Usage
   - Check AWS Cost Explorer monthly
   - Review service usage in AWS Console
   - Monitor Lambda invocation counts
     
3. Optimization Tips
   - Lambda: Use appropriate memory allocation
   - API Gateway: Enable caching for production
   - Lambda: Use appropriate memory allocation (128MB is sufficient for this project)
   - API Gateway: Enable caching for production (reduces Lambda invocations)
   - S3: Use lifecycle policies for log files if storing them
   - CloudFront: Configure appropriate cache behaviors to reduce origin requests

## 🔒 Security Best Practices

### Lambda Security

- **Least Privilege IAM Roles**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        }
    ]
}
```

- **Environment Variables for Sensitive Data**
```js
const API_KEY = process.env.API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
```

- **Input Validation**
```js
if (!symbol || typeof symbol !== 'string' || symbol.length > 10) {
    return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid symbol' })
    };
}
```

### API Gateway Security

- **Rate Limiting**: Configure throttling limits (burst & rate)
- **API Keys (Optional)**:
```js
headers: {
    'x-api-key': 'your-api-key'
}
```
- **Request Validation**: Enable validation and define schemas

### S3 Security

- **Bucket Policy Review**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*",
            "Condition": {
                "StringEquals": {
                    "s3:ExistingObjectTag/Environment": "Production"
                }
            }
        }
    ]
}
```
- **Enable Logging**: Enable S3 access logs and monitor patterns

### Frontend Security

- **Content Security Policy**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               connect-src 'self' https://*.amazonaws.com;">
```

- **Input Sanitization**
```js
function sanitizeInput(input) {
    return input.replace(/[<>"']/g, '');
}
```

## 🚀 Future Enhancements

### Phase 1: Data Persistence
- Add DynamoDB for portfolios & history
- User Authentication with AWS Cognito
- Real-time updates using WebSockets

### Phase 2: Advanced Features
- Stock Charts with Chart.js
- Technical indicators
- News from external APIs
- Price change alerts via SMS/Email

### Phase 3: Production Readiness
- CI/CD with AWS CodePipeline
- CloudWatch dashboards
- Jest-based automated testing
- Performance optimization with caching

### Phase 4: Mobile App
- React Native app
- Push notifications
- Offline support

## 📊 Monitoring and Observability

### CloudWatch Dashboards

Monitor:
- **Lambda**: Invocations, Duration, Errors, Throttles
- **API Gateway**: Request count, Latency, 4XX/5XX, Cache hits
- **S3**: Request count, Data transfer, Errors

### CloudWatch Alarm
```bash
aws cloudwatch put-metric-alarm   --alarm-name "StockTradingLambdaErrors"   --alarm-description "Alert when Lambda function errors exceed threshold"   --metric-name Errors   --namespace AWS/Lambda   --statistic Sum   --period 300   --threshold 5   --comparison-operator GreaterThanThreshold   --dimensions Name=FunctionName,Value=StockCheckerFunction   --evaluation-periods 2
```

### Structured Logging
```js
console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: 'Stock data requested',
    requestId: context.awsRequestId,
    userId: event.requestContext?.identity?.sourceIp
}));
```

### Log Insights Query
```sql
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 20
```

## 🧪 Advanced Testing

### Unit Testing (Jest)
```bash
npm init -y
npm install --save-dev jest aws-sdk-mock
```

```js
// tests/stockChecker.test.js
const { handler } = require('../lambda-functions/stock-checker/index.js');
describe('Stock Checker Function', () => {
    test('should return stock data', async () => {
        const event = {};
        const context = {};
        const result = await handler(event, context);
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toHaveLength(5);
    });
});
```

### Integration Testing
```js
// tests/integration.test.js
const axios = require('axios');
describe('API Integration Tests', () => {
    const API_BASE_URL = 'https://your-api-id.execute-api.region.amazonaws.com/Prod';
    test('should fetch stock data', async () => {
        const response = await axios.get(`${API_BASE_URL}/check`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveLength(5);
    });
});
```

### Load Testing with Artillery

`load-test.yml`:
```yaml
config:
  target: 'https://your-api-id.execute-api.region.amazonaws.com/Prod'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Stock data fetch"
    requests:
      - get:
          url: "/check"
```

```bash
npm install -g artillery
artillery run load-test.yml
```

## 📚 Learning Resources

- **AWS Docs**: Lambda, API Gateway, S3, CloudFront
- **Best Practices**: Well-Architected Framework, Serverless Lens, Security
- **Community**: AWS Samples, Serverless Framework, AWS CDK

## 🤝 Contributing

### Setup
```bash
git clone https://github.com/your-username/aws-stock-trading-platform.git
cd aws-stock-trading-platform
npm install
cp .env.example .env
```

### Guidelines
- Fork and branch
- Follow code style and add tests
- Lint and test with:
```bash
npm test
npm run lint
```

- Submit PR with clear description

### Code Style
- ES6+ features
- Error handling & logging
- Descriptive commit messages

## 📄 License

MIT License © 2024 AWS Stock Trading Platform

## 📞 Support

- Check documentation
- Review GitHub issues
- Create issue with bug template

### Bug Report Template
```markdown
**Describe the bug**
**To Reproduce**
**Expected behavior**
**Screenshots**
**Environment:**
- AWS Region:
- Browser:
- Node.js version:
**Additional context**
```

## 🎯 Project Milestones

### ✅ Completed
- Serverless backend
- API Gateway config
- S3 hosting + CloudFront
- Frontend + CORS + UI
- Portfolio features

### 🚧 In Progress
- Testing, security, documentation

### 📋 Planned
- Cognito, DynamoDB, Real-time updates, Mobile app, CI/CD

## 🏆 Achievements

- ✅ Built production-grade serverless app
- ✅ Full-stack cloud-native architecture
- ✅ Implemented best practices for AWS

## 🎉 Conclusion

This project demonstrates:
- Modern serverless stack
- Secure & scalable AWS design
- Real-world cloud development skills

Project Repository: https://github.com/your-username/aws-stock-trading-platform  
Live Demo: https://your-cloudfront-domain.cloudfront.net  
Author: Your Name  
Version: 1.0.0  
Date: 2024
