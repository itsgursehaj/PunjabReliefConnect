
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import ContactForm from "@/components/contact-form";
import { useRouter } from "next/navigation";

export default function ContactUsPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <div className="w-full bg-card p-8 sm:p-12 rounded-2xl shadow-xl border mt-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              <span>Contact Us</span>
              <span className="block text-3xl sm:text-4xl text-muted-foreground mt-1">ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              <span>We're here to help and answer any questions you might have.</span>
              <span className="block text-base text-muted-foreground/80 mt-1">ਅਸੀਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰਨ ਅਤੇ ਤੁਹਾਡੇ ਸਵਾਲਾਂ ਦੇ ਜਵਾਬ ਦੇਣ ਲਈ ਇੱਥੇ ਹਾਂ।</span>
            </p>
          </div>
          <div className="w-full flex justify-start items-center gap-4 py-8">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back / ਪਿੱਛੇ
            </Button>
             <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home / ਮੁੱਖ ਪੰਨਾ
              </Link>
            </Button>
          </div>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
