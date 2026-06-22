const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stage_monitoring'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting:', err);
    process.exit(1);
  }

  const query = 'SELECT * FROM evaluaties WHERE student_id = 3';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
    } else {
      console.log('Evaluations table rows for Neyla:', results);
    }
    connection.end();
  });
});
