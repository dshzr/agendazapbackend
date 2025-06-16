const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendWelcomeEmail(email, name, temporaryPassword = '123456') {
    const html = `
      <div style='font-family: Arial, sans-serif; padding: 20px; color: #374151; line-height: 1.6;'>
        <h1 style='color: #1d4ed8; margin-bottom: 20px;'>Bem-vindo à AgendaZap!</h1>
        <p style='font-size: 16px; margin-bottom: 16px;'>
          Olá ${name}! Sua conta foi criada com sucesso e você já pode acessar a plataforma!
        </p>
        <p style='font-size: 16px; background-color: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 16px;'>
          <strong>E-mail:</strong> ${email}<br>
          <strong>Senha temporária:</strong> ${temporaryPassword}
        </p>
        <p style='font-size: 16px; margin-bottom: 16px;'>
          Recomendamos que você altere sua senha o quanto antes. É só acessar <strong>Configurações > Alterar Senha</strong>.
        </p>
        <p style='font-size: 16px;'>
          Qualquer dúvida, estamos por aqui. Seja muito bem-vindo(a)! 💙
        </p>
      </div>
    `;

    return await this.sendEmail(email, 'Bem-vindo(a) à AgendaZap!', html);
  }

  async sendWelcomeBackEmail(email, name) {
    const html = `
      <div style='font-family: Arial, sans-serif; padding: 20px; color: #374151; line-height: 1.6;'>
        <h1 style='color: #1d4ed8; margin-bottom: 20px;'>Seja bem-vindo de volta!</h1>
        <p style='font-size: 16px; margin-bottom: 16px;'>
          Olá ${name}! Ficamos felizes em ver você de volta na <strong>AgendaZap</strong>!
        </p>
        <p style='font-size: 16px; margin-bottom: 16px;'>
          Sua assinatura foi reativada com sucesso e tudo já está funcionando normalmente.
        </p>
        <p style='font-size: 16px;'>
          Se precisar de qualquer ajuda, estamos por aqui! 💙
        </p>
      </div>
    `;

    return await this.sendEmail(
      email,
      'Bem-vindo(a) de volta à AgendaZap!',
      html,
    );
  }

  async sendDuplicateSubscriptionEmail(email, name) {
    const html = `
      <div style='font-family: Arial, sans-serif; padding: 20px; color: #374151; line-height: 1.6;'>
        <h1 style='color: #1d4ed8; margin-bottom: 20px;'>Olá ${name}!</h1>
        <p style='font-size: 16px; margin-bottom: 16px;'>
          Vimos que tentou assinar um plano, mas você já tem um plano ativo conosco na AgendaZap.
        </p>
        <p style='font-size: 16px;'>
          Para trocar seu plano, acesse o portal de assinaturas em <strong>Configurações</strong> na AgendaZap.
        </p>
      </div>
    `;

    return await this.sendEmail(
      email,
      'Tentativa de assinatura AgendaZap',
      html,
    );
  }

  async sendPaymentSuccessEmail(email, name) {
    const subject = 'Pagamento confirmado - AgendaZap';
    const html = `
      <h2>Olá ${name}!</h2>
      <p>O pagamento da sua assinatura foi processado com sucesso.</p>
      <p>Sua conta continua ativa e você pode aproveitar todos os recursos do AgendaZap.</p>
      <p>Obrigado por confiar em nossos serviços!</p>
    `;

    return await this.sendEmail(email, subject, html);
  }

  async sendPaymentFailedEmail(email, name) {
    const subject = 'Problema com pagamento - AgendaZap';
    const html = `
      <h2>Olá ${name}</h2>
      <p>Identificamos um problema no processamento do pagamento da sua assinatura.</p>
      <p>Por favor, verifique:</p>
      <ul>
        <li>Se há limite disponível no cartão</li>
        <li>Se os dados do cartão estão corretos</li>
        <li>Se o cartão não está bloqueado</li>
      </ul>
      <p>Você pode atualizar seus dados de pagamento a qualquer momento em sua área de configurações.</p>
      <p>Se precisar de ajuda, entre em contato conosco respondendo este email.</p>
    `;

    return await this.sendEmail(email, subject, html);
  }

  async sendTrialEndingEmail(email, name, trialEndDate) {
    const subject = 'Seu período de teste está acabando - AgendaZap';
    const formattedDate = trialEndDate.toLocaleDateString('pt-BR');

    const html = `
      <h2>Olá ${name}</h2>
      <p>Seu período de teste gratuito termina em ${formattedDate}.</p>
      <p>Para continuar usando todos os recursos do AgendaZap sem interrupção, certifique-se de:</p>
      <ul>
        <li>Ter um método de pagamento válido cadastrado</li>
        <li>Verificar se o cartão tem limite disponível</li>
      </ul>
      <p>Você pode gerenciar sua assinatura a qualquer momento em sua área de configurações.</p>
      <p>Precisando de ajuda? Responda este email!</p>
    `;

    return await this.sendEmail(email, subject, html);
  }

  async sendEmail(to, subject, html) {
    try {
      const result = await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
      });

      logger.info(`Email enviado para ${to}:`, { messageId: result.messageId });
      return result;
    } catch (error) {
      logger.error(`Erro ao enviar email para ${to}:`, error);
      throw error;
    }
  }
}

module.exports = new EmailService();
