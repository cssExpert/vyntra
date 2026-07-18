import type { ReactNode } from "react";
import {
  Ban,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Home,
  Globe,
  Link as LinkIcon,
  Calendar,
  Clock,
  Lock,
  CreditCard,
  Hash,
  DollarSign,
  AtSign,
  Briefcase,
  Tag,
  Search,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

import { type FieldType, type FormFieldIcon } from "./forms.types";

/** Field types that support a leading icon. */
export const ICON_SUPPORTED_TYPES: FieldType[] = [
  "short_text",
  "email",
  "phone",
  "number",
  "date",
];

export function supportsFieldIcon(type: FieldType): boolean {
  return ICON_SUPPORTED_TYPES.includes(type);
}

/** name → lucide component. */
const ICON_MAP: Record<Exclude<FormFieldIcon, "none">, LucideIcon> = {
  user: User,
  mail: Mail,
  phone: Phone,
  building: Building2,
  mapPin: MapPin,
  home: Home,
  globe: Globe,
  link: LinkIcon,
  calendar: Calendar,
  clock: Clock,
  lock: Lock,
  creditCard: CreditCard,
  hash: Hash,
  dollar: DollarSign,
  atSign: AtSign,
  briefcase: Briefcase,
  tag: Tag,
  search: Search,
  message: MessageSquare,
};

/** Ordered options for the icon picker (leads with "None"). */
export const FIELD_ICON_OPTIONS: { value: FormFieldIcon; label: string; Icon: LucideIcon }[] = [
  { value: "none", label: "None", Icon: Ban },
  { value: "user", label: "Person", Icon: User },
  { value: "mail", label: "Email", Icon: Mail },
  { value: "phone", label: "Phone", Icon: Phone },
  { value: "building", label: "Company", Icon: Building2 },
  { value: "mapPin", label: "Location", Icon: MapPin },
  { value: "home", label: "Address", Icon: Home },
  { value: "globe", label: "Website", Icon: Globe },
  { value: "link", label: "Link", Icon: LinkIcon },
  { value: "calendar", label: "Date", Icon: Calendar },
  { value: "clock", label: "Time", Icon: Clock },
  { value: "lock", label: "Secure", Icon: Lock },
  { value: "creditCard", label: "Card", Icon: CreditCard },
  { value: "hash", label: "Number", Icon: Hash },
  { value: "dollar", label: "Amount", Icon: DollarSign },
  { value: "atSign", label: "Handle", Icon: AtSign },
  { value: "briefcase", label: "Work", Icon: Briefcase },
  { value: "tag", label: "Tag", Icon: Tag },
  { value: "search", label: "Search", Icon: Search },
  { value: "message", label: "Message", Icon: MessageSquare },
];

function isRenderable(name?: FormFieldIcon): name is Exclude<FormFieldIcon, "none"> {
  return !!name && name !== "none";
}

/** Renders a field icon by name (nothing for "none"/unset). */
export function FieldIcon({
  name,
  className,
}: {
  name?: FormFieldIcon;
  className?: string;
}) {
  if (!isRenderable(name)) return null;
  const Icon = ICON_MAP[name];
  return <Icon className={className} />;
}

/**
 * Wraps an input control with an absolutely-positioned leading icon. Pair with
 * {@link fieldIconPad} so the input's left padding clears the icon. Renders the
 * control unchanged when no icon is set.
 */
export function WithLeadingIcon({
  name,
  children,
}: {
  name?: FormFieldIcon;
  children: ReactNode;
}) {
  if (!isRenderable(name)) return <>{children}</>;
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
        <FieldIcon name={name} className="h-4 w-4" />
      </span>
      {children}
    </div>
  );
}

/** Extra left padding to apply to an input when it has a leading icon. */
export function fieldIconPad(name?: FormFieldIcon): string {
  return isRenderable(name) ? "pl-11" : "";
}
