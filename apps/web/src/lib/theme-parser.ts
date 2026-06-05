import type { EditorNode } from "@/types/editor";
import type { ThemePage, ThemeAssets } from "@/modules/cms/themes/upload-types";
import { nanoid } from "nanoid";

// ---------------------------------------------------------------------------
// extractZipHtml
// Reads the uploaded ZIP, inlines all CSS (incl. @import + url() assets),
// converts <img> to base64, and returns live-renderable HTML.
// Uses DOMParser so attribute order never matters.
// ---------------------------------------------------------------------------

export interface ZipExtractResult {
  html: string;
  pages: ThemePage[];
  assets: ThemeAssets;
}

const IMG_EXTS  = /\.(png|jpe?g|gif|svg|webp|ico|avif)$/i;
const FONT_EXTS = /\.(ttf|woff2?|eot|otf)$/i;
const MIME: Record<string, string> = {
  png:  "image/png",   jpg:  "image/jpeg",  jpeg: "image/jpeg",
  gif:  "image/gif",   svg:  "image/svg+xml", webp: "image/webp",
  ico:  "image/x-icon", avif: "image/avif",
  ttf:  "font/ttf",   woff: "font/woff",   woff2: "font/woff2",
  eot:  "application/vnd.ms-fontobject",   otf:  "font/otf",
};

function fileExt(path: string) {
  return (path.split(".").pop() ?? "").toLowerCase();
}

/** Normalise slashes and strip leading ./ */
function normRef(ref: string) {
  return ref.replace(/\\/g, "/").replace(/^\.\//, "");
}

/** Return the directory prefix of a zip-internal path, e.g. "theme/css/" */
function dirOf(path: string) {
  const idx = path.lastIndexOf("/");
  return idx >= 0 ? path.slice(0, idx + 1) : "";
}

/** Look up a file in the zip map; tries baseDir + ref first, then ref bare. */
function lookup<T>(
  map: Map<string, T>,
  baseDir: string,
  ref: string,
): T | null {
  const clean = normRef(ref);
  return map.get(baseDir + clean) ?? map.get(clean) ?? null;
}

/** Inline all url() tokens in a CSS string with base64 data URIs. */
async function inlineCssUrls(
  css: string,
  cssDir: string,
  b64Map: Map<string, () => Promise<string>>,
): Promise<string> {
  const urlRe = /url\(["']?([^"')#?]+)["']?\)/gi;
  for (const m of [...css.matchAll(urlRe)]) {
    const ref = m[1];
    if (ref.startsWith("data:") || ref.startsWith("http") || ref.startsWith("//")) continue;
    const loader = lookup(b64Map, cssDir, ref);
    if (!loader) continue;
    try {
      const b64  = await loader();
      const mime = MIME[fileExt(ref)] ?? "application/octet-stream";
      css = css.split(m[0]).join(`url("data:${mime};base64,${b64}")`);
    } catch { /* skip */ }
  }
  return css;
}

/** Resolve @import statements recursively (one level deep is enough for most themes). */
async function resolveImports(
  css: string,
  cssDir: string,
  strMap: Map<string, () => Promise<string>>,
  b64Map: Map<string, () => Promise<string>>,
): Promise<string> {
  const importRe = /@import\s+(?:url\(["']?([^"')]+)["']?\)|["']([^"']+)["'])[^;]*;/gi;
  for (const m of [...css.matchAll(importRe)]) {
    const ref = m[1] ?? m[2];
    if (!ref || ref.startsWith("http") || ref.startsWith("//")) continue;
    const loader = lookup(strMap, cssDir, ref);
    if (!loader) continue;
    try {
      const importedDir = dirOf(cssDir + normRef(ref));
      let importedCss   = await loader();
      importedCss       = await inlineCssUrls(importedCss, importedDir, b64Map);
      css = css.split(m[0]).join(importedCss);
    } catch { /* skip */ }
  }
  return css;
}

export async function extractZipHtml(file: File): Promise<ZipExtractResult> {
  const JSZip = (await import("jszip")).default;
  const zip   = await JSZip.loadAsync(file);

  // ── Build file maps (normalise all paths to forward slashes) ────────────────
  const strMap = new Map<string, () => Promise<string>>();
  const b64Map = new Map<string, () => Promise<string>>();
  zip.forEach((rawPath, entry) => {
    if (entry.dir) return;
    const p = rawPath.replace(/\\/g, "/");
    strMap.set(p, () => entry.async("string"));
    b64Map.set(p, () => entry.async("base64"));
  });

  const paths = [...strMap.keys()];

  // ── Asset counts ────────────────────────────────────────────────────────────
  const assets: ThemeAssets = {
    images:   paths.filter(p => IMG_EXTS.test(p)).length,
    cssFiles: paths.filter(p => p.endsWith(".css")).length,
    jsFiles:  paths.filter(p => p.endsWith(".js")).length,
    fonts:    paths.filter(p => FONT_EXTS.test(p)).length,
  };

  // ── Detect pages ────────────────────────────────────────────────────────────
  const htmlPaths = paths.filter(p => p.endsWith(".html") || p.endsWith(".htm"));
  const pages: ThemePage[] = htmlPaths.map(p => {
    const fileName = p.split("/").pop() ?? p;
    const rawName  = fileName.replace(/\.html?$/i, "").replace(/[-_]/g, " ");
    return {
      name:   rawName.charAt(0).toUpperCase() + rawName.slice(1),
      file:   fileName,
      isMain: fileName.toLowerCase() === "index.html",
    };
  });
  if (pages.length > 0 && !pages.some(pg => pg.isMain)) pages[0].isMain = true;

  // ── Find main HTML file ─────────────────────────────────────────────────────
  // Prefer a root-level index.html; fall back to any index.html; then any .html
  const mainPath =
    htmlPaths.find(p => p.toLowerCase() === "index.html") ??
    htmlPaths.find(p => p.split("/").pop()?.toLowerCase() === "index.html") ??
    htmlPaths[0];

  if (!mainPath) throw new Error("No .html file found in the ZIP.");

  const htmlStr = await strMap.get(mainPath)!();
  const baseDir = dirOf(mainPath);   // e.g. "mytheme/" or ""

  // ── Parse with DOMParser (handles any attribute order) ──────────────────────
  const doc = new DOMParser().parseFromString(htmlStr, "text/html");

  // ── Inline stylesheet <link> elements ───────────────────────────────────────
  // querySelectorAll handles href-before-rel, extra attributes, etc.
  for (const link of Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))) {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("//") || href.startsWith("data:")) continue;

    const cssLoader = lookup(strMap, baseDir, href);
    if (!cssLoader) continue;
    try {
      const cssDir = dirOf(baseDir + normRef(href));
      let css      = await cssLoader();
      css          = await resolveImports(css, cssDir, strMap, b64Map);
      css          = await inlineCssUrls(css, cssDir, b64Map);

      const style = doc.createElement("style");
      style.textContent = css;
      link.replaceWith(style);
    } catch { /* leave the <link> in place */ }
  }

  // ── Inline <style> blocks that contain url() (e.g. background images) ───────
  for (const style of Array.from(doc.querySelectorAll("style"))) {
    try {
      style.textContent = await inlineCssUrls(style.textContent ?? "", baseDir, b64Map);
    } catch { /* skip */ }
  }

  // ── Convert <img src> to base64 ─────────────────────────────────────────────
  for (const img of Array.from(doc.querySelectorAll<HTMLImageElement>("img[src]"))) {
    const src = img.getAttribute("src");
    if (!src || src.startsWith("http") || src.startsWith("//") || src.startsWith("data:")) continue;
    const loader = lookup(b64Map, baseDir, src);
    if (!loader) continue;
    try {
      img.setAttribute("src", `data:${MIME[fileExt(src)] ?? "image/png"};base64,${await loader()}`);
    } catch { /* skip */ }
  }

  // ── Convert CSS background / src on other elements (via inline style) ───────
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>("[style]"))) {
    const inlineStyle = el.getAttribute("style") ?? "";
    if (!inlineStyle.includes("url(")) continue;
    try {
      el.setAttribute("style", await inlineCssUrls(inlineStyle, baseDir, b64Map));
    } catch { /* skip */ }
  }

  // ── Remove only LOCAL scripts; keep CDN scripts (e.g. Tailwind CDN) ──────────
  // Removing cdn.tailwindcss.com or similar would strip all Tailwind styling.
  for (const s of Array.from(doc.querySelectorAll("script[src]"))) {
    const src = s.getAttribute("src") ?? "";
    const isExternal = src.startsWith("http") || src.startsWith("//");
    if (!isExternal) s.remove();
  }

  // ── Serialize back to a full HTML document ──────────────────────────────────
  const finalHtml = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;

  return { html: finalHtml, pages, assets };
}

// ---------------------------------------------------------------------------
// convertHtmlToNodes
// ---------------------------------------------------------------------------
export function convertHtmlToNodes(html: string): EditorNode[] {
  if (typeof window === "undefined") return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;

  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "LINK", "META"]);

  function domToNode(el: Element, depth: number): EditorNode | null {
    if (SKIP_TAGS.has(el.tagName)) return null;

    const tag = el.tagName.toLowerCase();
    const className = el.getAttribute("class") ?? "";
    const content = el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE
      ? (el.childNodes[0].textContent ?? "").trim()
      : "";

    const childNodes: EditorNode[] = [];
    if (depth < 3) {
      let count = 0;
      for (const child of Array.from(el.children)) {
        if (count >= 10) break;
        const node = domToNode(child, depth + 1);
        if (node) {
          childNodes.push(node);
          count++;
        }
      }
    }

    return {
      id: nanoid(8),
      type: "element",
      tag,
      className,
      content: content || undefined,
      children: childNodes.length > 0 ? childNodes : undefined,
    };
  }

  const result: EditorNode[] = [];
  let count = 0;
  for (const child of Array.from(body.children)) {
    if (count >= 20) break;
    const node = domToNode(child, 0);
    if (node) {
      result.push(node);
      count++;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Color scheme helper
// ---------------------------------------------------------------------------
interface ColorScheme {
  bg: string;
  accent: string;
  text: string;
  cardBg: string;
  navBg: string;
  footerBg: string;
}

function getColorScheme(category: string): ColorScheme {
  switch (category) {
    case "Cosmetics":
      return { bg: "#0f3430", accent: "#fbbf24", text: "#f0fdf4", cardBg: "#134e48", navBg: "#0a2520", footerBg: "#0a2520" };
    case "Business":
      return { bg: "#1e3a5f", accent: "#60a5fa", text: "#eff6ff", cardBg: "#1e4070", navBg: "#132740", footerBg: "#132740" };
    case "Agency":
      return { bg: "#0a0a0a", accent: "#8b5cf6", text: "#f5f3ff", cardBg: "#18181b", navBg: "#000000", footerBg: "#000000" };
    case "Resume":
      return { bg: "#111827", accent: "#10b981", text: "#ecfdf5", cardBg: "#1f2937", navBg: "#0f172a", footerBg: "#0f172a" };
    case "Portfolio":
    default:
      return { bg: "#111111", accent: "#fb7185", text: "#fff1f2", cardBg: "#1e1e1e", navBg: "#0a0a0a", footerBg: "#0a0a0a" };
  }
}

// ---------------------------------------------------------------------------
// generatePreviewHtml
// ---------------------------------------------------------------------------
export function generatePreviewHtml(name: string, description: string, category: string): string {
  const c = getColorScheme(category);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} Preview</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: ${c.bg}; color: ${c.text}; line-height: 1.6; }
    nav { background: ${c.navBg}; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .logo { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.03em; color: ${c.accent}; }
    .nav-links { display: flex; gap: 1.5rem; list-style: none; }
    .nav-links a { color: ${c.text}; text-decoration: none; font-size: 0.875rem; opacity: 0.8; transition: opacity 0.2s; }
    .nav-links a:hover { opacity: 1; color: ${c.accent}; }
    .hero { padding: 6rem 2rem 5rem; text-align: center; background: linear-gradient(135deg, ${c.bg} 0%, ${c.cardBg} 100%); }
    .hero h1 { font-size: clamp(2rem, 6vw, 3.5rem); font-weight: 900; letter-spacing: -0.04em; margin-bottom: 1rem; color: ${c.text}; }
    .hero h1 span { color: ${c.accent}; }
    .hero p { font-size: 1.125rem; opacity: 0.75; max-width: 560px; margin: 0 auto 2rem; }
    .btn { display: inline-block; padding: 0.85rem 2rem; background: ${c.accent}; color: #000; font-weight: 700; font-size: 0.9rem; border-radius: 0.5rem; text-decoration: none; letter-spacing: 0.02em; }
    .features { padding: 5rem 2rem; }
    .features h2 { text-align: center; font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; color: ${c.text}; }
    .features .subtitle { text-align: center; opacity: 0.6; margin-bottom: 3rem; font-size: 0.95rem; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; max-width: 900px; margin: 0 auto; }
    .card { background: ${c.cardBg}; border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.75rem 1.5rem; }
    .card-icon { width: 40px; height: 40px; background: ${c.accent}20; border-radius: 0.75rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; }
    .card-icon svg { width: 20px; height: 20px; fill: ${c.accent}; }
    .card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; color: ${c.text}; }
    .card p { font-size: 0.85rem; opacity: 0.65; line-height: 1.6; }
    footer { background: ${c.footerBg}; padding: 2.5rem 2rem; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); }
    footer p { font-size: 0.8rem; opacity: 0.5; }
    footer .footer-accent { color: ${c.accent}; font-weight: 600; }
  </style>
</head>
<body>
  <nav>
    <span class="logo">${name || "Theme"}</span>
    <ul class="nav-links">
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Work</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </nav>

  <section class="hero">
    <h1>${name ? `<span>${name}</span>` : "<span>Your Theme</span>"}</h1>
    <p>${description || "A beautifully crafted theme ready to be customized for your next project."}</p>
    <a href="#" class="btn">Get Started</a>
  </section>

  <section class="features">
    <h2>Key Features</h2>
    <p class="subtitle">Everything you need to launch a stunning website</p>
    <div class="cards">
      <div class="card">
        <div class="card-icon">
          <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <h3>Modern Design</h3>
        <p>Clean layouts with contemporary aesthetics that engage your visitors instantly.</p>
      </div>
      <div class="card">
        <div class="card-icon">
          <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
        <h3>Fully Responsive</h3>
        <p>Looks perfect on every device — desktop, tablet, and mobile.</p>
      </div>
      <div class="card">
        <div class="card-icon">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        </div>
        <h3>Fast Performance</h3>
        <p>Optimized for speed with lightweight code and efficient asset loading.</p>
      </div>
    </div>
  </section>

  <footer>
    <p>Built with <span class="footer-accent">${name || "Vyntra Themes"}</span> &mdash; Crafted for the modern web.</p>
  </footer>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// generateMockPages
// ---------------------------------------------------------------------------
export function generateMockPages(category: string): ThemePage[] {
  const configs: Record<string, Array<{ name: string; file: string; isMain: boolean }>> = {
    Cosmetics: [
      { name: "Home", file: "index.html", isMain: true },
      { name: "Shop", file: "shop.html", isMain: false },
      { name: "Ingredients", file: "ingredients.html", isMain: false },
      { name: "About", file: "about.html", isMain: false },
      { name: "Contact", file: "contact.html", isMain: false },
    ],
    Portfolio: [
      { name: "Home", file: "index.html", isMain: true },
      { name: "Work", file: "work.html", isMain: false },
      { name: "About", file: "about.html", isMain: false },
      { name: "Contact", file: "contact.html", isMain: false },
    ],
    Business: [
      { name: "Home", file: "index.html", isMain: true },
      { name: "Services", file: "services.html", isMain: false },
      { name: "Pricing", file: "pricing.html", isMain: false },
      { name: "Team", file: "team.html", isMain: false },
      { name: "Blog", file: "blog.html", isMain: false },
      { name: "Contact", file: "contact.html", isMain: false },
    ],
    Agency: [
      { name: "Home", file: "index.html", isMain: true },
      { name: "About", file: "about.html", isMain: false },
      { name: "Services", file: "services.html", isMain: false },
      { name: "Case Studies", file: "case-studies.html", isMain: false },
      { name: "Careers", file: "careers.html", isMain: false },
      { name: "Contact", file: "contact.html", isMain: false },
    ],
    Resume: [
      { name: "Home", file: "index.html", isMain: true },
      { name: "Experience", file: "experience.html", isMain: false },
      { name: "Skills", file: "skills.html", isMain: false },
      { name: "Projects", file: "projects.html", isMain: false },
      { name: "Contact", file: "contact.html", isMain: false },
    ],
  };

  return configs[category] ?? configs.Portfolio;
}

// ---------------------------------------------------------------------------
// generateMockAssets
// ---------------------------------------------------------------------------
export function generateMockAssets(): ThemeAssets {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  return {
    images: rand(10, 24),
    cssFiles: rand(2, 4),
    jsFiles: rand(3, 6),
    fonts: rand(2, 3),
  };
}
