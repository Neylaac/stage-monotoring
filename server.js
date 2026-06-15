console.log("SERVER JS WORDT UITGEVOERD");
const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();


const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware om JSON en formulierdata te kunnen lezen
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false
    }
}));

// Static files zoals CSS en frontend JavaScript
app.use(express.static(path.join(__dirname, 'views')));

// Routes gebruiken
app.use('/', routes);

// Server starten
app.listen(PORT, () => {
    console.log(`Server draait op http://localhost:${PORT}`);
});