# Vyntra i18n — Wiring Status & Handoff

**Last updated:** 2026-06-17
**Languages:** English (`en`, master) · Hindi (`hi`) · French (`fr`)
**Catalog size:** 1443 leaf keys, **full parity across all three files** (en = hi = fr).

> ⚠️ The older `I18N_STATUS.md` is **stale** (dated 2026-06-09, "ready to begin wiring"). This file reflects the real, current state. Use this one.

---

## TL;DR for the next dev

The **infrastructure is complete and working** (next-intl v4, cookie-based locale, language switcher). The remaining work is **wiring components** (replace hardcoded strings with `t()`) and, for several modules, **creating catalog namespaces that don't exist yet**.

**Scope rule (confirmed with product owner):**
- ✅ **Static UI text** → lang files (`t()`): labels, buttons, headings, placeholders that are instructions, tooltips, empty states, validation/error messages, table headers, fixed enum labels (product type, order status, etc.).
- ❌ **Leave hardcoded** (will become DB-driven later): sample/demo data (example emails like `info.companyname@gmail.com`, demo names like `John Smith`), marketing/testimonial copy, brand names (`ERVFlow`), and **DB-driven dynamic labels** (CRM stages, sources, custom statuses, owners — per the project's critical i18n dynamic-data rule).

---

## ✅ Completed (this pass)

### auth — DONE & verified
Files: `LoginPage.tsx`, `SignupPage.tsx`, `ForgotPasswordPage.tsx`, `HeroPanel.tsx`
- Rebuilt the `auth` namespace cleanly: **35 keys**, removed junk keys (`johnsmith`, empty `""` key, etc.).
- Per the scope rule, example placeholders (`info.companyname@gmail.com`, `John Smith`) and the HeroPanel marketing testimonial are **left hardcoded**; only real UI chrome is translated.
- Namespace: `useTranslations("auth")`.

### store — DONE & verified
Files: `ProductsHeader.tsx`, `ProductsToolbar.tsx`, `ProductsTable.tsx`, `OrdersTable.tsx`, `ProductDescriptionEditor.tsx`
- Added `store.products` (49 keys), `store.products.editor` (32 keys, rich-text toolbar), extended `store.orders` (37 keys).
- Namespaces: `store.products`, `store.products.editor`, `store.orders`.
- `tsc --noEmit` clean for all store files.

---

## 🔴 IMPORTANT FINDING — "wired but broken" files

Some files were previously converted to `t()` **but their catalog keys were never added** (or were lost in a later commit). They currently throw `MISSING_MESSAGE` at runtime. My grep-based "wired" counts overstated reality — **a `useTranslations` import does not mean the keys exist.**

Confirmed broken:
- **seo**: `SeoView.tsx`, `SeoDashboard.tsx`, `SeoKeywords.tsx` reference `seo`, `seo.dashboard`, `seo.keywords` (~50 keys) — **none exist** in the catalog (only an empty `seo.seo` stub was found in commit `a6acd97`).
- **lighthouse**: namespace has only **2 keys** but `LighthouseDashboard.tsx` etc. use many — almost certainly broken too. Audit before assuming "2/6 wired" is real.

### Recommended recovery approach
The original English copy was replaced by `t()` keys, so don't guess it — **recover it from git**. The wiring commit was:
```
a6acd97  Add useTranslations hooks to 35 remaining component files and expand translation catalogs
```
Get the key→English mapping straight from that commit's diff:
```bash
git show a6acd97 -- apps/web/src/modules/seo/SeoView.tsx
# the diff shows  - "Original English"   →   + {t("someKey")}
```
The pre-wiring version (parent `04d8f81`) has all original hardcoded strings if you need full context.

**Before declaring any module done, add a missing-key check** (see Validation below).

---

## ⏳ Remaining work (priority order)

| # | Module | Files | Catalog status | Notes |
|---|--------|-------|----------------|-------|
| 1 | **seo** | SeoSitemaps, SeoMetaTags, SeoSerp + fix View/Dashboard/Keywords | **Missing** `seo.*` — recover via git (commit `a6acd97`) | Broken at runtime today. Highest priority. |
| 2 | **lighthouse** | LighthouseDashboard, AIOptimizer, AuditBar, OpportunityCard | Stub (2 keys) — likely broken | Recover via git, then add sitemaps-style keys |
| 3 | **dashboard** | DashboardContent | check namespace | small |
| 4 | **settings** | SystemLogsView | `settings` exists | small |
| 5 | **admin** | LogoUploader (AdminGuard has no strings) | `admin.*` exists | small |
| 6 | **mail** | MailCompose (~18 strings), MailList, MailSidebar, MailDetail, MailListItem | **No `mail` namespace** — create it | new catalog |
| 7 | **email** | AICopilot, WorkflowBuilder, TemplatesLibrary | **No `email` namespace** — create it | new catalog |
| 8 | **cms** | blog-editor (20 files), forms/*, gallery/* | partial — add `cms.blogEditor`, `cms.forms`, `cms.gallery` | largest module (~35 files) |
| 9 | **components/editor** | visual page builder (24 files, ~100+ strings) | **No namespace** — create `editor` | large; uses RightSidebar/Canvas/etc. |

`KanbanBoard.tsx` (crm) is intentionally **not** wired — its columns are DB-driven dynamic data (per the dynamic-data rule). Don't translate those.

---

## Conventions & patterns (follow these exactly)

### 1. Catalog structure
- Files: `apps/web/src/i18n/messages/{en,hi,fr}.json`.
- They are **canonical 2-space JSON** — `JSON.stringify(obj, null, 2) + "\n"` reproduces them exactly. This means you can edit them programmatically with a Node script and get a **localized diff** (only your namespace changes). See `/tmp/wire_*.js` examples from this pass.
- **Note the nesting quirk:** the store keys live *under* `store` → `store.products`, `store.orders`, `store.categories`, etc. (there's even a `store.store`). Check where a namespace actually lives before referencing it. SEO lives at top-level `seo` (once created).

### 2. Wiring a component
```tsx
import { useTranslations } from "next-intl";

export function MyView() {
  const t = useTranslations("store.products"); // dotted path OK
  return <h1>{t("title")}</h1>;
}
```

### 3. Module-level constants that need translation
Arrays/maps defined at module scope (filter options, column definitions, status→label maps) **must be moved inside the component** (or into a `buildX(t)` factory) so they can call `t()`. See `ProductsToolbar` (filter arrays moved inside) and `ProductsTable`/`OrdersTable` (`buildColumns(..., tx)` factory).

### 4. Avoid `t` name collisions
In files where a local `const t = getValue()` already exists (tanstack cells), name the translator **`tx`** to avoid shadowing. (Done in ProductsTable/OrdersTable.)

### 5. ICU for counts/interpolation
```jsonc
"selected": "{count} selected",
"showingEntries": "Showing {from} to {to} of {total} entries",
"moreItems": "+{count, plural, one {# more item} other {# more items}}"
```
```tsx
t("showingEntries", { from, to, total })
t("moreItems", { count })
```

### 6. Rich text (inline tags)
For a string with inline markup, use `t.rich`:
```tsx
t.rich("heroQuote", { hl: (chunks) => <span className="text-accent">{chunks}</span> })
// catalog: "Simply all <hl>the tools</hl> you need."
```

### 7. Reuse before adding
There are shared `common` and `enums` namespaces (Save/Cancel/Delete/Edit, Active/Draft/Archived, Yes/No…). Prefer reusing them for generic words instead of duplicating.

---

## Validation (run before declaring a module done)

```bash
cd apps/web

# 1. JSON valid
for f in en hi fr; do node -e "JSON.parse(require('fs').readFileSync('src/i18n/messages/$f.json'))" && echo "$f ok"; done

# 2. Parity — all three must report the SAME number
node -e "for(const l of ['en','hi','fr']){const m=require('./src/i18n/messages/'+l+'.json');const c=(function f(o){let n=0;for(const k in o)typeof o[k]==='object'?n+=f(o[k]):n++;return n})(m);console.log(l,c)}"

# 3. Types (next-intl enforces keys at compile time if augmented; at minimum no TS errors)
npx tsc --noEmit 2>&1 | grep modules/<module> || echo "clean"

# 4. Missing-key audit (catch "wired but broken" files) — pseudo:
#    for each useTranslations("NS") + t("key"), assert NS.key exists in en.json.
#    Worth scripting once and running repo-wide; it would have caught the SEO breakage.

# 5. Manual: open a page with ?locale=hi or ?locale=fr (or set NEXT_LOCALE cookie)
```

**Parity is mandatory** — every key added to `en.json` must be added to `hi.json` and `fr.json`. Machine translation (Google) is acceptable per the project; flag for professional review before production. Person names / brand names stay identical across languages.

---

## Quick reference

| Thing | Value |
|---|---|
| Config | `apps/web/src/i18n/config.ts` (locales: en/hi/fr) |
| Switcher | `components/common/LanguageSwitcher.tsx` (sets `NEXT_LOCALE`, reloads) |
| Server resolve | `apps/web/src/i18n/request.ts` |
| Catalogs | `apps/web/src/i18n/messages/{en,hi,fr}.json` |
| Test a locale | `?locale=hi` / `?locale=fr` or DevTools → `NEXT_LOCALE` cookie |
| Wiring commit (for git recovery) | `a6acd97` |
