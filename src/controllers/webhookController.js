const crypto = require('crypto');
const { stripe, webhookSecret } = require('../config/stripe');
const subscriptionService = require('../services/subscriptionService');
const logger = require('../utils/logger');

class WebhookController {
  
  async handleStripeWebhook(req, res) {
    const signature = req.headers['stripe-signature'];
    const body = req.body;

    let event;

    try {
      // Verificar assinatura do webhook
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      logger.error('Erro na verificação da assinatura do webhook:', error);
      return res.status(400).json({ error: 'Assinatura inválida' });
    }

    try {
      // Processar evento
      const result = await subscriptionService.processWebhookEvent(event);
      
      logger.info('Webhook processado com sucesso:', result);
      res.json({ success: true, ...result });
      
    } catch (error) {
      logger.error('Erro ao processar webhook:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: error.message 
      });
    }
  }
}

module.exports = new WebhookController();