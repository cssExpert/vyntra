"use client";
import { useState } from "react";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import SectionTitle from "@/components/common/SectionTitle";

const inputCls =
  "w-full min-h-10 w-full min-w-0 border border-input px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 rounded-sm bg-card focus:border-primary! focus:ring-2 focus:ring-ring/20! dark:focus:border-primary! dark:focus-visible:ring-primary/25!";

const MetaTitle = () => {
  const [canonicalMode, setCanonicalhMode] = useState(false);

  return (
    <>
      <SectionTitle
        title="Meta tags"
        paragraph="The <meta> tag defines metadata about an HTML document."
      />
      <div className="rounded-lg border border-border dark:border-border bg-muted dark:bg-card p-4">
        <div className="grid space-y-4">
          <Field>
            <FieldLabel htmlFor="html-page-title" className="inline">
              Page Title
            </FieldLabel>
            <Input
              id="html-page-title"
              type="text"
              placeholder="Home Page"
              className={inputCls}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="html-page-keywords" className="inline">
              Page Keywords
            </FieldLabel>
            <Textarea
              id="html-page-keywords"
              placeholder="Keyword1, Keyword2, ..."
              className={`${inputCls} min-h-15!`}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="html-page-description" className="inline">
              Page Description
            </FieldLabel>
            <Textarea
              id="html-page-description"
              placeholder="Brief description for search engines"
              className={`${inputCls} min-h-20!`}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="html-page-canonical" className="inline">
              Canonical URL
            </FieldLabel>
            <Input
              id="html-page-canonical"
              type="text"
              placeholder="https://yoursite.com/{{page_name}}"
              className={inputCls}
            />
          </Field>
          <div className="flex items-center justify-start space-x-2">
            <Switch
              id="html-search-engine"
              checked={canonicalMode}
              onCheckedChange={setCanonicalhMode}
              className="data-checked:bg-primary"
            />
            <Label
              htmlFor="html-search-engine"
              className="flex cursor-pointer items-center justify-between gap-2"
            >
              Allow search engines to index this page
            </Label>
          </div>
        </div>
      </div>
    </>
  );
};

export default MetaTitle;
