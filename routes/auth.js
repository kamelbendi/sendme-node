const express = require('express');
const bcrypt = require('bcryptjs');
const TextFlow = require("textflow.js");
const { isValidFieldProvided } = require('../helpers/help');
TextFlow.useKey("5IFWwEiNbn8oWDsykxRRMCCzVdMOnpx3clHg5eeZ7fB6wXc9V2JzP6uYrz62QCRZ");

const Router = express.Router();

Router.post('/verifysms', async (req, res) => {
    const { code, phone } = req.body;

    var result = await TextFlow.verifyCode(phone, code);
    if (result.valid) {
        return res.sendStatus(200).json({ success: true });
    } else {
        return res.sendStatus(400).json({ success: false});
    };
})

Router.post('/getsms', async (req, res) => {
    const number = req.body.phone;

    var result = await TextFlow.sendVerificationSMS(number, {});

    if(result.ok) {
        return res.status(200).json({ success: true });
    }

    return res.status(400).json({ success: false });
})

Router.post('/check-username', async (req, res) => {
    const { username } = req.body;

    try {
      // Query to check if the username already exists
      const queryResult = await global.pool.query('SELECT * FROM users WHERE username = $1;', [username]);
      if (queryResult.rows.length === 0) {
        res.json({ unique: true });
      } else {
        res.json({ unique: false });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

Router.post('/check-email', async (req, res) => {
    const { email } = req.body;

    try {
      // Query to check if the email already exists
      const queryResult = await global.pool.query('SELECT * FROM users WHERE email = $1;', [email]);
  
      if (queryResult.rows.length === 0) {
        res.json({ unique: true });
      } else {
        res.json({ unique: false });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = Router;
