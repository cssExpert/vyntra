# Multi-Tenant File Storage Architecture

## Core Principle
All files uploaded by companies must be organized in a structured directory hierarchy to ensure:
- **Data isolation:** Companies' files are separate
- **Security:** Easy to restrict access by company
- **Compliance:** Simple auditing and GDPR compliance
- **Management:** Easy backup, restore, and cleanup per company
- **Module tracking:** Know which module uploaded each file

## Directory Structure

### Format
```
public/uploads/{companyId}/{module}/{filename}
```

### Examples
```
public/uploads/comp_abc123/cms/logo.png
public/uploads/comp_abc123/cms/hero-image.jpg
public/uploads/comp_abc123/crm/customer-photo.jpg
public/uploads/comp_abc123/store/product-001.jpg
public/uploads/comp_def456/cms/favicon.ico
public/uploads/comp_def456/email/template-header.png
```

### Public URL Format
```
/uploads/{companyId}/{module}/{filename}
```

Example:
```html
<img src="/uploads/comp_abc123/cms/logo.png" />
```

## Implementation

### Backend (NestJS Upload Service)

**Method Signature:**
```typescript
async uploadLocal(
  file: MulterFile,
  customFilename?: string,
  companyId?: string,    // REQUIRED
  module?: string,        // REQUIRED
): Promise<UploadResult>
```

**Usage:**
```typescript
await uploadService.uploadLocal(
  file,
  "custom-name.jpg",
  "comp_abc123",  // Company ID
  "cms"           // Module name
);
// Returns: { url: "/uploads/comp_abc123/cms/custom-name.jpg", ... }
```

### Frontend (React Upload Hook)

**Usage in Components:**
```typescript
import { useUpload } from "@/lib/storage";
import { useAuth } from "@/providers/AuthProvider";

function ImageUpload() {
  const { upload } = useUpload();
  const { currentOrg } = useAuth();  // Get company context
  
  const handleUpload = async (file: File) => {
    const result = await upload(file, {
      companyId: currentOrg.id,      // From auth context
      module: "cms"                   // From route context
    });
    // result.url = "/uploads/comp_abc123/cms/..."
  };
}
```

## Module Names (Standardized)

Use these module names consistently across the app:

```typescript
enum UploadModule {
  CMS = "cms",           // Blog, pages, content
  CRM = "crm",           // Contacts, deals, emails
  STORE = "store",       // Products, variants
  EMAIL = "email",       // Email templates
  REPORTS = "reports",   // Generated reports
  DOCS = "docs",         // Documents, PDFs
  PROFILES = "profiles", // User/company profiles
  SETTINGS = "settings"  // App configuration files
}
```

## API Endpoints

### Local Upload
```
POST /api/upload/local
Content-Type: multipart/form-data

Body:
- file (binary)
- companyId (string) - REQUIRED
- module (string) - REQUIRED
- filename (string) - OPTIONAL

Response:
{
  "url": "/uploads/comp_abc123/cms/logo.png",
  "filename": "logo.png",
  "size": 15234,
  "mimeType": "image/png"
}
```

### S3 Upload (Future)
```
POST /api/upload/s3/presigned-url

Body:
{
  "filename": "logo.png",
  "contentType": "image/png",
  "contentLength": 15234,
  "companyId": "comp_abc123",
  "module": "cms"
}

Response:
{
  "url": "https://bucket.s3.region.amazonaws.com/comp_abc123/cms/logo.png?signature=...",
  "publicUrl": "https://bucket.s3.region.amazonaws.com/comp_abc123/cms/logo.png"
}
```

## Security Rules

### Access Control
1. **Authentication Required** - User must be logged in
2. **Authorization Check** - User must belong to company making the upload
3. **Module Check** - User must have access to the module
4. **File Validation** - Check file type and size limits

Example middleware:
```typescript
@Post('local')
@UseGuards(JwtAuthGuard)  // Require authentication
async uploadLocal(
  @UploadedFile() file: MulterFile,
  @Body() body: { companyId: string; module: string; filename?: string },
  @Req() req: Request,
) {
  const user = req.user;
  
  // Verify user belongs to company
  if (user.companyId !== body.companyId) {
    throw new ForbiddenException('Cannot upload to other companies');
  }
  
  // Verify user has module access
  if (!user.modules.includes(body.module)) {
    throw new ForbiddenException(`No access to ${body.module}`);
  }
  
  // Verify file size and type
  if (file.size > 10 * 1024 * 1024) {
    throw new BadRequestException('File too large (max 10MB)');
  }
  
  // Proceed with upload
  return await this.uploadService.uploadLocal(
    file,
    body.filename,
    body.companyId,
    body.module
  );
}
```

## File Cleanup & Retention

### Per-Company Cleanup
```bash
# Delete all files for a company
rm -rf public/uploads/comp_abc123

# Delete specific module files
rm -rf public/uploads/comp_abc123/cms

# Find size per company
du -sh public/uploads/comp_*
```

### Retention Policies
```typescript
// Example: Delete files older than 90 days
const deleteOldFiles = async (companyId: string, module: string, days: number = 90) => {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', companyId, module);
  const now = Date.now();
  const maxAge = days * 24 * 60 * 60 * 1000;
  
  const files = fs.readdirSync(uploadDir);
  for (const file of files) {
    const filepath = path.join(uploadDir, file);
    const stat = fs.statSync(filepath);
    if (now - stat.mtimeMs > maxAge) {
      fs.unlinkSync(filepath);
    }
  }
};
```

## Data Export & GDPR Compliance

### Export Company Files
```typescript
// Package all files for a company (GDPR right to data portability)
const exportCompanyFiles = async (companyId: string) => {
  const zipPath = `/tmp/${companyId}_files.zip`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', companyId);
  
  // Create zip from directory
  // Return download URL
  return zipPath;
};
```

### Delete Company Files
```typescript
// Delete all company files on account deletion (GDPR right to be forgotten)
const deleteCompanyData = async (companyId: string) => {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', companyId);
  fs.rmSync(uploadDir, { recursive: true, force: true });
};
```

## Cloud Provider Strategy (Future)

When migrating to S3/Uploadthing/Vercel Blob, use same directory structure:

### S3 Key Format
```
s3://bucket/comp_abc123/cms/logo.png
```

### Public URL (CloudFront/CDN)
```
https://cdn.example.com/uploads/comp_abc123/cms/logo.png
```

## Performance & Storage Optimization

### Lazy-load Images
```typescript
<img 
  src={fileUrl} 
  loading="lazy"
  alt="Company file"
/>
```

### Image Optimization
```typescript
// Resize on upload (if using cloud provider)
{
  "variant": "thumbnail",
  "width": 200,
  "height": 200
}
```

### Database Indexing
When storing file URLs in database, index by company:
```sql
CREATE INDEX idx_files_company_module ON files(company_id, module);
```

## Monitoring & Logging

```typescript
// Log all uploads
logger.info('File uploaded', {
  companyId,
  module,
  filename,
  size: file.size,
  mimeType: file.mimetype,
  url,
  timestamp: new Date(),
});

// Monitor storage usage
const getStorageUsage = (companyId: string) => {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', companyId);
  return getTotalSize(uploadDir);
};
```

## Summary

✅ **Required Rules:**
1. All uploads MUST include companyId and module
2. Directory structure MUST be: `public/uploads/{companyId}/{module}/{filename}`
3. Public URLs MUST match: `/uploads/{companyId}/{module}/{filename}`
4. Access control MUST verify company ownership
5. File operations MUST be scoped to company

✅ **Benefits:**
- Data isolation and security
- GDPR compliance ready
- Easy per-company analytics
- Simple backup/restore strategy
- Audit trail by module
- Future-proof for cloud migration

---

**Implementation Status:**
- Backend: ✅ Implemented (NestJS uploadService)
- Frontend: ⏳ TODO - Update React components
- Authentication: ⏳ TODO - Add guard middleware
- Cloud migration: 📋 Future step
