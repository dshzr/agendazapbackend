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

## 🔧 **CONFIGURAÇÃO DE AMBIENTE**

### Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
# Ambiente
NODE_ENV=development # ou production

# Stripe Price IDs - Desenvolvimento
STRIPE_PRICE_ID_ESSENCIAL_DEV=price_1RagABHC7bWP9xDtvcLu5rYL
STRIPE_PRICE_ID_PROFISSIONAL_DEV=price_1Rag9xHC7bWP9xDtplExGNxS

# Stripe Price IDs - Produção
STRIPE_PRICE_ID_ESSENCIAL_PROD=price_live_...
STRIPE_PRICE_ID_PROFISSIONAL_PROD=price_live_...
```

## 🧪 **TESTAR WEBHOOKS**

```bash
# Nova assinatura
Para criar subscription com cliente específico:
  stripe subscriptions create \
    --customer=cus_SVf1vGOoQIxu6M \
    --items[0][price]=$STRIPE_PRICE_ID_ESSENCIAL_DEV

  Para criar subscription com plano profissional:
  stripe subscriptions create \
    --customer=cus_SVf1vGOoQIxu6M \
    --items[0][price]=$STRIPE_PRICE_ID_PROFISSIONAL_DEV

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
4. Configurar price IDs no .env
5. Reiniciar servidor
6. `stripe trigger customer.subscription.created`

**Pronto! 🎉**
