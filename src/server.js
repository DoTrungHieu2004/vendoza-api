const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const chalk = require('chalk');
require('dotenv').config();

const routes = require('./routes/index.route');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
  logger.info(chalk.green.bold(`🚀 Server started on port ${PORT}`));
  logger.http(chalk.magenta.bold(`🌐 http://localhost:${PORT}`));
});
