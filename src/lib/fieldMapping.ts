/**
 * Field Mapping Logic
 * Converts between CSV, internal Contact format, and AgentWebsite format
 */

import { Contact, AgentWebsiteContact, CSVRow, CSV_TEMPLATE_HEADERS } from '@/types/contacts';
import { LTSLead, LTS_FIELD_MAPPING } from '@/types/lts';

/**
 * Field mapping configuration for CSV import
 * Users can customize column names, but defaults to template headers
 */
export class FieldMapper {
  private csvColumnMap: Map<string, string>;

  constructor(csvHeaders: string[]) {
    // By default, assume headers match template
    this.csvColumnMap = new Map();
    csvHeaders.forEach((header) => {
      this.csvColumnMap.set(header.toLowerCase(), header);
    });
  }

  /**
   * Convert CSV row to internal Contact format
   */
  csvToContact(row: CSVRow): Contact {
    // Try to find matching columns (case-insensitive)
    const contact: Contact = {
      name: this.getFieldValue(row, ['Name', 'FullName', 'Full Name', 'First Name']) || '',
      email: this.getFieldValue(row, ['Email', 'Email Address', 'E-mail']) || '',
      phone: this.getFieldValue(row, ['Phone', 'PhoneNumber', 'Phone Number', 'Tel']),
      address: this.getFieldValue(row, ['Address', 'Street', 'Street Address']),
      city: this.getFieldValue(row, ['City']),
      state: this.getFieldValue(row, ['State', 'State Code', 'Province']),
      zip: this.getFieldValue(row, ['Zip', 'ZipCode', 'Zip Code', 'Postal Code']),
      birthday: this.getFieldValue(row, ['Birthday', 'BirthDate', 'Birth Date', 'DOB']),
      type: this.getFieldValue(row, ['Type', 'ContactType', 'Contact Type']),
      anniversary: this.getFieldValue(row, ['Anniversary', 'AnniversaryDate']),
      pipeline: this.getFieldValue(row, ['Pipeline', 'Pipeline Stage']),
      texting: this.getFieldValue(row, ['Texting', 'TextOpt']),
      tags: this.parseArray(this.getFieldValue(row, ['Tags', 'Tag'])),
      campaignIds: this.parseArray(this.getFieldValue(row, ['CampaignIDs', 'CampaignID', 'Campaign IDs'])),
      marketIds: this.parseArray(this.getFieldValue(row, ['MarketIDs', 'MarketID', 'Market IDs'])),
      note: this.getFieldValue(row, ['Note', 'Notes', 'Comments', 'Description']),
      source: this.getFieldValue(row, ['Source', 'LeadSource', 'Lead Source']),
    };

    // Parse name into first and last if not separated
    if (contact.name && !contact.firstName && !contact.lastName) {
      const nameParts = contact.name.split(' ');
      if (nameParts.length >= 2) {
        contact.firstName = nameParts[0];
        contact.lastName = nameParts.slice(1).join(' ');
      } else {
        contact.firstName = contact.name;
      }
    }

    return contact;
  }

  /**
   * Convert internal Contact to AgentWebsite format
   */
  contactToAgentWebsite(contact: Contact): AgentWebsiteContact {
    return {
      Name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
      Email: contact.email,
      Phone: contact.phone,
      Address: contact.address,
      City: contact.city,
      State: contact.state,
      Zip: contact.zip,
      Birthday: contact.birthday,
      Type: contact.type,
      Anniversary: contact.anniversary,
      Pipeline: contact.pipeline,
      Texting: contact.texting,
      Tags: contact.tags?.join(','),
      CampaignIDs: contact.campaignIds?.join(','),
      MarketIDs: contact.marketIds?.join(','),
      Note: contact.note,
      Source: contact.source,
    };
  }

  /**
   * Convert LTS XML lead to internal Contact format
   */
  ltsToContact(ltsLead: LTSLead): Contact {
    const contact: Contact = {
      name: ltsLead.Name || '',
      email: ltsLead.Email || '',
      phone: ltsLead.Phone,
      address: ltsLead.Address,
      city: ltsLead.City,
      state: ltsLead.State,
      zip: ltsLead.Zip,
      birthday: ltsLead.Birthday,
      type: ltsLead.Type,
      anniversary: ltsLead.Anniversary,
      pipeline: ltsLead.Pipeline,
      texting: ltsLead.Texting,
      tags: this.parseArray(ltsLead.Tags),
      campaignIds: this.parseArray(ltsLead.CampaignIDs),
      marketIds: this.parseArray(ltsLead.MarketIDs),
      note: ltsLead.Note,
      source: ltsLead.Source,
    };

    return contact;
  }

  /**
   * Helper: Get field value from row (case-insensitive, with fallbacks)
   */
  private getFieldValue(row: CSVRow, fieldNames: string[]): string | undefined {
    for (const fieldName of fieldNames) {
      const value = row[fieldName];
      if (value && value.trim()) {
        return value.trim();
      }
    }
    return undefined;
  }

  /**
   * Helper: Parse comma-separated string into array
   */
  private parseArray(value: string | undefined): string[] | undefined {
    if (!value) return undefined;
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
}

/**
 * Convert Contact to AgentWebsite format (standalone function)
 */
export function contactToAgentWebsite(contact: Contact): AgentWebsiteContact {
  return {
    Name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
    Email: contact.email,
    Phone: contact.phone,
    Address: contact.address,
    City: contact.city,
    State: contact.state,
    Zip: contact.zip,
    Birthday: contact.birthday,
    Type: contact.type,
    Anniversary: contact.anniversary,
    Pipeline: contact.pipeline,
    Texting: contact.texting,
    Tags: contact.tags?.join(','),
    CampaignIDs: contact.campaignIds?.join(','),
    MarketIDs: contact.marketIds?.join(','),
    Note: contact.note,
    Source: contact.source,
  };
}

/**
 * Generate CSV row from Contact (for download/export)
 */
export function contactToCsvRow(contact: Contact): Record<string, string> {
  return {
    Name: contact.name || '',
    Email: contact.email || '',
    Phone: contact.phone || '',
    Address: contact.address || '',
    City: contact.city || '',
    State: contact.state || '',
    Zip: contact.zip || '',
    Birthday: contact.birthday || '',
    Type: contact.type || '',
    Anniversary: contact.anniversary || '',
    Pipeline: contact.pipeline || '',
    Texting: contact.texting || '',
    Tags: contact.tags?.join(',') || '',
    CampaignIDs: contact.campaignIds?.join(',') || '',
    MarketIDs: contact.marketIds?.join(',') || '',
    Note: contact.note || '',
    Source: contact.source || '',
  };
}

/**
 * Create empty template row
 */
export function createTemplateRow(): Record<string, string> {
  const row: Record<string, string> = {};
  CSV_TEMPLATE_HEADERS.forEach((header) => {
    row[header] = '';
  });
  return row;
}
