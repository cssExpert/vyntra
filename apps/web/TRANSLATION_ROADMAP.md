# Translation Completion Roadmap

## Status Summary
- **Files Fully Wired:** 2/52 (CompaniesAdminView, PackagesAdminView)
- **Message Catalog Keys Added:** 150+ keys across 6 namespaces
- **Languages Complete:** en.json ✓, hi.json ✗ (needs nested Store keys), fr.json ✗ (needs nested Store keys)

## Completed

### Admin Section
- ✅ **CompaniesAdminView** - Fully wired with t() calls
  - Message keys: admin.companies (40+ keys)
  - Translations: en, hi, fr complete
- ✅ **PackagesAdminView** - Fully wired with t() calls  
  - Message keys: admin.packages (20+ keys)
  - Translations: en, hi, fr complete

### Message Catalogs
- ✅ **en.json** - Expanded with store sub-namespaces:
  - store.orders (10 keys)
  - store.customers (15 keys)
  - store.categories (7 keys)
  - store.inventory (13 keys)
  - store.settings (40+ keys)

## Immediate Next Steps (High Impact)

### 1. Complete Store Translations (10 min)
Add the nested Store object keys to hi.json and fr.json - use the exact same structure from en.json but translate the values.

**en.json structure example:**
```json
"store": {
  "orders": { "title": "All Orders", ... },
  "customers": { "title": "Customers", ... },
  "categories": { "title": "Categories", ... },
  "inventory": { "title": "Inventory", ... },
  "settings": { "title": "Store Settings", ... }
}
```

### 2. Wire Store Views (30 min - 5 files)
Wire these high-impact views using the pattern from CompaniesAdminView:

**File: OrdersView.tsx**
```typescript
import { useTranslations } from "next-intl";
const t = useTranslations("store.orders");
// Replace: "All Orders" → t("title")
// Replace: "Pending" → t("pending")
// etc.
```

**Priority order:**
1. OrdersView (20+ strings)
2. CustomersView (18+ strings)
3. InventoryView (15+ strings)
4. CategoriesView (7+ strings)
5. StoreSettingsView (40+ strings)

### 3. Complete Remaining Admin Sections (1 hour)
Need namespaces for:
- admin.modules (use same pattern as admin.packages)
- admin.users (complex table view - similar to Companies)
- admin.themes (complex 600+ line file)
- admin.modals (AddCompanyModal, EditCompanyModal, DomainManagementModal)
- admin.settings (SettingsAdminView)
- admin.email (EmailSettingsView)
- admin.payment (PaymentSettingsView)
- admin.storage (StorageSettingsView)
- admin.company-detail (CompanyDetailView)
- admin.user-detail (UserDetailView)

### 4. Complete Settings Section (30 min - 7 files)
- ProfileSettingsView
- PasswordSettingsView
- NotificationsSettingsView
- BillingSettingsView
- SubscriptionSettingsView
- SystemLogsView
- SettingsView

### 5. Complete Remaining Sections (2 hours)
Dashboard (both views), CRM, CMS (9 files), Email, Mail, Lighthouse, SEO, Users

## Pattern to Follow

Every view follows this 3-step pattern:

### Step 1: Add Keys to Message Catalogs
```json
"moduleName": {
  "title": "Page Title",
  "description": "Page description",
  "buttonLabel": "Button Text",
  "placeholder": "Input placeholder",
  "errorMessage": "Error text",
  ...all hardcoded strings...
}
```

### Step 2: Wire Component with useTranslations
```typescript
import { useTranslations } from "next-intl";

function MyView() {
  const t = useTranslations("moduleName");
  
  return (
    <h1>{t("title")}</h1>
    <button>{t("buttonLabel")}</button>
    <input placeholder={t("placeholder")} />
  );
}
```

### Step 3: Add Translations to hi.json & fr.json
Copy the exact key structure from en.json, translate the values only:
```json
"moduleName": {
  "title": "पृष्ठ का शीर्षक",  // Hindi
  "description": "पृष्ठ विवरण",
  ...
}
```

## Batch Wiring Order (Recommended)

**Batch 1: Store (5 files, 80+ strings)** - HIGHEST IMPACT
- OrdersView, CustomersView, InventoryView, CategoriesView, StoreSettingsView

**Batch 2: Admin Details (4 files, 60+ strings)**
- CompanyDetailView, UserDetailView, ModulesAdminView, UsersAdminView

**Batch 3: Admin Settings (3 files, 50+ strings)**
- SettingsAdminView, EmailSettingsView, StorageSettingsView, PaymentSettingsView

**Batch 4: Dashboard (2 files, 40+ strings)**
- DashboardView, SuperAdminDashboardView

**Batch 5: Settings (7 files, 50+ strings)**
- ProfileSettingsView, PasswordSettingsView, NotificationsSettingsView, etc.

**Batch 6: CMS (9 files, 60+ strings)**
- PagesView, BlogView, GalleryView, MenusView, ThemesView, etc.

**Batch 7: CRM, Email, Others (10+ files)**

## Quick Wins

These files need <10 strings translated:
- MailView
- LighthouseView
- SeoView
- CRMView (mostly hardcoded already)

## JSON Validation
Always run before committing:
```bash
node -e "JSON.parse(require('fs').readFileSync('apps/web/src/i18n/messages/en.json'))" && \
node -e "JSON.parse(require('fs').readFileSync('apps/web/src/i18n/messages/hi.json'))" && \
node -e "JSON.parse(require('fs').readFileSync('apps/web/src/i18n/messages/fr.json'))" && \
echo "✓ All JSON valid"
```

## TypeScript Check
```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep -E "error|warning" | head -20
```

## Current File Counts by Module
- **admin:** 11 files (2 done, 9 todo)
- **store:** 14 files (0 done, 14 todo)
- **cms:** 9 files (0 done, 9 todo)
- **settings:** 7 files (0 done, 7 todo)
- **dashboard:** 2 files (0 done, 2 todo)
- **crm:** 1 file (0 done, 1 todo)
- **email:** 1 file (0 done, 1 todo)
- **lighthouse:** 1 file (0 done, 1 todo)
- **mail:** 1 file (0 done, 1 todo)
- **seo:** 1 file (0 done, 1 todo)
- **users:** 1 file (0 done, 1 todo)

**Total: 52 files | Completion: 2/52 (3.8%)**

## Recommended: Parallel Approach
1. Create translations for all 5 Store namespaces in hi.json & fr.json (copy from en.json structure, machine-translate values)
2. Wire all 5 Store files with useTranslations (use Agent tool to parallelize)
3. Repeat for other batches

This will reach 50% completion (26 files) in ~2-3 hours of focused work.
