require('dotenv').config();

const path = require('path');

const express = require('express');

const PORT = process.env.PORT || 3000;

global.PROJECT_DIR = path.resolve(__dirname);
global.BASE_DIR = path.join(__dirname, '..');

const app = express();

// TODO: Technically a promise
require('./config/database')();
require('./config/express')(app);

app.listen(PORT, () => {
  console.log(`Jarret is running on http://localhost:${PORT}`);
});
