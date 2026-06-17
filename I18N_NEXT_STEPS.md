# i18n Wiring — Next Steps for Developers

> **Read first:** [`I18N_WIRING_STATUS.md`](I18N_WIRING_STATUS.md) — it has the full context, conventions, and validation checklist.

---

## Where we are

✅ **Done:**
- **Auth** (4 files) — fully wired and verified
- **Store** (5 files) — fully wired and verified  
- Catalogs: **1443 leaf keys, en/hi/fr parity**
- Infrastructure: next-intl v4, language switcher, routing, all working

❌ **Remaining:** ~60 files across 9 modules. See the priority table in `I18N_WIRING_STATUS.md`.

---

## Quick-start for your next module

### 1. **Pick a module** from the priority list (easiest first):
   - **seo** (3 files) — **IMPORTANT:** You'll need to recover the original English from git (see below)
   - **dashboard** (1 file) — trivial
   - **settings** (1 file) — trivial
   - **admin** (1 file) — trivial
   - **mail** (5 files) — need to create `mail` namespace first
   - **email** (3 files) — need to create `email` namespace first
   - **lighthouse** (4 files) — need to expand stale 2-key stub
   - **cms** (35 files) — large; coordinate with team before starting

### 2. **Understand the scope**
```
Static UI text → lang files:  labels, buttons, placeholders, error messages, table headers
Leave hardcoded:               sample data, brand names, DB-driven labels (CRM stages, etc.)
```
See "Scope rule" in `I18N_WIRING_STATUS.md` for details.

### 3. **For modules with existing catalogs** (dashboard, settings, admin, seo, lighthouse):
   - Wire the component: add `useTranslations("namespace")` hook
   - Replace hardcoded strings with `t("key")`
   - Validate: `npm run tsc --noEmit 2>&1 | grep <module>`

### 4. **For modules WITHOUT catalogs** (mail, email, cms.blogEditor, editor):
   - First, create the namespace keys (see examples below)
   - **Use a Node script** to inject them while preserving JSON formatting (see `/tmp/wire_*.js` examples from the prior commit)
   - Then wire the components

### 5. **For "broken" modules** (seo, lighthouse):
   - The code has `t()` calls but catalog keys are **missing** (bug from prior work)
   - **Recover the original English from git** using this commit:
     ```bash
     git show a6acd97:apps/web/src/modules/seo/SeoView.tsx | head -200
     # Look for the diff lines showing    - "Original text"  →   + {t("key")}
     ```
   - Rebuild the namespace with the real English strings, then validate

---

## Creating a new namespace (example: `mail`)

### Step 1: Identify the keys you need
Scan the unwired files for hardcoded strings. E.g., `MailCompose.tsx` has `~18 strings`.

### Step 2: Write a seed script (Node)
```javascript
// /tmp/wire_mail.js
const fs = require("fs");
const dir = "apps/web/src/i18n/messages";

const mail = {
  en: {
    compose: "Compose",
    to: "To",
    subject: "Subject",
    from: "From",
    body: "Message body",
    send: "Send",
    draft: "Draft",
    sent: "Sent",
    // ... etc
  },
  hi: {
    compose: "रचना करें",
    to: "प्राप्तकर्ता",
    subject: "विषय",
    // ... full translations
  },
  fr: {
    compose: "Composer",
    to: "À",
    subject: "Objet",
    // ... full translations
  },
};

for (const lang of ["en", "hi", "fr"]) {
  const file = `${dir}/${lang}.json`;
  const obj = JSON.parse(fs.readFileSync(file, "utf8"));
  obj.mail = mail[lang];
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n");
  console.log(`${lang}: ${Object.keys(mail[lang]).length} keys`);
}
```

### Step 3: Run it
```bash
node /tmp/wire_mail.js
# en: 18 keys
# hi: 18 keys
# fr: 18 keys
```

### Step 4: Verify parity
```bash
node -e "for(const l of ['en','hi','fr']){const m=require('./apps/web/src/i18n/messages/'+l+'.json');const c=(function f(o){let n=0;for(const k in o)typeof o[k]==='object'?n+=f(o[k]):n++;return n})(m);console.log(l,c)}"
# All three should report the same number
```

### Step 5: Wire the component
```tsx
import { useTranslations } from "next-intl";

export function MailCompose() {
  const t = useTranslations("mail");
  return (
    <div>
      <label>{t("to")}</label>
      <input placeholder={t("subject")} />
      <button>{t("send")}</button>
    </div>
  );
}
```

### Step 6: Validate
```bash
cd apps/web
npm run tsc --noEmit 2>&1 | grep mail  # should be empty
```

---

## Conventions to follow

See **full details** in `I18N_WIRING_STATUS.md` → "Conventions & patterns" section. TL;DR:

✅ Use `useTranslations("namespace")`  
✅ Move module-level constants (filters, enums) **into** the component if they need translation  
✅ Name the translator `tx` if `t` shadows an existing variable  
✅ Use `t("key", { var })` for interpolation (ICU syntax supported)  
✅ Use `t.rich("key", { tag: (c) => <Tag>{c}</Tag> })` for inline markup  

❌ Don't duplicate `common`/`enums` keys — reuse Save/Cancel/Delete/etc from those namespaces  

---

## Validation checklist (run before marking a module done)

```bash
cd apps/web

# 1. JSON is valid
for f in en hi fr; do node -e "JSON.parse(require('fs').readFileSync('src/i18n/messages/$f.json'))" && echo "$f ✓"; done

# 2. Parity: all three have the same key count
node -e "for(const l of ['en','hi','fr']){const m=require('./src/i18n/messages/'+l+'.json');const c=(function f(o){let n=0;for(const k in o)typeof o[k]==='object'?n+=f(o[k]):n++;return n})(m);console.log(l,c)}"

# 3. No TypeScript errors in your module
npm run tsc --noEmit 2>&1 | grep modules/<your-module>  # should be empty

# 4. Test it in browser: http://localhost:3000?locale=hi (or ?locale=fr)
# Then check DevTools → NEXT_LOCALE cookie is set
```

---

## What to do if you get stuck

1. **"Missing message key XYZ"** → Add the key to `en.json`, `hi.json`, `fr.json` (same key in all three, different value).
2. **"Wired but broken" module** (seo, lighthouse) → Recover English from commit `a6acd97` using `git show`.
3. **Parity mismatch** → Count keys: `node -e "..."` on each file. One is missing a key. Check the diff.
4. **Module-level constant needs translation** → Move it **inside** the component so it can call `t()`. See `ProductsToolbar`, `ProductsTable` examples.

---

## Who's doing what

**Done:**
- auth ✅  
- store ✅  

**To do (pick in this order):**
1. seo (recover from git)
2. dashboard, settings, admin (trivial; existing catalogs)
3. lighthouse (expand stale catalog)
4. mail, email (new catalogs)
5. cms (large; ~35 files — coordinate first)
6. components/editor (largest; ~24 files)

---

## Questions?

See `I18N_WIRING_STATUS.md` for the full reference (conventions, validation, architecture, git recovery, patterns).
