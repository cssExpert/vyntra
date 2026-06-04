"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Send, Paperclip, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComposeData } from "./mail.types";

interface MailComposeProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: ComposeData) => void;
  initialTo?: string;
  initialSubject?: string;
}

export function MailCompose({
  isOpen,
  onClose,
  onSend,
  initialTo = "",
  initialSubject = "",
}: MailComposeProps) {
  const [minimized, setMinimized] = useState(false);
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState("");

  const handleSend = () => {
    if (!to.trim()) return;
    onSend({ to, subject, body });
    setTo("");
    setSubject("");
    setBody("");
    onClose();
  };

  const inputCls =
    "w-full px-3 py-2 bg-transparent border-0 border-b border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-card border border-border rounded-2xl shadow-glass-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-foreground/5 border-b border-border">
            <span className="text-sm font-bold text-foreground">
              {initialSubject ? `Re: ${initialSubject}` : "New Message"}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Minus size={14} />
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
                className="overflow-hidden"
              >
                {/* Fields */}
                <div className="border-b border-border">
                  <div className="flex items-center px-4">
                    <span className="text-xs text-muted-foreground w-12 shrink-0">
                      To
                    </span>
                    <input
                      type="email"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="recipient@example.com"
                      className={cn(
                        inputCls,
                        "outline-none !border-0 !shadow-none !ring-0 focus:outline-none focus-visible:outline-none focus:border-primaryfocus:border-0 flex-1",
                      )}
                    />
                  </div>
                  <div className="flex items-center px-4">
                    <span className="text-xs text-muted-foreground w-12 shrink-0">
                      Subject
                    </span>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Subject"
                      className={cn(
                        inputCls,
                        "border-0 focus:border-0 flex-1 !ring-0",
                      )}
                    />
                  </div>
                </div>

                {/* Body */}
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message..."
                  rows={8}
                  className="w-full px-4 py-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none border-0 !ring-0"
                />

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Paperclip size={15} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSend}
                      disabled={!to.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-all disabled:opacity-50 active:scale-[0.98]"
                    >
                      <Send size={13} /> Send
                    </button>
                    <button className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <ChevronDown size={15} />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded text-muted-foreground hover:text-rose-500 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
