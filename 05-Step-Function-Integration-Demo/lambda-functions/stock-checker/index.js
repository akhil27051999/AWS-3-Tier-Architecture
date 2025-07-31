function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

export const handler = async (event, context) => {
    try {
        console.log('Event:', JSON.stringify(event, null, 2));
        
        // Create multiple stock data instead of just one price
        const stockData = [
            {
                symbol: 'GOOGL',
                price: 140 + getRandomInt(30), // Random price between 140-170
                change: (Math.random() * 10 - 5).toFixed(2), // Random change between -5 to +5
                volume: 800000 + getRandomInt(500000) // Random volume
            },
            {
                symbol: 'AAPL',
                price: 170 + getRandomInt(20), // Random price between 170-190
                change: (Math.random() * 8 - 4).toFixed(2), // Random change between -4 to +4
                volume: 1500000 + getRandomInt(1000000) // Random volume
            },
            {
                symbol: 'MSFT',
                price: 370 + getRandomInt(25), // Random price between 370-395
                change: (Math.random() * 6 - 3).toFixed(2), // Random change between -3 to +3
                volume: 1200000 + getRandomInt(800000) // Random volume
            },
            {
                symbol: 'TSLA',
                price: 240 + getRandomInt(40), // Random price between 240-280
                change: (Math.random() * 12 - 6).toFixed(2), // Random change between -6 to +6
                volume: 2000000 + getRandomInt(1500000) // Random volume
            },
            {
                symbol: 'AMZN',
                price: 130 + getRandomInt(20), // Random price between 130-150
                change: (Math.random() * 7 - 3.5).toFixed(2), // Random change between -3.5 to +3.5
                volume: 900000 + getRandomInt(600000) // Random volume
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
