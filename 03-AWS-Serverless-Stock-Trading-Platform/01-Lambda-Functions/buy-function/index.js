const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const mysql = require("mysql2/promise");

const client = new SecretsManagerClient();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { symbol, quantity } = body;

    if (!symbol || !quantity) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Missing symbol or quantity' }),
      };
    }

    const secretName = process.env.SECRET_NAME;
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const secretResponse = await client.send(command);

    const creds = JSON.parse(secretResponse.SecretString);

    const connection = await mysql.createConnection({
      host: creds.host,
      user: creds.username,
      password: creds.password,
      database: creds.dbname,
    });

    const insertQuery = `
      INSERT INTO transactions (symbol, quantity, transaction_type, transaction_time)
      VALUES (?, ?, 'BUY', NOW())
    `;

    await connection.execute(insertQuery, [symbol, quantity]);
    await connection.end();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: `Buy order placed for ${quantity} shares of ${symbol}` }),
    };

  } catch (error) {
    console.error('Error placing buy order:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal server error', error: error.message }),
    };
  }
};
