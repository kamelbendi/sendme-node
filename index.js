const express = require('express');
//import { setupUsersDatabase } from "./db/setup";
const  { pool } = require("./db/db");
const TextFlow = require("textflow.js");
TextFlow.useKey("5IFWwEiNbn8oWDsykxRRMCCzVdMOnpx3clHg5eeZ7fB6wXc9V2JzP6uYrz62QCRZ");
const app = express();
const PORT = process.env.PORT || 3030;

// Database setup
//setupUsersDatabase();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// your code

app.post('/verifysms', async (req, res) => {
    console.log('verify sms');
    console.log(req.body);
    const { code, phone } = req.body;

    var result = await TextFlow.verifyCode(phone, code);
    console.log(result)
    if (result.valid) {
        return res.sendStatus(200).json({ success: true });
    } else {
        return res.sendStatus(400).json({ success: false});
    };
})

app.post('/getsms', async (req, res) => {
    const number = req.body;

    var result = await TextFlow.sendVerificationSMS(number.phone, {});

    if(result.ok) {
        return res.status(200).json({ success: true });
    }
    console.log(result);
    return res.status(400).json({ success: false });
})

// app.get('/users', async (req, res) => {
//     try {
//       const result = await pool.query('SELECT * FROM users');
//       res.json(result.rows);
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).send('Internal Server Error');
//     }
//   });
  
//   // Get a specific user by ID
//   app.get('/users/:id', async (req, res) => {
//     const userId = req.params.id;
  
//     try {
//       const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
//       if (result.rows.length === 0) {
//         res.status(404).send('User not found');
//       } else {
//         res.json(result.rows[0]);
//       }
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).send('Internal Server Error');
//     }
//   });
  
//   // Add a new user
//   app.post('/users', async (req, res) => {
//     const { username, email } = req.body;
  
//     try {
//       const result = await pool.query('INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *', [username, email]);
//       res.json(result.rows[0]);
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).send('Internal Server Error');
//     }
//   });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  