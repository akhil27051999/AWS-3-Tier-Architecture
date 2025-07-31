import crypto from "crypto";

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max)) + 1;
}

export const handler = async (event, context) => {
    try {
        console.log('Event:', JSON.stringify(event, null, 2));
        
        // Handle CORS preflight request
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
        
        // Parse the request body
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        console.log('Parsed body:', body);
        
        // Extract data from request
        const symbol = body.symbol || 'UNKNOWN';
        const quantity = body.quantity || getRandomInt(10);
        const action = body.action || 'buy';
        
        // Generate a realistic stock price if not provided
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
