const { Pool } = require("pg");
const { databaseName } = require("./db");
const bcrypt = require('bcrypt');

const setupTestData = async () => {
  try {
    await createDummyData();
    console.log('Database schema created successfully.');
  } catch (error) {
    console.log('Error adding test data');
  }
};

const createDummyData = async () => {
  try {
    const encryptedPassword = await bcrypt.hash('test', 10);
    const encryptedPin = await bcrypt.hash('123456', 10);

    const testUsersData = [
      { name: 'test1', surname: 'surname1', username: 'test1', email: 'test1@example.com', phone: '123456789', pin: encryptedPin, password: encryptedPassword, balance: 1500 },
      { name: 'test2', surname: 'surname2', username: 'test2', email: 'test2@example.com', phone: '123456789', pin: encryptedPin, password: encryptedPassword, balance: 2000 },
      { name: 'test3', surname: 'surname3', username: 'test3', email: 'test3@example.com', phone: '123456789', pin: encryptedPin, password: encryptedPassword, balance: 2500 },
      { name: 'test4', surname: 'surname4', username: 'test4', email: 'test4@example.com', phone: '123456789', pin: encryptedPin, password: encryptedPassword, balance: 3000 },
      { name: 'test5', surname: 'surname5', username: 'test5', email: 't@e.s', phone: '123456789', pin: encryptedPin, password: encryptedPassword, balance: 3000 },
      // Add more test users as needed
    ];

    const valuesClause = testUsersData.map(user => `('${user.name}', '${user.surname}', '${user.username}', '${user.email}', '${user.phone}', '${user.pin}', '${user.password}', ${user.balance})`).join(',');

// Create the final INSERT query
  const insertQuery = `
    INSERT INTO users (name, surname, username, email, phone, pin, password, balance)
    VALUES ${valuesClause}
  `;
    await global.pool.query(insertQuery);

    console.log(`${testUsersData.length} test users inserted successfully.`); 
  } catch {

  }
}

module.exports = {
    setupTestData,
};
