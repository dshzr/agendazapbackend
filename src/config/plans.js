const PLANS = {
  development: {
    essencial:
      process.env.STRIPE_PRICE_ID_ESSENCIAL_DEV ||
      'price_1RagABHC7bWP9xDtvcLu5rYL',
    profissional:
      process.env.STRIPE_PRICE_ID_PROFISSIONAL_DEV ||
      'price_1Rag9xHC7bWP9xDtplExGNxS',
  },
  production: {
    essencial: process.env.STRIPE_PRICE_ID_ESSENCIAL_PROD,
    profissional: process.env.STRIPE_PRICE_ID_PROFISSIONAL_PROD,
  },
};

function getPriceIds() {
  const environment =
    process.env.NODE_ENV === 'production' ? 'production' : 'development';
  return PLANS[environment];
}

module.exports = {
  getPriceIds,
};
