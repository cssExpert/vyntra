export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  createdAt: string; // ISO date
}
