export type MailFolder = "inbox" | "sent" | "drafts" | "starred" | "deleted";

export interface MailLabel {
  id: string;
  name: string;
  color: string; // Tailwind bg class for the dot
}

export interface EmailAddress {
  name: string;
  email: string;
}

export interface EmailAttachment {
  name: string;
  size: string;
  type: string;
}

export interface Email {
  id: string;
  from: EmailAddress;
  to: EmailAddress[];
  subject: string;
  preview: string;
  body: string;
  date: string;          // ISO string
  read: boolean;
  starred: boolean;
  folder: MailFolder;
  labels: string[];      // label ids
  attachments?: EmailAttachment[];
}

export interface ComposeData {
  to: string;
  subject: string;
  body: string;
}
