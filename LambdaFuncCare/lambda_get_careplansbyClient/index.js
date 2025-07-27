const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  console.log('EVENT:', JSON.stringify(event));

  let connection;
  try {
    // DB connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'atghealthcare.cjmme44o6mb1.ap-south-1.rds.amazonaws.com',
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASS || 'Atghealth.12',
      database: process.env.DB_NAME || 'atghealthcare',
    });

    // Get client username from query string parameters
    const clientUsername = event.queryStringParameters?.client_username;

    if (!clientUsername) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: 'Missing client_username' }),
      };
    }

    // Query care plans for the client (include id field)
    const query = `
      SELECT id, care_plan_name, date_created, status
      FROM care_plans
      WHERE client_username = ?
      ORDER BY date_created DESC
    `;

    const [rows] = await connection.execute(query, [clientUsername]);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ care_plans: rows }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    if (connection) await connection.end();
  }
}; 