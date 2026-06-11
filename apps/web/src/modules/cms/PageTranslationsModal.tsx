"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Globe, Trash2, Plus, Loader2, Wand2, Check } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { cmsPages, type PageTranslation } from "@/lib/api";
import { SITE_LANGUAGES } from "@/lib/site-languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  page: { id: string; title: string; metaDesc: string | null; metaKeywords: string | null } | null;
  onClose: () => void;
}

interface TranslationForm {
  title: string;
  metaDesc: string;
  metaKeywords: string;
}

const EMPTY_FORM: TranslationForm = { title: "", metaDesc: "", metaKeywords: "" };

async function freeTranslate(text: string, targetLang: string): Promise<string> {
  if (!text.trim()) return "";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Translation failed");
  const data = await res.json();
  return data?.responseData?.translatedText ?? text;
}

export function PageTranslationsModal({ page, onClose }: Props) {
  const [translations, setTranslations] = useState<PageTranslation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [selectedLang, setSelectedLang] = useState("");
  const [form, setForm] = useState<TranslationForm>(EMPTY_FORM);
  const [editingLang, setEditingLang] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!page) return;
    setLoading(true);
    try {
      const data = await cmsPages.listTranslations(page.id);
      setTranslations(data);
    } catch {
      setTranslations([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (page) load();
  }, [page, load]);

  const existingLangs = new Set(translations.map((t) => t.lang));
  const availableLangs = SITE_LANGUAGES.filter((l) => l.code !== "en" && !existingLangs.has(l.code));

  const startEdit = (t: PageTranslation) => {
    setEditingLang(t.lang);
    setSelectedLang(t.lang);
    setForm({ title: t.title, metaDesc: t.metaDesc ?? "", metaKeywords: t.metaKeywords ?? "" });
  };

  const startNew = () => {
    setEditingLang(null);
    setSelectedLang(availableLangs[0]?.code ?? "");
    setForm(EMPTY_FORM);
  };

  const handleAutoTranslate = async () => {
    if (!page || !selectedLang) return;
    setTranslating(true);
    try {
      const [title, metaDesc, metaKeywords] = await Promise.all([
        freeTranslate(page.title, selectedLang),
        freeTranslate(page.metaDesc ?? "", selectedLang),
        freeTranslate(page.metaKeywords ?? "", selectedLang),
      ]);
      setForm({ title, metaDesc, metaKeywords });
    } catch {
      // keep current form values on error
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!page || !selectedLang || !form.title.trim()) return;
    setSaving(true);
    try {
      const t = await cmsPages.upsertTranslation(page.id, selectedLang, {
        title: form.title,
        metaDesc: form.metaDesc || null,
        metaKeywords: form.metaKeywords || null,
      });
      setTranslations((prev) => {
        const exists = prev.find((x) => x.lang === t.lang);
        return exists ? prev.map((x) => (x.lang === t.lang ? t : x)) : [...prev, t];
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      setEditingLang(null);
      setSelectedLang("");
      setForm(EMPTY_FORM);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lang: string) => {
    if (!page) return;
    await cmsPages.deleteTranslation(page.id, lang);
    setTranslations((prev) => prev.filter((t) => t.lang !== lang));
  };

  const isAdding = editingLang === null && selectedLang !== "";
  const isEditing = editingLang !== null;
  const showForm = isAdding || isEditing;

  const langMeta = (code: string) => SITE_LANGUAGES.find((l) => l.code === code);

  return (
    <Modal
      isOpen={!!page}
      onClose={onClose}
      title={`Translations — ${page?.title ?? ""}`}
      description="Manage page content in multiple languages. The original (English) page is always served as fallback."
      icon={<Globe size={18} />}
      maxWidth="lg"
      footer={
        showForm ? (
          <>
            <Button variant="ghost" radius="sm" className="font-semibold text-muted-foreground hover:text-foreground"
              type="button"
              onClick={() => { setEditingLang(null); setSelectedLang(""); setForm(EMPTY_FORM); }}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              radius="sm"
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              className="gap-1.5 px-5 font-semibold active:scale-95"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
              {saving ? "Saving…" : saved ? "Saved!" : "Save Translation"}
            </Button>
          </>
        ) : (
          <Button variant="ghost" radius="sm" className="font-semibold text-muted-foreground hover:text-foreground"
            type="button"
            onClick={onClose}
          >
            Close
          </Button>
        )
      }
    >
      <div className="p-5 space-y-5">
        {/* Existing translations list */}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {translations.length > 0 && !showForm && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Existing Translations</p>
                <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                  {translations.map((t) => {
                    const meta = langMeta(t.lang);
                    return (
                      <div key={t.lang} className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors">
                        <span className="text-xl leading-none">{meta?.flag}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{t.title}</p>
                          <p className="text-xs text-muted-foreground">{meta?.name} ({t.lang})</p>
                        </div>
                        <Button
                          variant="link"
                          onClick={() => startEdit(t)}
                          className="h-auto p-0 text-xs font-semibold shrink-0"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(t.lang)}
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                          title="Delete translation"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!showForm && (
              <Button
                variant="outline"
                size="lg"
                radius="lg"
                onClick={startNew}
                disabled={availableLangs.length === 0}
                className="w-full border-dashed px-4 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5"
              >
                <Plus size={15} />
                {availableLangs.length === 0 ? "All languages added" : "Add Translation"}
              </Button>
            )}

            {showForm && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Language</label>
                  {isEditing ? (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-border bg-muted/30 text-sm text-foreground">
                      <span className="text-base">{langMeta(selectedLang)?.flag}</span>
                      <span>{langMeta(selectedLang)?.name} ({selectedLang})</span>
                    </div>
                  ) : (
                    <select
                      value={selectedLang}
                      onChange={(e) => { setSelectedLang(e.target.value); setForm(EMPTY_FORM); }}
                      className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    >
                      {availableLangs.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.flag} {l.name} ({l.code})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  radius="lg"
                  onClick={handleAutoTranslate}
                  disabled={translating || !selectedLang}
                  className="w-full px-4"
                >
                  {translating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Wand2 size={14} className="text-primary" />
                  )}
                  {translating ? "Translating…" : "Auto-translate from English (Free)"}
                </Button>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Translated page title"
                    size="xl" className="w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Meta Description</label>
                  <textarea
                    value={form.metaDesc}
                    onChange={(e) => setForm((f) => ({ ...f, metaDesc: e.target.value }))}
                    placeholder="SEO description in the target language"
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Keywords</label>
                  <Input
                    value={form.metaKeywords}
                    onChange={(e) => setForm((f) => ({ ...f, metaKeywords: e.target.value }))}
                    placeholder="keyword1, keyword2"
                    size="xl" className="w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                </div>

                <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 text-xs text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Page body content can be translated by opening the page in the visual editor. Meta fields (title, description, keywords) are managed here.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
