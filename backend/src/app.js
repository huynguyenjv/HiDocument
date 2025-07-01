const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api', routes);

// Error handling
app.use(require('./middlewares/error.middleware'));

module.exports = app;
