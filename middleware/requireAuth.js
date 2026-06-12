const jwt = require('jsonwebtoken');

require('dotenv').config();

const requireAuth = (req, res, next) =>{
    const token = req.session.token;

    if(!token){
        return res.status(401).json({
            status: 'error',
            message: 'Niet ingelogd'
        });
    }

    try{
        const decodeUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.user = decodeUser;

        next();

    }catch (error){
        return res.status(403).json({
            status: 'error', 
            message: 'Ongeldig sessie'
        });
    }
};

module.exports = requireAuth; 