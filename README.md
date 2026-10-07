# NeedaJob

A React and Vite job application tracker with a Frutiger Aero interface, light and dark themes, and mobile layouts.

## Features

- Dashboard, applications, pipeline, and analytics
- Calendar events and reminders
- Reusable document library and resume versions
- Browser-based PDF text extraction and deterministic resume matching
- Supabase authentication, database, and file storage

## Local setup

1. Install Node.js compatible with the installed Vite release and npm.
2. Run `npm ci`.
3. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and publishable key.
4. Configure your Supabase tables, storage buckets, and access policies. Files in `supabase/migrations` contain incremental changes to an existing database; they are not a complete initial schema.
5. Run `npm run dev`.

Never put a Supabase service role key in a `VITE_` variable. These variables are included in the browser bundle.

## Checks

```sh
npm run lint
npm test
npm run build
```

Run `npm run preview` to preview the production build.

Local environment files, dependencies, and generated build output are excluded from Git. Commit `package-lock.json` for reproducible installs.

## Prototype Beta

NeedaJob is currently being tested. Features may change and occasional bugs may occur. Avoid uploading highly sensitive documents or information during this testing period.

Created by Rendy Prasetyo. All rights reserved.
