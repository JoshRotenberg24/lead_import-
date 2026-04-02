# Lead Import Tool - Form-Based

A web application for adding leads and exporting as CSV for AgentWebsite import.

## Features

### Lead Entry
- Form-based interface for individual lead entry
- 17 fields per lead (Name, Email, Phone, Address, City, State, Zip, Birthday, Type, Anniversary, Pipeline, Texting, Tags, CampaignIDs, MarketIDs, Note, Source)
- Real-time validation
- Duplicate email detection

### Lead Management
- View all added leads in a table
- Remove individual leads
- Clear all leads at once
- Live count of total leads

### Export
- Download leads as CSV
- Formatted for AgentWebsite Control Panel import
- Timestamp in filename

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Deployment

### Vercel (Recommended for Next.js)

1. Push to GitHub
2. Go to https://vercel.com/new
3. Import this repository
4. Deploy (automatic)

App will be live with auto-deployments on push.

## Workflow

1. Fill out lead form with contact details
2. Click "Add Lead" to add to list
3. Repeat for each lead (or add one at a time)
4. Review leads in the preview table
5. Click "Download CSV" when done
6. Log into AgentWebsite Control Panel
7. Use Import function to upload the CSV file

## Architecture

```
app/
  ├── page.tsx           # Main lead entry page
  ├── layout.tsx         # Layout wrapper
  └── api/
      ├── template/      # Template CSV download
      ├── process-csv/   # CSV validation (legacy)
      └── webhooks/lts/  # LTS webhook receiver (optional)

src/
  ├── components/
  │   ├── LeadForm.tsx   # Lead entry form
  │   ├── CSVPreview.tsx # Table preview (legacy)
  │   └── FileUpload.tsx # File upload (legacy)
  ├── lib/
  │   ├── fieldMapping.ts    # Field conversion logic
  │   ├── csvProcessor.ts    # CSV validation (legacy)
  │   └── ltsParser.ts       # LTS webhook parser
  └── types/
      ├── contacts.ts    # Contact interfaces
      ├── validation.ts  # Validation helpers
      └── lts.ts         # LTS webhook types
```

## Notes

- AgentWebsite's LTS API is one-way outbound only
- Final import to AgentWebsite must be done manually in Control Panel
- This tool prepares the data for that step
