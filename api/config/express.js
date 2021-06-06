const express = require('express');
const morgan = require('morgan');

const repositoryRoutes = require('../routes/repository');

module.exports = function (app) {
  // Built-in middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Third-party middleware
  app.use(morgan());
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
  });

  // Routes
  app.use('/api/v1/repository', repositoryRoutes);
};
