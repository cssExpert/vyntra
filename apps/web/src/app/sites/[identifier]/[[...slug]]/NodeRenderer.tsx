import { createElement, type ReactNode } from "react";
import type { EditorNode } from "@/types/editor";

const VOID_TAGS = new Set(["input", "img", "br", "hr", "meta", "link"]);
const INERT_TAGS = new Set(["script", "style", "noscript"]);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Visibility array → Tailwind class
function visibilityToClass(vis: string[]): string {
  if (!vis?.length || vis.includes("all")) return "";
  const m = vis.includes("mobile");
  const t = vis.includes("tablet");
  const d = vis.includes("desktop");
  if (m && t && d) return "";
  if (m && t && !d) return "lg:hidden";
  if (t && d && !m) return "hidden md:block";
  if (m && d && !t) return "block md:hidden lg:block";
  if (m && !t && !d) return "block md:hidden";
  if (t && !m && !d) return "hidden md:block lg:hidden";
  if (d && !m && !t) return "hidden lg:block";
  return "";
}

// Async RSC: fetches the live menu and renders it
async function LiveMenuBlock({
  menuId,
  orgId,
  className,
}: {
  menuId: string;
  orgId: string;
  className?: string;
}) {
  let menu: {
    visibility: string[];
    items: { id: string; label: string; url: string; target: string }[];
  } | null = null;

  try {
    const res = await fetch(`${API}/public/sites/${orgId}/menus/${menuId}`, {
      cache: "no-store",
    });
    if (res.ok) menu = await res.json();
  } catch {
    // menu fetch failed — render nothing
  }

  if (!menu) return null;

  const visClass = visibilityToClass(menu.visibility);
  const combinedClass = [className, visClass].filter(Boolean).join(" ");

  return (
    <nav className={combinedClass || undefined}>
      {menu.items.map((item) => {
        const itemVis = (item as { visibility?: string[] }).visibility ?? [];
        const itemVisClass = visibilityToClass(itemVis);
        return (
          <a
            key={item.id}
            href={item.url}
            target={item.target}
            rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
            className={itemVisClass || undefined}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

function RenderNode({
  node,
  orgId,
}: {
  node: EditorNode;
  orgId?: string;
}): ReactNode {
  if (INERT_TAGS.has(node.tag)) return null;

  // If this node has a linked menu and orgId is available, delegate to LiveMenuBlock
  const menuId = node.props?.["data-menu-id"] as string | undefined;
  if (menuId && orgId) {
    return (
      <LiveMenuBlock
        menuId={menuId}
        orgId={orgId}
        className={node.className || undefined}
      />
    );
  }

  const attrs: Record<string, unknown> = {
    className: node.className || undefined,
    ...node.props,
  };

  if (node.styles && Object.keys(node.styles).length > 0) {
    attrs.style = node.styles;
  }

  if (VOID_TAGS.has(node.tag)) {
    return createElement(node.tag, attrs);
  }

  if (node.children?.length) {
    return createElement(
      node.tag,
      attrs,
      ...node.children.map((child) =>
        createElement(RenderNode, { key: child.id, node: child, orgId }),
      ),
    );
  }

  if (node.content && /<[a-z]/i.test(node.content)) {
    return createElement(node.tag, {
      ...attrs,
      dangerouslySetInnerHTML: { __html: node.content },
    });
  }

  return createElement(node.tag, attrs, node.content ?? undefined);
}

export function NodeRenderer({
  nodes,
  orgId,
}: {
  nodes: EditorNode[];
  orgId?: string;
}) {
  return (
    <>
      {nodes.map((node) => (
        <RenderNode key={node.id} node={node} orgId={orgId} />
      ))}
    </>
  );
}
