# Storage Integration Setup Guide

## Quick Start

### 1. Configure Storage Provider (Admin Only)

1. Go to `http://localhost:3000/admin/settings/storage`
2. Select your preferred storage provider:
   - **Local** (default, no setup needed)
   - **AWS S3** (requires AWS credentials)
   - **Uploadthing** (requires API key)
   - **Vercel Blob** (requires Vercel token)
3. Fill in the configuration
4. Click "Save Settings"

### 2. Use in Components

#### For Image Uploads:
```tsx
import { ImageUploadWithStorage } from "@/components/common/ImageUploadWithStorage";

<ImageUploadWithStorage
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  maxSizeMB={5}
  accept="image/*"
/>
```

#### For Generic File Uploads:
```tsx
import { useUpload } from "@/lib/storage";

const { upload, uploading, progress, error } = useUpload();

const handleUpload = async (file: File) => {
  const result = await upload(file);
  if (result) {
    console.log("File URL:", result.url);
    // Save result.url to your database
  }
};
```

## Provider Setup Instructions

### Local (Default)
**No setup required!** Files are stored in `public/uploads/`.

```bash
# Directory is auto-created, just ensure it's writable
chmod -R 755 public/uploads
```

### AWS S3

#### Step 1: Create AWS Account & S3 Bucket
```bash
# Create bucket (replace with your bucket name)
aws s3 mb s3://my-app-uploads --region us-east-1

# Enable public read access (optional, for public files)
aws s3api put-bucket-acl --bucket my-app-uploads --acl public-read
```

#### Step 2: Create IAM User for App
```bash
# Create user
aws iam create-user --user-name my-app-uploads

# Attach S3 policy
aws iam attach-user-policy \
  --user-name my-app-uploads \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Create access key
aws iam create-access-key --user-name my-app-uploads
```

Copy the `AccessKeyId` and `SecretAccessKey` from the output.

#### Step 3: Configure in Admin Settings
1. Go to `/admin/settings/storage`
2. Select "AWS S3 (or Compatible)"
3. Fill in:
   - **S3 Bucket Name:** `my-app-uploads`
   - **AWS Region:** `us-east-1` (or your region)
   - **Access Key ID:** (from above)
   - **Secret Access Key:** (from above)
4. Click "Save Settings"

#### Step 4 (Production): Set Environment Variables
```env
# .env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

### Uploadthing

#### Step 1: Create Account
1. Go to https://uploadthing.com
2. Sign up with GitHub or email
3. Create an app

#### Step 2: Get API Key
1. Go to your app dashboard
2. Click Settings → API Keys
3. Copy your secret key

#### Step 3: Configure in Admin Settings
1. Go to `/admin/settings/storage`
2. Select "Uploadthing"
3. Paste the API key
4. Click "Save Settings"

### Vercel Blob

#### Step 1: Deploy to Vercel
Your app must be deployed to Vercel to use Vercel Blob.

#### Step 2: Create Blob Storage
1. Go to your project on Vercel
2. Go to Settings → Storage
3. Click "Create" → Blob
4. Name it (e.g., `app-uploads`)

#### Step 3: Get Token
1. Go to Settings → Storage
2. Click on your blob store
3. Copy the token

#### Step 4: Configure in Admin Settings
1. Go to `/admin/settings/storage`
2. Select "Vercel Blob"
3. Paste the token
4. Click "Save Settings"

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           Frontend Component                      │
│  (ImageUploadWithStorage or useUpload hook)     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│        Storage Service (libs/storage.ts)        │
│  - Loads admin settings from /api/admin/settings│
│  - Routes to appropriate provider               │
│  - Handles upload progress                      │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┬──────────────┬────────────┐
        ▼                     ▼              ▼            ▼
    ┌─────────┐         ┌─────────┐    ┌──────────┐  ┌──────────┐
    │  Local  │         │   S3    │    │Uploadthing  Vercel Blob
    │ Filesystem       │ Presigned       │
    │        │          │  URL    │    │
    └─────────┘         └─────────┘    └──────────┘  └──────────┘
        │                   │              │            │
        └─────────┬─────────┴──────────┬───┴───────┬────┘
                  ▼
           ┌─────────────────┐
           │  Admin Settings │ (Prisma DB)
           │  Configuration  │
           └─────────────────┘
```

## API Endpoints

### Frontend → Backend Routes

```
POST /api/upload/local
  - Body: FormData with 'file' field
  - Returns: { url, filename, size, mimeType }

POST /api/upload/s3/presigned-url
  - Body: { filename, contentType, contentLength }
  - Returns: { url, publicUrl }
  - Frontend then PUTs to the presigned URL

POST /api/upload/uploadthing
  - Body: FormData with 'file' field
  - Returns: { url, filename, size, mimeType }

POST /api/upload/vercel-blob
  - Body: FormData with 'file' field
  - Returns: { url, filename, size, mimeType }

DELETE /api/upload/delete
  - Body: { url, provider }
  - Returns: { success: true }
```

## Code Examples

### Example 1: User Profile Avatar Upload

```tsx
import { useState } from "react";
import { ImageUploadWithStorage } from "@/components/common/ImageUploadWithStorage";
import { apiUpdateProfile } from "@/lib/api";

export function AvatarUpload() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = async (url: string | null) => {
    setAvatarUrl(url);
    if (url) {
      setSaving(true);
      try {
        await apiUpdateProfile({ avatarUrl: url });
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div>
      <ImageUploadWithStorage
        value={avatarUrl}
        onChange={handleAvatarChange}
        accept="image/png,image/jpeg,image/webp"
        maxSizeMB={2}
        previewShape="circle"
        disabled={saving}
      />
    </div>
  );
}
```

### Example 2: Bulk Document Upload

```tsx
import { useUpload } from "@/lib/storage";
import { useState } from "react";

export function DocumentUploader() {
  const { upload, uploading, progress, error } = useUpload();
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      const result = await upload(file);
      if (result) {
        setUploadedDocs(prev => [...prev, result.url]);
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading... {progress}%</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      
      {uploadedDocs.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
          Document {i + 1}
        </a>
      ))}
    </div>
  );
}
```

### Example 3: CMS Image Insert

```tsx
import { useUpload } from "@/lib/storage";
import { Button } from "@/components/ui/Button";

export function CMSImageInsert({ onImageInsert }) {
  const { upload, uploading } = useUpload();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload(file);
    if (result) {
      onImageInsert({
        src: result.url,
        alt: file.name.split(".")[0],
        title: file.name,
      });
    }
  };

  return (
    <label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
        disabled={uploading}
      />
      <Button disabled={uploading}>
        {uploading ? "Uploading..." : "Insert Image"}
      </Button>
    </label>
  );
}
```

## Switching Providers Without Data Loss

Since each provider has different URL formats, switching providers won't automatically migrate files:

1. **Local** → URLs start with `/uploads/filename`
2. **S3** → URLs like `https://bucket.s3.region.amazonaws.com/...`
3. **Uploadthing** → URLs like `https://uploadthing.com/...`
4. **Vercel Blob** → URLs like `https://blob.vercel-storage.com/...`

**Solution:**
- Create a migration script to reupload files to the new provider
- Update all URLs in your database
- Or keep both providers active temporarily

## Troubleshooting

### Upload fails with "Storage settings not found"
- Ensure you've configured storage in `/admin/settings/storage`
- Check that the settings were saved successfully

### S3 upload returns "Access Denied"
- Verify AWS credentials in admin settings
- Check bucket name and region are correct
- Ensure IAM user has S3 permissions

### Uploadthing errors
- Verify API key is correct
- Check that API key is for the right app
- Ensure Uploadthing account is active

### Files stored but URLs broken
- Check that `/public/uploads` directory exists (local)
- Verify S3 bucket is accessible and public (if needed)
- Check CORS settings for cross-origin access

### TypeScript errors with storage service
```bash
# Ensure types are built
pnpm build:types

# Restart dev server
pkill -f "next dev"
pnpm dev:web
```

## Security Considerations

1. **Validate file types** on both client and server
2. **Limit file size** using maxSizeMB in components
3. **Use HTTPS** for all uploads (automatic on production)
4. **Rotate S3 credentials** regularly
5. **Don't commit credentials** to git (use env vars)
6. **Set appropriate CORS** policies on S3 buckets
7. **Scan uploaded files** for malware (consider third-party service)
8. **Encrypt sensitive files** before upload if needed

## Performance Tips

1. **Compress images** before upload
2. **Use CDN** for static files (S3 → CloudFront)
3. **Enable image optimization** with Next.js Image component
4. **Cache public files** with appropriate headers
5. **Monitor upload speeds** and adjust limits accordingly
6. **Use background jobs** for processing after upload

## Next Steps

1. ✅ Storage settings UI created
2. ✅ Upload service integrated
3. ✅ Components updated to use storage
4. ⏳ Choose your storage provider
5. ⏳ Configure in admin settings
6. ⏳ Test uploads in your app
7. ⏳ Deploy to production

---

**Questions?** Check `STORAGE_INTEGRATION.md` for detailed API documentation.
