/**
 * CSV Processing Logic
 * Handles parsing, validation, formatting, and deduplication
 */

import Papa from 'papaparse';
import { Contact, AgentWebsiteContact, CSVRow, UploadResult, CSV_TEMPLATE_HEADERS } from '@/types/contacts';
import { ValidationError } from '@/types/validation';
import { isValidEmail, isValidPhone, isValidState, isValidDate, isValidZip } from '@/types/validation';
import { FieldMapper, contactToAgentWebsite, contactToCsvRow } from './fieldMapping';

/**
 * Main CSV processor class
 */
export class CSVProcessor {
  private fieldMapper: FieldMapper;

  constructor(csvHeaders: string[]) {
    this.fieldMapper = new FieldMapper(csvHeaders);
  }

  /**
   * Parse CSV file content
   */
  async parseCSV(fileContent: string): Promise<CSVRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          } else {
            resolve(results.data as CSVRow[]);
          }
        },
        error: (error: unknown) => {
          reject(error);
        },
      });
    });
  }

  /**
   * Process uploaded CSV file
   * 1. Parse CSV
   * 2. Convert to internal Contact format
   * 3. Validate
   * 4. Convert to AgentWebsite format
   * 5. Deduplicate
   * 6. Return results
   */
  async processFile(fileContent: string): Promise<UploadResult> {
    // Step 1: Parse
    const csvRows = await this.parseCSV(fileContent);

    // Step 2: Convert to Contact format and validate
    const validatedRows: { contact: Contact; awContact: AgentWebsiteContact; rowIndex: number }[] = [];
    const validationErrors: ValidationError[] = [];
    const emailSet = new Set<string>();
    const duplicateEmails = new Set<string>();

    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i];
      const contact = this.fieldMapper.csvToContact(row);

      // Validate contact
      const errors = this.validateContact(contact, i);
      if (errors.length > 0) {
        validationErrors.push(...errors);
        continue;
      }

      // Check for duplicates within this batch
      if (contact.email) {
        if (emailSet.has(contact.email.toLowerCase())) {
          duplicateEmails.add(contact.email);
          validationErrors.push({
            rowIndex: i,
            field: 'Email',
            value: contact.email,
            error: 'Duplicate email in this batch',
          });
          continue;
        }
        emailSet.add(contact.email.toLowerCase());
      }

      // Convert to AgentWebsite format
      const awContact = contactToAgentWebsite(contact);
      validatedRows.push({ contact, awContact, rowIndex: i });
    }

    // Step 4: Extract cleaned data
    const cleanedData = validatedRows.map((item) => item.awContact);

    return {
      totalRows: csvRows.length,
      validRows: validatedRows.length,
      invalidRows: validationErrors,
      cleanedData,
      duplicateEmails: Array.from(duplicateEmails),
    };
  }

  /**
   * Validate a single contact
   */
  private validateContact(contact: Contact, rowIndex: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required: Name
    if (!contact.name || contact.name.trim() === '') {
      errors.push({
        rowIndex,
        field: 'Name',
        value: contact.name || '',
        error: 'Name is required',
      });
    }

    // Required: Email
    if (!contact.email || contact.email.trim() === '') {
      errors.push({
        rowIndex,
        field: 'Email',
        value: contact.email || '',
        error: 'Email is required',
      });
    } else if (!isValidEmail(contact.email)) {
      errors.push({
        rowIndex,
        field: 'Email',
        value: contact.email,
        error: 'Invalid email format',
      });
    }

    // Optional: Phone (validate format if provided)
    if (contact.phone && contact.phone.trim() !== '' && !isValidPhone(contact.phone)) {
      errors.push({
        rowIndex,
        field: 'Phone',
        value: contact.phone,
        error: 'Invalid phone format (need at least 10 digits)',
      });
    }

    // Optional: State (validate if provided)
    if (contact.state && contact.state.trim() !== '' && !isValidState(contact.state)) {
      errors.push({
        rowIndex,
        field: 'State',
        value: contact.state,
        error: 'Invalid US state abbreviation',
      });
    }

    // Optional: Zip (validate format if provided)
    if (contact.zip && contact.zip.trim() !== '' && !isValidZip(contact.zip)) {
      errors.push({
        rowIndex,
        field: 'Zip',
        value: contact.zip,
        error: 'Invalid ZIP code format (5 or 9 digits)',
      });
    }

    // Optional: Birthday (validate date format if provided)
    if (contact.birthday && contact.birthday.trim() !== '' && !isValidDate(contact.birthday)) {
      errors.push({
        rowIndex,
        field: 'Birthday',
        value: contact.birthday,
        error: 'Invalid date format (use YYYY-MM-DD)',
      });
    }

    // Optional: Anniversary (validate date format if provided)
    if (contact.anniversary && contact.anniversary.trim() !== '' && !isValidDate(contact.anniversary)) {
      errors.push({
        rowIndex,
        field: 'Anniversary',
        value: contact.anniversary,
        error: 'Invalid date format (use YYYY-MM-DD)',
      });
    }

    return errors;
  }

  /**
   * Generate CSV string from contacts (for download)
   */
  generateCSV(contacts: AgentWebsiteContact[]): string {
    const rows = [CSV_TEMPLATE_HEADERS];

    contacts.forEach((contact) => {
      rows.push([
        contact.Name || '',
        contact.Email || '',
        contact.Phone || '',
        contact.Address || '',
        contact.City || '',
        contact.State || '',
        contact.Zip || '',
        contact.Birthday || '',
        contact.Type || '',
        contact.Anniversary || '',
        contact.Pipeline || '',
        contact.Texting || '',
        contact.Tags || '',
        contact.CampaignIDs || '',
        contact.MarketIDs || '',
        contact.Note || '',
        contact.Source || '',
      ]);
    });

    return Papa.unparse(rows);
  }

  /**
   * Generate CSV string from validation errors (for failed records download)
   */
  generateErrorCSV(errors: ValidationError[]): string {
    const headers = ['Row #', 'Field', 'Value', 'Error'];
    const rows = [headers];

    errors.forEach((error) => {
      rows.push([
        String(error.rowIndex + 1),
        error.field,
        error.value,
        error.error,
      ]);
    });

    return Papa.unparse(rows);
  }
}

/**
 * Factory function to create CSV processor
 */
export function createCSVProcessor(fileContent: string): CSVProcessor {
  // Extract headers from file
  const firstLine = fileContent.split('\n')[0];
  const headers = Papa.parse(firstLine).data[0] as string[];

  return new CSVProcessor(headers);
}
