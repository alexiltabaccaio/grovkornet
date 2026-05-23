import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { I18nInitializer } from "./providers/I18nInitializer";
import { cookies, headers } from "next/headers";

export const metadata: Metadata = {
  title: "Grovkornet | Cinematic Analog Film Emulation",
  description: "A high-performance cinematic camera application for Android built with React Native and a custom C++/Kotlin native rendering engine (Uber Shader) for real-time analog film emulation.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const savedLang = cookieStore.get("grovkornet-lang")?.value;

  let lang = "en";
  if (savedLang && ["en", "it"].includes(savedLang)) {
    lang = savedLang;
  } else {
    const acceptLanguage = (await headers()).get("accept-language");
    if (acceptLanguage) {
      const preferred = acceptLanguage.split(",")[0].split("-")[0].toLowerCase();
      if (["en", "it"].includes(preferred)) {
        lang = preferred;
      }
    }
  }

  return (
    <html lang={lang}>
      <body>
        <I18nInitializer initialLang={lang}>
          {children}
        </I18nInitializer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
