/**
 * Contact/Lead Interface - Internal standardized format
 * Used across CSV import, LTS webhook, and internal processing
 */

import { ValidationError } from './validation';

export interface Contact {
  // Core fields
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;

  // Address fields
  address?: string;
  city?: string;
  state?: string;
  zip?: string;

  // Additional fields
  birthday?: string; // ISO date format: YYYY-MM-DD
  type?: string; // Contact type (e.g., Lead, Client)
  anniversary?: string; // ISO date format: YYYY-MM-DD
  pipeline?: string; // Sales pipeline stage
  texting?: string; // Texting opt-in status
  tags?: string[]; // Array of tags
  campaignIds?: string[]; // Campaign IDs
  marketIds?: string[]; // Market IDs
  note?: string; // Notes/description
  source?: string; // Lead source

  // New fields for better CRM tracking
  engagementRating?: string; // Hot/Warm/Cold
  dateMet?: string; // When you met them (ISO date)
  dateCreated?: string; // When lead was created (ISO date)
  leadSource?: string; // Where lead came from

  // Metadata
  id?: string; // Internal ID if from AgentWebsite
  createdAt?: string;
  updatedAt?: string;
}

/**
 * CSV Import Row - What user uploads
 * Column names flexible, mapping configured separately
 */
export interface CSVRow {
  [key: string]: string | undefined;
}

/**
 * AgentWebsite Contact Format
 * Matches AgentWebsite's expected column names for Control Panel import
 */
export interface AgentWebsiteContact {
  Name: string;
  Email: string;
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
  EngagementRating?: string;
  DateMet?: string;
  DateCreated?: string;
  LeadSource?: string;
}

/**
 * CSV Template - Default column structure
 */
export const CSV_TEMPLATE_HEADERS = [
  'Name',
  'Email',
  'Phone',
  'Address',
  'City',
  'State',
  'Zip',
  'Birthday',
  'Type',
  'Anniversary',
  'Pipeline',
  'Texting',
  'Tags',
  'CampaignIDs',
  'MarketIDs',
  'Note',
  'Source',
  'LeadSource',
  'EngagementRating',
  'DateMet',
  'DateCreated',
];

/**
 * Upload result summary
 */
export interface UploadResult {
  totalRows: number;
  validRows: number;
  invalidRows: ValidationError[];
  cleanedData: AgentWebsiteContact[];
  duplicateEmails: string[];
}
