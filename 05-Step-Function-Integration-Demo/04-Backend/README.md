Phase 1: Backend Infrastructure Setup
Step 1: Create DynamoDB Tables
# Create Stock Items Table
aws dynamodb create-table \
    --table-name StockItems \
    --attribute-definitions \
        AttributeName=stockSymbol,AttributeType=S \
    --key-schema \
        AttributeName=stockSymbol,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

# Create Transactions Table
aws dynamodb create-table \
    --table-name StockTransactions \
    --attribute-definitions \
        AttributeName=transactionId,AttributeType=S \
        AttributeName=timestamp,AttributeType=S \
    --key-schema \
        AttributeName=transactionId,KeyType=HASH \
        AttributeName=timestamp,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

Run in CloudShell
Step 2: Create Lambda Functions
A. Stock Checker Lambda (stock-checker.js)

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const { stockSymbol } = JSON.parse(event.body);
        
        // Get stock from DynamoDB
        const params = {
            TableName: 'StockItems',
            Key: { stockSymbol: stockSymbol }
        };
        
        const result = await dynamodb.get(params).promise();
        
        if (result.Item) {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                body: JSON.stringify({
                    stockSymbol: result.Item.stockSymbol,
                    currentPrice: result.Item.currentPrice,
                    availableShares: result.Item.availableShares,
                    timestamp: new Date().toISOString()
                })
            };
        } else {
            return {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                body: JSON.stringify({ message: 'Stock not found' })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};

B. Buy/Sell Order Lambda (order-processor.js)

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const stepfunctions = new AWS.StepFunctions();

exports.handler = async (event) => {
    try {
        const orderData = JSON.parse(event.body);
        const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Start Step Function execution
        const stepFunctionParams = {
            stateMachineArn: process.env.STEP_FUNCTION_ARN,
            input: JSON.stringify({
                ...orderData,
                transactionId: transactionId,
                timestamp: new Date().toISOString()
            })
        };
        
        const execution = await stepfunctions.startExecution(stepFunctionParams).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({
                orderId: transactionId,
                executionArn: execution.executionArn,
                status: 'PROCESSING'
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'Failed to process order' })
        };
    }
};

C. Transaction History Lambda (get-transactions.js)

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const params = {
            TableName: 'StockTransactions',
            ScanIndexForward: false, // Sort by timestamp descending
            Limit: 50 // Get last 50 transactions
        };
        
        const result = await dynamodb.scan(params).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({
                transactions: result.Items
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'Failed to get transactions' })
        };
    }
};

Step 3: Create Step Functions State Machine
Step Function Definition (stock-trading-workflow.json)

{
  "Comment": "Stock Trading Workflow",
  "StartAt": "ValidateOrder",
  "States": {
    "ValidateOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:ValidateStockOrder",
      "Next": "CheckStockAvailability"
    },
    "CheckStockAvailability": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:CheckStockAvailability",
      "Next": "ProcessOrder"
    },
    "ProcessOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:ProcessStockOrder",
      "Next": "UpdateDatabase"
    },
    "UpdateDatabase": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:UpdateStockDatabase",
      "Next": "SendNotification"
    },
    "SendNotification": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:SendOrderNotification",
      "End": true
    }
  }
}

Step 4: Create API Gateway
API Gateway Setup Commands:

# Create API Gateway
aws apigatewayv2 create-api \
    --name stock-management-api \
    --protocol-type HTTP \
    --cors-configuration AllowOrigins="*",AllowMethods="*",AllowHeaders="*"

# Create routes
aws apigatewayv2 create-route \
    --api-id YOUR_API_ID \
    --route-key "POST /stock/check"

aws apigatewayv2 create-route \
    --api-id YOUR_API_ID \
    --route-key "POST /stock/buy"

aws apigatewayv2 create-route \
    --api-id YOUR_API_ID \
    --route-key "POST /stock/sell"

aws apigatewayv2 create-route \
    --api-id YOUR_API_ID \
    --route-key "GET /transactions"

Run in CloudShell
Phase 2: Frontend Deployment
Step 5: Create S3 Bucket for Frontend
# Create S3 bucket
aws s3 mb s3://your-stock-app-frontend-bucket

# Enable static website hosting
aws s3 website s3://your-stock-app-frontend-bucket \
    --index-document index.html \
    --error-document error.html

# Upload frontend files
aws s3 sync ./frontend-files s3://your-stock-app-frontend-bucket

Run in CloudShell
Step 6: Setup CloudFront Distribution
CloudFront Configuration:

{
    "CallerReference": "stock-app-distribution",
    "Comment": "Stock Management App Distribution",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-stock-app",
                "DomainName": "your-stock-app-frontend-bucket.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-stock-app",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        }
    },
    "Enabled": true
}

Phase 3: Configuration and Connection
Step 7: Update Frontend Configuration
Update script.js with your actual API Gateway URL:

// Replace this with your actual API Gateway URL
const API_BASE_URL = 'https://your-api-id.execute-api.us-east-1.amazonaws.com';

const ENDPOINTS = {
    checkStock: `${API_BASE_URL}/stock/check`,
    buyStock: `${API_BASE_URL}/stock/buy`,
    sellStock: `${API_BASE_URL}/stock/sell`,
    getTransactions: `${API_BASE_URL}/transactions`
};

Step 8: Sample Data Setup
Add sample stock data to DynamoDB:

// Sample data insertion script
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const sampleStocks = [
    {
        stockSymbol: 'AAPL',
        currentPrice: 150.25,
        availableShares: 1000,
        companyName: 'Apple Inc.'
    },
    {
        stockSymbol: 'GOOGL',
        currentPrice: 2800.50,
        availableShares: 500,
        companyName: 'Alphabet Inc.'
    },
    {
        stockSymbol: 'TSLA',
        currentPrice: 800.75,
        availableShares: 750,
        companyName: 'Tesla Inc.'
    }
];

async function insertSampleData() {
    for (const stock of sampleStocks) {
        const params = {
            TableName: 'StockItems',
            Item: stock
        };
        
        try {
            await dynamodb.put(params).promise();
            console.log(`Inserted ${stock.stockSymbol}`);
        } catch (error) {
            console.error(`Error inserting ${stock.stockSymbol}:`, error);
        }
    }
}

insertSampleData();

Phase 4: IAM Permissions Setup
Step 9: Create IAM Roles
Lambda Execution Role Policy:

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
        },
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Scan",
                "dynamodb:Query"
            ],
            "Resource": [
                "arn:aws:dynamodb:us-east-1:*:table/StockItems",
                "arn:aws:dynamodb:us-east-1:*:table/StockTransactions"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "states:StartExecution"
            ],
            "Resource": "arn:aws:states:us-east-1:*:stateMachine:*"
        }
    ]
}

Phase 5: Testing and Deployment
Step 10: Deploy and Test
Deploy Lambda Functions:
# Package and deploy each Lambda function
zip -r stock-checker.zip stock-checker.js node_modules/
aws lambda create-function \
    --function-name stock-checker \
    --runtime nodejs18.x \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
    --handler stock-checker.handler \
    --zip-file fileb://stock-checker.zip

Run in CloudShell
Test API Endpoints:
# Test stock checker
curl -X POST https://your-api-gateway-url/stock/check \
  -H "Content-Type: application/json" \
  -d '{"stockSymbol": "AAPL"}'

Run in CloudShell
Access Your Frontend:
Go to your CloudFront distribution URL
Test all functionality: stock checking, buying, selling
Verify data is being stored in DynamoDB
Quick Setup Script
Here's a deployment script to automate the setup:

#!/bin/bash

# Set variables
REGION="us-east-1"
ACCOUNT_ID="YOUR_ACCOUNT_ID"
BUCKET_NAME="your-stock-app-frontend-bucket"

# Create DynamoDB tables
aws dynamodb create-table --table-name StockItems --attribute-definitions AttributeName=stockSymbol,AttributeType=S --key-schema AttributeName=stockSymbol,KeyType=HASH --billing-mode PAY_PER_REQUEST --region $REGION

aws dynamodb create-table --table-name StockTransactions --attribute-definitions AttributeName=transactionId,AttributeType=S AttributeName=timestamp,AttributeType=S --key-schema AttributeName=transactionId,KeyType=HASH AttributeName=timestamp,KeyType=RANGE --billing-mode PAY_PER_REQUEST --region $REGION

# Create S3 bucket
aws s3 mb s3://$BUCKET_NAME

# Enable static website hosting
aws s3 website s3://$BUCKET_NAME --index-document index.html

echo "Setup complete! Now deploy your Lambda functions and configure API Gateway."

Run in CloudShell
This complete setup will give you a fully functional stock management system with frontend UI connected to your backend services and database!

Would you like me to help you with any specific part of this setup process?

Sources
Building a Serverless Architecture on AWS | AWS re:Post 

Set up an API integration request using the API Gateway console - Amazon API Gateway 

Web application - AWS Serverless Multi-Tier Architectures with Amazon API Gateway and AWS Lambda 

Tutorial: Create a WebSocket API with an AWS integration - Amazon API Gateway 
