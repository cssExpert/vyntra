"use client";

import { useAIStudioStore } from "@/store/aiStudioStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";

const INDUSTRIES = [
  "Dental Clinic",
  "Law Firm",
  "Real Estate",
  "Restaurant",
  "Gym / Fitness",
  "Beauty Salon",
  "Consulting",
  "Marketing Agency",
  "Tech Startup",
  "E-commerce",
  "Healthcare",
  "Finance",
  "Construction",
  "Education",
  "Photography",
  "Other",
];

const GOALS = [
  "Generate Leads",
  "Sell Products",
  "Build Brand Awareness",
  "Provide Information",
  "Book Appointments",
  "Showcase Portfolio",
];

export function Step1BusinessInfo({ onNext }: { onNext: () => void }) {
  const { wizard, setBusinessInfo } = useAIStudioStore();
  const info = wizard.businessInfo;

  const isValid =
    info.businessName.trim() &&
    info.industry.trim() &&
    info.websiteGoal.trim() &&
    info.description.trim();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Tell us about your business
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              The more detail you provide, the better your generated website
              will be.
            </p>
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Business Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={info.businessName}
              onChange={(e) =>
                setBusinessInfo({ businessName: e.target.value })
              }
              placeholder="e.g. Acme Dental Clinic"
              autoFocus
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Industry <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => setBusinessInfo({ industry: ind })}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition-colors ${
                    info.industry === ind
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
            {info.industry === "Other" ||
            (!INDUSTRIES.includes(info.industry) && info.industry) ? (
              <Input
                className="mt-2"
                value={INDUSTRIES.includes(info.industry) ? "" : info.industry}
                onChange={(e) => setBusinessInfo({ industry: e.target.value })}
                placeholder="Type your industry…"
              />
            ) : null}
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Location
            </label>
            <Input
              value={info.location}
              onChange={(e) => setBusinessInfo({ location: e.target.value })}
              placeholder="e.g. New York, NY"
            />
          </div>

          {/* Website Goal */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Website Goal <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setBusinessInfo({ websiteGoal: goal })}
                  className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-colors ${
                    info.websiteGoal === goal
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Target Audience
            </label>
            <Input
              value={info.targetAudience}
              onChange={(e) =>
                setBusinessInfo({ targetAudience: e.target.value })
              }
              placeholder="e.g. Small business owners aged 30-55"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Business Description <span className="text-destructive">*</span>
            </label>
            <textarea
              value={info.description}
              onChange={(e) => setBusinessInfo({ description: e.target.value })}
              placeholder="Describe what your business does, your key services, and what makes you unique…"
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          {/* Competitors */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Competitors{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Input
              value={info.competitors}
              onChange={(e) => setBusinessInfo({ competitors: e.target.value })}
              placeholder="e.g. Company A, Company B"
            />
          </div>

          {/* Existing URL */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Existing Website URL{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Input
              value={info.existingUrl}
              onChange={(e) => setBusinessInfo({ existingUrl: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-border px-6 py-4 flex justify-end">
        <Button onClick={onNext} disabled={!isValid} className="gap-2">
          Design Preferences
          <MoveRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
