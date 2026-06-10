import { INITIAL_FORMS } from "./forms.data";
import type { CmsForm } from "./forms.types";

const KEY = "vyntra_cms_forms";

export function loadForms(): CmsForm[] {
  if (typeof window === "undefined") return INITIAL_FORMS;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CmsForm[]) : INITIAL_FORMS;
  } catch {
    return INITIAL_FORMS;
  }
}

export function saveForms(forms: CmsForm[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(forms));
}

export function getForm(id: string): CmsForm | undefined {
  return loadForms().find((f) => f.id === id);
}

/** Insert or replace a form, returns the updated collection. */
export function upsertForm(form: CmsForm): CmsForm[] {
  const all = loadForms();
  const exists = all.some((f) => f.id === form.id);
  const next = exists
    ? all.map((f) => (f.id === form.id ? form : f))
    : [form, ...all];
  saveForms(next);
  return next;
}

export function deleteForm(id: string): CmsForm[] {
  const next = loadForms().filter((f) => f.id !== id);
  saveForms(next);
  return next;
}

export function duplicateForm(id: string): CmsForm[] {
  const all = loadForms();
  const source = all.find((f) => f.id === id);
  if (!source) return all;
  const now = new Date().toISOString();
  const copy: CmsForm = {
    ...source,
    id: `form_${Date.now()}`,
    name: `${source.name} (Copy)`,
    slug: `${source.slug}-copy-${Date.now()}`,
    status: "Draft",
    responses: 0,
    createdAt: now,
    updatedAt: now,
    fields: source.fields.map((fld) => ({ ...fld })),
  };
  const next = [copy, ...all];
  saveForms(next);
  return next;
}
