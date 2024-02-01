const { Pool } = require('pg');

// Replace the following with your PostgreSQL connection string
const connectionString = 'postgresql://postgres@localhost:5432/';

const pool = new Pool({
  connectionString: connectionString,
});

// Replace 'your_database_name' with the desired database name
const databaseName = 'sendme_pg';

// Create the database
exports.createDatabase = async () => {
    try {
        const client = await pool.connect();
          // Create the database
          await client.query(`CREATE DATABASE ${databaseName}`);
          console.log(`Database '${databaseName}' created successfully.`);
    } catch {
        console.error('Error creating database');
    }
}

exports.deleteDatabase = async () => {
    try {
        const client = await pool.connect();
          // Create the database
          await client.query(`DROP DATABASE ${databaseName} WITH (FORCE)`);
          console.log(`Database '${databaseName}' deleted successfully.`);
    } catch {
        console.error('Error deleting database');
    }
}
