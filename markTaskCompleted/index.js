const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  const taskId = event.pathParameters.id;

  const connection = await mysql.createConnection({
    host: 'your-rds-endpoint.rds.amazonaws.com',
    user: 'your-username',
    password: 'your-password',
    database: 'your-database-name',
  });

  try {
    const [result] = await connection.execute(
      'UPDATE tasks SET status = ? WHERE id = ?',
      ['completed', taskId]
    );

    await connection.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Task marked as completed' }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update task status' }),
    };
  }
};