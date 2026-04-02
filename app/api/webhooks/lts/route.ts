import { NextRequest, NextResponse } from 'next/server';
import { getLTSParser } from '@/lib/ltsParser';

/**
 * LTS Webhook Endpoint
 * Receives webhook POST from AgentWebsite when new leads come in
 *
 * Expected format: XML with Lead Transmission Standard structure
 *
 * Example URL to register in AgentWebsite:
 * https://yourapp.com/api/webhooks/lts
 */
export async function POST(request: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.LTS_WEBHOOK_SECRET;

    // Get signature from headers if provided
    const signature = request.headers.get('X-LTS-Signature');
    const timestamp = request.headers.get('X-LTS-Timestamp');

    // Verify signature if configured (optional - implement based on AgentWebsite docs)
    if (webhookSecret && signature) {
      // TODO: Implement signature verification based on AgentWebsite's method
      // For now, we accept all requests
      // In production, validate the signature
    }

    // Get XML content from request body
    const xmlContent = await request.text();

    if (!xmlContent || xmlContent.trim() === '') {
      return NextResponse.json(
        { error: 'Empty XML payload' },
        { status: 400 }
      );
    }

    // Parse and process the webhook
    const parser = getLTSParser();
    const { leads, errors } = await parser.processWebhook(xmlContent);

    console.log(`LTS Webhook: Received ${leads.length} leads${errors.length > 0 ? ` with ${errors.length} errors` : ''}`);

    // Log leads received (in production, store in database)
    if (leads.length > 0) {
      console.log('Leads processed:', leads.map((l) => l.email));
      // TODO: Store leads in database or send to backend service
    }

    if (errors.length > 0) {
      console.error('Processing errors:', errors);
    }

    // Return success response
    const response = {
      success: true,
      leadsProcessed: leads.length,
      errors: errors.length,
      message: `Processed ${leads.length} leads`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('LTS webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process webhook',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for webhook configuration testing
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/webhooks/lts',
    method: 'POST',
    contentType: 'application/xml',
    status: 'active',
    description: 'LTS webhook receiver for AgentWebsite',
  });
}
