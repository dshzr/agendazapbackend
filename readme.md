# Comandos Essenciais - Quick Reference

## 🚀 **RODAR SERVIDOR**
```bash
npm run dev
```

## 👂 **STRIPE LISTEN**
```bash
stripe listen --forward-to localhost:3000/webhook/stripe
```
**→ Copiar o `whsec_...` para .env**

## 🧪 **TESTAR WEBHOOKS**
```bash
# Nova assinatura
Para criar subscription com cliente específico:
  stripe subscriptions create \
    --customer=cus_SVf1vGOoQIxu6M \
    --items[0][price]=price_1RZwkAQZgpVccQF8AGT1tiK3

  Para criar subscription com plano profissional:
  stripe subscriptions create \
    --customer=cus_SVf1vGOoQIxu6M \
    --items[0][price]=price_1RZwkZQZgpVccQF8UK7COqL3

  Para cancelar uma subscription (se precisar testar cancelamento):
  stripe subscriptions cancel sub_SUBSCRIPTION_ID

  Para ver dados do cliente:
  stripe customers retrieve cus_SVf1vGOoQIxu6M
```

## 🔍 **VER LOGS**
```bash
stripe logs tail
```

## ✅ **TESTAR SE FUNCIONA**
```bash
curl http://localhost:3000
```

---

## ⚡ **WORKFLOW RÁPIDO**
1. `npm run dev`
2. `stripe listen --forward-to localhost:3000/webhook/stripe`
3. Copiar webhook secret → .env
4. Reiniciar servidor
5. `stripe trigger customer.subscription.created`

**Pronto! 🎉**