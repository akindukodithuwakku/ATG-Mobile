const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  try {
    // Extract task_id from query parameters
    const taskId = event.queryStringParameters?.id;

    if (!taskId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required query parameter: id' }),
      };
    }

    // Connect to the database
    const connection = await mysql.createConnection({
      host: 'atghealthcare.cjmme44o6mb1.ap-south-1.rds.amazonaws.com',
      user: 'admin',
      password: 'Atghealth.12',
      database: 'atghealthcare',
    });

    // Run DELETE query
    const [result] = await connection.execute(
      'DELETE FROM tasks WHERE id = ?',
      [taskId]
    );

    await connection.end();

    // If no rows were affected, the task didn't exist
    if (result.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `Task with id ${taskId} not found.` }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Task with id ${taskId} deleted successfully.` }),
    };
  } catch (error) {
    console.error('Error deleting task:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error: ' + error.message }),
    };
  }
};
