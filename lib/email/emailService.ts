import { createEmailProvider, type EmailProvider, type EmailResult } from './providers';
import { PasswordResetService } from '@/lib/auth/passwordReset';
import {
  generateCredentialsEmailHTML,
  generateCredentialsEmailText,
  getCredentialsEmailSubject,
  generateOTPEmailHTML,
  generateOTPEmailText,
  getOTPEmailSubject,
  type CredentialsData,
  type OTPData,
} from './templates';

export interface SendCredentialsOptions {
  to: string;
  credentials: {
    id: string;
    password: string;
  };
  userInfo: {
    name: string;
    email: string;
  };
  userType: 'mentor' | 'intern';
  includeResetLink?: boolean;
}

export interface SendOTPOptions {
  to: string;
  otp: string;
  expiryMinutes: number;
}

export class EmailService {
  private provider: EmailProvider;
  private baseUrl: string;

  constructor() {
    this.provider = createEmailProvider();
    this.baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }

  async sendCredentialsEmail(options: SendCredentialsOptions): Promise<EmailResult> {
    try {
      let resetPasswordUrl: string | undefined;

      // Generate reset password link if requested
      if (options.includeResetLink) {
        const resetToken = await PasswordResetService.createResetTokenForNewUser(options.userInfo.email);
        if (resetToken) {
          resetPasswordUrl = `${this.baseUrl}/auth/reset-password?token=${resetToken}`;
        }
      }

      const templateData: CredentialsData = {
        name: options.userInfo.name,
        email: options.userInfo.email,
        loginId: options.credentials.id,
        password: options.credentials.password,
        userType: options.userType,
        loginUrl: `${this.baseUrl}/auth/login`,
        resetPasswordUrl,
      };

      const subject = getCredentialsEmailSubject(options.userType, options.userInfo.name);
      const html = generateCredentialsEmailHTML(templateData);
      const text = generateCredentialsEmailText(templateData);

      console.log(`Sending ${options.userType} credentials email to:`, options.to, options.includeResetLink ? '(with reset link)' : '');

      const result = await this.provider.send({
        to: options.to,
        subject,
        html,
        text,
      });

      if (result.success) {
        console.log(`Credentials email sent successfully to ${options.to}, messageId:`, result.messageId);
      } else {
        console.error(`Failed to send credentials email to ${options.to}:`, result.error);
      }

      return result;
    } catch (error) {
      console.error('Error in sendCredentialsEmail:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while sending email',
      };
    }
  }

  async sendOTPEmail(options: SendOTPOptions): Promise<EmailResult> {
    try {
      const templateData: OTPData = {
        otp: options.otp,
        expiryMinutes: options.expiryMinutes,
      };

      const subject = getOTPEmailSubject();
      const html = generateOTPEmailHTML(templateData);
      const text = generateOTPEmailText(templateData);

      console.log(`Sending OTP email to:`, options.to);

      const result = await this.provider.send({
        to: options.to,
        subject,
        html,
        text,
      });

      if (result.success) {
        console.log(`OTP email sent successfully to ${options.to}, messageId:`, result.messageId);
      } else {
        console.error(`Failed to send OTP email to ${options.to}:`, result.error);
      }

      return result;
    } catch (error) {
      console.error('Error in sendOTPEmail:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while sending OTP email',
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (this.provider instanceof (await import('./providers')).NodemailerProvider) {
        return await (this.provider as any).verify();
      }
      return true; // For other providers, assume they're configured correctly
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<EmailResult> {
    try {
      const result = await this.provider.send({
        to,
        subject: 'Test Email - Intern Management System',
        html: `
          <h2>Email Service Test</h2>
          <p>This is a test email to verify that your email configuration is working correctly.</p>
          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
        `,
        text: `Email Service Test\n\nThis is a test email to verify that your email configuration is working correctly.\n\nSent at: ${new Date().toISOString()}`,
      });

      return result;
    } catch (error) {
      console.error('Error sending test email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while sending test email',
      };
    }
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

// Convenience function for sending credentials
export async function sendCredentialsEmail(options: SendCredentialsOptions): Promise<EmailResult> {
  const emailService = getEmailService();
  return await emailService.sendCredentialsEmail(options);
}