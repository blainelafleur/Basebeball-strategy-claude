// Conditional email service to prevent build errors if not configured
let resendClient: unknown = null;
let emailInitialized = false;

const initializeEmail = async () => {
  if (emailInitialized) return resendClient;
  
  if (!process.env.RESEND_API_KEY) {
    console.log('Email service not configured - email notifications disabled');
    emailInitialized = true;
    return null;
  }

  try {
    const { Resend } = await import('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
    emailInitialized = true;
    console.log('Email service initialized');
    return resendClient;
  } catch (error) {
    console.warn('Failed to initialize email service:', error);
    emailInitialized = true;
    return null;
  }
};

export interface EmailTemplate {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  private async getResendClient() {
    return await initializeEmail();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    const resendClient = await this.getResendClient();
    
    if (!resendClient) {
      console.warn('Email service not configured - skipping email send');
      return false;
    }

    // Type assertion since we know it's a Resend client if not null
    const resend = resendClient as { 
      emails: { 
        send: (data: {
          from: string;
          to: string | string[];
          subject: string;
          html?: string;
          text?: string;
        }) => Promise<{ 
          error?: unknown;
          data?: { id?: string };
        }> 
      } 
    };

    try {
      const baseEmailData = {
        from: template.from || process.env.FROM_EMAIL || 'noreply@baseballstrategy.com',
        to: template.to,
        subject: template.subject,
      };

      let result;

      // Send with both HTML and text if both are provided
      if (template.html && template.text) {
        result = await resend.emails.send({
          ...baseEmailData,
          html: template.html,
          text: template.text,
        });
      }
      // Send with HTML only if only HTML is provided
      else if (template.html) {
        result = await resend.emails.send({
          ...baseEmailData,
          html: template.html,
        });
      }
      // Send with text only if only text is provided
      else if (template.text) {
        result = await resend.emails.send({
          ...baseEmailData,
          text: template.text,
        });
      }
      // Fallback to subject as text if neither is provided
      else {
        result = await resend.emails.send({
          ...baseEmailData,
          text: template.subject,
        });
      }

      if (result.error) {
        console.error('Email send error:', result.error);
        return false;
      }

      console.log('Email sent successfully:', result.data?.id);
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  // Pre-built email templates
  async sendWelcomeEmail(userEmail: string, userName: string, appUrl?: string): Promise<boolean> {
    const baseUrl = appUrl || process.env.NEXTAUTH_URL || 'https://your-app.railway.app';
    
    return this.sendEmail({
      to: userEmail,
      subject: 'Welcome to Baseball Strategy Master! ⚾',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Welcome to Baseball Strategy Master!</h1>
          <p>Hi ${userName},</p>
          <p>Thanks for joining Baseball Strategy Master! You're now ready to:</p>
          <ul>
            <li>🎯 Practice game situations across all positions</li>
            <li>🧠 Get AI-powered coaching feedback</li>
            <li>📊 Track your progress and compete on leaderboards</li>
            <li>🏆 Unlock achievements as you improve</li>
          </ul>
          <p>
            <a href="${baseUrl}/game" 
               style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Your First Challenge
            </a>
          </p>
          <p>Good luck on the diamond!</p>
          <p>The Baseball Strategy Team</p>
        </div>
      `,
      text: `
        Welcome to Baseball Strategy Master!
        
        Hi ${userName},
        
        Thanks for joining Baseball Strategy Master! You're now ready to practice game situations, get AI coaching, track progress, and compete on leaderboards.
        
        Start your first challenge: ${baseUrl}/game
        
        Good luck on the diamond!
        The Baseball Strategy Team
      `,
    });
  }

  async sendPasswordResetEmail(userEmail: string, resetLink: string): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      subject: 'Reset your Baseball Strategy password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Password Reset Request</h1>
          <p>You requested a password reset for your Baseball Strategy account.</p>
          <p>Click the button below to reset your password:</p>
          <p>
            <a href="${resetLink}" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link expires in 1 hour.</p>
        </div>
      `,
      text: `
        Password Reset Request
        
        You requested a password reset for your Baseball Strategy account.
        
        Reset your password: ${resetLink}
        
        If you didn't request this, you can safely ignore this email.
        This link expires in 1 hour.
      `,
    });
  }

  async sendSubscriptionConfirmation(userEmail: string, planName: string, appUrl?: string): Promise<boolean> {
    const baseUrl = appUrl || process.env.NEXTAUTH_URL || 'https://your-app.railway.app';
    
    return this.sendEmail({
      to: userEmail,
      subject: `Welcome to ${planName}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #059669;">Subscription Confirmed!</h1>
          <p>Your ${planName} subscription is now active.</p>
          <p>You now have access to:</p>
          <ul>
            <li>✅ Unlimited game scenarios</li>
            <li>✅ Advanced AI coaching</li>
            <li>✅ Detailed analytics</li>
            <li>✅ Priority support</li>
          </ul>
          <p>
            <a href="${baseUrl}/dashboard" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Your Dashboard
            </a>
          </p>
        </div>
      `,
    });
  }

  async sendAchievementUnlocked(
    userEmail: string,
    achievementName: string,
    description: string,
    appUrl?: string
  ): Promise<boolean> {
    const baseUrl = appUrl || process.env.NEXTAUTH_URL || 'https://your-app.railway.app';
    
    return this.sendEmail({
      to: userEmail,
      subject: `🏆 Achievement Unlocked: ${achievementName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">🏆 Achievement Unlocked!</h1>
          <h2 style="color: #1e40af;">${achievementName}</h2>
          <p>${description}</p>
          <p>Keep up the great work on your baseball strategy journey!</p>
          <p>
            <a href="${baseUrl}/achievements" 
               style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View All Achievements
            </a>
          </p>
        </div>
      `,
    });
  }
}

export const emailService = EmailService.getInstance();
