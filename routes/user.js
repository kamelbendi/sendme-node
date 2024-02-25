const express = require('express');
const Router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateRandomDigitsNumber, generateExpiryDate } = require('../helpers/help');

Router.post('/transfer', async (req, res) => {
    const { username_sender, username_receiver, amount, pin } = req.body;
    
    try {
      const queryResult = await global.pool.query('SELECT * FROM users WHERE username = $1;', [username_sender]);

      const sender = queryResult.rows[0];
      const isPinMatch = await bcrypt.compare(pin, sender.pin);
      if (!isPinMatch) {
        console.log('Invalid PIN');
        return res.status(400).send({
          transfer_error: 'Invalid PIN.'
        });
      }
      if (sender.balance < amount) {
        console.log('Insufficient funds');
        return res.status(400).send({
          transfer_error: 'Insufficient funds.'
        });
      }
      const result = await global.pool.query('SELECT * FROM users WHERE username = $1', [username_receiver]);
      const receiver = result.rows[0];
      if (receiver) {
        const transaction = await global.pool.query('INSERT INTO transactions (username_sender, title, amount, username_receiver) VALUES ($1, $2, $3, $4) RETURNING id, amount, username_sender, username_receiver;', [req.body.username_sender, 'Transfer from ' + req.body.username_sender, req.body.amount, req.body.username_receiver]);
        const { id, amount, username_sender, username_receiver } = transaction.rows[0];
        const updateSenderBalanceQuery = 'UPDATE users SET balance = balance - $1 WHERE username = $2;';
        const updateReceiverBalanceQuery = 'UPDATE users SET balance = balance + $1 WHERE username = $2;';
        await global.pool.query(updateSenderBalanceQuery, [amount, username_sender]);
        await global.pool.query(updateReceiverBalanceQuery, [amount, username_receiver]);
        res.status(200).send({ id, amount, username_sender, username_receiver });
      } else {
        res.status(400).send({
          transfer_error: 'Receiver not found.'
        });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

Router.post('/deleteaccount', async (req, res) => {
    const { email } = req.body;
    try {
      const queryResult = await global.pool.query('DELETE FROM users WHERE email = $1;', [email]);
      res.status(200).json({ success: true });
      console.log('Account deleted successfully');
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

Router.post('/getaccountnumber', async (req, res) => {
    const { username } = req.body;
    try {
      const queryResult = await global.pool.query('SELECT * FROM users WHERE username = $1;', [username]);

        if (queryResult.rows.length > 0) {
            const accountnumber = queryResult.rows[0].accountnumber;
            res.status(200).json({ accountnumber });
        } else {
            
            res.status(404).json({ error: 'Username not found' });
        }
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

Router.post('/getbalance', async (req, res) => {
    const { username } = req.body;

    try {
        const queryResult = await global.pool.query('SELECT * FROM users WHERE username = $1;', [username]);

        if (queryResult.rows.length > 0) {
            const balance = queryResult.rows[0].balance;
            res.status(200).json({ balance });
        } else {
            
            res.status(404).json({ error: 'Username not found' });
        }
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

Router.post('/gettransactions', async (req, res) => {
    const { username } = req.body;

    try {
        const queryResult = await global.pool.query(`
        SELECT * FROM transactions 
        WHERE username_sender = $1
        UNION
        SELECT * FROM transactions 
        WHERE username_receiver = $1 
        ORDER BY timestamp DESC;
        `,
        [username]);

        if (queryResult.rows.length > 0) {
            const transactions = queryResult.rows;
            res.status(200).json(transactions);
        } else {
            res.status(404).json({ error: 'Transactions not found' });
        }
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

Router.post('/getcarddetails', async (req, res) => {
    const { username } = req.body;

    try {
        // Query to get credit card details based on username
        const queryResult = await global.pool.query(`
            SELECT cardnumber, cvv, expirydate FROM users WHERE username = $1;
        `, [username]);

        // Check if the query returned any rows
        if (queryResult.rows.length > 0) {
            const cardDetails = queryResult.rows[0];
            res.status(200).json(cardDetails);
        } else {
            // Username not found
            res.status(404).json({ error: 'Username not found' });
        }
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

Router.post('/register', async (req, res) => {
    const userData = req.body;

    const { name, surname, username, email, phone, pin, password, iduri } = req.body;
        const validFieldsToUpdate = [
          'name',
          'surname',
          'username',
          'email',
          'phone',
          'pin',
          'password',
          'iduri',
        ];

        const receivedFields = Object.keys(req.body);

        const isValidFieldProvided = isValidFieldProvided( //talk
          receivedFields,
          validFieldsToUpdate
        );

        if (isValidFieldProvided) {
          return res.status(400).send({
            signup_error: 'Invalid field.'
          });
        }

        const resultEmail = await global.pool.query(
          'select count(*) as count from users where email=$1',
          [email]
        );
        const countEmail = resultEmail.rows[0].count;
        if (countEmail > 0) {
          console.log('here2')
          return res.status(400).send({
            signup_error: 'User with this email address already exists.'
          });
        }

        const resultUsername = await global.pool.query(
          'select count(*) as count from users where email=$1',
          [email]
        );
        const countUsername = resultUsername.rows[0].count;
        if (countUsername > 0) {
          return res.status(400).send({
            signup_error: 'User with this email address already exists.'
          });
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        const hashedPin = await bcrypt.hash(pin, 8);
        const generatedData = {
          balance: 0,
          cardnumber: generateRandomDigitsNumber(16),
          cvv: generateRandomDigitsNumber(3),
          expirydate: generateExpiryDate(),
          accountnumber: generateRandomDigitsNumber(10)
        }
        await global.pool.query(
          'insert into users(name, surname, username, email, phone, pin, password, balance, accountnumber, cardnumber, cvv, expirydate, iduri) values($1,$2,$3,$4,$5,$6,$7, $8, $9, $10, $11, $12, $13)',
          [name, surname, username, email, phone, hashedPin, hashedPassword, generatedData.balance, generatedData.accountnumber, generatedData.cardnumber, generatedData.cvv, generatedData.expirydate, iduri]
        );
        
        res.status(201).send();

})

Router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await global.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
          return res.status(400).send({
            login_error: 'Check your login details and try again.'
          });
        }

        const user = result.rows[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password); // user.password is a hashed password
        
        if (!isPasswordMatch) {
          return res.status(400).send({
            login_error: 'Check your login details and try again.'
          });
        }
    
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: '1d'
        });

        res.status(200).send({ user, token });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
});

Router.post('/pinlogin', async (req, res) => {
    const { email, pin } = req.body;

    try {
      // Query to check if the username already exists
      const queryResult = await global.pool.query('SELECT * FROM users WHERE email = $1;', [email]);
      const user = queryResult.rows[0];
      if (user) {
        const isPinMatch = await bcrypt.compare(pin, user.pin);
        if (isPinMatch) {
          const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
          });
          res.status(200).send({ token });
        } else {
          res.status(400).send({ login_error: 'Check your login details and try again.' });
        }
      } else {
        res.status(400).send({ login_error: 'Invalid email.' });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

Router.post('/user', async (req, res) => {
    const { email } = req.body;
    try {
      const user = await global.pool.query('SELECT * FROM users WHERE email = $1', [email]);
      res.status(200).send(user.rows[0]);
    } catch (error) {
      res.status(401).send({ error: 'Please authenticate.' });
    }
});

module.exports = Router;
