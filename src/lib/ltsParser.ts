/**
 * LTS (Lead Transmission Standard) XML Parser
 * Handles parsing incoming webhook XML from AgentWebsite
 */

import xml2js from 'xml2js';
import { LTSWebhookPayload, LTSLead, LTSProcessingResult } from '@/types/lts';
import { Contact } from '@/types/contacts';
import { FieldMapper } from './fieldMapping';

/**
 * LTS Parser class
 */
export class LTSParser {
  private xmlParser: xml2js.Parser;
  private fieldMapper: FieldMapper;

  constructor() {
    this.xmlParser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
    });

    // Initialize field mapper with empty headers for LTS parsing
    this.fieldMapper = new FieldMapper([]);
  }

  /**
   * Parse XML string to LTS payload
   */
  async parseXML(xmlContent: string): Promise<LTSWebhookPayload> {
    try {
      const result = await this.xmlParser.parseStringPromise(xmlContent);
      return result as LTSWebhookPayload;
    } catch (error) {
      throw new Error(`Failed to parse LTS XML: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract leads from LTS payload
   */
  extractLeads(payload: LTSWebhookPayload): LTSLead[] {
    const leads = payload.LTS?.Lead;
    if (!leads) {
      return [];
    }

    // Handle both single lead and multiple leads
    return Array.isArray(leads) ? leads : [leads];
  }

  /**
   * Convert LTS lead to internal Contact format
   */
  convertToContact(ltsLead: LTSLead): Contact {
    return this.fieldMapper.ltsToContact(ltsLead);
  }

  /**
   * Process incoming LTS webhook
   */
  async processWebhook(xmlContent: string): Promise<{ leads: Contact[]; errors: Error[] }> {
    const leads: Contact[] = [];
    const errors: Error[] = [];

    try {
      // Parse XML
      const payload = await this.parseXML(xmlContent);

      // Extract leads
      const ltsLeads = this.extractLeads(payload);

      // Convert to internal format
      ltsLeads.forEach((ltsLead, index) => {
        try {
          const contact = this.convertToContact(ltsLead);
          leads.push(contact);
        } catch (error) {
          errors.push(
            new Error(
              `Failed to process lead ${index}: ${error instanceof Error ? error.message : String(error)}`
            )
          );
        }
      });

      return { leads, errors };
    } catch (error) {
      throw new Error(
        `Failed to process LTS webhook: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Verify webhook signature (if AgentWebsite provides one)
   * This is a placeholder - implement according to AgentWebsite's signature method
   */
  verifySignature(
    xmlContent: string,
    signature: string,
    secret: string
  ): boolean {
    // Placeholder for signature verification
    // AgentWebsite may use HMAC-SHA256 or similar
    // Implementation depends on their documentation

    // For now, just return true
    // In production, implement proper verification
    return true;
  }

  /**
   * Generate webhook response XML (if needed)
   */
  generateResponse(result: LTSProcessingResult): string {
    const response = {
      LTSResponse: {
        Success: result.success ? 'true' : 'false',
        LeadID: result.leadId,
        Message: result.message || result.error,
      },
    };

    const xmlBuilder = new xml2js.Builder();
    return xmlBuilder.buildObject(response);
  }
}

/**
 * Create and cache LTS parser instance
 */
let parserInstance: LTSParser | null = null;

export function getLTSParser(): LTSParser {
  if (!parserInstance) {
    parserInstance = new LTSParser();
  }
  return parserInstance;
}
