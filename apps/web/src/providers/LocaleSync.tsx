"use client";

import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";

export function LocaleSync({
  children,
  locale,
  messages,
}: {
  children: ReactNode;
  locale: string;
  messages: Record<string, any>;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
