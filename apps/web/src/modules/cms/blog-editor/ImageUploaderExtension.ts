import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageUploaderView } from "./ImageUploaderView";

export const ImageUploader = Node.create({
  name: "imageUploader",
  group: "block",
  atom: true,
  draggable: false,
  selectable: true,

  addAttributes() {
    return {};
  },

  parseHTML() {
    return [{ tag: "div[data-image-uploader]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-image-uploader": "" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageUploaderView);
  },
});
