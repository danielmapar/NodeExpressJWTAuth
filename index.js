// Main starting point of the application
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser'); // parse requests to JSON
const morgan = require('morgan'); // log-in incoming requests framework
const app = express();
const router = require('./router');
const mongoose = require('mongoose');

// DB Setup
mongoose.Promise = require('q').Promise;
mongoose.connect('mongodb://localhost:auth/auth');

// App Setup - middleware
app.use(morgan('combined'));
app.use(bodyParser.json({ type: '*/*' }));
router(app);

// npm install --save nodemon
// nodemon check for changes on the api files and restarts
// automaticaly

// Server Setup
const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log('Server listening to port: ', port);
