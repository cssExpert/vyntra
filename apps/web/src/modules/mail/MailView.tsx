"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Email, MailFolder, ComposeData } from "./mail.types";
import { INITIAL_EMAILS } from "./mail.data";
import { MailSidebar } from "./MailSidebar";
import { MailList } from "./MailList";
import { MailDetail } from "./MailDetail";
import { MailCompose } from "./MailCompose";

export function MailView() {
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [activeFolder, setActiveFolder] = useState<MailFolder>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{ to?: string; subject?: string }>({});

  // Emails for the current folder view
  const folderEmails = useMemo(() => {
    if (activeFolder === "starred") return emails.filter((e) => e.starred);
    return emails.filter((e) => e.folder === activeFolder);
  }, [emails, activeFolder]);

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    // Mark as read
    setEmails((prev) => prev.map((e) => e.id === email.id ? { ...e, read: true } : e));
  };

  const handleToggleStar = (id: string) => {
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, starred: !e.starred } : e));
    if (selectedEmail?.id === id) {
      setSelectedEmail((prev) => prev ? { ...prev, starred: !prev.starred } : prev);
    }
  };

  const handleDelete = (id: string) => {
    setEmails((prev) => prev.map((e) =>
      e.id === id ? { ...e, folder: "deleted" as MailFolder } : e,
    ));
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };

  const handleReply = (email: Email) => {
    setReplyTo({ to: email.from.email, subject: email.subject });
    setComposeOpen(true);
  };

  const handleSend = (data: ComposeData) => {
    const sent: Email = {
      id: `sent-${Date.now()}`,
      from: { name: "Me", email: "admin@acme.com" },
      to: [{ name: data.to, email: data.to }],
      subject: data.subject || "(no subject)",
      preview: data.body.substring(0, 100),
      body: data.body,
      date: new Date().toISOString(),
      read: true,
      starred: false,
      folder: "sent",
      labels: [],
    };
    setEmails((prev) => [sent, ...prev]);
    setReplyTo({});
  };

  const handleFolderChange = (folder: MailFolder) => {
    setActiveFolder(folder);
    setSelectedEmail(null);
  };

  return (
    <div className="font-sans text-foreground h-[calc(100vh-130px)] flex overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      {/* Left sidebar */}
      <div className="p-4 shrink-0">
        <MailSidebar
          activeFolder={activeFolder}
          setActiveFolder={handleFolderChange}
          emails={emails}
          onCompose={() => { setReplyTo({}); setComposeOpen(true); }}
        />
      </div>

      {/* Email list */}
      <div className={cn(
        "border-l border-border shrink-0 overflow-hidden transition-all",
        selectedEmail ? "w-72" : "flex-1",
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFolder}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            <MailList
              folder={activeFolder}
              emails={folderEmails}
              selectedId={selectedEmail?.id ?? null}
              onSelect={handleSelectEmail}
              onToggleStar={handleToggleStar}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Reading pane */}
      <AnimatePresence>
        {selectedEmail && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="flex-1 border-l border-border overflow-hidden"
          >
            <MailDetail
              email={selectedEmail}
              onClose={() => setSelectedEmail(null)}
              onToggleStar={handleToggleStar}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty reading pane placeholder */}
      {!selectedEmail && (
        <div className="hidden lg:flex flex-1 border-l border-border items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <span className="text-2xl">✉️</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Select a message</p>
            <p className="text-xs text-muted-foreground/60">Click an email to read it here</p>
          </div>
        </div>
      )}

      {/* Compose */}
      <MailCompose
        isOpen={composeOpen}
        onClose={() => { setComposeOpen(false); setReplyTo({}); }}
        onSend={handleSend}
        initialTo={replyTo.to}
        initialSubject={replyTo.subject ? `Re: ${replyTo.subject}` : ""}
      />
    </div>
  );
}
