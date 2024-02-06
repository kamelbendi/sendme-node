const createHistoryTableForUser = async (clientID) => {
  try {
    await global.pool.query(`
      CREATE TABLE IF NOT EXISTS history_${clientID} (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER,
        receiver_id INTEGER,
        amount DECIMAL,
        date DATE
      );
    `);
  } catch {

  }
}

module.exports = {
  createUsersTable,
  createContactTableForUser,
  createHistoryTableForUser,
};
