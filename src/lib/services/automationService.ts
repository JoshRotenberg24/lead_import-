/**
 * Automation Service
 * Handles automation scheduling, enrollment, and execution
 */

import { prisma } from '@/lib/prisma';
import { EmailLog } from '@/generated/prisma/client';
import { sendEmail } from './emailService';

/**
 * Enroll a lead in an automation
 */
export async function enrollLeadInAutomation(
  leadId: string,
  automationId: string
) {
  return prisma.leadAutomation.upsert({
    where: {
      leadId_automationId: {
        leadId,
        automationId,
      },
    },
    update: {
      status: 'active',
    },
    create: {
      leadId,
      automationId,
      status: 'active',
    },
  });
}

/**
 * Unenroll a lead from an automation
 */
export async function unenrollLeadFromAutomation(
  leadId: string,
  automationId: string
) {
  return prisma.leadAutomation.update({
    where: {
      leadId_automationId: {
        leadId,
        automationId,
      },
    },
    data: {
      status: 'paused',
    },
  });
}

/**
 * Get next send date for an automation
 */
function getNextSendDate(
  triggerField: string | null,
  triggerValue: string | null,
  daysBefore: number
): Date | null {
  if (!triggerField || !triggerValue) return null;

  try {
    // Parse the date value (could be YYYY-MM-DD)
    const targetDate = new Date(triggerValue);
    if (isNaN(targetDate.getTime())) return null;

    // Calculate days before
    const sendDate = new Date(targetDate);
    sendDate.setDate(sendDate.getDate() - daysBefore);

    // If the send date is in the past, calculate for next year
    const now = new Date();
    if (sendDate < now) {
      sendDate.setFullYear(sendDate.getFullYear() + 1);
    }

    return sendDate;
  } catch {
    return null;
  }
}

/**
 * Process due automations - sends emails for leads with upcoming dates
 */
export async function processDueAutomations() {
  const now = new Date();

  // Find all active automations
  const automations = await prisma.automation.findMany({
    where: { isActive: true },
    include: { template: true },
  });

  for (const automation of automations) {
    // Find leads enrolled in this automation
    const enrollments = await prisma.leadAutomation.findMany({
      where: {
        automationId: automation.id,
        status: 'active',
      },
      include: {
        lead: true,
      },
    });

    for (const enrollment of enrollments) {
      const { lead } = enrollment;

      // Determine trigger field and value
      let triggerValue: string | null = null;

      if (automation.type === 'birthday' && lead.birthday) {
        triggerValue = lead.birthday;
      } else if (automation.type === 'anniversary' && lead.anniversary) {
        triggerValue = lead.anniversary;
      } else if (automation.type === 'holiday' && automation.holidayDate) {
        triggerValue = automation.holidayDate;
      }

      if (!triggerValue) continue;

      // Get next send date
      const nextSendDate = getNextSendDate(
        automation.triggerField || automation.type,
        triggerValue,
        automation.daysBefore
      );

      if (!nextSendDate || nextSendDate > now) continue;

      try {
        // Send email
        await sendEmail({
          leadId: lead.id,
          templateId: automation.templateId,
          automationId: automation.id,
          toEmail: lead.email,
          subject: automation.template.subject,
          htmlBody: automation.template.htmlBody,
        });

        // Update next run time
        await prisma.leadAutomation.update({
          where: {
            leadId_automationId: {
              leadId: lead.id,
              automationId: automation.id,
            },
          },
          data: {
            lastRun: now,
            nextRun: getNextSendDate(
              automation.triggerField || automation.type,
              triggerValue,
              automation.daysBefore
            ),
          },
        });

        // Increment total sent counter
        await prisma.automation.update({
          where: { id: automation.id },
          data: {
            totalSent: { increment: 1 },
            lastRun: now,
          },
        });
      } catch (error) {
        console.error(
          `Failed to send automation email for lead ${lead.id}:`,
          error
        );
      }
    }
  }
}

/**
 * Pause automation
 */
export async function pauseAutomation(automationId: string) {
  return prisma.automation.update({
    where: { id: automationId },
    data: { isActive: false },
  });
}

/**
 * Resume automation
 */
export async function resumeAutomation(automationId: string) {
  return prisma.automation.update({
    where: { id: automationId },
    data: { isActive: true },
  });
}

/**
 * Get automation statistics
 */
export async function getAutomationStats(automationId: string) {
  const automation = await prisma.automation.findUnique({
    where: { id: automationId },
  });

  if (!automation) return null;

  const enrolledCount = await prisma.leadAutomation.count({
    where: {
      automationId,
      status: 'active',
    },
  });

  const emailLogs = await prisma.emailLog.findMany({
    where: { automationId },
  });

  return {
    automation,
    enrolled: enrolledCount,
    emailsSent: automation.totalSent,
    emailsOpened: emailLogs.filter((l: EmailLog) => l.status === 'opened').length,
    emailsClicked: emailLogs.filter((l: EmailLog) => l.status === 'clicked').length,
  };
}
