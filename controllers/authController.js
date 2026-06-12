const connection = require ('../config/db_connection'); //gebruik de databaseverbinding uit db_connection.ks
const bcrypt = require('bcrypt'); //gehashed wachtwoord.
const jwt = require('jsonwebtoken');// wordt gebruikt om access token te maken.(token soort digitaal bewijs)
require('dotenv').config();// daarmee lezen we de .env --> moet want je token secret zit in de .env 

const loginGebruiker = async (req,res) =>{ // maken een functie met de naam logingebruiker. req: wat de frotend naar de backend stuurt/ res: is wat de backend terugstuurt naar de frontend
    try{ // alles wat kan fout gaan zetten we in de try
        const {email,wachtwoord} = req.body; // dat heet destructuring: haal email en wachtwoord uit req.body
        const query = 'SELECT * FROM users WHERE email = ?'; // zoek in de tabel users naar een gebruiker met dit emailadres --> ? is een placeholder later vullen we die met een echte mail.
        const [rows] = await connection.promise().query(query,[email]); //query uitvoeren
//connection: databaseverbinding
//.query(query, [email]): //// als de gebruiker bestaat, zit die in rows; omdat email uniek is, nemen we de eerste rij
// [rows] --> rows zijn de echte resultaten

        if(rows.length === 0){ //controleren of gebruikers bestaat.
            return res.status(401).json({ //401 je mag niet inloggen want je gegevens zijn fout.
                status: 'error',
                message: 'Fout e-mailadres of wachtwoord'
            });// als geen gebruiker sturen we dit
        }

        const user = rows[0]; //als gebruiker bestaal, zit huj in rows

        const isPasswordValid = await bcrypt.compare(wachtwoord, user.wachtwoord); 
        //(wachtwoord, user.wachtwoord) --> wachtwoord is wat de gebruiker net heeft getypt, user.wachtwoord is wat in de databse staat
// bcrypt.compare --> komt het gewone wachtwoord overeen met deze hash.
       

    if(!isPasswordValid){ // als de wachtwoord niet GELDIG is
            return res.status(401).json({
                status: 'error',
                message: 'Fout e-mailadres of wachtwoord'
            }); //sturen we deze error
        }

        const role = user.role; //rol ophalen

        //JWT token bestaat uit informatie over de gebruiker.
       
        const accessToken = jwt.sign(
            {// inhoud van de token
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.ACCESS_TOKEN_SECRET, //geheime sleutel uit .env
            {expiresIn: '10h'} // de token is 10u geldig, na 10h moet de gebruiker opnieuw inloggen
        );

        res.json({ // als alles goed is, stuurt de backend dit terug naar de frontend.
            status: 'success',
            accessToken,
            role
        });
    }catch(error) { // als er een ergens in de try een fout gebeurt dan voeren we de catch uit.
        console.error('Error in loginGebruiker:', error); // toon je fout in de terminal. 

        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

module.exports = {loginGebruiker};// andere bestandern mogen loginGebruiker gebruiken.