const path = require('path');
const express = require('express');
const app = express();

const port = 3000;

app.use(express.static(path.join(__dirname, "views")));

/* Docent */

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "views/html/docent-stageovereenkomst-overzicht.html"
        )
    );
});

app.get("/stageovereenkomst-detail", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "views/html/docent-stageovereenkomst-detail.html"
        )
    );
});

/* Student */

app.get("/student-stageovereenkomst-detail", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "views/html/student-stageovereenkomst-detail.html"
        )
    );
});

/* Itsme */

app.get("/itsme", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "views/html/itsme.html"
        )
    );
});

/* Bedrijf */

app.get("/bedrijf-stageovereenkomst-overzicht", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "views/html/bedrijf-stageovereenkomst-overzicht.html"
        )
    );
});

app.get("/bedrijf-student-overzicht", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "views/html/bedrijf-student-overzicht.html"
        )
    );
});

app.get("/bedrijf-stageovereenkomst-detail", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "views/html/bedrijf-stageovereenkomst-detail.html"
        )
    );
});

app.get("/bedrijf-stageovereenkomst-detail", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "views/html/bedrijf-stageovereenkomst-detail.html"
        )
    );
});

app.listen(port, () => {
    console.log(`App Listening on Port ${port}`);
});