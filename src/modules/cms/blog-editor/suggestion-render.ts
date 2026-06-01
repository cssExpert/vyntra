"use client";

import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance } from "tippy.js";
import type { ComponentType } from "react";

export interface SuggestionListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

// Shared, null-safe tippy + ReactRenderer lifecycle for any "@", ":" etc.
// suggestion. Pass the React list component to render.
export function makeSuggestionRender(Component: ComponentType<Record<string, unknown>>) {
  return () => {
    let component: ReactRenderer | undefined;
    let popup: Instance[] | undefined;

    return {
      onStart: (props: { clientRect?: (() => DOMRect | null) | null; editor: unknown }) => {
        if (!props.clientRect) return;
        component = new ReactRenderer(Component, {
          props,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          editor: props.editor as any,
        });
        popup = tippy("body", {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
          animation: false,
        });
      },
      onUpdate: (props: { clientRect?: (() => DOMRect | null) | null }) => {
        component?.updateProps(props);
        if (props.clientRect) {
          popup?.[0]?.setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          });
        }
      },
      onKeyDown: (props: { event: KeyboardEvent }) => {
        if (props.event.key === "Escape") {
          popup?.[0]?.hide();
          return true;
        }
        const handle = component?.ref as SuggestionListHandle | null;
        return handle?.onKeyDown(props) ?? false;
      },
      onExit: () => {
        popup?.[0]?.destroy();
        component?.destroy();
        popup = undefined;
        component = undefined;
      },
    };
  };
}
