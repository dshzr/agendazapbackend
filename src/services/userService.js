const logger = require('../utils/logger');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

class UserService {
  async findUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .not('auth_id', 'is', null)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        logger.error('Erro ao buscar usuário por email:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      logger.error('Erro na busca do usuário por email:', error);
      throw error;
    }
  }

  async findUserBySubscriptionId(subscriptionId) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao buscar usuário por subscription_id:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      logger.error('Erro na busca do usuário por subscription_id:', error);
      throw error;
    }
  }

  async createCompany(companyData) {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert({
          nome: companyData.nome,
          email: companyData.email,
          telefone: companyData.telefone,
          ativo: companyData.ativo,
        })
        .select('id, nome, email')
        .single();

      if (error) {
        logger.error('Erro ao criar empresa:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Erro na criação da empresa:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          empresa_id: userData.empresa_id,
          nome: userData.nome,
          email: userData.email,
          telefone: userData.telefone,
          tipo_usuario: userData.tipo_usuario,
          ativo: userData.ativo,
          auth_id: userData.auth_id,
          customer_id: userData.customer_id,
          subscription_id: userData.subscription_id,
          plano: userData.plano,
        })
        .select('id, nome, email')
        .single();

      if (error) {
        logger.error('Erro ao criar usuário:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Erro na criação do usuário:', error);
      throw error;
    }
  }

  async reactivateUser(userId, subscription) {
    try {
      const planType =
        subscription.items.data[0]?.price?.id ===
        'price_1RZwkZQZgpVccQF8UK7COqL3'
          ? 'profissional'
          : 'essencial';

      const { data, error } = await supabase
        .from('usuarios')
        .update({
          ativo: true,
          subscription_id: subscription.id,
          plano: planType,
        })
        .eq('id', userId)
        .select('id, email')
        .single();

      if (error) {
        logger.error('Erro ao reativar usuário:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Erro na reativação do usuário:', error);
      throw error;
    }
  }

  async deactivateUser(userId) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update({ ativo: false })
        .eq('id', userId)
        .select('id, email')
        .single();

      if (error) {
        logger.error('Erro ao desativar usuário:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Erro na desativação do usuário:', error);
      throw error;
    }
  }

  async createSupabaseUser(email, password) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error) {
        logger.error('Erro ao criar usuário no Supabase:', error);
        throw error;
      }

      return data.user;
    } catch (error) {
      logger.error('Erro na criação do usuário Supabase:', error);
      throw error;
    }
  }

  /**
   * Encontra um usuário pelo customer_id do Stripe
   */
  async findUserByCustomerId(customerId) {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (error) {
      logger.error('Erro ao buscar usuário por customer_id:', error);
      throw error;
    }

    return user;
  }

  /**
   * Atualiza o status da assinatura de um usuário
   */
  async updateSubscriptionStatus(
    userId,
    { subscription_id, status, last_payment_date },
  ) {
    const updateData = {
      subscription_id,
      updated_at: new Date(),
    };

    // Adicionar campos opcionais se fornecidos
    if (status) {
      updateData.subscription_status = status;
    }

    if (last_payment_date) {
      updateData.last_payment_date = last_payment_date;
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Erro ao atualizar status da assinatura:', error);
      throw error;
    }

    return data;
  }
}

module.exports = new UserService();
