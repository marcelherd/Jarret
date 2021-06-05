const path = require('path');

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');

const repositoryRoutes = require('../routes/repository');
const frontendRoutes = require('../routes/frontend');

module.exports = function (app) {
  // Frontend configuration
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('view engine', 'pug');

  // Application variables
  app.locals.version = process.env.npm_package_version;

  // Built-in middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Third-party middleware
  app.use(morgan());

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          scriptSrc: ["'self'", 'cdn.jsdelivr.net'],
        },
      },
    }),
  );

  // Routes
  app.use('/api/v1/repository', repositoryRoutes);
  app.use('/', frontendRoutes);
};
