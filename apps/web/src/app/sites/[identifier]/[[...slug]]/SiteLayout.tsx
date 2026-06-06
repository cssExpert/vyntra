// Global navbar + footer rendered from the org's SiteLayout config.
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

// Visibility array → Tailwind class (mirrors NodeRenderer)
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

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-gray-900 hover:text-gray-600 transition-colors shrink-0"
        >
          {org.name}
        </a>
        {items.length > 0 && (
          <div className="flex items-center gap-6 flex-wrap">
            {items.map((item) => {
              const cls = [
                "text-sm text-gray-600 hover:text-gray-900 transition-colors",
                visClass(item.visibility),
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target={item.target}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  className={cls}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
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

  const colCount = columns.length;
  const gridClass =
    colCount === 0
      ? ""
      : colCount === 1
        ? "grid-cols-1"
        : colCount === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : colCount === 3
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-2 lg:grid-cols-4";

  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {colCount > 0 && (
          <div className={`grid gap-10 mb-12 ${gridClass}`}>
            {columns.map((col, i) => {
              const items = columnMenus[i] ?? [];
              return (
                <div key={i}>
                  {col.title && (
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                      {col.title}
                    </h4>
                  )}
                  <ul className="space-y-2.5">
                    {items.map((item) => {
                      const cls = [
                        "text-sm text-gray-500 hover:text-gray-900 transition-colors",
                        visClass(item.visibility),
                      ]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <li key={item.id}>
                          <a
                            href={item.url}
                            target={item.target}
                            rel={
                              item.target === "_blank"
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className={cls}
                          >
                            {item.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        <div
          className={`${colCount > 0 ? "border-t border-gray-100 pt-8" : ""} text-center text-sm text-gray-400`}
        >
          © {new Date().getFullYear()} {org.name}
        </div>
      </div>
    </footer>
  );
}
