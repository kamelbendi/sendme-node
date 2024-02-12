const createHistoryTableForUsers = async () => {
  try {
    await global.pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      username_receiver VARCHAR(50),
      title VARCHAR(50),
      amount DECIMAL,
      username_sender VARCHAR(50),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
    `);
    console.log('Table "transactions" created successfully');
  } catch {
    console.error('Error creating history table');
  }
}

module.exports = {
  createHistoryTableForUsers,
};
