'use client';

import { useState } from 'react';
import { Contact } from '@/types/contacts';

interface LeadFormProps {
  onAddLead: (lead: Contact) => void;
  isLoading?: boolean;
}

export default function LeadForm({ onAddLead, isLoading = false }: LeadFormProps) {
  const [formData, setFormData] = useState<Contact>({
    name: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    birthday: '',
    type: '',
    anniversary: '',
    pipeline: '',
    texting: '',
    tags: [],
    campaignIds: [],
    marketIds: [],
    note: '',
    source: '',
  });

  const [tagsInput, setTagsInput] = useState('');
  const [campaignInput, setCampaignInput] = useState('');
  const [marketInput, setMarketInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      alert('Name is required');
      return;
    }
    if (!formData.email?.trim()) {
      alert('Email is required');
      return;
    }

    const lead: Contact = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      tags: tagsInput ? tagsInput.split(',').map((t) => t.trim()).filter((t) => t) : undefined,
      campaignIds: campaignInput ? campaignInput.split(',').map((c) => c.trim()).filter((c) => c) : undefined,
      marketIds: marketInput ? marketInput.split(',').map((m) => m.trim()).filter((m) => m) : undefined,
    };

    onAddLead(lead);

    setFormData({
      name: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      birthday: '',
      type: '',
      anniversary: '',
      pipeline: '',
      texting: '',
      tags: [],
      campaignIds: [],
      marketIds: [],
      note: '',
      source: '',
    });
    setTagsInput('');
    setCampaignInput('');
    setMarketInput('');
  };

  const FormField = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );

  const InputField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean }) => {
    const { label, required, ...inputProps } = props;
    return (
      <FormField label={label} required={required}>
        <input
          {...inputProps}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
        />
      </FormField>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">📝 Add a Lead</h2>
        <p className="text-gray-600 mt-2 text-sm">Fill in the details below. Name & Email are required.</p>
      </div>

      {/* Required Fields Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-8 border border-indigo-100">
        <h3 className="text-sm font-semibold text-indigo-900 mb-4 flex items-center gap-2">
          <span>⭐</span> Required Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="e.g., John Smith"
            required
          />
          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="e.g., john@example.com"
            required
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📞</span> Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            placeholder="555-123-4567"
          />
          <InputField
            label="Address"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            placeholder="Street address"
          />
          <InputField
            label="City"
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
            placeholder="City"
          />
          <InputField
            label="State"
            name="state"
            value={formData.state || ''}
            onChange={handleChange}
            placeholder="IL"
            maxLength={2}
          />
          <InputField
            label="Zip"
            name="zip"
            value={formData.zip || ''}
            onChange={handleChange}
            placeholder="60601"
          />
        </div>
      </div>

      {/* Personal Details */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🎂</span> Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Birthday"
            type="date"
            name="birthday"
            value={formData.birthday || ''}
            onChange={handleChange}
          />
          <InputField
            label="Anniversary"
            type="date"
            name="anniversary"
            value={formData.anniversary || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Business Information */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>💼</span> Business Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Type"
            name="type"
            value={formData.type || ''}
            onChange={handleChange}
            placeholder="e.g., Lead, Client"
          />
          <InputField
            label="Pipeline"
            name="pipeline"
            value={formData.pipeline || ''}
            onChange={handleChange}
            placeholder="e.g., Qualified, Negotiating"
          />
          <div>
            <FormField label="Texting">
              <select
                name="texting"
                value={formData.texting || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all text-gray-900"
              >
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </FormField>
          </div>
          <InputField
            label="Source"
            name="source"
            value={formData.source || ''}
            onChange={handleChange}
            placeholder="e.g., Website, Referral"
          />
        </div>
      </div>

      {/* Campaign & Market */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🎯</span> Campaigns & Markets
        </h3>
        <div className="grid grid-cols-1 gap-5">
          <FormField label="Tags">
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Comma-separated: VIP, Hot Lead, Follow-up"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
            />
          </FormField>
          <FormField label="Campaign IDs">
            <input
              type="text"
              value={campaignInput}
              onChange={(e) => setCampaignInput(e.target.value)}
              placeholder="Comma-separated: CAMP123, CAMP456"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
            />
          </FormField>
          <FormField label="Market IDs">
            <input
              type="text"
              value={marketInput}
              onChange={(e) => setMarketInput(e.target.value)}
              placeholder="Comma-separated: MARKET1, MARKET2"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
            />
          </FormField>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📝</span> Additional Notes
        </h3>
        <FormField label="Note">
          <textarea
            name="note"
            value={formData.note || ''}
            onChange={handleChange}
            placeholder="Any additional information..."
            rows={3}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
          />
        </FormField>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
      >
        {isLoading ? '⏳ Adding Lead...' : '✨ Add Lead'}
      </button>
    </form>
  );
}
