import AWS from "aws-sdk";
import crypto from "crypto";

const dynamodb = new AWS.DynamoDB.DocumentClient();

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max)) + 1;
}

export const handler = async (event) => {
    try {
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

        const symbol = body.symbol || 'UNKNOWN';
        const quantity = body.quantity || getRandomInt(10);
        const action = 'sell';
        const stock_price = body.stock_price || (150 + getRandomInt(50));
        const date = new Date();

        const transaction = {
            id: crypto.randomBytes(16).toString("hex"),
            symbol,
            price: parseFloat(stock_price).toFixed(2),
            type: action,
            quantity: parseInt(quantity),
            timestamp: date.toISOString(),
            total_received: (parseFloat(stock_price) * parseInt(quantity)).toFixed(2),
            success: true,
            message: `Successfully sold ${quantity} shares of ${symbol} at $${parseFloat(stock_price).toFixed(2)} each`
        };

        // ✅ Store to TransactionsTable
        await dynamodb.put({
            TableName: "TransactionsTable",
            Item: transaction
        }).promise();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            body: JSON.stringify(transaction)
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message,
                success: false
            })
        };
    }
};
