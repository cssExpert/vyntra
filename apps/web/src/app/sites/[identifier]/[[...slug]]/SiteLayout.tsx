// Global navbar + footer rendered from the org's Layout config.
// Rendered server-side as RSC — fetches each menu directly.

import { cookies } from "next/headers";
import Link from "next/link";
import { SiteThemeToggle } from "./SiteThemeToggle";
import { SiteLanguageSwitcher } from "./SiteLanguageSwitcher";
import { FooterNewsletterForm } from "./FooterNewsletterForm";
import { CartButton } from "./CartButton";
import { AccountButton } from "./AccountButton";
import { WishlistButton } from "./WishlistButton";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  target: string;
  visibility: string[];
}

interface OrgInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  darkLogoUrl?: string | null;
  themeSwitcherEnabled?: boolean;
  siteLanguages?: string[];
  defaultSiteLanguage?: string;
}

interface SiteLayoutData {
  navMenuId: string | null;
  footerColumns: { title: string; menuId: string }[];
}

async function fetchMenu(orgId: string, menuId: string): Promise<MenuItem[]> {
  try {
    const res = await fetch(`${API}/public/sites/${orgId}/menus/${menuId}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

function visClass(vis: string[]): string {
  if (!vis?.length || vis.includes("all")) return "";
  const m = vis.includes("mobile");
  const t = vis.includes("tablet");
  const d = vis.includes("desktop");
  if (m && t && !d) return "lg:hidden";
  if (t && d && !m) return "hidden md:block";
  if (m && d && !t) return "block md:hidden lg:block";
  if (m && !t && !d) return "block md:hidden";
  if (t && !m && !d) return "hidden md:block lg:hidden";
  if (d && !m && !t) return "hidden lg:block";
  return "";
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function OrgLogo({ org, className = "h-8" }: { org: OrgInfo; className?: string }) {
  if (org.logoUrl) {
    return (
      <>
        {/* light logo — hidden in dark mode when a dark logo is provided */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={org.logoUrl}
          alt={org.name}
          className={`${className} object-contain ${org.darkLogoUrl ? "block dark:hidden" : "block"}`}
        />
        {/* dark logo — only shown in dark mode */}
        {org.darkLogoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={org.darkLogoUrl}
            alt={org.name}
            className={`${className} object-contain hidden dark:block`}
          />
        )}
      </>
    );
  }
  return <span>{org.name}</span>;
}

// ── Header variants ───────────────────────────────────────────────────────────

/** logo left · nav links right · sticky blur */
async function NavbarMinimal({ org, items, activeLang }: { org: OrgInfo; items: MenuItem[]; activeLang: string }) {
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-sm"
      style={{
        backgroundColor: "color-mix(in srgb, var(--background, #ffffff) 95%, transparent)",
        borderBottom: "1px solid var(--border, #e5e7eb)",
        color: "var(--foreground, #111827)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight shrink-0 transition-opacity hover:opacity-70"
          style={{ color: "var(--primary, #3b82f6)" }}
        >
          <OrgLogo org={org} />
        </Link>
        <div className="flex items-center gap-6 flex-wrap">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target={item.target}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              className={["text-sm transition-opacity hover:opacity-70", visClass(item.visibility)].filter(Boolean).join(" ")}
              style={{ color: "var(--foreground, #374151)" }}
            >
              {item.label}
            </a>
          ))}
          {org.themeSwitcherEnabled && <SiteThemeToggle />}
          {(org.siteLanguages?.length ?? 0) > 1 && (
            <SiteLanguageSwitcher
              orgId={org.id}
              available={org.siteLanguages!}
              defaultLang={org.defaultSiteLanguage ?? "en"}
              activeLang={activeLang}
            />
          )}
          <CartButton orgId={org.id} className="p-2 rounded-full transition-opacity hover:opacity-70 relative" />
          <AccountButton className="p-2 rounded-full transition-opacity hover:opacity-70" />
        </div>
      </div>
    </nav>
  );
}

/** logo + nav both centered · two-row */
async function NavbarCentered({ org, items, activeLang }: { org: OrgInfo; items: MenuItem[]; activeLang: string }) {
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-sm"
      style={{
        backgroundColor: "color-mix(in srgb, var(--background, #ffffff) 95%, transparent)",
        borderBottom: "1px solid var(--border, #e5e7eb)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col items-center gap-2">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight transition-opacity hover:opacity-70"
          style={{ color: "var(--primary, #3b82f6)" }}
        >
          <OrgLogo org={org} />
        </Link>
        <div className="flex items-center gap-6 flex-wrap justify-center">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target={item.target}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              className={["text-sm transition-opacity hover:opacity-70", visClass(item.visibility)].filter(Boolean).join(" ")}
              style={{ color: "var(--foreground, #374151)" }}
            >
              {item.label}
            </a>
          ))}
          {org.themeSwitcherEnabled && <SiteThemeToggle />}
          {(org.siteLanguages?.length ?? 0) > 1 && (
            <SiteLanguageSwitcher
              orgId={org.id}
              available={org.siteLanguages!}
              defaultLang={org.defaultSiteLanguage ?? "en"}
              activeLang={activeLang}
            />
          )}
        </div>
      </div>
    </nav>
  );
}

/** logo left · nav center · last item styled as CTA button right */
async function NavbarSplit({ org, items, activeLang }: { org: OrgInfo; items: MenuItem[]; activeLang: string }) {
  const navItems = items.length > 1 ? items.slice(0, -1) : items;
  const ctaItem = items.length > 1 ? items[items.length - 1] : null;

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-sm"
      style={{
        backgroundColor: "color-mix(in srgb, var(--background, #ffffff) 95%, transparent)",
        borderBottom: "1px solid var(--border, #e5e7eb)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 grid grid-cols-3 items-center">
        {/* Logo — left */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight transition-opacity hover:opacity-70 justify-self-start"
          style={{ color: "var(--primary, #3b82f6)" }}
        >
          <OrgLogo org={org} />
        </Link>

        {/* Nav — center */}
        <div className="flex items-center gap-5 flex-wrap justify-center">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target={item.target}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              className={["text-sm transition-opacity hover:opacity-70", visClass(item.visibility)].filter(Boolean).join(" ")}
              style={{ color: "var(--foreground, #374151)" }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA + theme toggle + language — right */}
        <div className="justify-self-end flex items-center gap-2">
          {(org.siteLanguages?.length ?? 0) > 1 && (
            <SiteLanguageSwitcher
              orgId={org.id}
              available={org.siteLanguages!}
              defaultLang={org.defaultSiteLanguage ?? "en"}
              activeLang={activeLang}
            />
          )}
          {org.themeSwitcherEnabled && <SiteThemeToggle />}
          {ctaItem && (
            <a
              href={ctaItem.url}
              target={ctaItem.target}
              rel={ctaItem.target === "_blank" ? "noopener noreferrer" : undefined}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-85"
              style={{
                backgroundColor: "var(--primary, #3b82f6)",
                color: "var(--primary-foreground, #ffffff)",
              }}
            >
              {ctaItem.label}
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

/** dark background (inverted) · logo left · nav right */
async function NavbarDark({ org, items, activeLang }: { org: OrgInfo; items: MenuItem[]; activeLang: string }) {
  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        backgroundColor: "var(--foreground, #111827)",
        borderBottom: "1px solid color-mix(in srgb, var(--foreground, #111827) 80%, transparent)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight shrink-0 transition-opacity hover:opacity-70"
          style={{ color: "var(--background, #ffffff)" }}
        >
          <OrgLogo org={org} />
        </Link>
        <div className="flex items-center gap-6 flex-wrap">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target={item.target}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              className={["text-sm transition-opacity hover:opacity-70", visClass(item.visibility)].filter(Boolean).join(" ")}
              style={{ color: "color-mix(in srgb, var(--background, #ffffff) 85%, transparent)" }}
            >
              {item.label}
            </a>
          ))}
          {org.themeSwitcherEnabled && <SiteThemeToggle />}
          {(org.siteLanguages?.length ?? 0) > 1 && (
            <SiteLanguageSwitcher
              orgId={org.id}
              available={org.siteLanguages!}
              defaultLang={org.defaultSiteLanguage ?? "en"}
              activeLang={activeLang}
            />
          )}
        </div>
      </div>
    </nav>
  );
}

// ── Footer variants ───────────────────────────────────────────────────────────

function gridClass(colCount: number): string {
  if (colCount <= 0) return "";
  if (colCount === 1) return "grid-cols-1";
  if (colCount === 2) return "grid-cols-1 sm:grid-cols-2";
  if (colCount === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-2 lg:grid-cols-4";
}

/** multi-column with headings (default) */
async function FooterColumns({
  org,
  columns,
  columnMenus,
}: {
  org: OrgInfo;
  columns: { title: string; menuId: string }[];
  columnMenus: MenuItem[][];
}) {
  const colCount = columns.length;

  return (
    <footer
      className="mt-24"
      style={{
        backgroundColor: "var(--muted, #f9fafb)",
        borderTop: "1px solid var(--border, #e5e7eb)",
        color: "var(--foreground, #111827)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-16">
        {colCount > 0 && (
          <div className={`grid gap-10 mb-12 ${gridClass(colCount)}`}>
            {columns.map((col, i) => {
              const items = columnMenus[i] ?? [];
              return (
                <div key={i}>
                  {col.title && (
                    <h4
                      className="text-xs font-semibold uppercase tracking-widest mb-4"
                      style={{ color: "var(--muted-foreground, #9ca3af)" }}
                    >
                      {col.title}
                    </h4>
                  )}
                  <ul className="space-y-2.5">
                    {items.map((item) => (
                      <li key={item.id}>
                        <a
                          href={item.url}
                          target={item.target}
                          rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                          className={["text-sm transition-opacity hover:opacity-70", visClass(item.visibility)].filter(Boolean).join(" ")}
                          style={{ color: "var(--muted-foreground, #6b7280)" }}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        <div
          className={`${colCount > 0 ? "pt-8" : ""} text-center text-sm`}
          style={{
            borderTop: colCount > 0 ? "1px solid var(--border, #e5e7eb)" : undefined,
            color: "var(--muted-foreground, #9ca3af)",
          }}
        >
          © {new Date().getFullYear()} {org.name}
        </div>
      </div>
    </footer>
  );
}

/** single copyright line only */
async function FooterSimple({ org }: { org: OrgInfo }) {
  return (
    <footer
      className="mt-24 py-8 text-center text-sm"
      style={{
        borderTop: "1px solid var(--border, #e5e7eb)",
        color: "var(--muted-foreground, #9ca3af)",
      }}
    >
      © {new Date().getFullYear()} {org.name}
    </footer>
  );
}

/** centered: site name · flat link row · copyright */
async function FooterCentered({
  org,
  columns,
  columnMenus,
}: {
  org: OrgInfo;
  columns: { title: string; menuId: string }[];
  columnMenus: MenuItem[][];
}) {
  const allLinks = columnMenus.flat();

  return (
    <footer
      className="mt-24"
      style={{
        backgroundColor: "var(--muted, #f9fafb)",
        borderTop: "1px solid var(--border, #e5e7eb)",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-14 flex flex-col items-center gap-5 text-center">
        <span
          className="text-lg font-bold tracking-tight"
          style={{ color: "var(--primary, #3b82f6)" }}
        >
          {org.name}
        </span>

        {allLinks.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {allLinks.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className={["text-sm transition-opacity hover:opacity-70", visClass(item.visibility)].filter(Boolean).join(" ")}
                style={{ color: "var(--muted-foreground, #6b7280)" }}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}

        <p className="text-xs" style={{ color: "var(--muted-foreground, #9ca3af)" }}>
          © {new Date().getFullYear()} {org.name}
        </p>
      </div>
    </footer>
  );
}

/** dark background footer with columns */
async function FooterDark({
  org,
  columns,
  columnMenus,
}: {
  org: OrgInfo;
  columns: { title: string; menuId: string }[];
  columnMenus: MenuItem[][];
}) {
  const colCount = columns.length;

  return (
    <footer
      className="mt-24"
      style={{ backgroundColor: "var(--foreground, #111827)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-16">
        {colCount > 0 && (
          <div className={`grid gap-10 mb-12 ${gridClass(colCount)}`}>
            {columns.map((col, i) => {
              const items = columnMenus[i] ?? [];
              return (
                <div key={i}>
                  {col.title && (
                    <h4
                      className="text-xs font-semibold uppercase tracking-widest mb-4"
                      style={{ color: "color-mix(in srgb, var(--background, #ffffff) 50%, transparent)" }}
                    >
                      {col.title}
                    </h4>
                  )}
                  <ul className="space-y-2.5">
                    {items.map((item) => (
                      <li key={item.id}>
                        <a
                          href={item.url}
                          target={item.target}
                          rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                          className={["text-sm transition-opacity hover:opacity-70", visClass(item.visibility)].filter(Boolean).join(" ")}
                          style={{ color: "color-mix(in srgb, var(--background, #ffffff) 70%, transparent)" }}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        <div
          className={`${colCount > 0 ? "pt-8 border-t" : ""} text-center text-sm`}
          style={{
            borderColor: "color-mix(in srgb, var(--background, #ffffff) 15%, transparent)",
            color: "color-mix(in srgb, var(--background, #ffffff) 45%, transparent)",
          }}
        >
          © {new Date().getFullYear()} {org.name}
        </div>
      </div>
    </footer>
  );
}

/** Shopingo-style: single white row — stacked wordmark logo · centered links · icon cluster */
async function NavbarShopingo({ org, items, activeLang }: { org: OrgInfo; items: MenuItem[]; activeLang: string }) {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#1c1c1e] border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[76px] flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex flex-col leading-none">
          {org.logoUrl ? (
            <OrgLogo org={org} className="h-10" />
          ) : (
            <>
              <span className="text-2xl font-extrabold tracking-tight uppercase text-[#212529] dark:text-white">
                {org.name}
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-gray-400 dark:text-gray-500 mt-0.5">
                eCommerce
              </span>
            </>
          )}
        </Link>

        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-7 mx-auto">
          {items.map((item, i) => (
            <a
              key={item.id}
              href={item.url}
              target={item.target}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              className={[
                "text-[13px] font-semibold uppercase tracking-wide transition-colors whitespace-nowrap",
                i === 0
                  ? "text-[#212529] dark:text-white"
                  : "text-[#5a5a5a] dark:text-gray-300 hover:text-[#212529] dark:hover:text-white",
                visClass(item.visibility),
              ].filter(Boolean).join(" ")}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action icons */}
        <div className="ml-auto lg:ml-0 flex items-center gap-0.5 shrink-0 text-[#212529] dark:text-gray-100">
          {org.themeSwitcherEnabled && <SiteThemeToggle />}
          {(org.siteLanguages?.length ?? 0) > 1 && (
            <SiteLanguageSwitcher orgId={org.id} available={org.siteLanguages!} defaultLang={org.defaultSiteLanguage ?? "en"} activeLang={activeLang} />
          )}
          {/* Search */}
          <button className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          {/* Wishlist */}
          <WishlistButton orgId={org.id} />
          {/* Cart */}
          <CartButton orgId={org.id} />
          {/* Account */}
          <AccountButton />
        </div>
      </div>

      {/* Mobile nav links — visible below lg where the centered row is hidden */}
      {items.length > 0 && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-5 overflow-x-auto no-scrollbar">
            {items.map((item, i) => (
              <a
                key={item.id}
                href={item.url}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className={[
                  "py-3 text-[13px] font-semibold uppercase tracking-wide whitespace-nowrap transition-colors",
                  i === 0
                    ? "text-[#212529] dark:text-white"
                    : "text-[#5a5a5a] dark:text-gray-300 hover:text-[#212529] dark:hover:text-white",
                  visClass(item.visibility),
                ].filter(Boolean).join(" ")}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

/** Shopingo-style: newsletter strip + columns with brand col + bottom bar */
async function FooterShopingo({
  org,
  columns,
  columnMenus,
}: {
  org: OrgInfo;
  columns: { title: string; menuId: string }[];
  columnMenus: MenuItem[][];
}) {
  const colCount = columns.length;
  const SOCIAL = [
    { label: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
    { label: "Twitter", path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
    { label: "Instagram", path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" },
    { label: "YouTube", path: "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" },
  ];

  return (
    <footer>
      {/* ── Newsletter strip — always dark ───────────── */}
      <div className="bg-[#1e2226]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-lg font-bold text-white">Get Latest Updates</p>
            <p className="text-sm mt-1 text-white/50">
              Subscribe to our newsletter for the latest offers &amp; deals
            </p>
          </div>
          <FooterNewsletterForm orgId={org.id} />
        </div>
      </div>

      {/* ── Main columns ─────────────────────────────── */}
      <div className="bg-[#f7f7f7] dark:bg-[#151518] border-t border-b border-[#e8e8e8] dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className={`grid gap-10 ${colCount > 0 ? gridClass(colCount + 1) : "grid-cols-1"}`}>
            {/* Brand column */}
            <div>
              <Link href="/" className="block mb-4">
                <OrgLogo org={org} className="h-10" />
              </Link>
              <p className="text-sm leading-relaxed mb-5 text-[#636363] dark:text-gray-400">
                Your one-stop destination for quality products at great prices. Shop with confidence.
              </p>
              <div className="flex items-center gap-2.5">
                {SOCIAL.map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-[#212529] dark:bg-gray-700 text-white/70 hover:bg-[#e4611e] hover:text-white"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {columns.map((col, i) => {
              const items = columnMenus[i] ?? [];
              return (
                <div key={i}>
                  {col.title && (
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-4 text-[#212529] dark:text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>
                      {col.title}
                    </h4>
                  )}
                  <ul className="space-y-2.5">
                    {items.map((item) => (
                      <li key={item.id}>
                        <a
                          href={item.url}
                          target={item.target}
                          rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                          className={["text-sm transition-colors text-[#636363] dark:text-gray-400 hover:text-[#e4611e] dark:hover:text-[#e4611e]", visClass(item.visibility)].filter(Boolean).join(" ")}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom bar — always dark ─────────────────── */}
      <div className="bg-[#1e2226]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/45">
          <span>© {new Date().getFullYear()} {org.name}. All Rights Reserved.</span>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Use</a>
            <span>Powered by Vyntra</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const ACADEMY_NAVY = "#0B1E33";
const ACADEMY_GOLD = "#C9A961";
const ACADEMY_SERIF = "Georgia, 'Times New Roman', serif";

/** Academy-style: navy header, gold accent wordmark, centered nav, no cart/search (non-ecommerce). */
async function NavbarAcademy({ org, items }: { org: OrgInfo; items: MenuItem[] }) {
  return (
    <header className="sticky top-0 z-50" style={{ background: ACADEMY_NAVY }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center gap-6">
        <Link href="/" className="shrink-0 flex items-center gap-2.5">
          {org.logoUrl ? (
            <OrgLogo org={org} className="h-9" />
          ) : (
            <span
              className="text-xl font-bold tracking-tight text-white"
              style={{ fontFamily: ACADEMY_SERIF }}
            >
              {org.name}
            </span>
          )}
        </Link>

        <nav className="hidden lg:flex items-center gap-7 mx-auto">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target={item.target}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              className={["text-[13px] font-semibold uppercase tracking-wide text-white/80 hover:text-white transition-colors whitespace-nowrap", visClass(item.visibility)].filter(Boolean).join(" ")}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="/contact"
          className="ml-auto lg:ml-0 shrink-0 px-4 py-2 rounded text-xs font-semibold whitespace-nowrap"
          style={{ background: ACADEMY_GOLD, color: ACADEMY_NAVY }}
        >
          Book a Tour
        </a>
      </div>

      {items.length > 0 && (
        <div className="lg:hidden border-t" style={{ borderColor: "rgba(255,255,255,.1)" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-5 overflow-x-auto no-scrollbar">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className={["py-3 text-[13px] font-semibold uppercase tracking-wide whitespace-nowrap text-white/80 hover:text-white transition-colors", visClass(item.visibility)].filter(Boolean).join(" ")}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

/** Academy-style: navy footer, gold column headings, serif brand blurb. */
async function FooterAcademy({
  org,
  columns,
  columnMenus,
}: {
  org: OrgInfo;
  columns: { title: string; menuId: string }[];
  columnMenus: MenuItem[][];
}) {
  const colCount = columns.length;
  return (
    <footer style={{ background: ACADEMY_NAVY }} className="text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className={`grid gap-10 ${colCount > 0 ? gridClass(colCount + 1) : "grid-cols-1"}`}>
          <div>
            <Link href="/" className="block mb-4">
              {org.logoUrl ? (
                <OrgLogo org={org} className="h-9" />
              ) : (
                <span className="text-lg font-bold" style={{ fontFamily: ACADEMY_SERIF }}>{org.name}</span>
              )}
            </Link>
            <p className="text-sm leading-relaxed text-white/60">
              A premium, faith-grounded private school forming confident leaders through small classes and rigorous academics.
            </p>
          </div>

          {columns.map((col, i) => {
            const items = columnMenus[i] ?? [];
            return (
              <div key={i}>
                {col.title && (
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: ACADEMY_GOLD }}>
                    {col.title}
                  </h4>
                )}
                <ul className="space-y-2.5">
                  {items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.url}
                        target={item.target}
                        rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                        className={["text-sm text-white/70 hover:text-white transition-colors", visClass(item.visibility)].filter(Boolean).join(" ")}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="pt-8 mt-8 border-t text-center text-xs text-white/45" style={{ borderColor: "rgba(255,255,255,.1)" }}>
          © {new Date().getFullYear()} {org.name}. A registered 501(c)(3) nonprofit institution. ·{" "}
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}

// ── Public entry points ───────────────────────────────────────────────────────

export async function SiteNavbar({
  org,
  layout,
  themeIdentifier,
}: {
  org: OrgInfo;
  layout: SiteLayoutData;
  themeIdentifier?: string;
}) {
  const cookieStore = await cookies();
  const rawLang = cookieStore.get("vyntra_site_lang")?.value;
  const activeLang = (rawLang && org.siteLanguages?.includes(rawLang))
    ? rawLang
    : (org.defaultSiteLanguage ?? "en");

  const items = layout.navMenuId ? await fetchMenu(org.id, layout.navMenuId) : [];

  switch (themeIdentifier) {
    case "shopingo":
      return <NavbarShopingo org={org} items={items} activeLang={activeLang} />;
    case "academy":
      return <NavbarAcademy org={org} items={items} />;
    default:
      return <NavbarMinimal org={org} items={items} activeLang={activeLang} />;
  }
}

export async function SiteFooter({
  org,
  layout,
  themeIdentifier,
}: {
  org: OrgInfo;
  layout: SiteLayoutData;
  themeIdentifier?: string;
}) {
  const columns = layout.footerColumns.filter((c) => c.menuId);
  const columnMenus = await Promise.all(
    columns.map((col) => fetchMenu(org.id, col.menuId)),
  );

  switch (themeIdentifier) {
    case "shopingo":
      return <FooterShopingo org={org} columns={columns} columnMenus={columnMenus} />;
    case "academy":
      return <FooterAcademy org={org} columns={columns} columnMenus={columnMenus} />;
    default:
      return <FooterColumns org={org} columns={columns} columnMenus={columnMenus} />;
  }
}
