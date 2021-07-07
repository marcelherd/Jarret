const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const repositoryRoutes = require('../routes/repository');

module.exports = function (app) {
  // Built-in middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Third-party middleware
  app.use(morgan());
  app.use(cors());

  // Routes
  app.use('/api/v1/repository', repositoryRoutes);

  // Use vue dist directory
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(global.BASE_DIR, '/app/dist')));
    app.get('/', (req, res) => res.sendFile(path.join(global.BASE_DIR, '/app/dist/index.html')));
  }
};
