const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  console.log('EVENT:', JSON.stringify(event));

  let connection;
  try {
    // Get care_navigator_username from query string (GET request)
    const careNavigatorUsername = event.queryStringParameters?.care_navigator_username;

    if (!careNavigatorUsername) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: 'Missing care_navigator_username' }),
      };
    }

    // Connect to MySQL database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'atghealthcare.cjmme44o6mb1.ap-south-1.rds.amazonaws.com',
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASS || 'Atghealth.12',
      database: process.env.DB_NAME || 'atghealthcare',
    });

    // SQL query to get care plans with id, careplan_name, client_username, status, and date_created
    const query = `
      SELECT cp.id, cp.care_plan_name, cp.client_username, cp.status, cp.date_created
      FROM care_plans cp
      INNER JOIN client_details cd ON cp.client_username = cd.client_username
      WHERE cd.care_navigator_username = ?
      ORDER BY cp.date_created DESC
    `;

    const [rows] = await connection.execute(query, [careNavigatorUsername]);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ care_plans: rows }),
    };

  } catch (error) {
    console.error('DB ERROR:', error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    if (connection) await connection.end();
  }
};
