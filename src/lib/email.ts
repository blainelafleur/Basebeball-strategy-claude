// TEMPORARY: Email service disabled for initial deployment
// TODO: Re-enable after core app is deployed and working

export interface EmailTemplate {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

// Stub implementation - no Resend dependencies
export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    console.log('Email service disabled - email notifications disabled');
    console.log('Would send email to:', template.to, 'Subject:', template.subject);
    return false;
  }

  // Pre-built email templates - all stubbed
  async sendWelcomeEmail(userEmail: string, userName: string, appUrl?: string): Promise<boolean> {
    console.log(`Would send welcome email to ${userEmail} for ${userName}`);
    return false;
  }

  async sendPasswordResetEmail(userEmail: string, resetLink: string): Promise<boolean> {
    console.log(`Would send password reset email to ${userEmail}`);
    return false;
  }

  async sendSubscriptionConfirmation(
    userEmail: string,
    planName: string,
    appUrl?: string
  ): Promise<boolean> {
    console.log(`Would send subscription confirmation to ${userEmail} for ${planName}`);
    return false;
  }

  async sendAchievementUnlocked(
    userEmail: string,
    achievementName: string,
    description: string,
    appUrl?: string
  ): Promise<boolean> {
    console.log(`Would send achievement email to ${userEmail} for ${achievementName}`);
    return false;
  }
}

export const emailService = EmailService.getInstance();
