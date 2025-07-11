const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  // Log the event for debugging
  console.log('EVENT:', JSON.stringify(event));

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'atghealthcare.cjmme44o6mb1.ap-south-1.rds.amazonaws.com',
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASS || 'Atghealth.12',
      database: process.env.DB_NAME || 'atghealthcare',
    });

    // Get care_plan_id from query string if provided
    const carePlanId = event.queryStringParameters && event.queryStringParameters.care_plan_id;

    let query = 'SELECT * FROM tasks';
    let params = [];

    if (carePlanId) {
      query += ' WHERE care_plan_id = ?';
      params.push(carePlanId);
    }

    const [rows] = await connection.execute(query, params);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(rows),
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