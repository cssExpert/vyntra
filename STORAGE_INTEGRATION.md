# Storage Integration Guide

## Overview

Vyntra has a **centralized, configurable storage system** that supports multiple providers:
- **Local Filesystem** (default, development)
- **AWS S3** (production, scalable)
- **Uploadthing** (managed service)
- **Vercel Blob** (Vercel deployments)

All file uploads throughout the portal automatically use the configured storage provider.

## How It Works

### 1. Storage Configuration (Admin)

Go to **Admin Settings → Storage** to configure the storage provider.

### 2. Key Features

**Multi-Tenant Folder Structure:**
```
/uploads/{companyId}/{module}/{purpose}-{timestamp}.{ext}

Examples:
/uploads/superadmin/branding/logo-1718123456789.png
/uploads/comp_abc123/profiles/avatar-1718123456789.png
```

**Auto-Cleanup on Reupload:** Old versions of files are automatically deleted when you reupload with the same purpose.

## Adding File Uploads to New Features

```tsx
import { ImageUploadWithStorage } from "@/components/common/ImageUploadWithStorage";

<ImageUploadWithStorage
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  accept="image/png,image/jpeg"
  maxSizeMB={5}
  companyId={currentCompanyId}  // REQUIRED
  module="cms"                   // REQUIRED - use semantic name
/>
```

**Supported Modules:**
- `branding` - logos, favicons
- `profiles` - avatars, covers
- `cms` - page content, thumbnails
- `crm` - client images
- `email` - email templates
- `reports` - report exports
- `docs` - document uploads
- `settings` - config files

## Upload Flow

```
Frontend Component
  ↓ fetch /api/upload/config
  ↓ Determine storage provider
  ↓ POST /api/upload/{local|s3|uploadthing|vercel-blob}
  ↓ API saves file and returns URL
  ↓ Frontend displays preview
```

## Storage Providers

### Local Filesystem (Development)
```
Files stored in: public/uploads/{companyId}/{module}/{filename}
Access via: http://localhost:3001/uploads/...
```

### AWS S3 (Production)
```
Environment variables:
- S3_BUCKET=my-bucket
- S3_REGION=us-east-1
- S3_ACCESS_KEY_ID=xxx
- S3_SECRET_ACCESS_KEY=yyy

Files stored in: s3://my-bucket/uploads/{companyId}/{module}/{filename}
Access via: https://my-bucket.s3.amazonaws.com/uploads/...
```

### Uploadthing & Vercel Blob
Similar setup with respective API keys.

## Migration: Moving Files to S3

**Scenario:** Moving from Local to AWS S3

1. Configure S3 in Admin Settings → Storage
2. Old local files remain accessible
3. New uploads go to S3
4. Optional: Migrate existing files using migration tools (planned feature)

## Best Practices

✅ DO:
- Always pass `companyId` and `module` to ImageUploadWithStorage
- Use semantic module names from the approved list
- Let auto-cleanup handle old file deletion
- Store full URLs returned by API

❌ DON'T:
- Hardcode file paths in frontend
- Create custom modules without team discussion
- Skip companyId parameter

## Testing

```bash
# Check current storage config
curl http://localhost:3001/api/upload/config

# Test upload
# Go to Admin Settings → Logo & Icon
# Upload and check Dev Tools → Network tab
```

## Troubleshooting

**Images show 404:**
- Check /api/upload/config
- Verify storage provider matches environment
- Check S3 bucket is public (if using S3)

**S3 uploads fail:**
- Verify AWS credentials in .env
- Check IAM user has PutObject permission
- Verify bucket exists and region is correct

## Future Features

- [ ] Storage usage dashboard
- [ ] Migration manager UI
- [ ] CDN integration
- [ ] Image optimization on upload
- [ ] Automatic cleanup policies
- [ ] Virus scanning

See [CLAUDE.md - Storage Integration](./CLAUDE.md#storage-integration) for team rules.
