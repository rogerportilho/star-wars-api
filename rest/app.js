const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const restRoutes = require('./index');

function createRestApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // Permite x-www-form-urlencoded
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/api', restRoutes);
  return app;
}

module.exports = createRestApp;
