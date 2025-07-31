import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event, context) => {
    try {
        console.log('Event:', JSON.stringify(event, null, 2));

        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                },
                body: JSON.stringify({ message: 'CORS preflight successful' })
            };
        }

        // Parse body
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const symbol = body.symbol || 'UNKNOWN';

        const params = {
            TableName: "StockTable",
            Key: {
                symbol: { S: symbol }
            }
        };

        const data = await ddbClient.send(new GetItemCommand(params));

        if (!data.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    success: false,
                    message: `Stock ${symbol} not found in database.`
                })
            };
        }

        const stockInfo = {
            symbol: data.Item.symbol.S,
            name: data.Item.name.S,
            price: parseFloat(data.Item.price.N),
            change: parseFloat(data.Item.change.N),
            volume: parseInt(data.Item.volume.N)
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                data: stockInfo
            })
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
                success: false,
                message: "Internal Server Error",
                error: error.message
            })
        };
    }
};
