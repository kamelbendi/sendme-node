const winston = require('winston');
const express = require('express');
const authRoute = require('./routes/auth.js');
const userRoute = require('./routes/user.js');
const { createDatabase, deleteDatabase, createUsersTable } = require('./db/db.js');
const { setupTestData } = require('./db/setup.js');
const bcrypt = require('bcrypt');

const app = express();
process.env.JWT_SECRET = bcrypt.hash('maximumsecuritystring1234', 10);
winston.add(new winston.transports.File({ filename: 'logfile.log' }));

process.on('uncaughtException', (ex) => {
    winston.error(ex.message, ex);
    process.exit(1);
});

process.on('unhandledRejection', (ex) => {
    winston.error(ex.message, ex);
    process.exit(1);
});

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(authRoute);
app.use(userRoute);

const startApp = async () => {
    try {
        await createDatabase()
            .then(createUsersTable)
            .then(setupTestData)
            .catch((error) => {
                console.error('Error setting up the schema:', error);
            })

        const port = process.env.PORT || 3000;

        app.use("*", (req, res) => {
            res.json("Page not found.");
        });
 
        app.on('error', (err) => {
            console.error('Server error:', err);
        });

        app.listen(port, () => {
            console.log(`listening on port ${port}`);
            winston.info(`listening on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting the app:', error);
    }
};

startApp();

  // Optionally, we can delete the entire database 
process.on('SIGINT', async () => {
    console.log('Received SIGINT. Exiting gracefully...');
    await deleteDatabase();
    process.exit(0);
});
