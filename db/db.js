const { Pool } = require('pg');

// Replace the following with your PostgreSQL connection string
const connectionString = 'postgresql://postgres@localhost:5432/';

let pool = new Pool({
  connectionString: connectionString,
});

// Replace 'your_database_name' with the desired database name
const databaseName = 'sendme_pg';

// Create the database
const createDatabase = async () => {
    try {
          //Create the database
        await pool.query(`CREATE DATABASE ${databaseName}`);
        await pool.end();

        await createUsersTable();
    } catch {
        console.error('Error creating database');
    }
}

const createUsersTable = async () => {
    pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        port: 5432,
        database: databaseName, // Connecting to the new database
      });

      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50),
            surname VARCHAR(50),
            username VARCHAR(50) UNIQUE,
            email VARCHAR(100) UNIQUE,
            phone VARCHAR(15),
            pin VARCHAR(4),
            password VARCHAR(255),
            balance DECIMAL DEFAULT 1000
        );
      `);
    console.log('Table "users" created successfully');
    console.log(`Database '${databaseName}' created successfully.`);
};

const deleteDatabase = async () => {
    try {
          // delete the database
        await pool.query(`DROP DATABASE IF EXISTS ${databaseName} WITH (FORCE)`);
        console.log(`Database '${databaseName}' deleted successfully.`);
    } catch {
        console.error('Error deleting database');
    }
}

console.log('pool exported')
module.exports = {
    createDatabase,
    deleteDatabase,
    pool
}
