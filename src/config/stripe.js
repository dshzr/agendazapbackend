const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = {
  stripe,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
};