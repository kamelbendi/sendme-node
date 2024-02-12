const { Pool } = require('pg');

// Replace the following with your PostgreSQL connection string
const connectionString = 'postgresql://postgres@localhost:5432/';

global.pool = new Pool({
  connectionString: connectionString,
});

// Replace 'your_database_name' with the desired database name
const databaseName = 'sendme_pg';

// Create the database
const createDatabase = async () => {
    try {
        //Create the database
        await global.pool.query(`CREATE DATABASE ${databaseName}`);
        await global.pool.end();
        console.log(`Database '${databaseName}' created successfully.`);
    } catch {
        console.error('Error creating database');
    }
}

const createUsersTable = async () => {
    try {
        global.pool = new Pool({
          user: 'postgres',
          host: 'localhost',
          port: 5432,
          database: databaseName, // Connecting to the new database
        });
  
        await global.pool.query(`
          CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              name VARCHAR(50),
              surname VARCHAR(50),
              username VARCHAR(50) UNIQUE,
              email VARCHAR(100) UNIQUE,
              phone VARCHAR(15),
              pin VARCHAR(100),
              password VARCHAR(255),
              balance DECIMAL DEFAULT 0,
              accountnumber VARCHAR(10) UNIQUE,
              cardnumber VARCHAR(16) UNIQUE,
              cvv VARCHAR(3),
              expirydate VARCHAR(7)
          );
        `); 
        console.log('Table "users" created successfully');
    } catch {
        console.error('Error creating table "users"');
    }
};

const deleteDatabase = async () => {
    try {
          // delete the database
        global.pool.end();
        global.pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        port: 5432,
        database: 'postgres', // Connecting to the postgres database
        });

        await global.pool.query(`DROP DATABASE IF EXISTS ${databaseName} WITH (FORCE)`);
        console.log(`Database '${databaseName}' deleted successfully.`);
    } catch {
        console.error('Error deleting database');
    }
}

module.exports = {
    createDatabase,
    deleteDatabase,
    createUsersTable,
    databaseName,
}
