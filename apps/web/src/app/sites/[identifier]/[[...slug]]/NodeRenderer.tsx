import { createElement, type ReactNode } from "react";
import type { EditorNode } from "@/types/editor";

const VOID_TAGS = new Set(["input", "img", "br", "hr", "meta", "link"]);
const INERT_TAGS = new Set(["script", "style", "noscript"]);

function RenderNode({ node }: { node: EditorNode }): ReactNode {
  if (INERT_TAGS.has(node.tag)) return null;

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
        createElement(RenderNode, { key: child.id, node: child }),
      ),
    );
  }

  // Content with embedded HTML markup
  if (node.content && /<[a-z]/i.test(node.content)) {
    return createElement(node.tag, {
      ...attrs,
      dangerouslySetInnerHTML: { __html: node.content },
    });
  }

  return createElement(node.tag, attrs, node.content ?? undefined);
}

export function NodeRenderer({ nodes }: { nodes: EditorNode[] }) {
  return (
    <>
      {nodes.map((node) => (
        <RenderNode key={node.id} node={node} />
      ))}
    </>
  );
}
