/**
 * Email Service
 * Handles email sending, templating, and logging
 */

import { prisma } from '@/lib/prisma';
import { EmailLog } from '@/generated/prisma/client';

export interface SendEmailOptions {
  leadId: string;
  templateId: string;
  automationId?: string;
  toEmail: string;
  subject: string;
  htmlBody: string;
}

/**
 * Send email and log the action
 */
export async function sendEmail(options: SendEmailOptions): Promise<string> {
  const { leadId, templateId, automationId, toEmail, subject, htmlBody } = options;

  try {
    // Get template details
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // TODO: Integrate with actual email service (SendGrid, Mailgun, etc)
    // For now, this is a mock implementation
    console.log(`Sending email to ${toEmail} with subject: ${subject}`);

    // Log the email
    const emailLog = await prisma.emailLog.create({
      data: {
        leadId,
        templateId,
        automationId,
        toEmail,
        subject,
        fromName: template.name || 'Default',
        fromEmail: 'noreply@example.com', // TODO: Configure from address
        status: 'sent',
      },
    });

    return emailLog.id;
  } catch (error) {
    console.error('Error sending email:', error);

    // Log failed email attempt
    await prisma.emailLog.create({
      data: {
        leadId,
        templateId,
        automationId,
        toEmail,
        subject,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

/**
 * Get email logs for a lead
 */
export async function getLeadEmailLogs(leadId: string) {
  return prisma.emailLog.findMany({
    where: { leadId },
    include: {
      template: true,
      automation: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Mark email as opened
 */
export async function markEmailOpened(emailLogId: string) {
  return prisma.emailLog.update({
    where: { id: emailLogId },
    data: {
      status: 'opened',
      openedAt: new Date(),
    },
  });
}

/**
 * Mark email as clicked
 */
export async function markEmailClicked(emailLogId: string) {
  return prisma.emailLog.update({
    where: { id: emailLogId },
    data: {
      status: 'clicked',
      clickedAt: new Date(),
    },
  });
}

/**
 * Get email statistics
 */
export async function getEmailStats(userId: string) {
  const logs = await prisma.emailLog.findMany({
    where: {
      lead: {
        userId,
      },
    },
  });

  const stats = {
    total: logs.length,
    sent: logs.filter((l: EmailLog) => l.status === 'sent').length,
    opened: logs.filter((l: EmailLog) => l.status === 'opened').length,
    clicked: logs.filter((l: EmailLog) => l.status === 'clicked').length,
    failed: logs.filter((l: EmailLog) => l.status === 'failed').length,
    bounced: logs.filter((l: EmailLog) => l.status === 'bounced').length,
  };

  return stats;
}
