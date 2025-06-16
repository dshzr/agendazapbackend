const userService = require('./userService');
const emailService = require('./emailService');
const stripeService = require('./stripeService');
const logger = require('../utils/logger');

class SubscriptionService {
  /**
   * Processa eventos de webhook do Stripe
   * Lógica única e otimizada baseada no tipo de evento
   */
  async processWebhookEvent(event) {
    const { type, data } = event;

    logger.info(`Processando evento: ${type}`, {
      subscriptionId: data.object.id,
      customerId: data.object.customer,
    });

    try {
      switch (type) {
        case 'customer.subscription.created':
          return await this.handleSubscriptionCreated(data.object);

        case 'customer.subscription.deleted':
          return await this.handleSubscriptionCanceled(data.object);

        case 'invoice.payment_succeeded':
          return await this.handleInvoicePaymentSucceeded(data.object);

        case 'invoice.payment_failed':
          return await this.handleInvoicePaymentFailed(data.object);

        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(data.object);

        case 'customer.subscription.trial_will_end':
          return await this.handleTrialWillEnd(data.object);

        default:
          // Eventos que podemos ignorar com segurança
          const safeToIgnore = [
            'charge.succeeded',
            'payment_intent.succeeded',
            'payment_intent.created',
            'invoice.created',
            'invoice.finalized',
            'invoice.paid',
            'invoice_payment.paid',
          ];

          if (safeToIgnore.includes(type)) {
            logger.info(`Evento ignorado com segurança: ${type}`);
          } else {
            logger.warn(`Evento não tratado: ${type}`);
          }

          return { success: true, message: 'Evento ignorado' };
      }
    } catch (error) {
      logger.error(`Erro ao processar evento ${type}:`, error);
      throw error;
    }
  }

  /**
   * NOVA ASSINATURA - Lógica otimizada em um único fluxo
   */
  async handleSubscriptionCreated(subscription) {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;

    // 1. Buscar dados do cliente no Stripe com múltiplas fontes
    const stripeCustomer = await stripeService.getCustomer(customerId);

    logger.info('Dados iniciais do cliente Stripe:', {
      id: stripeCustomer.id,
      email: stripeCustomer.email,
      name: stripeCustomer.name,
      phone: stripeCustomer.phone,
    });

    // 2. Se não tiver email, buscar na subscription e payment methods
    let customerEmail = stripeCustomer.email;
    let customerName = stripeCustomer.name;
    let customerPhone = stripeCustomer.phone;

    if (!customerEmail) {
      logger.info(
        'Email não encontrado no customer, buscando na subscription...',
      );

      // Buscar email no payment method da subscription
      try {
        const fullSubscription = await stripeService.getSubscription(
          subscriptionId,
        );
        const paymentMethodId = fullSubscription.default_payment_method;

        if (paymentMethodId) {
          const paymentMethod = await stripeService.getPaymentMethod(
            paymentMethodId,
          );
          if (paymentMethod.billing_details) {
            customerEmail =
              customerEmail || paymentMethod.billing_details.email;
            customerName = customerName || paymentMethod.billing_details.name;
            customerPhone =
              customerPhone || paymentMethod.billing_details.phone;

            logger.info('Dados encontrados no payment method:', {
              email: customerEmail,
              name: customerName,
              phone: customerPhone,
            });
          }
        }
      } catch (error) {
        logger.warn('Erro ao buscar payment method:', error.message);
      }
    }

    // 3. Validar se conseguimos encontrar pelo menos um email
    if (!customerEmail) {
      throw new Error(
        'Não foi possível encontrar email do cliente nem no Customer nem no Payment Method',
      );
    }

    // 4. Aplicar fallbacks para campos obrigatórios
    customerName = customerName || customerEmail.split('@')[0];
    customerPhone = customerPhone || null;

    // 3. Verificar se usuário já existe (UMA ÚNICA CONSULTA)
    const existingUser = await userService.findUserByEmail(customerEmail);

    if (existingUser) {
      // USUÁRIO EXISTENTE
      return await this.handleExistingUser(existingUser, subscription, {
        id: stripeCustomer.id,
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
      });
    } else {
      // USUÁRIO NOVO
      return await this.handleNewUser(subscription, {
        id: stripeCustomer.id,
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
      });
    }
  }

  /**
   * USUÁRIO EXISTENTE - Verifica se já tem assinatura ativa
   */
  async handleExistingUser(user, subscription, stripeCustomer) {
    // Verificar se tem assinatura ativa no Stripe
    if (user.subscription_id && user.subscription_id !== subscription.id) {
      try {
        const activeSubscription = await stripeService.getSubscription(
          user.subscription_id,
        );

        if (
          activeSubscription &&
          ['active', 'trialing'].includes(activeSubscription.status)
        ) {
          // JÁ TEM ASSINATURA ATIVA - Cancelar nova assinatura e enviar email de aviso
          await stripeService.cancelSubscription(subscription.id);
          await emailService.sendDuplicateSubscriptionEmail(
            stripeCustomer.email,
            stripeCustomer.name,
          );

          logger.warn(
            `Assinatura duplicada cancelada para usuário ${user.email}`,
            {
              existingSubscription: user.subscription_id,
              canceledSubscription: subscription.id,
            },
          );

          return {
            success: true,
            message:
              'Usuário já possui assinatura ativa - nova assinatura cancelada',
            action: 'duplicate_subscription_prevented',
          };
        }
      } catch (error) {
        logger.error('Erro ao verificar assinatura existente:', error);
        // Continua com reativação se não conseguir verificar
      }
    }

    // REATIVAR USUÁRIO
    await userService.reactivateUser(user.id, subscription);
    await emailService.sendWelcomeBackEmail(
      stripeCustomer.email,
      stripeCustomer.name,
    );

    return {
      success: true,
      message: 'Usuário reativado com sucesso',
      action: 'user_reactivated',
    };
  }

  /**
   * USUÁRIO NOVO - Criar empresa, usuário e conta de autenticação
   */
  async handleNewUser(subscription, stripeCustomer) {
    const planType = this.determinePlanType(subscription);

    // DEBUG: Log dos dados que serão usados para criar a empresa
    logger.info('Criando empresa com dados:', {
      nome: stripeCustomer.name,
      email: stripeCustomer.email,
      telefone: stripeCustomer.phone,
      ativo: true,
    });

    // Validar dados antes de criar empresa
    if (!stripeCustomer.email) {
      throw new Error('Email é obrigatório para criar empresa');
    }

    if (!stripeCustomer.name) {
      throw new Error('Nome é obrigatório para criar empresa');
    }

    // 1. Criar empresa
    const company = await userService.createCompany({
      nome: stripeCustomer.name,
      email: stripeCustomer.email,
      telefone: stripeCustomer.phone,
      ativo: true,
    });

    // 2. Criar conta no Supabase
    const temporaryPassword = this.generateTemporaryPassword();
    const authUser = await userService.createSupabaseUser(
      stripeCustomer.email,
      temporaryPassword,
    );

    // 3. Criar usuário no banco
    const user = await userService.createUser({
      empresa_id: company.id,
      nome: stripeCustomer.name,
      email: stripeCustomer.email,
      telefone: stripeCustomer.phone,
      tipo_usuario: 'admin',
      ativo: true,
      auth_id: authUser.id,
      customer_id: stripeCustomer.id,
      subscription_id: subscription.id,
      plano: planType,
    });

    // 4. Enviar email de boas-vindas com senha temporária
    await emailService.sendWelcomeEmail(
      stripeCustomer.email,
      stripeCustomer.name,
      temporaryPassword,
    );

    return {
      success: true,
      message: 'Nova conta criada com sucesso',
      action: 'new_account_created',
      data: { userId: user.id, companyId: company.id },
    };
  }

  /**
   * CANCELAMENTO DE ASSINATURA
   */
  async handleSubscriptionCanceled(subscription) {
    const subscriptionId = subscription.id;

    // Buscar usuário pela subscription_id
    const user = await userService.findUserBySubscriptionId(subscriptionId);

    if (!user) {
      logger.warn(
        `Usuário não encontrado para subscription: ${subscriptionId}`,
      );
      return { success: true, message: 'Usuário não encontrado' };
    }

    // Desativar usuário
    await userService.deactivateUser(user.id);

    logger.info(
      `Usuário ${user.email} desativado por cancelamento da assinatura`,
    );

    return {
      success: true,
      message: 'Usuário desativado por cancelamento',
      action: 'user_deactivated',
    };
  }

  /**
   * Determinar tipo de plano baseado no price_id
   */
  determinePlanType(subscription) {
    const priceId = subscription.items.data[0]?.price?.id;

    // Planos definidos pelo usuário
    switch (priceId) {
      case 'price_1RZwkZQZgpVccQF8UK7COqL3':
        return 'profissional';
      case 'price_1RZwkAQZgpVccQF8AGT1tiK3':
        return 'essencial';
      default:
        return 'essencial';
    }
  }

  /**
   * Gera senha temporária segura
   */
  generateTemporaryPassword() {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Processa pagamento bem sucedido de fatura
   */
  async handleInvoicePaymentSucceeded(invoice) {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    if (!customerId || !subscriptionId) {
      logger.warn('Invoice sem customer_id ou subscription_id', { invoice });
      return { success: true, message: 'Invoice ignorada - dados incompletos' };
    }

    try {
      // Atualizar status do pagamento no banco
      const user = await userService.findUserByCustomerId(customerId);

      if (!user) {
        logger.warn('Usuário não encontrado para customer_id:', customerId);
        return { success: true, message: 'Usuário não encontrado' };
      }

      // Atualizar data de último pagamento e status
      await userService.updateSubscriptionStatus(user.id, {
        subscription_id: subscriptionId,
        status: 'active',
        last_payment_date: new Date(),
      });

      // Enviar email de confirmação
      await emailService.sendPaymentSuccessEmail(user.email, user.nome);

      return {
        success: true,
        message: 'Pagamento processado com sucesso',
        action: 'payment_processed',
      };
    } catch (error) {
      logger.error('Erro ao processar pagamento:', error);
      throw error;
    }
  }

  /**
   * Processa falha no pagamento de fatura
   */
  async handleInvoicePaymentFailed(invoice) {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    if (!customerId || !subscriptionId) {
      logger.warn('Invoice sem customer_id ou subscription_id', { invoice });
      return { success: true, message: 'Invoice ignorada - dados incompletos' };
    }

    try {
      const user = await userService.findUserByCustomerId(customerId);

      if (!user) {
        logger.warn('Usuário não encontrado para customer_id:', customerId);
        return { success: true, message: 'Usuário não encontrado' };
      }

      // Atualizar status da assinatura
      await userService.updateSubscriptionStatus(user.id, {
        subscription_id: subscriptionId,
        status: 'payment_failed',
      });

      // Enviar email de alerta
      await emailService.sendPaymentFailedEmail(user.email, user.nome);

      return {
        success: true,
        message: 'Falha de pagamento registrada',
        action: 'payment_failed',
      };
    } catch (error) {
      logger.error('Erro ao processar falha de pagamento:', error);
      throw error;
    }
  }

  /**
   * Processa atualização de assinatura
   */
  async handleSubscriptionUpdated(subscription) {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const status = subscription.status;

    try {
      const user = await userService.findUserByCustomerId(customerId);

      if (!user) {
        logger.warn('Usuário não encontrado para customer_id:', customerId);
        return { success: true, message: 'Usuário não encontrado' };
      }

      // Atualizar status da assinatura
      await userService.updateSubscriptionStatus(user.id, {
        subscription_id: subscriptionId,
        status: status,
      });

      return {
        success: true,
        message: 'Status da assinatura atualizado',
        action: 'subscription_updated',
      };
    } catch (error) {
      logger.error('Erro ao atualizar status da assinatura:', error);
      throw error;
    }
  }

  /**
   * Processa aviso de fim do período trial
   */
  async handleTrialWillEnd(subscription) {
    const customerId = subscription.customer;
    const trialEnd = subscription.trial_end;

    try {
      const user = await userService.findUserByCustomerId(customerId);

      if (!user) {
        logger.warn('Usuário não encontrado para customer_id:', customerId);
        return { success: true, message: 'Usuário não encontrado' };
      }

      // Enviar email avisando sobre fim do trial
      await emailService.sendTrialEndingEmail(
        user.email,
        user.nome,
        new Date(trialEnd * 1000),
      );

      return {
        success: true,
        message: 'Aviso de fim de trial enviado',
        action: 'trial_ending_notified',
      };
    } catch (error) {
      logger.error('Erro ao processar aviso de fim de trial:', error);
      throw error;
    }
  }
}

module.exports = new SubscriptionService();
