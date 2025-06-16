26:01.440Z - POST /webhook/stripe {
  ip: '::1',
  userAgent: 'Stripe/1.0 (+https://stripe.com/docs/webhooks)'
}
[INFO] 2025-06-16T16:26:01.442Z - Processando evento: charge.succeeded {
  subscriptionId: 'ch_3Rafr6QZgpVccQF85XB35yaz',
  customerId: 'cus_SVQzUa8HBQOC40'
}
[WARN] 2025-06-16T16:26:01.443Z - Evento não tratado: charge.succeeded {}
[INFO] 2025-06-16T16:26:01.443Z - Webhook processado com sucesso: { success: true, message: 'Evento ignorado' }
[INFO] 2025-06-16T16:26:01.564Z - POST /webhook/stripe {
  ip: '::1',
  userAgent: 'Stripe/1.0 (+https://stripe.com/docs/webhooks)'
}
[INFO] 2025-06-16T16:26:01.565Z - Processando evento: customer.subscription.created {
  subscriptionId: 'sub_1Rafr5QZgpVccQF8xigJexuv',
  customerId: 'cus_SVQzUa8HBQOC40'
}
[INFO] 2025-06-16T16:26:01.628Z - POST /webhook/stripe {
  ip: '::1',
  userAgent: 'Stripe/1.0 (+https://stripe.com/docs/webhooks)'
}
[INFO] 2025-06-16T16:26:01.629Z - Processando evento: payment_intent.succeeded {
  subscriptionId: 'pi_3Rafr6QZgpVccQF85iN4au3j',
  customerId: 'cus_SVQzUa8HBQOC40'
}
[WARN] 2025-06-16T16:26:01.630Z - Evento não tratado: payment_intent.succeeded {}
[INFO] 2025-06-16T16:26:01.630Z - Webhook processado com sucesso: { success: true, message: 'Evento ignorado' }
[INFO] 2025-06-16T16:26:01.656Z - POST /webhook/stripe {
  ip: '::1',
  userAgent: 'Stripe/1.0 (+https://stripe.com/docs/webhooks)'
}
[INFO] 2025-06-16T16:26:01.657Z - Processando evento: payment_intent.created {
  subscriptionId: 'pi_3Rafr6QZgpVccQF85iN4au3j',
  customerId: 'cus_SVQzUa8HBQOC40'
}
[WARN] 2025-06-16T16:26:01.657Z - Evento não tratado: payment_intent.created {}
[INFO] 2025-06-16T16:26:01.657Z - Webhook processado com sucesso: { success: true, message: 'Evento ignorado' }
[INFO] 2025-06-16T16:26:01.735Z - POST /webhook/stripe {
  ip: '::1',
  userAgent: 'Stripe/1.0 (+https://stripe.com/docs/webhooks)'
}
[INFO] 2025-06-16T16:26:01.735Z - Processando evento: invoice.created {
  subscriptionId: 'in_1Rafr5QZgpVccQF856qtwYWD',
  customerId: 'cus_SVQzUa8HBQOC40'
}
[WARN] 2025-06-16T16:26:01.736Z - Evento não tratado: invoice.created {}
[INFO] 2025-06-16T16:26:01.736Z - Webhook processado com sucesso: { success: true, message: 'Evento ignorado' }
[INFO] 2025-06-16T16:26:01.798Z - POST /webhook/stripe {
  ip: '::1',
  userAgent: 'Stripe/1.0 (+https://stripe.com/docs/webhooks)'
}
[INFO] 2025-06-16T16:26:01.798Z - Processando evento: invoice.finalized {
  subscriptionId: 'in_1Rafr5QZgpVccQF856qtwYWD',
  customerId: 'cus_SVQzUa8HBQOC40'
}
[WARN] 2025-06-16T16:26:01.799Z - Evento não tratado: invoice.finalized {}
[INFO] 2025-06-16T16:26:01.799Z - Webhook processado com sucesso: { success: true, message: 'Evento ignorado' }
[INFO] 2025-06-16T16:26:01.852Z - POST /webhook/stripe {
  ip: '::1',
  userAgent: 'Stripe/1.0 (+https://stripe.com/docs/webhooks)'
}
[INFO] 2025-06-16T16:26:01.853Z - Processando evento: invoice.paid {
  subscriptionId: 'in_1Rafr5QZgpVccQF856qtwYWD',
  customerId: 'cus_SVQzUa8HBQOC40'
}
[WARN] 2025-06-16T16:26:01.853Z - Evento não tratado: invoice.paid {}
[INFO] 2025-06-16T16:26:01.853Z - Webhook processado com sucesso: { success: true, message: 'Evento ignorado' }
[INFO] 2025-06-16T16:26:01.933Z - POST /webhook/stripe {
  ip: '::1',
  userAgent: 'Stripe/1.0 (+https://stripe.com/docs/webhooks)'
}
[INFO] 2025-06-16T16:26:01.933Z - Processando evento: invoice.payment_succeeded {
  subscriptionId: 'in_1Rafr5QZgpVccQF856qtwYWD',
  customerId: 'cus_SVQzUa8HBQOC40'
}
[WARN] 2025-06-16T16:26:01.934Z - Evento não tratado: invoice.payment_succeeded {}
[INFO] 2025-06-16T16:26:01.934Z - Webhook processado com sucesso: { success: true, message: 'Evento ignorado' }
[INFO] 2025-06-16T16:26:02.155Z - Dados iniciais do cliente Stripe: {
  id: 'cus_SVQzUa8HBQOC40',
  email: 'wellingtonhmt2011@gmail.com',
  name: 'wellington novo',
  phone: '+5513996918986'
}
[INFO] 2025-06-16T16:26:05.502Z - Email enviado para wellingtonhmt2011@gmail.com: { messageId: '<c68cf0b9-d4d5-7853-64de-8559ffbea262@gmail.com>' }
[INFO] 2025-06-16T16:26:05.502Z - Webhook processado com sucesso: {
  success: true,
  message: 'Usuário reativado com sucesso',
  action: 'user_reactivated'
}
[INFO] 2025-06-16T16:26:19.763Z - POST /webhook/stripe {
  ip: '::1',
  userAgent: 'Stripe/1.0 (+https://stripe.com/docs/webhooks)'
}
[INFO] 2025-06-16T16:26:19.763Z - Processando evento: invoice_payment.paid {
  subscriptionId: 'inpay_1Rafr6QZgpVccQF8nU6xWJvo',
  customerId: undefined
}
[WARN] 2025-06-16T16:26:19.764Z - Evento não tratado: invoice_payment.paid {}
[INFO] 2025-06-16T16:26:19.764Z - Webhook processado com sucesso: { success: true, message: 'Evento ignorado' }
