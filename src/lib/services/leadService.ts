/**
 * Lead Service
 * Handles lead operations, filtering, bulk actions, etc.
 */

import { prisma } from '@/lib/prisma';

/**
 * Filter leads by multiple criteria
 */
export async function filterLeads(
  userId: string,
  filters: {
    search?: string;
    tags?: string[];
    sources?: string[];
    pipeline?: string;
    engagement?: string;
  },
  skip = 0,
  take = 50
) {
  const where: any = { userId };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { phone: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags };
  }

  if (filters.sources && filters.sources.length > 0) {
    where.source = { in: filters.sources };
  }

  if (filters.pipeline) {
    where.pipeline = filters.pipeline;
  }

  if (filters.engagement) {
    where.engagementRating = filters.engagement;
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.lead.count({ where }),
  ]);

  return { leads, total };
}

/**
 * Update lead engagement rating
 */
export async function updateEngagementRating(
  leadId: string,
  rating: 'Hot' | 'Warm' | 'Cold'
) {
  return prisma.lead.update({
    where: { id: leadId },
    data: { engagementRating: rating },
  });
}

/**
 * Add tags to lead
 */
export async function addTagsToLead(leadId: string, tags: string[]) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) throw new Error('Lead not found');

  const newTags = Array.from(new Set([...(lead.tags || []), ...tags]));

  return prisma.lead.update({
    where: { id: leadId },
    data: { tags: newTags },
  });
}

/**
 * Remove tags from lead
 */
export async function removeTagsFromLead(leadId: string, tags: string[]) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) throw new Error('Lead not found');

  const newTags = (lead.tags || []).filter(t => !tags.includes(t));

  return prisma.lead.update({
    where: { id: leadId },
    data: { tags: newTags },
  });
}

/**
 * Bulk update leads
 */
export async function bulkUpdateLeads(
  leadIds: string[],
  updateData: any
) {
  const promises = leadIds.map(id =>
    prisma.lead.update({
      where: { id },
      data: updateData,
    })
  );

  return Promise.all(promises);
}

/**
 * Bulk delete leads
 */
export async function bulkDeleteLeads(leadIds: string[]) {
  return prisma.lead.deleteMany({
    where: { id: { in: leadIds } },
  });
}

/**
 * Export leads as CSV data
 */
export async function exportLeads(userId: string) {
  const leads = await prisma.lead.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Convert to CSV format
  const headers = [
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
  ];

  const rows = leads.map(lead => [
    lead.name,
    lead.email,
    lead.phone || '',
    lead.address || '',
    lead.city || '',
    lead.state || '',
    lead.zip || '',
    lead.birthday || '',
    lead.type || '',
    lead.anniversary || '',
    lead.pipeline || '',
    lead.texting || '',
    (lead.tags || []).join(','),
    (lead.campaignIds || []).join(','),
    (lead.marketIds || []).join(','),
    lead.note || '',
    lead.source || '',
  ]);

  return { headers, rows, leads };
}

/**
 * Get lead statistics
 */
export async function getLeadStats(userId: string) {
  const leads = await prisma.lead.findMany({
    where: { userId },
  });

  const stats = {
    total: leads.length,
    byEngagement: {
      hot: leads.filter(l => l.engagementRating === 'Hot').length,
      warm: leads.filter(l => l.engagementRating === 'Warm').length,
      cold: leads.filter(l => l.engagementRating === 'Cold').length,
    },
    bySource: {} as Record<string, number>,
    byPipeline: {} as Record<string, number>,
  };

  leads.forEach(lead => {
    if (lead.source) {
      stats.bySource[lead.source] = (stats.bySource[lead.source] || 0) + 1;
    }
    if (lead.pipeline) {
      stats.byPipeline[lead.pipeline] =
        (stats.byPipeline[lead.pipeline] || 0) + 1;
    }
  });

  return stats;
}

/**
 * Get upcoming birthdays/anniversaries
 */
export async function getUpcomingDates(
  userId: string,
  daysAhead: number = 30
) {
  const leads = await prisma.lead.findMany({
    where: { userId },
  });

  const today = new Date();
  const cutoff = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const upcoming = [];

  for (const lead of leads) {
    const checkDates = [
      { type: 'birthday', date: lead.birthday },
      { type: 'anniversary', date: lead.anniversary },
    ];

    for (const { type, date } of checkDates) {
      if (!date) continue;

      // Parse date (assume YYYY-MM-DD format)
      const [, month, day] = date.split('-');
      const eventDate = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));

      // If event has passed this year, check next year
      if (eventDate < today) {
        eventDate.setFullYear(eventDate.getFullYear() + 1);
      }

      if (eventDate <= cutoff) {
        upcoming.push({
          type,
          lead,
          date: eventDate,
          daysUntil: Math.floor(
            (eventDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
          ),
        });
      }
    }
  }

  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}
