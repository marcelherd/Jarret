const path = require('path');

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');

const repositoryRoutes = require('../routes/repository');

module.exports = function (app) {
  // Built-in middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Third-party middleware
  app.use(morgan());
  app.use(helmet());

  // Routes
  app.use('/api/v1/repository', repositoryRoutes);
};
