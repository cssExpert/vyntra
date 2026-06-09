# Vyntra i18n (Internationalization) Status

**Last Updated:** 2026-06-09  
**Coverage:** Ready to begin component wiring (400+ keys prepared)  
**Support Languages:** English (en), Hindi (hi), French (fr)

## Summary

Deep internationalization infrastructure has been implemented for Vyntra using **next-intl v4** with support for English, Hindi, and French. The system uses cookie-based locale selection with automatic fallback to organization defaults.

## What's Complete

✅ **Database Schema**
- User.locale field (per-user language preference)
- Organization.defaultLocale field (company-wide default)
- AdminSettings.timezone & Organization.timezone fields
- 2 Prisma migrations applied

✅ **Frontend i18n Infrastructure**
- next-intl v4 configured with 3 languages
- Locale routing (cookie-based, no URL prefixes)
- Server-side locale resolution via request.ts
- Configuration files (config.ts, routing.ts)

✅ **Message Catalogs**
- 400+ message keys across 14 namespaces
- en.json (English - master/authoritative)
- hi.json (Hindi - machine-translated)
- fr.json (French - machine-translated)

✅ **Documentation**
- Updated seed.ts with complete i18n guide
- This I18N_STATUS.md for team reference

## Architecture

### Tech Stack
- **Framework:** next-intl v4 (React i18n library)
- **Locale Storage:** Browser cookie (NEXT_LOCALE)
- **Resolution Priority:** Cookie → Accept-Language header → "en" default
- **Per-User:** User.locale (null = inherit organization default)
- **Per-Organization:** Organization.defaultLocale

### File Structure

```
apps/web/src/i18n/
├── config.ts          (Language list, labels, defaults)
├── routing.ts         (next-intl routing configuration)
├── request.ts         (Server-side locale resolution)
└── messages/
    ├── en.json        (400+ keys - English master)
    ├── hi.json        (400+ keys - Hindi translations)
    └── fr.json        (400+ keys - French translations)

apps/api/prisma/
├── schema.prisma      (Updated with locale/timezone fields)
├── migrations/
│   ├── 20260609134729_add_user_and_org_locale/
│   └── 20260609141244_add_timezone/
└── seed.ts            (i18n documentation added)
```

## Message Organization

### Namespaces (14 total)

```
admin.settingsNav        - Admin nav labels (6 keys)
admin.appSettings        - Platform settings (20+ keys)
admin.payment            - Payment config (20+ keys)
admin.storage            - Storage config (20+ keys)
admin.email              - Email provider setup (18+ keys)
admin.companies          - Company management UI (20+ keys)
admin.dashboard          - Admin dashboard (10+ keys)
admin.packages           - Package/plan management (20+ keys)
admin.modules            - Module management (20+ keys)
admin.users              - User management (20+ keys)
admin.themes             - Theme gallery (20+ keys)
admin.crm                - CRM module (20+ keys)
admin.store              - Store module (50+ keys)
admin.cms                - CMS module (30+ keys)

navigation               - Main nav (10 keys)
common                   - Shared UI (15+ keys)
auth                     - Login/signup (20+ keys)
errors                   - Error messages (7 keys)
```

## Next Steps for Team

### Wiring Components (Repeatable Pattern — 5 min per file)

For each view file to translate:

```tsx
// 1. Add import at top
import { useTranslations } from "next-intl";

// 2. Initialize in component
export function MyView() {
  const t = useTranslations("admin.namespace");
  
  // 3. Replace all hardcoded strings
  return (
    <PageHeader
      title={t("myTitle")}
      description={t("myDescription")}
    />
  );
}
```

### Steps to Add a Namespace

1. **Identify the namespace** (e.g., "admin.store", "admin.crm")
2. **Extract all strings** from component into message keys
3. **Add keys to en.json** under appropriate namespace
4. **Translate to hi.json and fr.json** (use Google Translate, acceptable quality)
5. **Wire the component** using useTranslations hook
6. **Validate:** Run `npx tsc --noEmit` in apps/web
7. **Test:** Open app with `?locale=hi` or `?locale=fr`

### Translation Quality

- **English (en):** Hand-written, authoritative ✓
- **Hindi (hi):** Machine-translated (Google), acceptable for review
- **French (fr):** Machine-translated (Google), acceptable for review
- **Recommendation:** Professional review before production launch

## How to Test

### Browser Testing
```bash
# English (default)
http://localhost:3000

# Hindi
http://localhost:3000?locale=hi

# French  
http://localhost:3000?locale=fr

# Check cookie
DevTools → Application → Cookies → NEXT_LOCALE
```

### JSON Validation
```bash
# Test each message file parses correctly
node -e "JSON.parse(require('fs').readFileSync('apps/web/src/i18n/messages/en.json'))"
node -e "JSON.parse(require('fs').readFileSync('apps/web/src/i18n/messages/hi.json'))"
node -e "JSON.parse(require('fs').readFileSync('apps/web/src/i18n/messages/fr.json'))"
```

### TypeScript Validation
```bash
# All message keys must exist at compile time
cd apps/web
npx tsc --noEmit
```

## Database Integration Notes

The system currently uses static JSON files on the frontend. To move to database-backed i18n:

1. **Create Message model** in schema.prisma (shown in seed.ts)
2. **Generate migration** for new table
3. **Seed message data** from JSON files
4. **Update components** to fetch from database
5. **Add admin UI** for translating messages

This is optional and can be deferred until needing dynamic translation management.

## Key Files Reference

| File | Purpose |
|------|---------|
| `apps/web/src/i18n/config.ts` | Language list & locale defaults |
| `apps/web/src/i18n/routing.ts` | next-intl routing setup |
| `apps/web/src/i18n/request.ts` | Server-side locale resolution |
| `apps/web/src/i18n/messages/en.json` | English message catalog |
| `apps/web/src/i18n/messages/hi.json` | Hindi message catalog |
| `apps/web/src/i18n/messages/fr.json` | French message catalog |
| `apps/api/prisma/schema.prisma` | Updated with locale/timezone fields |
| `apps/api/prisma/seed.ts` | i18n setup documentation |

## Troubleshooting

### "Key not found in translations"
→ Add the key to en.json, hi.json, and fr.json under the correct namespace

### TypeScript errors on t("key")
→ Ensure key exists in en.json; TypeScript enforces at compile time

### Locale not changing when clicking language switcher
→ Check NEXT_LOCALE cookie is being set in DevTools
→ Verify browser doesn't have cache preventing cookie update

### Message keys have inconsistent translations
→ Review against en.json master; re-translate if needed
→ Use Google Translate consistently for machine translations

## Progress Tracking

| Item | Status | Notes |
|------|--------|-------|
| Schema changes | ✅ Complete | 2 migrations applied |
| Infrastructure | ✅ Complete | next-intl configured |
| Message files | ✅ Complete | 400+ keys across 3 languages |
| Component wiring | ⏳ Ready | 14 namespaces prepared, pattern documented |

## Questions?

- **How to add a new language?** Update config.ts, create new message file, generate schema migration
- **How to test translations?** Use ?locale=xx query param or DevTools to set cookie
- **How to debug missing keys?** TypeScript will error at compile time if key doesn't exist
- **When to move to database i18n?** When you need admin UI for managing translations or dynamic messaging

---

**Status:** Infrastructure complete. Ready for team to begin component wiring using the 5-minute repeatable pattern documented above.
