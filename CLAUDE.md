
# Project: [ERVFlow]

## Tech Stack
- Next.js 15+ with App Router
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- Lucide React for icons
- Zustand or Context API for state management
- React Hook Form + Zod for forms and validation
- Prisma or Drizzle for database layer when backend is required
- PostgreSQL as preferred database
- NextAuth/Auth.js or custom auth when authentication is required
- OpenAI/Anthropic/OpenRouter-ready AI integration layer

## Commands
- Dev: [command]
- Build: [command]
- Test: [command]
- Lint: [command]

## Architecture
- [Where services live]
- [Where routes/views live]
- [Where models/types live]
- [Where tests live]

## Code Style
- [Rule 1 — be specific]
- [Rule 2 - Make change what is prompted for ]
- [Rule 3 - Always follow the folder/file structure and use the already available components ]
- [Rule 4 - Always follow the Font Sizes used in modules, keep the heading in ascending order like h1, h2 etc ]
- [Rule 5 - Always Use the @tanstack/react-table when asked for table ]
- [Rule 6 - Always Use the Modal from the common Component ]
- [Rule 6 - Always Use the font size classes like text-xs or text-sm md: lg: don't add text-[12px] ]

## Rules - Core
- ALWAYS run tests after changes
- ALWAYS use TypeScript strict mode
- NEVER commit directly to main
- Keep files under 300 lines — split if larger

## Git Safety Rules
- Never run git add, git commit, or git push unless I explicitly ask.
- Before making any Git operation, ask for confirmation.
- You may edit files, but do not commit or push changes automatically.

## Rules - Multi-Tenant File Storage & Upload Integration (CRITICAL)
All file uploads MUST use the centralized storage system for data isolation, security, GDPR compliance, and multi-provider support. **See STORAGE_INTEGRATION.md for complete guide.**

### File Structure & Storage
1. **Directory format:** `/uploads/{companyId}/{module}/{purpose}-{timestamp}.{ext}`
2. **Super admin files:** Use `companyId: "superadmin"` (e.g., `/uploads/superadmin/branding/logo-123456.png`)
3. **Company files:** Use actual `companyId` (e.g., `/uploads/comp_abc123/cms/thumbnail-123456.png`)
4. **Auto-cleanup:** Old versions automatically deleted on reupload (same purpose)

### Storage Providers (Configurable)
- **Local Filesystem** (development): Files in `public/uploads/`
- **AWS S3** (production): Files in S3 bucket with same structure
- **Uploadthing** (managed): Automatic management
- **Vercel Blob** (serverless): Edge storage

**Configuration:** Admin Settings → Storage (applies to ALL uploads immediately)

### Module Names (Standardized)
```
"branding"   // logos, favicons, brand assets
"profiles"   // user avatars, covers
"cms"        // page content, thumbnails
"crm"        // client images
"store"      // product & category images
"email"      // email templates  
"reports"    // report exports
"docs"       // document uploads
"settings"   // misc config
```

### Implementation Rules

**REQUIRED for all file uploads:**

```tsx
// ALWAYS use this component
import { ImageUploadWithStorage } from "@/components/common/ImageUploadWithStorage";

// ALWAYS pass companyId and module
<ImageUploadWithStorage
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  companyId={currentCompanyId}  // REQUIRED: "superadmin" or company ID
  module="cms"                  // REQUIRED: from standardized list above
  accept="image/png,image/jpeg"
  maxSizeMB={5}
/>

// ALWAYS store full URL returned by API, never just filename
setImageUrl(result.url);  // ✅ e.g., "http://localhost:3001/uploads/comp_abc123/cms/logo-123456.png"
// NOT: setImageUrl(result.filename);  // ❌
```

**Backend (already integrated):**
```typescript
// Upload service automatically handles:
// ✅ Multi-tenant folder creation
// ✅ Semantic file naming with timestamp
// ✅ Old version cleanup
// ✅ Storage provider selection (from config)
// ✅ URL generation
```

### URL Handling

The API automatically returns the correct URL based on configured storage provider:

```
Local:         http://localhost:3001/uploads/superadmin/branding/logo-123.png
S3:            https://my-bucket.s3.amazonaws.com/uploads/superadmin/branding/logo-123.png
Uploadthing:   https://uploadthing-cdn.com/uploads/superadmin/branding/logo-123.png
Vercel Blob:   https://blob-store.vercel-storage.com/uploads/superadmin/branding/logo-123.png
```

**Frontend just uses the URL as-is** - no provider detection needed.

### Migration to Cloud Storage

When moving from Local to S3:

1. Change storage provider in Admin Settings → Storage
2. Old local files remain accessible (URLs don't change)
3. New uploads automatically go to S3
4. Optional: Use migration tools to move existing files (planned feature)

**No code changes needed** - storage provider is transparent to features.

### Testing File Uploads

```bash
# Verify storage config
curl http://localhost:3001/api/upload/config

# Expected response:
{
  "storageProvider": "local",
  "s3Config": null
}
```

### Quick Reference

| Feature | How | Where |
|---------|-----|-------|
| Configure storage | Admin → Settings → Storage | Database |
| Upload files | ImageUploadWithStorage component | Any feature |
| Check provider | /api/upload/config | API endpoint |
| Store in DB | Save full URL from API | Database |
| Auto-cleanup | Automatic on reupload | Upload service |
| Change provider | Update admin settings | One place for all |

### What NOT to Do

❌ Create custom upload components
❌ Hardcode file paths in code
❌ Store only filenames (store full URL)
❌ Assume provider will never change
❌ Create custom modules without discussion
❌ Skip `companyId` parameter

## Read and follow
- Do not expand scope beyond the files explicitly mentioned.
- Ask for approval before inspecting additional files.
- Follow same Table structure added on other pages [@tanstack/react-table].
- Use reusable component as possible.