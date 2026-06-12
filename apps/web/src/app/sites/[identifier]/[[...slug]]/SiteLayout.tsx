// Global navbar + footer rendered from the org's Layout config.
// Rendered server-side as RSC — fetches each menu directly.

import { cookies } from "next/headers";
import { SiteThemeToggle } from "./SiteThemeToggle";
import { SiteLanguageSwitcher } from "./SiteLanguageSwitcher";

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
        <a
          href="/"
          className="text-lg font-bold tracking-tight shrink-0 transition-opacity hover:opacity-70"
          style={{ color: "var(--primary, #3b82f6)" }}
        >
          <OrgLogo org={org} />
        </a>
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
        <a
          href="/"
          className="text-xl font-bold tracking-tight transition-opacity hover:opacity-70"
          style={{ color: "var(--primary, #3b82f6)" }}
        >
          <OrgLogo org={org} />
        </a>
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
        <a
          href="/"
          className="text-lg font-bold tracking-tight transition-opacity hover:opacity-70 justify-self-start"
          style={{ color: "var(--primary, #3b82f6)" }}
        >
          <OrgLogo org={org} />
        </a>

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
        <a
          href="/"
          className="text-lg font-bold tracking-tight shrink-0 transition-opacity hover:opacity-70"
          style={{ color: "var(--background, #ffffff)" }}
        >
          <OrgLogo org={org} />
        </a>
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

/** Shopingo-style: dark utility bar + white main navbar + category nav strip */
async function NavbarShopingo({ org, items, activeLang }: { org: OrgInfo; items: MenuItem[]; activeLang: string }) {
  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* ── Utility bar ─────────────────────────────── */}
      <div style={{ backgroundColor: "#212529" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            <span className="hidden sm:flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 13.7a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              1800-000-0000
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              Free shipping on orders over $99
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            {/* Social icons */}
            {[
              { label: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
              { label: "Twitter/X", path: "M22 4s-.7 2.1-2 3.4c1.6 17.1-8.6 26.9-18 26.9-4.3 0-8-.3-10.5-1.6 0 0 4.2 1.3 8.7-1.5-3.6-.5-6.3-4.1-7-7.6 1.1.5 2.7.4 3.8-.2C-4.6 22.2-7 17.4-7 12.6v-.3c1 .8 2.4 1.3 3.7 1.3C-7.7 11.1-8 4.6-5 0c3.9 5.7 9.7 9.4 16.3 9.8-.7-4.3 3.8-6.7 6.5-3.8 1.9-.4 3.6-1.4 5.2-2" },
              { label: "Instagram", path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" },
            ].map((s) => (
              <a key={s.label} href="#" aria-label={s.label} className="transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.45)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
            {(org.siteLanguages?.length ?? 0) > 1 && (
              <SiteLanguageSwitcher orgId={org.id} available={org.siteLanguages!} defaultLang={org.defaultSiteLanguage ?? "en"} activeLang={activeLang} />
            )}
          </div>
        </div>
      </div>

      {/* ── Main navbar ─────────────────────────────── */}
      <div style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e1e1e1" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[70px] flex items-center gap-6">
          {/* Logo */}
          <a href="/" className="shrink-0 text-2xl font-extrabold tracking-tight" style={{ color: "#212529", fontFamily: "'Raleway', sans-serif" }}>
            <OrgLogo org={org} className="h-10" />
          </a>

          {/* Search bar */}
          <div className="flex-1 hidden md:flex max-w-xl">
            <div className="flex w-full border border-gray-200 rounded overflow-hidden">
              <input
                type="text"
                placeholder="Search products…"
                className="flex-1 px-4 py-2.5 text-sm outline-none text-gray-700 bg-white"
                readOnly
              />
              <button className="px-5 py-2.5 text-white text-sm font-semibold shrink-0" style={{ backgroundColor: "#e4611e" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </div>
          </div>

          {/* Action icons */}
          <div className="ml-auto flex items-center gap-1 shrink-0">
            {/* Mobile search */}
            <button className="md:hidden p-2.5 rounded-full hover:bg-gray-100 transition-colors" style={{ color: "#212529" }} aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            {/* Wishlist */}
            <button className="p-2.5 rounded-full hover:bg-gray-100 transition-colors relative" style={{ color: "#212529" }} aria-label="Wishlist">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            {/* Cart */}
            <button className="p-2.5 rounded-full hover:bg-gray-100 transition-colors relative" style={{ color: "#212529" }} aria-label="Cart">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: "#e4611e" }}>0</span>
            </button>
            {org.themeSwitcherEnabled && <SiteThemeToggle />}
          </div>
        </div>
      </div>

      {/* ── Category nav strip ──────────────────────── */}
      {items.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", borderBottom: "2px solid #e1e1e1" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-0 overflow-x-auto no-scrollbar">
            {/* All Categories button */}
            <div className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-white shrink-0 mr-2" style={{ backgroundColor: "#e4611e" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              All Categories
            </div>
            {items.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className={["px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors hover:text-orange-600", visClass(item.visibility)].filter(Boolean).join(" ")}
                style={{ color: "#4a4a4a" }}
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
      {/* ── Newsletter strip ────────────────────────── */}
      <div style={{ backgroundColor: "#212529" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-lg font-bold text-white">Get Latest Updates</p>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              Subscribe to our newsletter for the latest offers &amp; deals
            </p>
          </div>
          <div className="flex w-full sm:w-auto max-w-sm overflow-hidden border border-white/20 rounded">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2.5 text-sm outline-none bg-white text-gray-800"
              readOnly
            />
            <button className="px-5 py-2.5 text-sm font-semibold text-white shrink-0" style={{ backgroundColor: "#e4611e" }}>
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* ── Main columns ─────────────────────────────── */}
      <div style={{ backgroundColor: "#f5f5f5", borderTop: "1px solid #e1e1e1", borderBottom: "1px solid #e1e1e1" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className={`grid gap-10 ${colCount > 0 ? gridClass(colCount + 1) : "grid-cols-1"}`}>
            {/* Brand column */}
            <div>
              <a href="/" className="block mb-4">
                <OrgLogo org={org} className="h-10" />
              </a>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#636363" }}>
                Your one-stop destination for quality products at great prices. Shop with confidence.
              </p>
              <div className="flex items-center gap-3">
                {SOCIAL.map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-orange-600 hover:text-white"
                    style={{ backgroundColor: "#212529", color: "rgba(255,255,255,0.7)" }}
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
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#212529", fontFamily: "'Raleway', sans-serif" }}>
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
                          className={["text-sm transition-colors hover:text-orange-600", visClass(item.visibility)].filter(Boolean).join(" ")}
                          style={{ color: "#636363" }}
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

      {/* ── Bottom bar ───────────────────────────────── */}
      <div style={{ backgroundColor: "#212529" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
          <span>© {new Date().getFullYear()} {org.name}. All Rights Reserved.</span>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-white transition-colors" style={{ color: "inherit" }}>Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors" style={{ color: "inherit" }}>Terms of Use</a>
            <span>Powered by Vyntra</span>
          </div>
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
    default:
      return <FooterColumns org={org} columns={columns} columnMenus={columnMenus} />;
  }
}
