require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions')
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJwt = require('./middleware/verifyJwt');
const PORT = process.env.PORT || 3500;
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const connectDb = require('./config/dbConn');

// connect to mongodb
    connectDb();


// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded data
// in other words, form data:  
// ‘content-type: application/x-www-form-urlencoded’
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
app.use('/',express.static(path.join(__dirname, '/public')));
app.use('/subdir',express.static(path.join(__dirname, '/public')));

//routes
app.use('/subdir', require('./routes/subdir'));
app.use('/',require('./routes/root'));
app.use('/register',require('./routes/api/register'));
app.use('/auth',require('./routes/api/auth'));
app.use('/refresh',require('./routes/api/refresh'));
app.use('/logout',require('./routes/api/logout'));


app.use(verifyJwt)
app.use('/employees',require('./routes/api/employee'));





// Route handlers
app.get('/hello(.html)?', (req, res, next) => {
    console.log('attempted to load hello.html');
    next()
}, (req, res) => {
    res.send('Hello World!');
});


// chaining route handlers
const one = (req, res, next) => {
    console.log('one');
    next();
}

const two = (req, res, next) => {
    console.log('two');
    next();
}

const three = (req, res) => {
    console.log('three');
    res.send('Finished!');
}

app.get('/chain(.html)?', [one, two, three]);

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to Mongodb');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
