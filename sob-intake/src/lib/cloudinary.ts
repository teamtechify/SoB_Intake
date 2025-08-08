import { v2 as cloudinary } from "cloudinary";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

let configured = false;
export function ensureCloudinaryConfigured() {
  if (configured) return;
  cloudinary.config({
    cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: requireEnv("CLOUDINARY_API_KEY"),
    api_secret: requireEnv("CLOUDINARY_API_SECRET"),
    secure: true,
  });
  configured = true;
}

export async function uploadBufferToCloudinary(buffer: Buffer, filename: string, folder = "sob-intake") {
  ensureCloudinaryConfigured();

  // Cloudinary upload via upload_stream
  const stream = () =>
    new Promise<{ url: string; secure_url: string; public_id: string; resource_type: string }>((resolve, reject) => {
      const uploader = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename.replace(/[^a-zA-Z0-9-_\.]/g, "-") + "-" + Date.now(),
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Cloudinary upload failed"));
          resolve({
            url: result.url!,
            secure_url: result.secure_url!,
            public_id: result.public_id!,
            resource_type: result.resource_type!,
          });
        }
      );
      uploader.end(buffer);
    });

  return stream();
}


