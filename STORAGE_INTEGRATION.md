# Storage Integration Guide

## Overview

The file upload system in the application is now integrated with the storage settings configured in `/admin/settings/storage`. This means all file uploads use the cloud provider configured by the admin, whether it's Local, S3, Uploadthing, or Vercel Blob.

## Architecture

### Frontend Components

#### Storage Service (`libs/storage.ts`)
- **Singleton service** that handles all file uploads
- Auto-loads admin settings from `/api/admin/settings`
- Routes uploads to the appropriate provider
- Caches settings to avoid repeated API calls

```typescript
import { storageService } from "@/lib/storage";

// Upload a file
const result = await storageService.upload({
  file: yourFile,
  filename: "custom-name.jpg",
  onProgress: (progress) => console.log(`${progress}%`)
});
// result.url = public URL of uploaded file
```

#### React Hook (`useUpload`)
- Simple hook for managing upload state in components
- Returns: `{ upload, uploading, error, progress }`

```typescript
import { useUpload } from "@/lib/storage";

export function MyComponent() {
  const { upload, uploading, error, progress } = useUpload();
  
  const handleFile = async (file: File) => {
    const result = await upload(file);
    if (result) {
      console.log("File uploaded:", result.url);
    }
  };
}
```

#### ImageUploadWithStorage Component
- Drop-in replacement for `ImageUploader`
- Automatically uses configured storage provider
- Shows upload progress
- Includes password field visibility toggles

```typescript
import { ImageUploadWithStorage } from "@/components/common/ImageUploadWithStorage";

<ImageUploadWithStorage
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  accept="image/*"
  maxSizeMB={5}
/>
```

### Backend API

#### Upload Routes

**POST /api/upload/local**
- Upload to local filesystem
- Returns: `{ url, filename, size, mimeType }`
- Multipart form data with `file` field

**POST /api/upload/s3/presigned-url**
- Get presigned URL for S3 upload
- Body: `{ filename, contentType, contentLength }`
- Returns: `{ url, publicUrl }`
- Client uploads directly to S3 using returned presigned URL

**POST /api/upload/uploadthing**
- Upload to Uploadthing
- Returns: `{ url, filename, size, mimeType }`
- Uses Uploadthing SDK (requires implementation)

**POST /api/upload/vercel-blob**
- Upload to Vercel Blob
- Returns: `{ url, filename, size, mimeType }`
- Uses Vercel Blob SDK (requires implementation)

**DELETE /api/upload/delete**
- Delete file from storage
- Body: `{ url, provider }`
- Returns: `{ success: true }`

#### NestJS Modules

**UploadModule** (`apps/api/src/upload/`)
- `upload.controller.ts` - HTTP endpoints
- `upload.service.ts` - Provider implementations
- Registered in `app.module.ts`

## Storage Providers

### Local Filesystem
**Configuration:** None required
**Directory:** `public/uploads/`
**URL Format:** `/uploads/filename.jpg`

**Pros:**
- No setup needed
- Fast for development
- Files are versioned with git

**Cons:**
- Limited scalability
- Doesn't work on serverless
- Manual backup required

### AWS S3
**Configuration Required:**
- AWS Access Key ID
- AWS Secret Access Key
- S3 Bucket name
- AWS Region

**Flow:**
1. Frontend requests presigned URL from backend
2. Backend generates presigned URL using AWS SDK
3. Frontend uploads directly to S3
4. Backend returns public S3 URL

**Pros:**
- Highly scalable
- Industry standard
- Works with CDN
- S3 API compatible (DigitalOcean Spaces, MinIO)

**Cons:**
- Requires AWS account
- Pay-as-you-go pricing

**Setup:**
```bash
# Create S3 bucket
aws s3 mb s3://my-bucket --region us-east-1

# Create IAM user with S3 permissions
aws iam create-user --user-name app-uploads
aws iam attach-user-policy \
  --user-name app-uploads \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

### Uploadthing
**Configuration Required:**
- Uploadthing API Key

**Flow:**
1. Frontend uploads file to backend
2. Backend forwards to Uploadthing API
3. Uploadthing returns public URL

**Pros:**
- Managed service (no infrastructure)
- Image optimization built-in
- Simple setup
- Free tier available

**Cons:**
- Requires Uploadthing account
- Limited to their API

**Setup:**
1. Sign up at https://uploadthing.com
2. Create an app
3. Get API key from Settings → API Keys
4. Add to admin settings

### Vercel Blob
**Configuration Required:**
- Vercel Blob Token

**Flow:**
Similar to S3 but uses Vercel's infrastructure

**Pros:**
- Integrated with Vercel deployments
- Simple API
- Works great with Next.js

**Cons:**
- Only available on Vercel
- Vendor lock-in

**Setup:**
1. Deploy to Vercel
2. Go to project settings → Storage
3. Create Blob store
4. Copy token to admin settings

## Using in Components

### Example: Profile Photo Upload

```typescript
import { useState } from "react";
import { ImageUploadWithStorage } from "@/components/common/ImageUploadWithStorage";

export function ProfilePhotoUpload() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  return (
    <div>
      <label>Profile Photo</label>
      <ImageUploadWithStorage
        value={photoUrl}
        onChange={setPhotoUrl}
        accept="image/png,image/jpeg"
        maxSizeMB={2}
        previewShape="circle"
      />
      {photoUrl && <img src={photoUrl} alt="Profile" />}
    </div>
  );
}
```

### Example: Generic File Upload

```typescript
import { useUpload } from "@/lib/storage";

export function DocumentUpload() {
  const { upload, uploading, error, progress } = useUpload();
  
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const result = await upload(file);
    if (result) {
      console.log("Document uploaded:", result.url);
      // Save result.url to database
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFile} disabled={uploading} />
      {uploading && <p>Uploading... {progress}%</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
```

## Switching Storage Providers

1. Go to `/admin/settings/storage`
2. Select a different provider
3. Fill in required configuration
4. Click "Save Settings"
5. The app automatically uses the new provider for all future uploads

**Note:** Switching providers does not migrate existing files. Old files remain at their original URLs.

## Environment Variables

For S3:
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

For local uploads, ensure `public/uploads/` directory is writable and included in your static file serving.

## Best Practices

1. **Always use `maxSizeMB`** in upload components to validate file size on client before upload
2. **Compress images** before uploading when possible
3. **Use descriptive filenames** for better debugging
4. **Validate file types** using `accept` attribute
5. **Monitor upload progress** for large files using `onProgress` callback
6. **Handle errors gracefully** - show user-friendly error messages
7. **Keep URLs in database** - don't reconstruct them in code
8. **Backup important files** - especially if using local storage

## Troubleshooting

### "Storage settings not found"
- Make sure admin settings are saved
- Check that storage configuration is complete for selected provider

### S3 "Access Denied"
- Verify AWS credentials are correct
- Check bucket name and region match configuration
- Ensure IAM user has S3 permissions

### Upload fails silently
- Check browser console for errors
- Verify file size is under maxSizeMB limit
- Check network tab in browser dev tools

### Uploadthing/Vercel SDK errors
- These providers need SDK implementation in `upload.service.ts`
- Currently returns mock responses
- Full implementation requires: `npm install @uploadthing/core @vercel/blob`

## Future Enhancements

- [ ] Image optimization/resizing before upload
- [ ] Automatic CDN caching headers
- [ ] Batch upload support
- [ ] Virus scanning integration
- [ ] File encryption at rest
- [ ] Uploadthing SDK full implementation
- [ ] Vercel Blob SDK full implementation
- [ ] File management UI (browse, delete, organize)
- [ ] Usage analytics and monitoring
