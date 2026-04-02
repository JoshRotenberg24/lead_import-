/**
 * LTS (Lead Transmission Standard) XML structures
 * For receiving webhook data from AgentWebsite
 */

/**
 * LTS Webhook Payload - Root XML structure from AgentWebsite
 */
export interface LTSWebhookPayload {
  LTS: LTSRoot;
}

/**
 * LTS Root element
 */
export interface LTSRoot {
  Lead?: LTSLead[];
}

/**
 * Individual Lead in LTS format
 */
export interface LTSLead {
  [key: string]: any; // Dynamic fields from AgentWebsite
  Name?: string;
  Email?: string;
  Phone?: string;
  Address?: string;
  City?: string;
  State?: string;
  Zip?: string;
  Birthday?: string;
  Type?: string;
  Anniversary?: string;
  Pipeline?: string;
  Texting?: string;
  Tags?: string;
  CampaignIDs?: string;
  MarketIDs?: string;
  Note?: string;
  Source?: string;
}

/**
 * LTS Field Mapping
 * Maps AgentWebsite field names to internal Contact format
 */
export const LTS_FIELD_MAPPING: Record<string, string> = {
  Name: 'name',
  Email: 'email',
  Phone: 'phone',
  Address: 'address',
  City: 'city',
  State: 'state',
  Zip: 'zip',
  Birthday: 'birthday',
  Type: 'type',
  Anniversary: 'anniversary',
  Pipeline: 'pipeline',
  Texting: 'texting',
  Tags: 'tags',
  CampaignIDs: 'campaignIds',
  MarketIDs: 'marketIds',
  Note: 'note',
  Source: 'source',
};

/**
 * LTS Webhook Signature - for authentication
 */
export interface LTSWebhookSignature {
  signature?: string;
  timestamp?: string;
  nonce?: string;
}

/**
 * LTS Processing Result
 */
export interface LTSProcessingResult {
  success: boolean;
  leadId?: string;
  error?: string;
  message?: string;
}
