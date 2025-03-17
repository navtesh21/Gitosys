import "@/styles/globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Gitosys",
  description: "Github AI",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
        <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
           
          </SignedIn>
          {children}

          </TRPCReactProvider>
          <Toaster />
      </body>
    </html>
    </ClerkProvider>

  );
}
