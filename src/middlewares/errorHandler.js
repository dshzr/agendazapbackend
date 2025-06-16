const logger = require('../utils/logger');

const errorHandler = (error, req, res, next) => {
  logger.error('Erro não tratado:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
};

module.exports = errorHandler;