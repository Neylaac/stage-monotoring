const express = require('express'); //Gebruik pakket/bestand express
const session = require('express-session'); //session wordt gebruikt om een gebruiker te onthouden. 
const path = require('path'); //path is een module in node.js, het helpt eigenlijk om correcte bestandspaden te doen 
require('dotenv').config();// hier ga je eigenlijk gewoon zeggen om het .enb bestand te lezen 


const routes = require('./routes'); // je laat je eigen bestand

const app = express(); //hier maak je de express applicatie in app
const PORT = process.env.PORT || 3000; //hier kies je je poortnummer, het haalt dus de port uit de env of gebruik 3000 als die poort niet bestaat

// Middleware is code die een verzoek passeert voordat het bij de uiteindelijke route komt.
app.use(express.json()); // gaat ervoor zorgen dat de JSON-gegevens van de browser leesbaar voor de server is
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({ // moet weten tot het einde welke student aangelogd is en wat haar rol is
    secret: process.env.SESSION_SECRET, //gebruikt geheime sleutel in de env om sessie te beschermen
    resave: false, //Niet opnieuw opslaan als niets veranderde.
    saveUninitialized: false, // Geen lege sessies bewaren.
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