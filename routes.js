const express = require('express'); // we gaan eerst express importeren, je gebruikt dus express in dit bestand
const router = express.Router(); // hiermme maak je een router object
const path = require('path');// dit helpt om coorecte bestandspaden te maken.
const connection = require('./config/db_connection');//importeert de databaseverbinding

const { loginGebruiker } = require('./controllers/authController');// haalt de functie logingebruiker uit authcontroller.js
const { registreerGebruiker } = require('./controllers/registerController');
const requireAuth = require('./middleware/requireAuth'); //importeert je middleware die controleert of iemand ingelogd is, requireAuth controleert de login.

const { getStudentProfile } = require('./controllers/studentController');
const {
    maakStageaanvraag,
    getMijnStageaanvragen,
    getAlleStageaanvragen,
    getStageaanvraagOpId,
    updateStageaanvraag,
    updateStageaanvraagStatus
} = require('./controllers/stageAanvraagController');

const {
    getAlleStageovereenkomsten,
    getStageovereenkomstOpId
} = require('./controllers/stageOvereenkomstController');

// get gebruik je om een pagina op te vragen

// -------------------------- ALGEMEEN --------------------------

router.get('/', (req, res) => { //loginpagina
    res.sendFile(path.join(__dirname, 'views', 'html', 'login.html'));
    //met path.join maakt node.js direct een automatische correct pad

});

router.get('/login', (req, res) => { //expliciete loginpagina
    res.sendFile(path.join(__dirname, 'views', 'html', 'login.html'));

});

router.post('/login', loginGebruiker);
router.post('/register', registreerGebruiker);

//sendFile = stuur een HTML-bestand terug naar de browser.
//__dirname = de map waarin dit bestand staat

//-------------------------SESSIE---------------------------

router.get('/set-token', (req, res) => { //Deze route wordt gebruikt na een succesvolle login.
    const { token, role } = req.query;

    req.session.token = token;


    res.cookie('accessToken', token, {
        httpOnly: true
    });

    if (role === 'STUDENT') {
        return res.redirect('/student/start');
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
});

router.get('/logout', (req, res) => { // Deze route wordt gebruikt om uit te loggen.
    req.session.destroy((err) => { //Verwijder de session van deze gebruiker.
        if (err) { //Als de sessie niet verwijderd kan worden, stuur je een serverfout terug.
            return res.status(500).json({
                status: 'error',
                message: 'Failed to end session'
            });
        }

        res.clearCookie('connect.sid');
        res.redirect('/login')
    });
});

//---------------------STUDENT API----------------------------------


/* GET    = gegevens ophalen
POST   = nieuwe gegevens toevoegen
PATCH  = een deel van bestaande gegevens aanpassen
DELETE = gegevens verwijderen */


router.get('/api/student/profile', requireAuth, getStudentProfile);
router.get('/api/student/stageovereenkomst', requireAuth, (req, res) => {
    const studentId = req.user.id;

    const query = `
        SELECT
            users.voornaam,
            users.achternaam,
            student_profiles.opleiding,
            stageaanvragen.bedrijfsnaam,
            stageaanvragen.startdatum,
            stageaanvragen.einddatum,
            stageaanvragen.opdracht,
            stageaanvragen.omschrijving,
            stageovereenkomsten.student_ondertekend,
            stageovereenkomsten.bedrijf_ondertekend,
            stageovereenkomsten.school_ondertekend,
            stageovereenkomsten.student_handtekening
        FROM stageaanvragen

        JOIN users
            ON users.id = stageaanvragen.student_id

        JOIN student_profiles
            ON student_profiles.user_id = users.id

        LEFT JOIN stageovereenkomsten
            ON stageovereenkomsten.stageaanvraag_id = stageaanvragen.id

        WHERE stageaanvragen.student_id = ?
        AND stageaanvragen.status = 'GOEDGEKEURD'

        ORDER BY stageaanvragen.created_at DESC
        LIMIT 1
    `;

    connection.query(query, [studentId], (error, results) => {
        if (error) {
            console.error('Fout bij ophalen stageovereenkomst:', error);

            return res.status(500).json({
                status: 'error',
                message: 'Stageovereenkomst kon niet worden opgehaald'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Geen goedgekeurde stageaanvraag gevonden'
            });
        }

        res.json({
            status: 'success',
            stageovereenkomst: results[0]
        });
    });
});

router.patch('/api/student/stageovereenkomst/ondertekenen', requireAuth, (req, res) => {
    const studentId = req.user.id;
    const handtekening = req.body.handtekening;

    if (!handtekening) {
        return res.status(400).json({
            status: 'error',
            message: 'Plaats eerst je handtekening'
        });
    }

    const queryStageaanvraag = `
        SELECT id
        FROM stageaanvragen
        WHERE student_id = ?
        AND status = 'GOEDGEKEURD'
        ORDER BY created_at DESC
        LIMIT 1
    `;

    connection.query(queryStageaanvraag, [studentId], (error, results) => {
        if (error) {
            console.error('Fout bij ophalen stageaanvraag:', error);

            return res.status(500).json({
                status: 'error',
                message: 'Stageaanvraag kon niet worden opgehaald'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Geen goedgekeurde stageaanvraag gevonden'
            });
        }


        const queryOvereenkomst = `
            INSERT INTO stageovereenkomsten (
                stageaanvraag_id,
                student_ondertekend,
                student_handtekening,
                student_ondertekend_op
            )
            VALUES (?, 1, ?, NOW())

            ON DUPLICATE KEY UPDATE
                student_ondertekend = 1,
                student_handtekening = ?,
                student_ondertekend_op = NOW()
        `;

        connection.query(
            queryOvereenkomst,
            [results[0].id, handtekening, handtekening],
            (error) => {
                if (error) {
                    console.error('Fout bij opslaan handtekening:', error);

                    return res.status(500).json({
                        status: 'error',
                        message: 'Handtekening kon niet worden opgeslagen'
                    });
                }

                res.json({
                    status: 'success',
                    message: 'Stageovereenkomst ondertekend'
                });
            }
        );
    });
});

// -------------------------- STAGEAANVRAGEN API --------------------------
router.post('/api/stageaanvragen', requireAuth, maakStageaanvraag);
router.get('/api/stageaanvragen/mijn', requireAuth, getMijnStageaanvragen);
router.get('/api/stagecommissie/stageaanvragen', requireAuth, getAlleStageaanvragen);
router.get('/api/stageaanvragen/:id', requireAuth, getStageaanvraagOpId);
router.patch('/api/stageaanvragen/:id', requireAuth, updateStageaanvraag);
router.patch('/api/stageaanvragen/:id/status', requireAuth, updateStageaanvraagStatus);


//hiet gaan we de functies importeren uit de controllers


// -------------------------- STAGEOVEREENKOMSTEN API --------------------------

router.get('/api/stageovereenkomsten', requireAuth, getAlleStageovereenkomsten);

router.get('/api/stageovereenkomsten/:id', requireAuth, getStageovereenkomstOpId);

// -------------------------- STUDENT START --------------------------

router.get('/student/start', requireAuth, (req, res) => {
    const studentId = req.user.id;

    const query = `
            SELECT
                stageaanvragen.id,
                stageaanvragen.status,
                stageovereenkomsten.student_ondertekend

            FROM stageaanvragen

            LEFT JOIN stageovereenkomsten
                ON stageovereenkomsten.stageaanvraag_id =
                   stageaanvragen.id

            WHERE stageaanvragen.student_id = ?

            ORDER BY stageaanvragen.created_at DESC
            LIMIT 1
        `;

    connection.query(query, [studentId], (error, results) => {
        if (error) {
            console.error('Fout bij controleren studentstatus:', error);
            return res.redirect('/student/stageaanvraag');
        }

        if (results.length === 0) {
            return res.redirect('/student/stageaanvraag');
        }

        const aanvraag = results[0];

        if (
            aanvraag.status === 'GOEDGEKEURD' &&
            aanvraag.student_ondertekend === 1
        ) {
            return res.redirect('/student/stageovereenkomsten');
        }

        res.redirect('/student/stageaanvraagoverzicht.html');
    });
});


// -------------------------- BEDRIJF API --------------------------

router.get('/api/bedrijf/stagiairs', requireAuth, (req, res) => {
    const email = req.user.email;

    const query =  `
        SELECT
            stageaanvragen.id,
            users.voornaam,
            users.achternaam,
            student_profiles.opleiding,
            stageaanvragen.startdatum,
            stageaanvragen.einddatum
        FROM stageaanvragen
        JOIN users
            ON users.id = stageaanvragen.student_id
        JOIN student_profiles
            ON student_profiles.user_id = users.id
        JOIN stageovereenkomsten
            ON stageovereenkomsten.stageaanvraag_id = stageaanvragen.id
        WHERE stageaanvragen.email_bedrijf = ?
        AND stageaanvragen.status = 'GOEDGEKEURD'
        AND stageovereenkomsten.student_ondertekend = 1
        ORDER BY users.voornaam
    `;

    connection.query(query, [email], (error, results) => {
        if(error){
            console.error(error);

            return res.status(500).json({
                status: 'error',
                message: 'stagiairs konden niet worden opgehaald'
            });
        }

        res.json({
            status: 'success',
            stagiairs: results
        })
    })

});
// -------------------------- STUDENT PAGINA'S --------------------------

router.get('/student/stageaanvraag', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'stageaanvraag.html'));
});

router.get('/student/stageaanvraagformulier.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'stageaanvraagformulier.html'));
});

router.get('/student/stageaanvraagoverzicht.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'stageaanvraagoverzicht.html'));
});

router.get('/student/home', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'studenthome.html'));
});

router.get('/student/stageovereenkomsten', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'student-stageovereenkomst-overzicht.html'));
});

router.get("/student-stageovereenkomst-detail", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "html", "student-stageovereenkomst-detail.html"));
});


// -------------------------- DOCENT PAGINA'S --------------------------


router.get('/docent/stageovereenkomsten', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'docent-stageovereenkomst-overzicht.html'));
});

router.get('/stageovereenkomst-detail', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'docent-stageovereenkomst-detail.html'));
});


// -------------------------- BEDRIJF PAGINA'S --------------------------

router.get('/bedrijf/home', requireAuth, (req, res) => {
    res.redirect('/bedrijf-stageovereenkomst-overzicht');
});

router.get('/bedrijf-stageovereenkomst-overzicht', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'bedrijf-stageovereenkomst-overzicht.html'));
});


router.get('/bedrijf-student-overzicht', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'bedrijf-student-overzicht.html'));
});


router.get('/bedrijf-stageovereenkomst-detail', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'bedrijf-stageovereenkomst-detail.html'));
});



// -------------------------- STAGECOMMISSIE PAGINA'S --------------------------

router.get('/stagecommissie/home', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'stagecommissiehome.html'));
});

router.get('/stagecommissie/stageaanvragen', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'stageaanvraagstagecommissie.html'));
});

router.get('/stagecommissie/stageaanvraagoverzichtstagecomissie.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'stageaanvraagoverzichtstagecomissie.html'));
});

router.get('/stagecommissie/stageaanvraaggoedgekeurdstagecommissie.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'stageaanvraaggoedgekeurdstagecommissie.html'));
});

router.get('/stagecommissie/stageaanvraagafgekeurdstagecommissie.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'stageaanvraagafgekeurdstagecommissie.html'));
});

router.get('/stagecommissie/stageaanvraagaangepaststagecommissie.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'stageaanvraagaangepaststagecommissie.html'));
});

router.get('/stagecommissie-stageovereenkomst-overzicht', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'stagecommissie-stageovereenkomst-overzicht.html'));
});

router.get('/stagecommissie-stageovereenkomst-detail', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'stagecommissie-stageovereenkomst-detail.html'));
});

// -------------------------- ADMIN --------------------------

router.get('/admin/home', requireAuth, (req, res) => {
    res.send('Welkom admin');
});


module.exports = router;