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

    // Validate required fields
    if (!formData.name?.trim()) {
      alert('Name is required');
      return;
    }
    if (!formData.email?.trim()) {
      alert('Email is required');
      return;
    }

    // Parse comma-separated fields
    const lead: Contact = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      tags: tagsInput ? tagsInput.split(',').map((t) => t.trim()).filter((t) => t) : undefined,
      campaignIds: campaignInput ? campaignInput.split(',').map((c) => c.trim()).filter((c) => c) : undefined,
      marketIds: marketInput ? marketInput.split(',').map((m) => m.trim()).filter((m) => m) : undefined,
    };

    onAddLead(lead);

    // Reset form
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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Add a Lead</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            placeholder="555-123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            placeholder="Street address"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
            placeholder="City"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            type="text"
            name="state"
            value={formData.state || ''}
            onChange={handleChange}
            placeholder="IL"
            maxLength={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
          />
        </div>

        {/* Zip */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zip
          </label>
          <input
            type="text"
            name="zip"
            value={formData.zip || ''}
            onChange={handleChange}
            placeholder="60601"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Birthday */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Birthday
          </label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <input
            type="text"
            name="type"
            value={formData.type || ''}
            onChange={handleChange}
            placeholder="Lead, Client, etc"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Anniversary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anniversary
          </label>
          <input
            type="date"
            name="anniversary"
            value={formData.anniversary || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Pipeline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pipeline
          </label>
          <input
            type="text"
            name="pipeline"
            value={formData.pipeline || ''}
            onChange={handleChange}
            placeholder="Sales stage"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Texting */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texting
          </label>
          <select
            name="texting"
            value={formData.texting || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select...</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>

      {/* Tags (comma-separated) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="VIP, Hot Lead, Follow-up"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Campaign IDs (comma-separated) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Campaign IDs (comma-separated)
        </label>
        <input
          type="text"
          value={campaignInput}
          onChange={(e) => setCampaignInput(e.target.value)}
          placeholder="CAMP123, CAMP456"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Market IDs (comma-separated) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Market IDs (comma-separated)
        </label>
        <input
          type="text"
          value={marketInput}
          onChange={(e) => setMarketInput(e.target.value)}
          placeholder="MARKET1, MARKET2"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Note */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note
        </label>
        <textarea
          name="note"
          value={formData.note || ''}
          onChange={handleChange}
          placeholder="Additional notes"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Source */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Source
        </label>
        <input
          type="text"
          name="source"
          value={formData.source || ''}
          onChange={handleChange}
          placeholder="How did you get this lead?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
      >
        {isLoading ? 'Adding...' : 'Add Lead'}
      </button>
    </form>
  );
}
