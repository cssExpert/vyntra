"use client";
import { useState } from "react";

import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import SectionTitle from "@/components/common/SectionTitle";

interface ogData {
  siteFavicon: File | null;
}

const Favicon = () => {
  const [ogData, setogData] = useState<ogData>({
    siteFavicon: null,
  });
  const [siteFaviconPreview, setSiteFaviconPreview] = useState<string | null>(
    null,
  );

  const updateogData = <K extends keyof ogData>(key: K, value: ogData[K]) => {
    setogData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlesiteFavicon = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateogData("siteFavicon", file);
      const previewUrl = URL.createObjectURL(file);
      setSiteFaviconPreview(previewUrl);
    }
  };

  const removeFavicon = () => {
    updateogData("siteFavicon", null);
    if (siteFaviconPreview) {
      URL.revokeObjectURL(siteFaviconPreview);
      setSiteFaviconPreview(null);
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
      <div className="flex items-start gap-3">
        <div className="w-25 h-auto border border-border rounded-lg overflow-hidden">
          <Image
            src="/images/FaviconPrev.png"
            width="100"
            height="70"
            alt="Favicon"
            className="rounded-lg"
          />
        </div>
        <SectionTitle
          title="Favicon"
          paragraph="Add favicon to project (max 128 KB)."
        />
      </div>
      <div className="rounded-lg border border-border dark:border-border bg-muted dark:bg-card p-4">
        <div className="grid space-y-4">
          <Field>
            <FieldLabel htmlFor="html-site-favicon" className="inline">
              Site Favicon
            </FieldLabel>
            <div
              id="html-site-favicon"
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 relative"
            >
              {ogData.siteFavicon ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <Image
                        src={siteFaviconPreview || "/placeholder.svg"}
                        alt="Site Favicon"
                        className="w-16 h-16 object-contain rounded-lg border-2 border-muted"
                        width={64}
                        height={64}
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
                          {ogData.siteFavicon?.name || "favicon.ico"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(ogData.siteFavicon?.size || 0)}
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
                      htmlFor="siteFavicon"
                      className="cursor-pointer w-full text-cente items-center justify-center flex-col"
                    >
                      <span className="mt-2 block text-sm font-medium text-foreground">
                        Upload favicon
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        ICO, PNG, SVG up to 128 KB
                      </span>
                    </Label>
                    <Input
                      id="siteFavicon"
                      type="file"
                      accept="image/ico,image/png,image/,image/svg+xml"
                      onChange={handlesiteFavicon}
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

export default Favicon;
