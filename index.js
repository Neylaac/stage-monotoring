const path = require('path');
const express = require('express');
const app = express();

const port = 3000;

app.use(express.static(path.join(__dirname, "views")));

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views/html/stageovereenkomst-overzicht.html")
    );
});


app.get("/stageovereenkomst-detail", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views/html/stageovereenkomst-detail.html")
    );
});

app.get("/itsme", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views/html/itsme.html")
    );
});

app.listen(port, () => {
    console.log(`App Listing on Port ${port}`);
});
app.get("/stageovereenkomst-detail", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views/html/stageovereenkomst-detail.html")
    );
});