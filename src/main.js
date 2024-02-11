'use strict';

require('dotenv').config();
const express = require('express');
var cors = require('cors');
const morgan = require('morgan');

// Initializations
const app = express();

// Settings
app.set('port', process.env.PORT || 3000);

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Headers
app.use(cors());

// Routes
app.use('/api/jobs', require('./routes/jobs.routes'));

// Starting the server
app.listen(app.get('port'), () => {
  console.clear();
  console.log('Server on port', app.get('port'));
});