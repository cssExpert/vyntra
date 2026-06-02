"use client";
import { useState } from "react";

import { Upload, X } from "lucide-react";
import Image from "next/image";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import SectionTitle from "@/components/common/SectionTitle";

const inputCls =
  "w-full min-h-10 w-full min-w-0 border border-input px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 rounded-sm bg-card focus:border-primary! focus:ring-2 focus:ring-ring/20! dark:focus:border-primary! dark:focus-visible:ring-primary/25!";

interface ogData {
  twitterSummaryImage: File | null;
}

const OpenGraphs = () => {
  const [ogData, setogData] = useState<ogData>({
    twitterSummaryImage: null,
  });
  const [twitterSummaryImagePreview, setTwitterSummaryImagePreview] = useState<
    string | null
  >(null);

  const updateogData = <K extends keyof ogData>(key: K, value: ogData[K]) => {
    setogData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleTwitterSummaryImage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      updateogData("twitterSummaryImage", file);
      const previewUrl = URL.createObjectURL(file);
      setTwitterSummaryImagePreview(previewUrl);
    }
  };

  const removeFavicon = () => {
    updateogData("twitterSummaryImage", null);
    if (twitterSummaryImagePreview) {
      URL.revokeObjectURL(twitterSummaryImagePreview);
      setTwitterSummaryImagePreview(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <>
      <SectionTitle
        title="Open graphs"
        paragraph="The <meta property='og:...'> tags define Open Graph metadata used by social platforms to generate rich link previews for web pages."
      />
      <div className="rounded-lg border border-border dark:border-border bg-muted dark:bg-card p-4">
        <div className="grid space-y-4">
          <Field>
            <FieldLabel htmlFor="html-og-title" className="inline">
              OG Title
            </FieldLabel>
            <Input
              id="html-og-title"
              type="text"
              placeholder="Home Page"
              className={inputCls}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="html-og-keywords" className="inline">
              OG Keywords
            </FieldLabel>
            <Textarea
              id="html-og-keywords"
              placeholder="Keyword1, Keyword2, ..."
              className={`${inputCls} min-h-15!`}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="html-og-description" className="inline">
              OG Description
            </FieldLabel>
            <Textarea
              id="html-og-description"
              placeholder="Brief description for search engines"
              className={`${inputCls} min-h-20!`}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="html-og-page-url" className="inline">
              OG Page URL
            </FieldLabel>
            <Input
              id="html-og-page-url"
              type="text"
              placeholder="https://yoursite.com/{{page_name}}"
              className={inputCls}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="html-og-type" className="inline">
              OG Type
            </FieldLabel>
            <Select>
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Types</SelectLabel>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          {/* Twitter Summary Image Upload Section */}
          <Field>
            <FieldLabel htmlFor="html-og-twtr-image" className="inline">
              Twitter Summary Image
            </FieldLabel>
            <div
              id="html-og-twtr-image"
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 relative"
            >
              {ogData.twitterSummaryImage ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <Image
                        src={twitterSummaryImagePreview || "/placeholder.svg"}
                        alt="Twitter Summary Image Preview"
                        className="object-contain rounded-lg border-2 border-muted"
                        width={1200}
                        height={628}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                        <Upload className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {ogData.twitterSummaryImage?.name ||
                            "twitter-summary.png"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(
                            ogData.twitterSummaryImage?.size || 0,
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFavicon}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4 w-full text-center">
                    <Label
                      htmlFor="twitterSummaryImage"
                      className="cursor-pointer w-full text-cente items-center justify-center flex-col"
                    >
                      <span className="mt-2 block text-sm font-medium text-foreground">
                        Upload favicon
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        JPG, PNG, WEBP, AVIF, SVG up to 1MB
                      </span>
                    </Label>
                    <Input
                      id="twitterSummaryImage"
                      type="file"
                      accept=""
                      onChange={handleTwitterSummaryImage}
                      className="absolute inset-0 w-full h-full opacity-0 p-0 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </Field>
        </div>
      </div>
    </>
  );
};

export default OpenGraphs;
