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

    // Get care navigator ID from query
    const careNavigatorId = event.queryStringParameters?.care_navigator_id;

    if (!careNavigatorId) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: 'Missing care_navigator_id' }),
      };
    }

    const query = `
      SELECT id, client_id, care_navigator_id, created_date, status, description
      FROM careplans
      WHERE care_navigator_id = ?
    `;

    const [rows] = await connection.execute(query, [careNavigatorId]);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ data: rows }),
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
