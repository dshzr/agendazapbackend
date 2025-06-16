const { stripe } = require('../config/stripe');

class StripeService {
  
  async getCustomer(customerId) {
    return await stripe.customers.retrieve(customerId);
  }

  async getSubscription(subscriptionId) {
    return await stripe.subscriptions.retrieve(subscriptionId);
  }

  async cancelSubscription(subscriptionId) {
    return await stripe.subscriptions.cancel(subscriptionId);
  }

  async getPaymentMethod(paymentMethodId) {
    return await stripe.paymentMethods.retrieve(paymentMethodId);
  }
}

module.exports = new StripeService();