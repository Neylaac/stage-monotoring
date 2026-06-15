const jwt = require('jsonwebtoken');
//token = eeen soort digitaal bewijs van login
require('dotenv').config(); //leest het env bestand

const requireAuth = (req, res, next) =>{ //ga naar het volgende onderdeel van de route
    const token = req.session.token; //token opgeslagen in de sessie

    if(!token){
        return res.status(401).json({ //als geen token stuur dan dat
            status: 'error',
            message: 'Niet ingelogd'
        });
    }

    try{
        const decodeUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        //jwt.verify controleert eigenlijk de functie 
        req.user = decodeUser; //gebruiker opslaan in req.user

        next();//naar het volgende

    }catch (error){
        return res.status(403).json({ //403: toegang verboden
            status: 'error', 
            message: 'Ongeldig sessie'
        });
    }
};

module.exports = requireAuth; 