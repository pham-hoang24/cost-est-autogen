// Email notification service
// In production, this would integrate with services like SendGrid, AWS SES, or similar

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  organization?: string;
}

interface Organization {
  id: string;
  name: string;
  admin_email: string;
}

export class EmailService {
  private static instance: EmailService;
  
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // User approval notification
  async sendUserApprovalNotification(user: User): Promise<boolean> {
    const template = this.getUserApprovalTemplate(user);
    return this.sendEmail(user.email, template);
  }

  // User rejection notification
  async sendUserRejectionNotification(user: User, reason?: string): Promise<boolean> {
    const template = this.getUserRejectionTemplate(user, reason);
    return this.sendEmail(user.email, template);
  }

  // Organization invitation
  async sendOrganizationInvitation(
    email: string, 
    organization: Organization, 
    inviterName: string
  ): Promise<boolean> {
    const template = this.getOrganizationInvitationTemplate(email, organization, inviterName);
    return this.sendEmail(email, template);
  }

  // Resource quota warning
  async sendQuotaWarning(user: User, resourceType: string, usagePercent: number): Promise<boolean> {
    const template = this.getQuotaWarningTemplate(user, resourceType, usagePercent);
    return this.sendEmail(user.email, template);
  }

  // Subscription upgrade reminder
  async sendUpgradeReminder(user: User, currentPlan: string, suggestedPlan: string): Promise<boolean> {
    const template = this.getUpgradeReminderTemplate(user, currentPlan, suggestedPlan);
    return this.sendEmail(user.email, template);
  }

  // Private template methods
  private getUserApprovalTemplate(user: User): EmailTemplate {
    return {
      subject: 'Welcome to SW4E Sandbox - Account Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #a3e635); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SW4E Sandbox</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Welcome, ${user.first_name}!</h2>
            <p>Your account has been approved and you now have access to the SW4E Sandbox platform.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Account Details:</h3>
              <ul>
                <li><strong>Name:</strong> ${user.first_name} ${user.last_name}</li>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Role:</strong> ${user.role}</li>
                <li><strong>Organization:</strong> ${user.organization || 'Not specified'}</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                 style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Access Your Dashboard
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      `,
      text: `
        Welcome to SW4E Sandbox!
        
        Your account has been approved and you now have access to the platform.
        
        Account Details:
        - Name: ${user.first_name} ${user.last_name}
        - Email: ${user.email}
        - Role: ${user.role}
        - Organization: ${user.organization || 'Not specified'}
        
        Access your dashboard at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login
      `
    };
  }

  private getUserRejectionTemplate(user: User, reason?: string): EmailTemplate {
    return {
      subject: 'SW4E Sandbox - Account Application Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ef4444; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SW4E Sandbox</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Account Application Update</h2>
            <p>Thank you for your interest in SW4E Sandbox. Unfortunately, we cannot approve your account at this time.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>If you believe this is an error or would like to reapply, please contact our support team.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/register" 
                 style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reapply for Access
              </a>
            </div>
          </div>
        </div>
      `,
      text: `
        SW4E Sandbox - Account Application Update
        
        Thank you for your interest in SW4E Sandbox. Unfortunately, we cannot approve your account at this time.
        
        ${reason ? `Reason: ${reason}` : ''}
        
        If you believe this is an error or would like to reapply, please contact our support team.
        
        Reapply at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/register
      `
    };
  }

  private getOrganizationInvitationTemplate(
    email: string, 
    organization: Organization, 
    inviterName: string
  ): EmailTemplate {
    return {
      subject: `Invitation to join ${organization.name} on SW4E Sandbox`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #a3e635); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SW4E Sandbox</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b;">You're Invited!</h2>
            <p><strong>${inviterName}</strong> has invited you to join <strong>${organization.name}</strong> on SW4E Sandbox.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Organization Details:</h3>
              <ul>
                <li><strong>Name:</strong> ${organization.name}</li>
                <li><strong>Invited by:</strong> ${inviterName}</li>
                <li><strong>Email:</strong> ${email}</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/register" 
                 style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accept Invitation
              </a>
            </div>
          </div>
        </div>
      `,
      text: `
        You're Invited to SW4E Sandbox!
        
        ${inviterName} has invited you to join ${organization.name} on SW4E Sandbox.
        
        Organization Details:
        - Name: ${organization.name}
        - Invited by: ${inviterName}
        - Email: ${email}
        
        Accept invitation at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/register
      `
    };
  }

  private getQuotaWarningTemplate(user: User, resourceType: string, usagePercent: number): EmailTemplate {
    return {
      subject: `SW4E Sandbox - ${resourceType} Quota Warning`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f59e0b; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SW4E Sandbox - Quota Warning</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Resource Usage Alert</h2>
            <p>Hello ${user.first_name},</p>
            <p>You've used <strong>${usagePercent}%</strong> of your ${resourceType} quota. Consider upgrading your plan to avoid service interruption.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Current Usage:</h3>
              <div style="background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden;">
                <div style="background: #f59e0b; height: 100%; width: ${usagePercent}%; transition: width 0.3s;"></div>
              </div>
              <p style="text-align: center; margin: 10px 0;">${usagePercent}% used</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/services" 
                 style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Upgrade Plan
              </a>
            </div>
          </div>
        </div>
      `,
      text: `
        SW4E Sandbox - Resource Usage Alert
        
        Hello ${user.first_name},
        
        You've used ${usagePercent}% of your ${resourceType} quota. Consider upgrading your plan to avoid service interruption.
        
        Current Usage: ${usagePercent}%
        
        Upgrade your plan at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/services
      `
    };
  }

  private getUpgradeReminderTemplate(user: User, currentPlan: string, suggestedPlan: string): EmailTemplate {
    return {
      subject: `Upgrade to ${suggestedPlan} - Unlock More Features`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #a3e635); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SW4E Sandbox</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Unlock More Features!</h2>
            <p>Hello ${user.first_name},</p>
            <p>You're currently on the <strong>${currentPlan}</strong> plan. Upgrade to <strong>${suggestedPlan}</strong> to access advanced features and higher resource limits.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>What you'll get with ${suggestedPlan}:</h3>
              <ul>
                <li>Higher resource quotas</li>
                <li>Advanced AI tools</li>
                <li>Team collaboration features</li>
                <li>Priority support</li>
                <li>Custom integrations</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/services" 
                 style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Upgrade Now
              </a>
            </div>
          </div>
        </div>
      `,
      text: `
        Upgrade to ${suggestedPlan} - Unlock More Features
        
        Hello ${user.first_name},
        
        You're currently on the ${currentPlan} plan. Upgrade to ${suggestedPlan} to access advanced features and higher resource limits.
        
        What you'll get with ${suggestedPlan}:
        - Higher resource quotas
        - Advanced AI tools
        - Team collaboration features
        - Priority support
        - Custom integrations
        
        Upgrade now at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/services
      `
    };
  }

  // Mock email sending - in production, integrate with real email service
  private async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      console.log(`📧 Sending email to ${to}`);
      console.log(`Subject: ${template.subject}`);
      console.log(`Text: ${template.text.substring(0, 100)}...`);
      
      // In production, this would call your email service:
      // await emailService.send({
      //   to,
      //   subject: template.subject,
      //   html: template.html,
      //   text: template.text
      // });
      
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }
}

export const emailService = EmailService.getInstance();
