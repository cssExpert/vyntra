// Global navbar + footer rendered from the org's Layout config.
// Rendered server-side as RSC — fetches each menu directly.

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
  headerVariant: string;
  footerVariant: string;
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
async function NavbarMinimal({ org, items }: { org: OrgInfo; items: MenuItem[] }) {
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
            />
          )}
        </div>
      </div>
    </nav>
  );
}

/** logo + nav both centered · two-row */
async function NavbarCentered({ org, items }: { org: OrgInfo; items: MenuItem[] }) {
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
            />
          )}
        </div>
      </div>
    </nav>
  );
}

/** logo left · nav center · last item styled as CTA button right */
async function NavbarSplit({ org, items }: { org: OrgInfo; items: MenuItem[] }) {
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
async function NavbarDark({ org, items }: { org: OrgInfo; items: MenuItem[] }) {
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

/** Shopingo-style: dark utility top bar + white main nav + cart icon */
async function NavbarShopingo({ org, items }: { org: OrgInfo; items: MenuItem[] }) {
  return (
    <header className="sticky top-0 z-50">
      {/* Top utility bar */}
      {/*
      <div style={{ backgroundColor: "var(--foreground, #212529)" }}>
        <div className="max-w-6xl mx-auto px-6 h-9 flex items-center justify-between">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            Free shipping on orders over $99
          </span>
          <div className="flex items-center gap-5 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            <a href="/account" className="hover:text-white transition-colors" style={{ color: "inherit" }}>My Account</a>
            <a href="/wishlist" className="hover:text-white transition-colors" style={{ color: "inherit" }}>Wishlist</a>
          </div>
        </div>
      </div>
      */}

      {/* Main nav */}
      <nav
        style={{
          backgroundColor: "var(--background, #ffffff)",
          borderBottom: "1px solid var(--border, #e1e1e1)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="/"
            className="text-xl font-bold tracking-tight shrink-0 transition-opacity hover:opacity-70"
            style={{ fontFamily: "var(--font-heading, 'Raleway', sans-serif)", color: "var(--foreground, #212529)" }}
          >
            <OrgLogo org={org} />
          </a>

          {items.length > 0 && (
            <div className="flex items-center gap-7 flex-wrap">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target={item.target}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  className={["text-sm font-medium transition-opacity hover:opacity-60", visClass(item.visibility)].filter(Boolean).join(" ")}
                  style={{ color: "var(--foreground, #323232)" }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}

          {/* Language + Theme toggle + Cart icon */}
          <div className="flex items-center gap-3 shrink-0">
            {(org.siteLanguages?.length ?? 0) > 1 && (
              <SiteLanguageSwitcher
                orgId={org.id}
                available={org.siteLanguages!}
                defaultLang={org.defaultSiteLanguage ?? "en"}
              />
            )}
            {org.themeSwitcherEnabled && <SiteThemeToggle />}
            <button
              aria-label="Search"
              className="p-1.5 transition-opacity hover:opacity-60"
              style={{ color: "var(--foreground, #212529)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <button
              aria-label="Cart"
              className="relative p-1.5 transition-opacity hover:opacity-60"
              style={{ color: "var(--foreground, #212529)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

/** Shopingo-style: newsletter strip (dark) + columns (light) + bottom bar (dark) */
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

  return (
    <footer className="mt-24">
      {/* Newsletter strip */}
      <div style={{ backgroundColor: "var(--foreground, #212529)" }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading, 'Raleway', sans-serif)", color: "var(--background, #ffffff)" }}>
              Get Latest Updates
            </p>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              Subscribe to our newsletter for the latest offers
            </p>
          </div>
          <div className="flex w-full sm:w-auto max-w-sm">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: "var(--background, #ffffff)",
                color: "var(--foreground, #212529)",
                border: "none",
              }}
            />
            <button
              className="px-5 py-2.5 text-sm font-semibold shrink-0 transition-opacity hover:opacity-85"
              style={{
                backgroundColor: "var(--accent, #ff2c2c)",
                color: "#ffffff",
              }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Columns section */}
      <div
        style={{
          backgroundColor: "var(--muted, #f9f9f9)",
          borderTop: "1px solid var(--border, #e1e1e1)",
          borderBottom: "1px solid var(--border, #e1e1e1)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-14">
          {colCount > 0 && (
            <div className={`grid gap-10 ${gridClass(colCount)}`}>
              {columns.map((col, i) => {
                const items = columnMenus[i] ?? [];
                return (
                  <div key={i}>
                    {col.title && (
                      <h4
                        className="text-sm font-bold uppercase tracking-widest mb-4"
                        style={{ fontFamily: "var(--font-heading, 'Raleway', sans-serif)", color: "var(--foreground, #212529)" }}
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
                            className={["text-sm transition-colors hover:text-foreground", visClass(item.visibility)].filter(Boolean).join(" ")}
                            style={{ color: "var(--muted-foreground, #636363)" }}
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
          {colCount === 0 && (
            <p className="text-center text-sm" style={{ color: "var(--muted-foreground, #797979)" }}>
              {org.name}
            </p>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ backgroundColor: "var(--foreground, #212529)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
          <span>© {new Date().getFullYear()} {org.name}. All Rights Reserved.</span>
          <span>Powered by Vyntra</span>
        </div>
      </div>
    </footer>
  );
}

// ── Public entry points ───────────────────────────────────────────────────────

export async function SiteNavbar({
  org,
  layout,
}: {
  org: OrgInfo;
  layout: SiteLayoutData;
}) {
  const items = layout.navMenuId ? await fetchMenu(org.id, layout.navMenuId) : [];

  switch (layout.headerVariant) {
    case "centered":
      return <NavbarCentered org={org} items={items} />;
    case "split":
      return <NavbarSplit org={org} items={items} />;
    case "dark":
      return <NavbarDark org={org} items={items} />;
    case "shopingo":
      return <NavbarShopingo org={org} items={items} />;
    default:
      return <NavbarMinimal org={org} items={items} />;
  }
}

export async function SiteFooter({
  org,
  layout,
}: {
  org: OrgInfo;
  layout: SiteLayoutData;
}) {
  const columns = layout.footerColumns.filter((c) => c.menuId);
  const columnMenus = await Promise.all(
    columns.map((col) => fetchMenu(org.id, col.menuId)),
  );

  switch (layout.footerVariant) {
    case "simple":
      return <FooterSimple org={org} />;
    case "centered":
      return <FooterCentered org={org} columns={columns} columnMenus={columnMenus} />;
    case "dark":
      return <FooterDark org={org} columns={columns} columnMenus={columnMenus} />;
    case "shopingo":
      return <FooterShopingo org={org} columns={columns} columnMenus={columnMenus} />;
    default:
      return <FooterColumns org={org} columns={columns} columnMenus={columnMenus} />;
  }
}
