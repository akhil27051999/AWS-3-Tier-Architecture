# AWS Serverless Stock Trading Platform
A complete serverless stock trading application built on AWS using Lambda, API Gateway, S3, and CloudFront. This project demonstrates modern cloud architecture with real-time stock data simulation, buy/sell functionality, and a responsive web interface.

## Architecture Diagram
<img width="1604" height="545" alt="diagram-export-7-31-2025-4_29_16-AM" src="https://github.com/user-attachments/assets/08beda9a-df91-4c11-998c-95494a58742e" />

## Table of Contents

- [Architecture Diagram](#architecture-diagram)
- [Project Overview](#project-overview)
- [Implementation Videos](#implementation-videos)  
- [Features](#features)
- [Prerequisites](#prerequisites)
- [AWS Services Used](#aws-services-used)
- [Project Structure](#project-structure)
- [Step-by-Step Setup Guide](#step-by-step-setup-guide)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Cost Optimization](#cost-optimization)
- [Security Best Practices](#security-best-practices)
- [Future Enhancements](#future-enhancements)
- [Monitoring and Observability](#monitoring-and-observability)
- [Advanced Testing](#advanced-testing)
- [Learning Resources](#learning-resources)
- [Achievements](#achievements)
- [Conclusion](#conclusion)

## Project Overview
This serverless stock trading platform allows users to:

View real-time stock prices for major companies (GOOGL, AAPL, MSFT, TSLA, AMZN)
Execute buy and sell orders with transaction tracking
Maintain a portfolio view
Experience a responsive, modern web interface
The application is built entirely on AWS serverless services, ensuring high availability, scalability, and cost-effectiveness.

## Implementation Videos

### 1. Lambda Function Setup

https://github.com/user-attachments/assets/991f4984-cc5d-4209-af24-c8c560058a0c

### 2. API Gateway Setup

https://github.com/user-attachments/assets/e80c1204-6b2a-4b1c-b644-e0bfb436a980

### 3. State Machine Setup

https://github.com/user-attachments/assets/6d8b872e-dc6a-4765-abf4-78ee073e3efc

### 4. DynamoDB Setup, Backend API Integration with Frontend and Frontend Deployment

https://github.com/user-attachments/assets/8195fdb6-1777-4a12-9235-ab1627559680

### 5. Application Testing

https://github.com/user-attachments/assets/74e18426-5c84-48e9-b3a5-6e1132bf03dd

## Features

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

## Prerequisites
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

## AWS Services Used

| Category               | AWS Service             | Purpose                                                                 |
|------------------------|-------------------------|-------------------------------------------------------------------------|
| Compute                | **AWS Lambda**          | Executes backend trading logic (buy, sell, stock check)                |
| API & Integration      | **Amazon API Gateway**  | Exposes Lambda functions as RESTful APIs                               |
| Orchestration          | **AWS Step Functions**  | Manages the flow between multiple Lambda functions                     |
| Storage & Hosting      | **Amazon S3**           | Hosts static frontend files (HTML, CSS, JS)                            |
| Content Delivery       | **Amazon CloudFront**   | Caches and delivers the frontend globally with low latency             |
| DevOps & Deployment    | **AWS CloudFormation**  | Automates deployment of infrastructure components                      |
| Web Hosting (Optional) | **AWS Amplify**         | Simplifies hosting and CI/CD for the frontend                          |
| Networking             | **Amazon VPC**          | Used in hybrid or advanced setups for secure communication             |
| Security               | **AWS IAM**             | Manages permissions for Lambda, API Gateway, and Step Functions        |
| Secrets Management     | **AWS Secrets Manager** | (Optional) Manages sensitive data like API keys and credentials        |


## Project Structure

```
aws-stock-trading-platform/
├── README.md
├── LICENSE
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
├── state-machine/
│   └── stock-trader.asl.json
└── cloudformation/
    └── template.yaml

```

# Step-by-Step Setup Guide

## Phase 1: Lambda Functions Setup

### 1.1 Create Stock Checker Function

1. Navigate to AWS Lambda Console

2. Create Function
  - Click "Create function"
  - Choose "Author from scratch"
  - Function name: StockCheckerFunction
  - Runtime: Node.js 18.x
  - Architecture: x86_64

3. Configure Function Code
  - lambda-functions/stock-checker/index.js

4. Deploy Function
   - Click "Deploy"
   - Test the function using the Test tab
   
## 1.2 Create Buy Function

1. Create Function
   - Function name: BuyFunction
   - Runtime: Node.js 18.x
     
2. Configure Function Code
  - lambda-functions/buy-function/index.js

3. Deploy Function
   - Click "Deploy"
   - Test the function using the Test tab


### 1.3 Create Sell Function

1. Create Function
   - Function name: SellFunction
   - Runtime: Node.js 18.x

2. Configure Function Code
  - lambda-functions/sell-function/index.js

3. Deploy Function
   - Click "Deploy"
   - Test the function using the Test tab  

## Phase 2: API Gateway Setup

### 2.1 Create REST API

1. Navigate to API Gateway Console

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

## Phase 3:  DynamoDB Integration for Data Storage

### 3.1 Table: `Stockitems`

This table maintains **current stock holdings per user**.

#### Schema

| Attribute Name   | Type     | Description                                |
|------------------|----------|--------------------------------------------|
| `symbol`         | String (PK) | Identifier for the user                 |
| `name `          | String (SK) | company name of the stock               |
| `price`          | Number   | Current price of the shares                |          

### JSON format for adding stock items in DynamoDB

``` Json 
{
  "symbol": {
    "S": "NVDA"
  },
  "name": {
    "S": "NVIDIA Corporation"
  },
  "price": {
    "N": "904.7"
  }
}
```
### 3.2 Backend Integration with DynamoDB

#### Lambda Handler
The Stockitems data is written into DynamoDB via the AWS.DynamoDB.DocumentClient in the Lambda function (executeOrder.js or equivalent):

```js
import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
```

- The backend uses an AWS Lambda function (e.g., getStocks) to read data from the StockItems table using the ScanCommand from AWS SDK.
- This Lambda function is exposed via API Gateway, allowing the frontend to fetch stock data using an HTTP GET request.

### 3.3 IAM Permissions 
- To allow Lambda to write to DynamoDB, attach the following IAM policy to its execution role:

```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:PutItem"
  ],
  "Resource": "arn:aws:dynamodb:<region>:<account-id>:table/TransactionsTable" 
}
```
- Make sure to replace <region> and <account-id> with actual values for Inline policy
- or else use AmazonDynamoDBReadOnlyAccess for Testing purpose

#### Successful Integration

- Once the integration is complete:
  - Show a list of available stocks to users.
  - Reference stock details during buy/sell transactions.
  - Display stock name, symbol, and price on the portfolio and trading pages.

## Phase 4: State Machine Setup (AWS Step Functions)

### What is a State Machine?

- In this project, a **State Machine** refers to an **AWS Step Function**—a serverless orchestration service that allows you to coordinate multiple AWS Lambda functions into a defined workflow.
- Each state in the state machine represents a step (or task), and transitions define the execution path. This allows for powerful error handling, retries, parallel execution, and more.

### Why Use Step Functions?

In the context of a stock trading platform, multiple steps may need to occur in sequence or conditionally. For example:
- Validating trade inputs
- Executing the trade logic (buy/sell)
- Recording the transaction to the database
- Sending a response back to the user

Using Step Functions:
- Increases reliability and fault tolerance
- Makes the workflow easier to visualize and debug
- Automatically retries failed tasks where configured

### How It's Used in This Project

We created a **Step Function state machine** to orchestrate the execution of three Lambda functions in the following order:

1. **ValidateTradeFunction**  
   Validates the incoming trade request (e.g., check stock symbol, quantity, balance).

2. **ExecuteTradeFunction**  
   Performs the business logic for buy/sell, updates user balance and stock holdings.

3. **RecordTransactionFunction**  
   Stores the trade transaction in DynamoDB for history and portfolio tracking.

### Triggering the State Machine

The State Machine is invoked via **API Gateway** using a `/trade` endpoint. When a user places a trade from the frontend UI, the request triggers the Step Function which runs all three Lambda functions in sequence.

## Phase 5: S3 Static Website Setup

### 5.1 Create S3 Bucket
1. Navigate to S3 Console
2. Create Bucket
   - Bucket name: stock-trading-platform-[your-unique-id]
   - Region: Same as your Lambda functions
   - Uncheck "Block all public access"
   - Acknowledge the warning
   - Click "Create bucket"

### 5.2 Configure Static Website Hosting
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

## Phase 6: Frontend Implementation

1. Create index.html
2. Create script.js
3. Create config.js
4. Create Styles.css

**IMPORTANT**: In script.js, replace the API_BASE_URL with your actual API Gateway URL:
```
// Replace this line with your actual API Gateway URL
const API_BASE_URL = 'https://YOUR-API-ID.execute-api.YOUR-REGION.amazonaws.com/Prod';
```

## Phase 7: Deployment

### 7.1 Upload Files to S3

1. Upload Frontend Files
   - Upload index.html to your S3 bucket
   - Upload script.js to your S3 bucket
   - Make sure both files are publicly readable
     
2. Test S3 Website
   - Go to your S3 bucket properties
   - Find the "Static website hosting" section
   - Click the website endpoint URL
   - Verify the site loads (may show API errors until configured)
     
7.2 Update API Configuration

1. Get Your API Gateway URL
   - Go to API Gateway console
   - Select your API
   - Note the Invoke URL from the stage
   - Update script.js
   - Replace YOUR-API-ID and YOUR-REGION in the API_BASE_URL
   - Re-upload script.js to S3
     
7.3 Final Testing

1. Test All Endpoints
   - Visit your website
   - Verify stock data loads
   - Test buy functionality
   - Test sell functionality
   - Check portfolio updates

## Testing

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
      
### API Testing with cURL

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

## Troubleshooting

### Common Issues and Solutions

#### 1. "exports is not defined" Error
Problem: Lambda function uses CommonJS syntax Solution: Use ES6 modules:
```
// Wrong
exports.handler = async (event) => { ... }

// Correct
export const handler = async (event) => { ... }
```
#### 2. CORS Errors
Problem: Browser blocks API requests Solution: Ensure CORS headers in Lambda responses:
```
headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}
```
#### 3. API Gateway 502 Errors
Problem: Lambda function errors Solution: Check CloudWatch logs:
  - Go to CloudWatch Console
  - Navigate to Log Groups
  - Find /aws/lambda/[FunctionName]
  - Check recent log streams for errors
    
#### 4. Stock Data Not Loading
Problem: API URL misconfiguration Solution: Verify API_BASE_URL in script.js matches your API Gateway URL

#### 5. S3 Access Denied
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
     
## Cost Optimization

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

## Security Best Practices

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

## Future Enhancements

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

## Monitoring and Observability

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

## Advanced Testing

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

## Learning Resources

- **AWS Docs**: Lambda, API Gateway, S3, CloudFront
- **Best Practices**: Well-Architected Framework, Serverless Lens, Security
- **Community**: AWS Samples, Serverless Framework, AWS CDK


## Achievements

- ✅ Built production-grade serverless app
- ✅ Full-stack cloud-native architecture
- ✅ Implemented best practices for AWS

## Conclusion

This project demonstrates:
- Modern serverless stack
- Secure & scalable AWS design
- Real-world cloud development skills
