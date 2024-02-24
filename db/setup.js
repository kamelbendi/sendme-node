const bcrypt = require('bcrypt');
const { getRandomInt, generateRandomDigitsNumber, generateExpiryDate } = require('../helpers/help');

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
    const encryptedPin = await bcrypt.hash('111111', 10);

    const testUsersData = [
      { name: 'test1', surname: 'surname1', username: 'test1', email: 'test1@example.com', phone: '123456789', pin: encryptedPin, password: encryptedPassword, balance: 1500, cardnumber: generateRandomDigitsNumber(16), cvv: generateRandomDigitsNumber(3), expirydate: generateExpiryDate(), accountnumber: generateRandomDigitsNumber(10), iduri: ''},
      { name: 'test2', surname: 'surname2', username: 'test2', email: 'test2@example.com', phone: '123456789', pin: encryptedPin, password: encryptedPassword, balance: 2000, cardnumber: generateRandomDigitsNumber(16), cvv: generateRandomDigitsNumber(3), expirydate: generateExpiryDate(), accountnumber: generateRandomDigitsNumber(10), iduri: '' },
      { name: 'test3', surname: 'surname3', username: 'test3', email: 'test3@example.com', phone: '123456789', pin: encryptedPin, password: encryptedPassword, balance: 2500, cardnumber: generateRandomDigitsNumber(16), cvv: generateRandomDigitsNumber(3), expirydate: generateExpiryDate(), accountnumber: generateRandomDigitsNumber(10), iduri: '' },
      { name: 'test4', surname: 'surname4', username: 'test4', email: 'test4@example.com', phone: '123456789', pin: encryptedPin, password: encryptedPassword, balance: 3000, cardnumber: generateRandomDigitsNumber(16), cvv: generateRandomDigitsNumber(3), expirydate: generateExpiryDate(), accountnumber: generateRandomDigitsNumber(10), iduri: '' },
      { name: 'test5', surname: 'surname5', username: 'test5', email: 't@e.st', phone: '123456789', pin: encryptedPin, password: encryptedPassword, balance: 3000, cardnumber: generateRandomDigitsNumber(16), cvv: generateRandomDigitsNumber(3), expirydate: generateExpiryDate(), accountnumber: generateRandomDigitsNumber(10), iduri: ''},
      // Add more test users as needed
    ];

    for (const user of testUsersData) {
      // Check if the user already exists
      const existingUserQuery = 'SELECT * FROM users WHERE username = $1';
      const existingUser = await global.pool.query(existingUserQuery, [user.username]);

      if (existingUser.rows.length === 0) {
        // User doesn't exist, proceed with insertion
        const userInsertQuery = `
          INSERT INTO users (name, surname, username, email, phone, pin, password, balance, cardnumber, cvv, expirydate, accountnumber, iduri)
          VALUES ('${user.name}', '${user.surname}', '${user.username}', '${user.email}', '${user.phone}', '${user.pin}', '${user.password}', ${user.balance}, '${user.cardnumber}', '${user.cvv}', '${user.expirydate}', '${user.accountnumber}', '${user.iduri}');
        `;
        await global.pool.query(userInsertQuery);

      // Insert transactions for the user into the 'transactions' table
      const testTransactionsData = Array.from({ length: 10 }, () => ({
        username_sender: user.username,
        title: 'Transaction from ' + user.username,
        amount: getRandomInt(10, 1000),
        username_receiver: 'test' + getRandomInt(1, 5)
      }));

      const transactionsValuesClause = testTransactionsData
        .filter(transaction => transaction.username_sender !== transaction.username_receiver) // Filter out transactions with the same sender and receiver
        .map(transaction => `('${transaction.username_sender}', '${transaction.title}', ${transaction.amount}, '${transaction.username_receiver}')`)
        .join(',');

      const transactionsInsertQuery = `
        INSERT INTO transactions (username_sender, title, amount, username_receiver)
        VALUES ${transactionsValuesClause}
        RETURNING id, amount, username_sender, username_receiver;
      `;

      const insertedTransaction = await global.pool.query(transactionsInsertQuery);

      // Extract relevant information from the inserted transaction
      const { id, amount, username_sender, username_receiver } = insertedTransaction.rows[0];

      // Update the balances of the sender and receiver
      const updateSenderBalanceQuery = `
        UPDATE users
        SET balance = balance - $1
        WHERE username = $2;
      `;

      const updateReceiverBalanceQuery = `
        UPDATE users
        SET balance = balance + $1
        WHERE username = $2;
      `;

      try {
        // Update the sender's balance (reduce)
        await global.pool.query(updateSenderBalanceQuery, [amount, username_sender]);

        // Update the receiver's balance (increase)
        await global.pool.query(updateReceiverBalanceQuery, [amount, username_receiver]);

      } catch (error) {
        console.error('Error updating balances:', error);
        // Handle error (rollback transaction or other appropriate action)
      }
      } else {
        console.log(`User with username ${user.username} already exists. Skipping insertion.`);
      }
    }

    console.log(`${testUsersData.length} test users and their transactions inserted successfully.`); 
  } catch (error) {
    console.error('Error inserting test data:', error);
  }
};

module.exports = {
  setupTestData,
};
