"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Eye, Check } from "lucide-react";

import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { type CmsForm } from "../forms.types";
import { loadGoogleFont } from "@/lib/googleFont";
import { FormFieldsPreview } from "../FormFieldsPreview";
import { SubmitButtonView } from "../SubmitButtonView";

interface FormPreviewModalProps {
  form: CmsForm | null;
  onClose: () => void;
}

export function FormPreviewModal({ form, onClose }: FormPreviewModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("cms.forms");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSubmitted(false);
  }, [form?.id]);

  useEffect(() => {
    loadGoogleFont(form?.settings?.headerFont);
    loadGoogleFont(form?.settings?.bodyFont);
  }, [form?.settings?.headerFont, form?.settings?.bodyFont]);

  return (
    <Modal
      isOpen={!!form}
      onClose={onClose}
      title="Form preview"
      description="Responses are not saved."
      icon={<Eye size={18} />}
      maxWidth="xl"
      footer={
        submitted ? (
          <>
            <Button
              variant="ghost"
              radius="sm"
              onClick={() => setSubmitted(false)}
              className="font-semibold text-muted-foreground hover:text-foreground"
            >
              Fill again
            </Button>
            <Button
              radius="sm"
              onClick={onClose}
              className="px-5 font-semibold active:scale-95"
            >
              Close
            </Button>
          </>
        ) : form && form.fields.length > 0 && !form.submitButton?.hidden ? (
          <SubmitButtonView
            config={form.submitButton}
            onClick={() => setSubmitted(true)}
          />
        ) : undefined
      }
    >
      {form &&
        (submitted ? (
          <div className="px-8 py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4"
            >
              <Check className="w-8 h-8 text-emerald-600" />
            </motion.div>
            <p className="text-lg font-bold text-foreground">
              Response submitted
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This is a preview — nothing was actually saved.
            </p>
          </div>
        ) : (
          <FormFieldsPreview form={form} />
        ))}
    </Modal>
  );
}
