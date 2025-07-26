const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  try {
    // Parse the request body
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    const { id, title, description, status, start, end } = body;

    // Validate required fields
    if (!id || !title || !status || !start || !end) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields." }),
      };
    }

    // Connect to the database
    const connection = await mysql.createConnection({
      host: 'atghealthcare.cjmme44o6mb1.ap-south-1.rds.amazonaws.com',
      user: 'admin',
      password: 'Atghealth.12',
      database: 'atghealthcare',
    });

    // Update the task
    const [result] = await connection.execute(
      `UPDATE tasks
       SET title = ?, description = ?, status = ?, updated_at = NOW(), start = ?, end = ?
       WHERE id = ?`,
      [title, description, status, start, end, id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Task not found." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Task updated successfully." }),
    };
  } catch (error) {
    console.error("Error updating task:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error: " + error.message }),
    };
  }
};