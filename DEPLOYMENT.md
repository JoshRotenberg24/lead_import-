# CSV Contact Import Tool - Deployment Guide

## Overview
This is a Next.js application for validating and formatting CSV contact files for AgentWebsite import.

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to access the tool.

## Production Build

```bash
npm run build
npm start
```

## Environment Variables

For LTS webhook support (optional):
```
LTS_WEBHOOK_SECRET=your_secret_here
NEXT_PUBLIC_WEBHOOK_URL=https://yourapp.com/api/webhooks/lts
```

## Features

- **CSV Upload** - Drag-and-drop or click to upload
- **Validation** - Email, phone, required fields, duplicates
- **Formatting** - Auto-formats to AgentWebsite spec
- **Error Reporting** - Download failed records for fixing
- **Webhook** - Optional LTS receiver for AgentWebsite leads

## Workflow

1. Client downloads CSV template
2. Fills in contact data
3. Uploads CSV file to our tool
4. App validates and formats data
5. Client downloads cleaned CSV
6. Client uploads to AgentWebsite Control Panel

## Architecture

- `src/types/` - TypeScript interfaces
- `src/lib/` - Core logic (CSV, LTS, field mapping)
- `src/components/` - React UI components
- `app/api/` - API routes (process, download, template)
- `app/page.tsx` - Main upload interface

## Notes

AgentWebsite's LTS API is one-way outbound. The final import to AgentWebsite must be done manually in the Control Panel, but this tool significantly simplifies data preparation.
