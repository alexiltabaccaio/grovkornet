import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grovkornet | Cinematic Analog Film Emulation",
  description: "A high-performance cinematic camera application for Android built with React Native and a custom C++/Kotlin native rendering engine (Uber Shader) for real-time analog film emulation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
