import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/services/emailService';

// POST /api/emails/send
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, templateId, toEmail, subject, htmlBody } = body;

    if (!leadId || !templateId || !toEmail) {
      return NextResponse.json(
        { error: 'leadId, templateId, and toEmail are required' },
        { status: 400 }
      );
    }

    const emailLogId = await sendEmail({
      leadId,
      templateId,
      toEmail,
      subject: subject || 'Email from CRM',
      htmlBody: htmlBody || '',
    });

    return NextResponse.json({
      success: true,
      emailLogId,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
