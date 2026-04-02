/**
 * Dropdown options management
 * Stores and manages available options for Tags, Sources, Campaigns, Markets, etc.
 */

export interface DropdownOptions {
  tags: string[];
  sources: string[];
  engagementRatings: string[];
  campaignIds: string[];
  marketIds: string[];
  types: string[];
}

const STORAGE_KEY = 'lead_tool_options';

// Default options
const DEFAULT_OPTIONS: DropdownOptions = {
  tags: ['Open House', 'Hot Lead', 'Warm Lead', 'Cold Lead', 'Follow-up', 'VIP'],
  sources: ['Website', 'Referral', 'Phone', 'Email', 'Open House', 'Past Client', 'Social Media', 'Other'],
  engagementRatings: ['Hot', 'Warm', 'Cold', 'Unqualified'],
  campaignIds: [],
  marketIds: [],
  types: ['Lead', 'Client', 'Past Client', 'Prospect'],
};

/**
 * Get all dropdown options from localStorage or defaults
 */
export function getOptions(): DropdownOptions {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading options from localStorage:', error);
  }
  return DEFAULT_OPTIONS;
}

/**
 * Save options to localStorage
 */
export function saveOptions(options: DropdownOptions): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  } catch (error) {
    console.error('Error saving options to localStorage:', error);
  }
}

/**
 * Add a new option to a category
 */
export function addOption(category: keyof DropdownOptions, value: string): void {
  if (!value.trim()) return;

  const options = getOptions();
  const category_array = options[category];

  if (!category_array.includes(value)) {
    category_array.push(value);
    saveOptions(options);
  }
}

/**
 * Remove an option from a category
 */
export function removeOption(category: keyof DropdownOptions, value: string): void {
  const options = getOptions();
  options[category] = options[category].filter((item) => item !== value);
  saveOptions(options);
}

/**
 * Reset to defaults
 */
export function resetToDefaults(): void {
  saveOptions(DEFAULT_OPTIONS);
}
