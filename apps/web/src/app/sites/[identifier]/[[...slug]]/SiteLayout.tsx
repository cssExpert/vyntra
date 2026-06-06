// Global navbar + footer rendered from the org's Layout config.
// Rendered server-side as RSC — fetches each menu directly.

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
          {org.name}
        </a>
        {items.length > 0 && (
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
          </div>
        )}
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
          {org.name}
        </a>
        {items.length > 0 && (
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
          </div>
        )}
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
          {org.name}
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

        {/* CTA — right */}
        <div className="justify-self-end">
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
          {org.name}
        </a>
        {items.length > 0 && (
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
          </div>
        )}
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

// ── Public entry points ───────────────────────────────────────────────────────

export async function SiteNavbar({
  org,
  layout,
}: {
  org: OrgInfo;
  layout: SiteLayoutData;
}) {
  const items = layout.navMenuId
    ? await fetchMenu(org.id, layout.navMenuId)
    : [];

  switch (layout.headerVariant) {
    case "centered":
      return <NavbarCentered org={org} items={items} />;
    case "split":
      return <NavbarSplit org={org} items={items} />;
    case "dark":
      return <NavbarDark org={org} items={items} />;
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
    default:
      return <FooterColumns org={org} columns={columns} columnMenus={columnMenus} />;
  }
}
