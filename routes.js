const express = require('express'); // we gaan eerst express importeren, je gebruikt dus express in dit bestand

const router = express.Router(); // hiermme maak je een router object
const path = require('path');// dit helpt om coorecte bestandspaden te maken.

const { loginGebruiker } = require('./controllers/authController');
const { registreerGebruiker } = require('./controllers/registerController');
const requireAuth = require('./middleware/requireAuth');
const { getStudentProfile } = require('./controllers/studentController');
const {maakStageaanvraag,getMijnStageaanvragen,getAlleStageaanvragen, getStageaanvraagOpId} = require('./controllers/stageAanvraagController');

// get gebruik je om een pagina op te vragen

router.get('/', (req, res) => { //loginpagina
    res.sendFile(path.join(__dirname, 'views', 'html', 'login.html'));
    //met path.join maakt node.js direct een automatische correct pad
    // als iemand naar de homepage gaat toon de login.html


});

router.get('/login', (req, res) => { //expliciete loginpagina
    res.sendFile(path.join(__dirname, 'views', 'html', 'login.html'));

});

//sendFile = stuur een HTML-bestand terug naar de browser.
//__dirname = de map waarin dit bestand staat


//---------------------login en registratie en API----------------------------------

router.post('/login', loginGebruiker);
router.post('/register', registreerGebruiker);
router.get('/api/student/profile', requireAuth, getStudentProfile);
router.post('/api/stageaanvragen',requireAuth,maakStageaanvraag);
router.get('/api/stageaanvragen/mijn',requireAuth,getMijnStageaanvragen);
router.get('/api/stagecommissie/stageaanvragen', requireAuth, getAlleStageaanvragen);
router.get('/api/stageaanvragen/:id', requireAuth, getStageaanvraagOpId);


//hiet gaan we de functies importeren uit de controllers


//-------------------------Token en role opslaan in session---------------------------

router.get('/set-token', (req, res) => { //Deze route wordt gebruikt na een succesvolle login.
    const token = req.query.token; //Haal gegevens uit de URL na het vraagteken.
    const role = req.query.role;


    if (!token || !role) {
        return res.redirect('/login');
    } /* Als token ontbreekt OF role ontbreekt,
stuur de gebruiker terug naar login.*/


    req.session.token = token;
    req.session.role = role; /* Hier sla je de token en role op in de sessie. Een session is tijdelijke informatie die de server onthoudt voor deze gebruiker.*/


    if (role === 'STUDENT') {
        return res.redirect('/student/stageaanvraag');
    }

    if (role === 'DOCENT') {
        return res.redirect('/docent/home');
    }

    if (role === 'BEDRIJF') {
        return res.redirect('/bedrijf/home');
    }

    if (role === 'ADMIN') {
        return res.redirect('/admin/home');
    }

    if (role === 'STAGECOMMISSIE') {
        return res.redirect('/stagecommissie/home');
    }

    return res.redirect('/login'); // Als de role niet herkend wordt, stuur je terug naar login.
})


// ---------------------------------Voorlopige test-homeroutes---------------------------

router.get('/student/stageaanvraag', (req, res)=>{
     res.sendFile(path.join(__dirname, 'views', 'html', 'stageaanvraag.html'));
});

router.get('/student/stageaanvraagformulier.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'stageaanvraagformulier.html'));
});

router.get('/student/stageaanvraagoverzicht.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'stageaanvraagoverzicht.html'));
});

router.get('/docent/home', (req, res)=>{
    res.send('Welkom docent');
});

router.get('/bedrijf/home', (req, res)=>{
    res.send('Welkom mentor');
});

router.get('/stagecommissie/home', (req, res)=>{
    res.send('Welkom stagecommissiee');
});

router.get('/admin/home', (req, res)=>{
    res.send('Welkom admin');
});


router.get('/logout', (req,res)=>{ // Deze route wordt gebruikt om uit te loggen.
    req.session.destroy((err)=>{ //Verwijder de session van deze gebruiker.
        if(err){ //Als de sessie niet verwijderd kan worden, stuur je een serverfout terug.
            return res.status(500).json({
                status: 'error',
                message: 'Failed to end session'
            });
        }

        res.clearCookie('connect.sid');
        res.redirect('/login')
    });
});

module.exports = router;  // Andere bestanden mogen deze router gebruiken.