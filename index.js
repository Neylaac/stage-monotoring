const express = require('express');
const path = require('path');
const app = express();

const router = require('./routes');

app.use(express.static(path.join(__dirname, "views")));
app.use('/', router);

const port = 3000;

app.listen(port, () => {
    console.log(`App Listening on Port ${port}`);
});