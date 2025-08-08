import { google } from "googleapis";
import { Readable } from "stream";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function getAuth() {
  const clientEmail = requireEnv("GDRIVE_SERVICE_ACCOUNT_EMAIL");
  let privateKey = requireEnv("GDRIVE_SERVICE_ACCOUNT_PRIVATE_KEY");
  // Support escaped newlines in env var
  privateKey = privateKey.replace(/\\n/g, "\n");
  const subject = process.env.GDRIVE_IMPERSONATE_EMAIL || undefined; // optional domain-wide delegation
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
    subject,
  });
}

export async function uploadBufferToDrive(buffer: Buffer, filename: string, parentFolderId?: string) {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });
  const parents = parentFolderId
    ? [parentFolderId]
    : process.env.GDRIVE_PARENT_FOLDER_ID
    ? [process.env.GDRIVE_PARENT_FOLDER_ID]
    : undefined;

  if (!parents || parents.length === 0) {
    throw new Error(
      "GDRIVE_PARENT_FOLDER_ID is required. Set it to a Shared Drive folder ID and share it with the service account."
    );
  }

  // Validate that the parent is a Shared Drive folder unless using domain-wide delegation
  const folderMeta = await drive.files.get({
    fileId: parents[0],
    fields: "id,name,driveId",
    supportsAllDrives: true,
  });
  const isSharedDrive = Boolean(folderMeta.data.driveId);
  const hasDelegation = Boolean(process.env.GDRIVE_IMPERSONATE_EMAIL);
  if (!isSharedDrive && !hasDelegation) {
    throw new Error(
      "Target folder is not in a Shared Drive. Service accounts lack personal storage; either use a Shared Drive folder or configure domain-wide delegation (set GDRIVE_IMPERSONATE_EMAIL)."
    );
  }

  // Create file
  const created = await drive.files.create({
    requestBody: {
      name: filename,
      parents,
      mimeType: "application/octet-stream",
    },
    media: {
      mimeType: "application/octet-stream",
      body: Readable.from(buffer),
    },
    fields: "id,name",
    supportsAllDrives: true,
  });

  const fileId = created.data.id!;

  // Make file public (anyone with link can view)
  await drive.permissions.create({
    fileId,
    requestBody: { type: "anyone", role: "reader" },
    supportsAllDrives: true,
  });

  const file = await drive.files.get({ fileId, fields: "id,name,webViewLink,webContentLink", supportsAllDrives: true });
  const id = file.data.id!;
  const directUrl = `https://drive.google.com/uc?id=${id}&export=download`;

  return {
    id,
    name: file.data.name!,
    webViewLink: file.data.webViewLink!,
    webContentLink: file.data.webContentLink!,
    directUrl,
  };
}


