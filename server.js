const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const webhookRoutes = require('./src/routes/webhookRoutes');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet());
app.use(cors());

// Middleware especial para webhook do Stripe (raw body)
app.use('/webhook/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Rotas
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    service: 'Stripe Webhook API',
    timestamp: new Date().toISOString()
  });
});

app.use('/webhook', webhookRoutes);

// Middleware de erro
app.use(errorHandler);

// 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

app.listen(PORT, () => {
  logger.info(`🚀 Servidor iniciado na porta ${PORT}`);
});

module.exports = app;