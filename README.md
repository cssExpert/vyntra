# 🚀 Vyntra

> The Modern Business Operating System

Vyntra is a powerful all-in-one business platform designed to unify website management, CRM, automation, analytics, communication, commerce, and operations into one seamless ecosystem.

Built with a modern SaaS-first architecture, Vyntra helps businesses streamline workflows, manage customer relationships, automate marketing, monitor performance, and scale operations from a single centralized dashboard.

---

## ✨ Features

* 🔐 Authentication & Admin Dashboard
* 📝 CMS & Visual Page Builder
* 👥 CRM & Lead Management
* ⚡ Lighthouse & Performance Insights
* 🔍 SEO Optimization Tools
* 💳 Payment Gateway Integrations
* 🛒 Store & Commerce Management
* 📞 Calling & Communication System
* 📧 Email Automation Workflows
* 📊 Analytics & Reporting
* 🤖 AI-Ready Modular Architecture

---

## 🛠️ Tech Stack

| Frontend   | Backend             | Database   | Styling       |
| ---------- | ------------------- | ---------- | ------------- |
| Next.js    | Node.js / Laravel   | PostgreSQL | Tailwind CSS  |
| TypeScript | REST / GraphQL APIs | Redis      | Framer Motion |

---

## 🎨 Design System

### Colors

```css
--primary: #CEFF00;
--background: #050505;
--surface: #121212;
--accent: #5BE7FF;
--text: #FFFFFF;
--muted: #A1A1AA;
```

### Typography

* Headings → Satoshi
* Body → Inter

### Buttons Component

import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";

``` Colour ```
<Button>Save</Button>                          // primary (theme color)
<Button variant="secondary">Filters</Button>   // blue secondary
<Button variant="outline">Export</Button>      // also: muted, ghost, link, destructive, success

``` Size ```
<Button size="xs">Tag</Button>                 // xs · sm · default · lg · xl · icon
// icon sizes auto-scale per button size ([&_svg]:size-*)

``` Icons — start or end ```
<Button startIcon={<Plus />}>New Post</Button>
<Button endIcon={<ArrowRight />}>Next</Button>

``` Radius — managed from the parent ```
<Button radius="full">Pill</Button>            // none · sm · md (default) · lg · xl · full

``` Loading — spinner replaces the start icon, button auto-disables, aria-busy set ```
<Button loading>Save</Button>
<Button loading loadingText="Saving…">Save</Button>

Disabled``` Disabled ```
<Button disabled>Unavailable</Button>


### Input Component

import { Input } from "@/components/ui/input";

<Input size="xs" placeholder="Tag" />        // h-7, text-xs
<Input size="sm" placeholder="Search..." />    // h-8, text-xs
<Input placeholder="Email" />                // default — h-9, text-sm (unchanged)
<Input size="lg" placeholder="Title" />      // h-10
<Input size="xl" placeholder="Headline" />   // h-11, text-base


---

## 📂 Project Structure

```bash
src/
├── app/
├── components/
├── features/
├── hooks/
├── layouts/
├── lib/
├── services/
├── store/
├── styles/
├── types/
├── utils/
└── animations/
```

---

## ⚙️ Core Modules

```txt
Vyntra Studio
Vyntra CRM
Vyntra Commerce
Vyntra Payments
Vyntra Voice
Vyntra Insights
Vyntra SEO
Vyntra Automations
```

---

## 🚀 Vision

Vyntra is built to become the central operating system for modern businesses — combining workflows, communication, marketing, analytics, and commerce into one intelligent platform.

---

## 📦 Installation

```bash
git clone https://github.com/yourusername/vyntra.git
cd vyntra

pnpm install          # this is a pnpm monorepo — do not use npm/yarn
pnpm build:types
pnpm db:up            # start PostgreSQL via Docker (team standard)
cp apps/api/.env.example apps/api/.env
pnpm db:migrate && pnpm db:seed
```

> **Full developer setup (Windows & macOS):** see **[DEVELOPMENT.md](./DEVELOPMENT.md)**.

---

## 🖥️ Development

```bash
pnpm dev              # runs API (:3001) and web (:3000) together
# or: pnpm dev:api  /  pnpm dev:web
```

Open:

```txt
Web  → http://localhost:3000
API  → http://localhost:3001/api
```

---

## 📄 License

MIT License © Vyntra
