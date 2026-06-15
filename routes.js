const express = require('express'); // we gaan eerst express importeren, je gebruikt dus express in dit bestand

const router = express.Router(); // hiermme maak je een router object
const path = require('path');// dit helpt om coorecte bestandspaden te maken.

const { loginGebruiker } = require('./controllers/authController');
const { registreerGebruiker } = require('./controllers/registerController');
const requireAuth = require('./middleware/requireAuth');
const { getStudentProfile } = require('./controllers/studentController');
const {maakStageaanvraag,getMijnStageaanvragen,getAlleStageaanvragen, getStageaanvraagOpId, updateStageaanvraagStatus} = require('./controllers/stageAanvraagController');

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


/* GET    = gegevens ophalen
POST   = nieuwe gegevens toevoegen
PATCH  = een deel van bestaande gegevens aanpassen
DELETE = gegevens verwijderen */

router.post('/login', loginGebruiker);
router.post('/register', registreerGebruiker);
router.get('/api/student/profile', requireAuth, getStudentProfile);
router.post('/api/stageaanvragen',requireAuth,maakStageaanvraag);
router.get('/api/stageaanvragen/mijn',requireAuth,getMijnStageaanvragen);
router.get('/api/stagecommissie/stageaanvragen', requireAuth, getAlleStageaanvragen);
router.get('/api/stageaanvragen/:id', requireAuth, getStageaanvraagOpId);
router.patch('/api/stageaanvragen/:id/status', requireAuth, updateStageaanvraagStatus);


//hiet gaan we de functies importeren uit de controllers


//-------------------------Token en role opslaan in session---------------------------

router.get('/set-token', (req, res) => { //Deze route wordt gebruikt na een succesvolle login.
    const {token, role} = req.query;  

    req.session.token = token;


    res.cookie('accessToken', token, {
        httpOnly: true
    });

    if (role === 'STUDENT') {
        return res.redirect(
            '/student/stageaanvraagoverzicht.html'
        );
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
    res.sendFile(path.join(__dirname, 'views', 'html', 'stagecommissiehome.html'));
});

router.get('/stagecommissie/stageaanvragen', (req, res)=>{
    res.sendFile(path.join(__dirname, 'views', 'html', 'stageaanvraagstagecommissie.html'));
});

router.get('/stagecommissie/stageaanvraagoverzichtstagecomissie.html', requireAuth, (req, res)=> {
    res.sendFile(path.join(__dirname, 'views', 'html', 'stageaanvraagoverzichtstagecomissie.html'));
});

router.get('/stagecommissie/stageaanvraaggoedgekeurdstagecommissie.html',requireAuth, (req, res) => {
        res.sendFile(path.join(__dirname,'views','html','stageaanvraaggoedgekeurdstagecommissie.html'));
    });

router.get('/stagecommissie/stageaanvraagafgekeurdstagecommissie.html',requireAuth,(req, res) => {
        res.sendFile(path.join(__dirname,'views','html','stageaanvraagafgekeurdstagecommissie.html'));
    });

router.get('/stagecommissie/stageaanvraagaangepaststagecommissie.html',requireAuth,(req, res) => {
        res.sendFile(path.join(__dirname,'views','html','stageaanvraagaangepaststagecommissie.html'));
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