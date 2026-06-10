"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Minus,
  Send,
  Paperclip,
  ChevronDown,
  Maximize2,
  Minimize2,
  FileText,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  Quote,
  Baseline,
  Type,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import { cn } from "@/lib/utils";
import type { ComposeData, ComposeAttachment } from "./mail.types";

interface MailComposeProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: ComposeData) => void;
  initialTo?: string;
  initialSubject?: string;
}

interface AttachedFile extends ComposeAttachment {
  file: File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FONT_FAMILIES = [
  { label: "Sans Serif", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Serif", value: "Georgia, Cambria, serif" },
  { label: "Monospace", value: "ui-monospace, monospace" },
];

const FONT_SIZES = [
  { label: "Small", value: "12px" },
  { label: "Normal", value: "14px" },
  { label: "Large", value: "18px" },
  { label: "Huge", value: "24px" },
];

const TEXT_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#111827",
];

const inputCls =
  "w-full px-3 py-2 bg-transparent border-0 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors !ring-0 focus:!ring-0";

function TBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={cn(
        "p-1.5 rounded transition-colors shrink-0",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function TDivider() {
  return <div className="w-px h-4 bg-border mx-0.5 shrink-0" />;
}

export function MailCompose({
  isOpen,
  onClose,
  onSend,
  initialTo = "",
  initialSubject = "",
}: MailComposeProps) {
  const [minimized, setMinimized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(initialSubject);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showAlign, setShowAlign] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [fontSize, setFontSize] = useState("14px");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[120px] text-sm text-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert",
      },
    },
  });

  const closeAllDropdowns = () => {
    setShowFontFamily(false);
    setShowFontSize(false);
    setShowAlign(false);
    setShowColor(false);
  };

  const currentFontLabel =
    FONT_FAMILIES.find((f) =>
      editor?.isActive("textStyle", { fontFamily: f.value }),
    )?.label ?? "Sans Serif";

  const currentAlign = editor?.isActive({ textAlign: "center" })
    ? "center"
    : editor?.isActive({ textAlign: "right" })
      ? "right"
      : editor?.isActive({ textAlign: "justify" })
        ? "justify"
        : "left";

  const AlignIcon =
    currentAlign === "center"
      ? AlignCenter
      : currentAlign === "right"
        ? AlignRight
        : currentAlign === "justify"
          ? AlignJustify
          : AlignLeft;

  const handleSend = () => {
    if (!to.trim() || !editor) return;
    onSend({
      to,
      cc: cc.trim() || undefined,
      bcc: bcc.trim() || undefined,
      subject,
      body: editor.getHTML(),
      attachments: attachments.map(({ name, size, type }) => ({
        name,
        size,
        type,
      })),
    });
    setTo("");
    setCc("");
    setBcc("");
    setSubject("");
    editor.commands.clearContent();
    setAttachments([]);
    setShowCc(false);
    setShowBcc(false);
    setFullscreen(false);
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachments((prev) => [
      ...prev,
      ...files.map((f) => ({
        name: f.name,
        size: formatFileSize(f.size),
        type: f.type,
        file: f,
      })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (i: number) =>
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fullscreen backdrop — hidden while minimized */}
          <AnimatePresence>
            {fullscreen && !minimized && (
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={() => setFullscreen(false)}
              />
            )}
          </AnimatePresence>

          {/*
            Fullscreen fix: don't use animate x/y (they conflict with CSS positioning).
            Instead, drive position entirely through inline style and let the `layout`
            prop FLIP-animate size/position between the two states.
          */}
          <motion.div
            layout
            key="compose"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={
              fullscreen && !minimized
                ? { top: "7.5vh", left: "10vw", right: "10vw", bottom: "7.5vh" }
                : { bottom: "1.5rem", right: "1.5rem" }
            }
            className={cn(
              "fixed z-50 bg-card border border-border rounded-2xl shadow-glass-lg overflow-hidden flex flex-col",
              fullscreen ? "w-auto" : "w-full max-w-lg",
            )}
          >
            {/* ── Header ───────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 bg-foreground/5 border-b border-border shrink-0">
              <span className="text-sm font-bold text-foreground">
                {initialSubject ? `Re: ${initialSubject}` : "New Message"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (!minimized && fullscreen) setFullscreen(false);
                    setMinimized(!minimized);
                  }}
                  title="Minimize"
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-[#000]/5 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => setFullscreen(!fullscreen)}
                  title={fullscreen ? "Restore" : "Fullscreen"}
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-[#000]/5 transition-colors"
                >
                  {fullscreen ? (
                    <Minimize2 size={14} />
                  ) : (
                    <Maximize2 size={14} />
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-600/10 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!minimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className={cn(
                    "overflow-hidden",
                    fullscreen && "flex flex-col flex-1 min-h-0",
                  )}
                >
                  {/* ── Address fields ───────────────────────────────── */}
                  <div className="border-b border-border shrink-0">
                    {/* To */}
                    <div className="flex items-center px-4 border-b border-border/50">
                      <span className="text-xs text-muted-foreground w-12 shrink-0">
                        To
                      </span>
                      <input
                        type="email"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        placeholder="recipient@example.com"
                        className={cn(inputCls, "flex-1")}
                      />
                      <div className="flex items-center gap-1 ml-1 shrink-0">
                        {!showCc && (
                          <button
                            onClick={() => setShowCc(true)}
                            className="text-[10px] font-medium text-muted-foreground hover:text-primary px-1.5 py-0.5 rounded hover:bg-primary/10 transition-colors"
                          >
                            Cc
                          </button>
                        )}
                        {!showBcc && (
                          <button
                            onClick={() => setShowBcc(true)}
                            className="text-[10px] font-medium text-muted-foreground hover:text-primary px-1.5 py-0.5 rounded hover:bg-primary/10 transition-colors"
                          >
                            Bcc
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cc */}
                    <AnimatePresence>
                      {showCc && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center px-4 border-b border-border/50 overflow-hidden"
                        >
                          <span className="text-xs text-muted-foreground w-12 shrink-0">
                            Cc
                          </span>
                          <input
                            type="email"
                            value={cc}
                            onChange={(e) => setCc(e.target.value)}
                            placeholder="cc@example.com"
                            className={cn(inputCls, "flex-1")}
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              setShowCc(false);
                              setCc("");
                            }}
                            className="ml-1 p-0.5 rounded text-muted-foreground hover:text-rose-500 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bcc */}
                    <AnimatePresence>
                      {showBcc && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center px-4 border-b border-border/50 overflow-hidden"
                        >
                          <span className="text-xs text-muted-foreground w-12 shrink-0">
                            Bcc
                          </span>
                          <input
                            type="email"
                            value={bcc}
                            onChange={(e) => setBcc(e.target.value)}
                            placeholder="bcc@example.com"
                            className={cn(inputCls, "flex-1")}
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              setShowBcc(false);
                              setBcc("");
                            }}
                            className="ml-1 p-0.5 rounded text-muted-foreground hover:text-rose-500 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Subject */}
                    <div className="flex items-center px-4">
                      <span className="text-xs text-muted-foreground w-12 shrink-0">
                        Subject
                      </span>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject"
                        className={cn(inputCls, "flex-1")}
                      />
                    </div>
                  </div>

                  {/* ── Formatting toolbar ───────────────────────────── */}
                  <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/20 flex-wrap shrink-0">
                    {/* Font family dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          setShowFontFamily(!showFontFamily);
                        }}
                        className="flex items-center gap-0.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        {currentFontLabel} <ChevronDown size={10} />
                      </button>
                      {showFontFamily && (
                        <div className="absolute top-full left-0 z-20 mt-1 w-36 bg-popover border border-border rounded-lg shadow-xl overflow-hidden">
                          {FONT_FAMILIES.map((f) => (
                            <button
                              key={f.value}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                editor
                                  ?.chain()
                                  .focus()
                                  .setFontFamily(f.value)
                                  .run();
                                setShowFontFamily(false);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                              style={{ fontFamily: f.value }}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <TDivider />

                    {/* Font size dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          setShowFontSize(!showFontSize);
                        }}
                        title="Font size"
                        className="flex items-center gap-0.5 px-1.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Type size={14} /> <ChevronDown size={10} />
                      </button>
                      {showFontSize && (
                        <div className="absolute top-full left-0 z-20 mt-1 w-28 bg-popover border border-border rounded-lg shadow-xl overflow-hidden">
                          {FONT_SIZES.map((s) => (
                            <button
                              key={s.value}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setFontSize(s.value);
                                editor
                                  ?.chain()
                                  .focus()
                                  .setMark("textStyle", { fontSize: s.value })
                                  .run();
                                setShowFontSize(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors",
                                fontSize === s.value &&
                                  "text-primary font-medium",
                              )}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <TDivider />

                    <TBtn
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      active={editor?.isActive("bold")}
                      title="Bold"
                    >
                      <Bold size={14} />
                    </TBtn>
                    <TBtn
                      onClick={() =>
                        editor?.chain().focus().toggleItalic().run()
                      }
                      active={editor?.isActive("italic")}
                      title="Italic"
                    >
                      <Italic size={14} />
                    </TBtn>
                    <TBtn
                      onClick={() =>
                        editor?.chain().focus().toggleUnderline().run()
                      }
                      active={editor?.isActive("underline")}
                      title="Underline"
                    >
                      <Underline size={14} />
                    </TBtn>

                    {/* Text color */}
                    <div className="relative">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          setShowColor(!showColor);
                        }}
                        title="Text color"
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Baseline size={14} />
                      </button>
                      {showColor && (
                        <div className="absolute top-full left-0 z-20 mt-1 p-2 bg-popover border border-border rounded-lg shadow-xl">
                          <div className="grid grid-cols-4 gap-1">
                            {TEXT_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  editor?.chain().focus().setColor(color).run();
                                  setShowColor(false);
                                }}
                                className="w-5 h-5 rounded-sm border border-border/40 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <TDivider />

                    {/* Alignment dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          setShowAlign(!showAlign);
                        }}
                        title="Text alignment"
                        className="flex items-center gap-0.5 p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <AlignIcon size={14} /> <ChevronDown size={10} />
                      </button>
                      {showAlign && (
                        <div className="absolute top-full left-0 z-20 mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden min-w-[130px]">
                          {[
                            {
                              Icon: AlignLeft,
                              value: "left",
                              label: "Align left",
                            },
                            {
                              Icon: AlignCenter,
                              value: "center",
                              label: "Align center",
                            },
                            {
                              Icon: AlignRight,
                              value: "right",
                              label: "Align right",
                            },
                            {
                              Icon: AlignJustify,
                              value: "justify",
                              label: "Justify",
                            },
                          ].map(({ Icon, value, label }) => (
                            <button
                              key={value}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                editor
                                  ?.chain()
                                  .focus()
                                  .setTextAlign(value)
                                  .run();
                                setShowAlign(false);
                              }}
                              className={cn(
                                "flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors w-full",
                                currentAlign === value && "text-primary",
                              )}
                            >
                              <Icon size={13} /> {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <TBtn
                      onClick={() =>
                        editor?.chain().focus().toggleOrderedList().run()
                      }
                      active={editor?.isActive("orderedList")}
                      title="Numbered list"
                    >
                      <ListOrdered size={14} />
                    </TBtn>
                    <TBtn
                      onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                      }
                      active={editor?.isActive("bulletList")}
                      title="Bullet list"
                    >
                      <List size={14} />
                    </TBtn>
                    <TBtn
                      onClick={() =>
                        editor?.chain().focus().liftListItem("listItem").run()
                      }
                      title="Decrease indent"
                    >
                      <Outdent size={14} />
                    </TBtn>
                    <TBtn
                      onClick={() =>
                        editor?.chain().focus().sinkListItem("listItem").run()
                      }
                      title="Increase indent"
                    >
                      <Indent size={14} />
                    </TBtn>

                    <TDivider />

                    <TBtn
                      onClick={() =>
                        editor?.chain().focus().toggleBlockquote().run()
                      }
                      active={editor?.isActive("blockquote")}
                      title="Blockquote"
                    >
                      <Quote size={14} />
                    </TBtn>
                    <TBtn
                      onClick={() =>
                        editor?.chain().focus().toggleStrike().run()
                      }
                      active={editor?.isActive("strike")}
                      title="Strikethrough"
                    >
                      <Strikethrough size={14} />
                    </TBtn>
                  </div>

                  {/* ── Rich text body ───────────────────────────────── */}
                  <div
                    className={cn(
                      "px-4 py-3 overflow-y-auto cursor-text",
                      fullscreen ? "flex-1 min-h-0" : "min-h-[160px] max-h-64",
                    )}
                    onClick={() => editor?.commands.focus()}
                  >
                    <EditorContent editor={editor} />
                  </div>

                  {/* ── Attachment chips ─────────────────────────────── */}
                  {attachments.length > 0 && (
                    <div className="px-4 py-2 border-t border-border flex flex-wrap gap-2 shrink-0">
                      {attachments.map((att, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted text-xs text-foreground max-w-[180px]"
                        >
                          <FileText
                            size={11}
                            className="shrink-0 text-muted-foreground"
                          />
                          <span className="truncate">{att.name}</span>
                          <span className="text-muted-foreground/60 shrink-0 text-[10px]">
                            {att.size}
                          </span>
                          <button
                            onClick={() => removeAttachment(i)}
                            className="ml-0.5 shrink-0 text-muted-foreground hover:text-rose-500 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Footer ──────────────────────────────────────── */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 shrink-0">
                    <div className="flex items-center gap-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach files"
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Paperclip size={15} />
                      </button>
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!to.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-sm bg-primary hover:bg-primary-600 text-primary-foreground text-xs font-semibold transition-all disabled:opacity-50 active:scale-[0.98]"
                    >
                      <Send size={13} /> Send
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
