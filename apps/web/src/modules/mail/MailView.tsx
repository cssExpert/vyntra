"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Email, MailFolder, ComposeData } from "./mail.types";
import { INITIAL_EMAILS, LABELS } from "./mail.data";
import { MailSidebar } from "./MailSidebar";
import { MailList } from "./MailList";
import { MailDetail } from "./MailDetail";
import { MailCompose } from "./MailCompose";

export function MailView() {
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [activeFolder, setActiveFolder] = useState<MailFolder>("inbox");
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{ to?: string; subject?: string; body?: string }>({});

  // Label filter takes priority over folder
  const folderEmails = useMemo(() => {
    if (activeLabel) return emails.filter((e) => e.labels.includes(activeLabel));
    if (activeFolder === "starred") return emails.filter((e) => e.starred);
    return emails.filter((e) => e.folder === activeFolder);
  }, [emails, activeFolder, activeLabel]);

  // Keep selectedEmail in sync when email list changes (e.g. after label toggle)
  const syncedSelectedEmail = useMemo(
    () => (selectedEmail ? (emails.find((e) => e.id === selectedEmail.id) ?? null) : null),
    [emails, selectedEmail],
  );

  const updateEmail = (id: string, patch: Partial<Email>) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    updateEmail(email.id, { read: true });
  };

  const handleToggleStar = (id: string) => {
    const email = emails.find((e) => e.id === id);
    if (email) updateEmail(id, { starred: !email.starred });
  };

  const handleMarkUnread = (id: string) => {
    updateEmail(id, { read: false });
    setSelectedEmail(null);
  };

  const handleMarkImportant = (id: string) => {
    const email = emails.find((e) => e.id === id);
    if (!email) return;
    const hasImportant = email.labels.includes("important");
    updateEmail(id, {
      labels: hasImportant
        ? email.labels.filter((l) => l !== "important")
        : [...email.labels, "important"],
    });
  };

  const handleDelete = (id: string) => {
    updateEmail(id, { folder: "deleted" });
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };

  const handleReply = (email: Email) => {
    setReplyTo({ to: email.from.email, subject: email.subject });
    setComposeOpen(true);
  };

  const handleForward = (email: Email) => {
    setReplyTo({
      subject: `Fwd: ${email.subject}`,
      body: `\n\n---------- Forwarded message ----------\nFrom: ${email.from.name} <${email.from.email}>\nSubject: ${email.subject}\n\n${email.body}`,
    });
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
    setActiveLabel(null);
    setSelectedEmail(null);
  };

  const handleLabelChange = (labelId: string) => {
    setActiveLabel((prev) => (prev === labelId ? null : labelId));
    setSelectedEmail(null);
  };

  const activeLabelName = activeLabel
    ? (LABELS.find((l) => l.id === activeLabel)?.name ?? activeLabel)
    : undefined;

  return (
    <div className="font-sans text-foreground h-[calc(100vh-130px)] flex overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      {/* Sidebar */}
      <div className="p-4 shrink-0">
        <MailSidebar
          activeFolder={activeFolder}
          setActiveFolder={handleFolderChange}
          activeLabel={activeLabel}
          onLabelChange={handleLabelChange}
          emails={emails}
          onCompose={() => { setReplyTo({}); setComposeOpen(true); }}
        />
      </div>

      <LayoutGroup>
        {/* Email list */}
        <motion.div
          layout
          className={cn(
            "border-l border-border shrink-0 overflow-hidden",
            syncedSelectedEmail ? "w-72" : "flex-1",
          )}
          transition={{ type: "spring", damping: 30, stiffness: 280 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLabel ?? activeFolder}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <MailList
                folder={activeFolder}
                emails={folderEmails}
                selectedId={syncedSelectedEmail?.id ?? null}
                onSelect={handleSelectEmail}
                onToggleStar={handleToggleStar}
                titleOverride={activeLabelName}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Reading pane */}
        <AnimatePresence mode="popLayout">
          {syncedSelectedEmail ? (
            <motion.div
              key={syncedSelectedEmail.id}
              layout
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="flex-1 border-l border-border overflow-hidden min-w-0"
            >
              <MailDetail
                email={syncedSelectedEmail}
                onClose={() => setSelectedEmail(null)}
                onToggleStar={handleToggleStar}
                onMarkUnread={handleMarkUnread}
                onMarkImportant={handleMarkImportant}
                onDelete={handleDelete}
                onReply={handleReply}
                onForward={handleForward}
              />
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="hidden lg:flex flex-1 border-l border-border items-center justify-center"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <span className="text-2xl">✉️</span>
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Select a message</p>
                <p className="text-xs text-muted-foreground/60">Click an email to read it here</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>

      {/* Compose */}
      <MailCompose
        isOpen={composeOpen}
        onClose={() => { setComposeOpen(false); setReplyTo({}); }}
        onSend={handleSend}
        initialTo={replyTo.to}
        initialSubject={replyTo.subject ?? ""}
      />
    </div>
  );
}
