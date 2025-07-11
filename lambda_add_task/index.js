const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (e) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Invalid JSON in request body" }),
    };
  }

  // Use environment variables for credentials in production!
  const connection = await mysql.createConnection({
        host: 'atghealthcare.cjmme44o6mb1.ap-south-1.rds.amazonaws.com',
        user: 'admin',
        password: 'Atghealth.12',
        database: 'atghealthcare', // ✅ Correct database name
      });

  try {
    const [result] = await connection.execute(
      `INSERT INTO tasks (care_plan_id, title, description, status, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        body.care_plan_id,
        body.title,
        body.description || '',
        body.status || 'pending',
        body.updated_by
      ]
    );

    await connection.end();

    return {
      statusCode: 201,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        id: result.insertId,
        care_plan_id: body.care_plan_id,
        title: body.title,
        description: body.description || '',
        status: body.status || 'pending',
        updated_by: body.updated_by,
        updated_at: new Date().toISOString()
      }),
    };
  } catch (error) {
    await connection.end();
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};