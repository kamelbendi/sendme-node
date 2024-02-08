const express = require('express');
const Router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

Router.get('/getqrcode', async (req, res) => {
    try {
        
    } catch (error) {
      res.status(400).send({
        update_error: 'Error while signing up..Try again later.'
      });
    }
});

Router.post('/register', async (req, res) => {
    const userData = req.body;

    const { name, surname, username, email, phone, pin, password } = req.body;
        const validFieldsToUpdate = [
          'name',
          'surname',
          'username',
          'email',
          'phone',
          'pin',
          'password'
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

        const result = await global.pool.query(
          'select count(*) as count from users where email=$1',
          [email]
        );
        const count = result.rows[0].count;
        if (count > 0) {
          return res.status(400).send({
            signup_error: 'User with this email address already exists.'
          });
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        await global.pool.query(
          'insert into users(name, surname, username, email, phone, pin, password) values($1,$2,$3,$4,$5,$6,$7)',
          [name, surname, username, email, phone, pin, hashedPassword]
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
          expiresIn: '5m'
        });

        res.status(200).send({ token });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
});

Router.post('/pinlogin', async (req, res) => {
    const { username, pin } = req.body;
    console.log(username, pin)
    try {
      // Query to check if the username already exists
      const queryResult = await global.pool.query('SELECT * FROM users WHERE username = $1;', [username]);
      const user = queryResult.rows[0];
      if (user) {
        console.log(user)
        const isPinMatch = await bcrypt.compare(pin, user.pin);
        if (isPinMatch) {
          const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '5m'
          });
          res.status(200).send({ token });
        } else {
          res.status(400).send({ login_error: 'Check your login details and try again.' });
        }
      } else {
        res.status(400).send({ login_error: 'Invalid username.' });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = Router;