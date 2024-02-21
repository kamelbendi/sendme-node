const express = require('express');
const Router = express.Router();
const bcrypt = require('bcrypt');

Router.post('/atm-check-balance', async (req, res) => {
    const { cardNumber, pin } = req.body;

    try {
        const queryResult = await global.pool.query('SELECT * FROM users WHERE cardnumber = $1', [cardNumber]);
        const user = queryResult.rows[0];

        if (user) {
            const isPinMatch = await bcrypt.compare(pin, user.pin);
            if (isPinMatch) {
                const balance = user.balance;
                res.status(200).json({ balance });
            } else {
                res.status(400).json({ login_error: 'Check your login details and try again.' });
            }
        } else {
            res.status(404).json({ error: 'Card number incorrect' });
        }
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

Router.post('/atm-withdraw', async (req, res) => {
    const { cardNumber, pin, amount } = req.body;

    try {
        const queryResult = await global.pool.query('SELECT * FROM users WHERE cardnumber = $1', [cardNumber]);
        const user = queryResult.rows[0];

        if (user) {
            const isPinMatch = await bcrypt.compare(pin, user.pin);
            if (isPinMatch) {
                if (user.balance >= amount) {
                    const balance = user.balance - amount;
                    await global.pool.query('UPDATE users SET balance = $1 WHERE cardnumber = $2', [balance, cardNumber]);
                    await global.pool.query('INSERT INTO transactions (username_sender, title, amount, username_receiver) VALUES ($1, $2, $3, $4);', [user.username, amount + ' PLN withrawn from ATM', -amount, 'ATM']);
                    res.status(200).json({ balance });
                } else {
                    res.status(400).json({ error: 'Insufficient funds' });
                }
            } else {
                res.status(400).json({ login_error: 'Check your login details and try again.' });
            }
        } else {
            res.status(404).json({ error: 'Card number incorrect' });
        }
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

Router.post('/atm-deposit', async (req, res) => {
    const { cardNumber, pin, amount } = req.body;

    try {
        const queryResult = await global.pool.query('SELECT * FROM users WHERE cardnumber = $1', [cardNumber]);
        const user = queryResult.rows[0];

        if (user) {
            const isPinMatch = await bcrypt.compare(pin, user.pin);
            if (isPinMatch) {
                const balance = (parseFloat(user.balance) + parseFloat(amount)).toString();
                await global.pool.query('UPDATE users SET balance = $1 WHERE cardnumber = $2', [balance, cardNumber]);
                await global.pool.query('INSERT INTO transactions (username_sender, title, amount, username_receiver) VALUES ($1, $2, $3, $4);', ['ATM', amount + ' PLN deposit in ATM', amount, user.username]);
                res.status(200).json({ balance });
            } else {
                res.status(400).json({ login_error: 'Check your login details and try again.' });
            }
        } else {
            res.status(404).json({ error: 'Card number incorrect' });
        }
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = Router;
