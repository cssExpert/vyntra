import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicFormView } from "@/modules/cms/forms/PublicFormView";
import type { FormField } from "@/modules/cms/forms/forms.types";

export const dynamic = "force-dynamic";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function resolveOrg(
  identifier: string,
  customHost?: string,
): Promise<{ id: string; name: string } | null> {
  try {
    const url =
      identifier === "_host" && customHost
        ? `${API}/public/resolve-domain?domain=${encodeURIComponent(customHost)}`
        : `${API}/public/resolve-subdomain/${encodeURIComponent(identifier)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchPublicForm(orgId: string, slug: string): Promise<{
  id: string;
  name: string;
  description: string | null;
  slug: string;
  fields: FormField[];
  captchaEnabled: boolean;
} | null> {
  try {
    const res = await fetch(
      `${API}/public/sites/${orgId}/forms/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ identifier: string; slug: string }>;
  searchParams: Promise<{ _chost?: string }>;
}): Promise<Metadata> {
  const { identifier, slug } = await params;
  const { _chost } = await searchParams;
  const org = await resolveOrg(identifier, _chost);
  if (!org) return {};
  const form = await fetchPublicForm(org.id, slug);
  if (!form) return {};
  return {
    title: `${form.name} — ${org.name}`,
    description: form.description ?? undefined,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PublicFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ identifier: string; slug: string }>;
  searchParams: Promise<{ _chost?: string }>;
}) {
  const { identifier, slug } = await params;
  const { _chost } = await searchParams;

  const org = await resolveOrg(identifier, _chost);
  if (!org) notFound();

  const form = await fetchPublicForm(org.id, slug);
  if (!form) notFound();

  return <PublicFormView form={form} orgId={org.id} />;
}
