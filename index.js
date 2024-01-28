require('express-async-errors')
const winston = require('winston');
const express = require('express');
const app = express();

winston.add(winston.transports.File, { filename: 'logfile.log' })
process.on('uncaughtException', (ex) => {
    winston.error(ex.message, err)
    process.exit(1)
})

process.on('unhandledRejection', (ex) => {
    winston.error(ex.message, err)
    process.exit(1)
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))



const port = process.env.PORT || 3030;

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})

//----- 

//import { setupUsersDatabase } from "./db/setup";
const  { pool } = require("./db/db");
const TextFlow = require("textflow.js");
TextFlow.useKey("5IFWwEiNbn8oWDsykxRRMCCzVdMOnpx3clHg5eeZ7fB6wXc9V2JzP6uYrz62QCRZ");

// Database setup
//setupUsersDatabase();


// your code

app.post('/verifysms', async (req, res) => {
    const { code, phone } = req.body;

    var result = await TextFlow.verifyCode(phone, code);
    if (result.valid) {
        return res.sendStatus(200).json({ success: true });
    } else {
        return res.sendStatus(400).json({ success: false});
    };
})

app.post('/getsms', async (req, res) => {
    const number = req.body.phone;

    var result = await TextFlow.sendVerificationSMS(number, {});

    if(result.ok) {
        return res.status(200).json({ success: true });
    }
    console.log(result);
    return res.status(400).json({ success: false });
})

app.post('/register', async (req, res) => {
    const userData = req.body;
    

})

app.post('/login', async (req, res) => {

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
