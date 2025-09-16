
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Manrope, Inter } from "next/font/google";
import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Punjab Flood Relief Connect',
  description: 'Helping affected villages connect with volunteers',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  const version = packageJson.version;

  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} h-full`} suppressHydrationWarning>
      <body className="font-body antialiased" suppressHydrationWarning>
        <div className="relative flex flex-col min-h-screen bg-gradient-soft">
          <main className="flex-grow">{children}</main>
          <footer className="w-full text-center p-6 text-sm text-muted-foreground">
            <div className="flex justify-center gap-4 mb-4">
              <Link href="/about-us" className="hover:text-primary hover:underline">About Us</Link>
              <Link href="/contact-us" className="hover:text-primary hover:underline">Contact Us</Link>
              <Link href="/privacy-policy" className="hover:text-primary hover:underline">Privacy Policy</Link>
              <Link href="/helplines-and-ngos" className="hover:text-primary hover:underline">Helplines & NGOs</Link>
              <Link href="/support-project" className="hover:text-primary hover:underline">Support This Project</Link>
            </div>
            © {new Date().getFullYear()} Punjab Flood Relief Connect. All Rights Reserved. (v{version})
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
