import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageNodeView } from "./ImageNodeView";

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (el) =>
          (el.getAttribute("data-align") as
            | "left"
            | "center"
            | "right"
            | "full") ?? "center",
        renderHTML: ({ align }) => ({ "data-align": align }),
      },
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-width") ?? null,
        renderHTML: ({ width }) =>
          width
            ? { "data-width": width, style: `width:${width};max-width:100%` }
            : {},
      },
      caption: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-caption") ?? null,
        renderHTML: ({ caption }) =>
          caption != null ? { "data-caption": caption } : {},
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
