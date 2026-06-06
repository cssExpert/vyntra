
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
- [Rule 2 - make change what is prompted for ]
- [Rule 3 - always follow the folder/file structure and use the already available components ]

## Rules - Core
- ALWAYS run tests after changes
- ALWAYS use TypeScript strict mode
- NEVER commit directly to main
- Keep files under 300 lines — split if larger

## Rules - Multi-Tenant File Storage (CRITICAL)
All file uploads MUST follow strict multi-tenant directory structure to ensure data isolation, security, and GDPR compliance. **See FILE_STORAGE_ARCHITECTURE.md for full spec.**

**Required:**
1. **Directory format:** `public/uploads/{companyId}/{module}/{filename}`
2. **Public URL format:** `/uploads/{companyId}/{module}/{filename}`
3. **API contract:** ALL upload endpoints MUST accept `companyId` and `module` parameters
4. **Module names:** Use standardized list (cms, crm, store, email, reports, docs, profiles, settings)
5. **Access control:** Verify user belongs to company before allowing upload
6. **File data in DB:** Store complete URL paths, not just filenames
7. **Cleanup:** Implement per-company file cleanup for GDPR compliance

**Example implementation:**
```typescript
// Backend: NestJS upload service
await uploadService.uploadLocal(file, customFilename, "comp_abc123", "cms");
// Returns: { url: "/uploads/comp_abc123/cms/logo.png", ... }

// Frontend: React component with company context
const { upload } = useUpload();
const result = await upload(file, {
  companyId: currentOrg.id,
  module: "cms"
});
```

## Read and follow
- Do not expand scope beyond the files explicitly mentioned.
- Ask for approval before inspecting additional files.
- Follow same Table structure added on other pages [@tanstack/react-table].
- Use reusable component as possible.