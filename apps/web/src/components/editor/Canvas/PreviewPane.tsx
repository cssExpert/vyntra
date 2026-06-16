"use client";

import { resolveThemeBlock } from "@/lib/themes/themeBlockResolver";
import { useEditorStore } from "@/store/editorStore";
import type { EditorNode } from "@/types/editor";

// ── Minimal static Shopingo header for the preview ────────────────────────────

function PreviewHeader({ orgName }: { orgName: string }) {
  return (
    <header className="sticky top-0 z-50 shadow-sm pointer-events-none select-none">
      {/* Utility bar */}
      <div className="bg-[#1e2226]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between">
          <span className="text-xs text-white/55">Free shipping on orders over $99</span>
          <div className="flex items-center gap-3">
            {["M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
              "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z"
            ].map((d, i) => (
              <span key={i} className="text-white/40">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="bg-white dark:bg-[#1c1c1e] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[70px] flex items-center gap-6">
          <span className="shrink-0 text-2xl font-extrabold tracking-tight text-[#212529] dark:text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>
            {orgName}
          </span>
          <div className="flex-1 hidden md:flex max-w-xl">
            <div className="flex w-full border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
              <span className="flex-1 px-4 py-2.5 text-sm text-gray-400 bg-white dark:bg-[#2a2a2e]">
                Search products…
              </span>
              <span className="px-5 py-2.5 text-white text-sm font-semibold shrink-0 bg-[#e4611e]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1 shrink-0 text-[#212529] dark:text-gray-100">
            <span className="p-2.5 rounded-full">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </span>
            <span className="relative p-2.5 rounded-full">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#e4611e] text-white flex items-center justify-center text-[9px] font-bold">0</span>
            </span>
          </div>
        </div>
      </div>

      {/* Category nav strip — placeholder */}
      <div className="bg-white dark:bg-[#1c1c1e] border-b-2 border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
          <span className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-white shrink-0 mr-2 bg-[#e4611e]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            All Categories
          </span>
          {["Home", "Shop", "About", "Blog", "Contact"].map((label) => (
            <span key={label} className="px-4 py-3.5 text-sm font-medium whitespace-nowrap text-[#4a4a4a] dark:text-gray-300">
              {label}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

// ── Minimal static Shopingo footer for the preview ────────────────────────────

function PreviewFooter({ orgName }: { orgName: string }) {
  const SOCIAL_PATHS = [
    "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z",
    "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z",
    "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z",
  ];

  const columns = [
    { title: "Shop", links: ["New Arrivals", "Best Sellers", "Sale", "All Products"] },
    { title: "Support", links: ["Help Center", "Shipping Info", "Returns", "Contact Us"] },
    { title: "Company", links: ["About Us", "Careers", "Press", "Blog"] },
  ];

  return (
    <footer className="pointer-events-none select-none">
      {/* Newsletter strip */}
      <div className="bg-[#1e2226]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-lg font-bold text-white">Get Latest Updates</p>
            <p className="text-sm mt-1 text-white/50">Subscribe to our newsletter for the latest offers &amp; deals</p>
          </div>
          <div className="flex w-full sm:w-auto max-w-sm overflow-hidden border border-white/20 rounded">
            <span className="flex-1 px-4 py-2.5 text-sm bg-white text-gray-400">Enter your email address</span>
            <span className="px-5 py-2.5 text-sm font-semibold text-white shrink-0 bg-[#e4611e]">Subscribe</span>
          </div>
        </div>
      </div>

      {/* Main columns */}
      <div className="bg-[#f7f7f7] dark:bg-[#151518] border-t border-b border-[#e8e8e8] dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid gap-10 grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div>
              <span className="block mb-4 text-2xl font-extrabold text-[#212529] dark:text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>{orgName}</span>
              <p className="text-sm leading-relaxed mb-5 text-[#636363] dark:text-gray-400">Your one-stop destination for quality products at great prices. Shop with confidence.</p>
              <div className="flex items-center gap-2.5">
                {SOCIAL_PATHS.map((d, i) => (
                  <span key={i} className="w-8 h-8 rounded-full flex items-center justify-center bg-[#212529] dark:bg-gray-700 text-white/70">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
                  </span>
                ))}
              </div>
            </div>
            {/* Link columns */}
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold uppercase tracking-widest mb-4 text-[#212529] dark:text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link} className="text-sm text-[#636363] dark:text-gray-400">{link}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#1e2226]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/45">
          <span>© {new Date().getFullYear()} {orgName}. All Rights Reserved.</span>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
            <span>Powered by Vyntra</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Render a single EditorNode as HTML (for non-typed-block nodes) ─────────────

function RenderHtmlNode({ node }: { node: EditorNode }) {
  const Tag = (node.tag || "div") as React.ElementType;
  const props: Record<string, unknown> = {
    className: node.className || undefined,
    style: node.styles && Object.keys(node.styles).length > 0 ? node.styles : undefined,
    ...node.props,
  };

  if (node.children?.length) {
    return (
      <Tag {...props}>
        {node.children.map((child) => <RenderHtmlNode key={child.id} node={child} />)}
      </Tag>
    );
  }

  if (node.content && /<[a-z]/i.test(node.content)) {
    return <Tag {...props} dangerouslySetInnerHTML={{ __html: node.content }} />;
  }

  return <Tag {...props}>{node.content ?? undefined}</Tag>;
}

// ── Main preview pane ─────────────────────────────────────────────────────────

export default function PreviewPane() {
  const { nodes, themeIdentifier } = useEditorStore();

  if (nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#121214]">
        <div className="text-center">
          <svg className="mx-auto mb-4 text-gray-300 dark:text-gray-600" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Add blocks to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#121214]">
      <PreviewHeader orgName="My Store" />

      <main>
        {nodes.map((node) => {
          if (node.type === "typed-block" && node.blockType) {
            const Component = resolveThemeBlock(node.blockType, themeIdentifier);
            if (!Component) {
              return (
                <div key={node.id} className="py-8 text-center text-sm text-gray-400">
                  Unknown block: {node.blockType}
                </div>
              );
            }
            return <Component key={node.id} data={node.blockData ?? {}} />;
          }
          return <RenderHtmlNode key={node.id} node={node} />;
        })}
      </main>

      <PreviewFooter orgName="My Store" />
    </div>
  );
}
