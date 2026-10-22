import type { Metadata } from "next";
import { Figtree, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Normas Atualizadas | Hogrefe",
  description: "Acesso às normas atualizadas dos testes Hogrefe",
  icons: {
    icon: { url: "/icon2.webp", type: "image/webp" },
    shortcut: "/icon2.webp",
    apple: "/icon2.webp",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${figtree.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
