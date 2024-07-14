const express = require('express');
const rootRouter = express.Router();
const path = require('path');

rootRouter.get('^/$|/index(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

rootRouter.get('/new-page(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '..','views', 'new-page.html'));
});

rootRouter.get('/old-page(.html)?', (req, res) => {
    res.redirect(301, '/new-page.html'); //302 by default
});

module.exports = rootRouter;