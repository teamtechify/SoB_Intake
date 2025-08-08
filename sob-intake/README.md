This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Airtable Integration

This project can store onboarding submissions in Airtable via the REST API.

1. Create a `.env.local` file in the project root with the following keys:

```
AIRTABLE_API_KEY=your_airtable_pat
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=Intake
# Optional: control how attachments are sent. Use 'attachment' if your Airtable has an Attachment field named 'Attachments'.
# Otherwise set to 'text' and create a Long text field named 'Attachment URLs (text)'.
AIRTABLE_ATTACHMENTS_MODE=attachment # or text
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
STORAGE_PROVIDER=gdrive # or cloudinary
GDRIVE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GDRIVE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GDRIVE_PARENT_FOLDER_ID=xxxxxxxxxxxxxxxxxxxx
# Optional: If using domain-wide delegation with a Workspace admin/user
# GDRIVE_IMPERSONATE_EMAIL=user@yourdomain.com
```

2. In Airtable, create a base and table (e.g., `Intake`) with fields that match the mapping in `src/lib/airtable.ts`. You can adjust field names in that file to match your schema.

3. The form posts to `/api/submit`, which parses the form, uploads files to Google Drive (default) or Cloudinary based on `STORAGE_PROVIDER`, and calls Airtable. Airtable receives public URLs in an `Attachments` field; set that field type to “Attachment”.

### Google Drive setup notes
- Service accounts do not have personal storage quotas. Prefer a Shared Drive folder.
- Create or pick a Shared Drive, create an upload folder in it, and share the folder (or the whole drive) with the service account as Content manager. Use that folder’s ID as `GDRIVE_PARENT_FOLDER_ID`.
- If your org requires it, configure domain‑wide delegation and set `GDRIVE_IMPERSONATE_EMAIL` to an account with access.

4. Example cURL (JSON submission):

```bash
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Acme Inc.",
    "contactName": "Jane Doe",
    "email": "jane@acme.com"
  }'
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
