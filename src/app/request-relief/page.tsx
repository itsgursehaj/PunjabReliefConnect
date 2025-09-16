
"use client";

import ReliefFormClient from "@/components/relief-form-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RequestReliefPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 font-headline bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
            <span>Relief Request Form</span>
            <span className="block text-3xl sm:text-4xl text-muted-foreground mt-1">ਰਾਹਤ ਬੇਨਤੀ ਫਾਰਮ</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-left sm:text-center">
            <span>Please provide accurate information so volunteers can reach your village directly. Do not misuse this form, so that aid reaches those who need it most.</span>
            <span className="block text-base text-muted-foreground/80 mt-1">ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ ਜਾਣਕਾਰੀ ਭਰੋ ਤਾਂ ਜੋ ਸਹਾਇਕ ਸਿੱਧਾ ਤੁਹਾਡੇ ਪਿੰਡ ਤੱਕ ਪਹੁੰਚ ਸਕਣ। ਕਿਰਪਾ ਕਰਕੇ ਇਸ ਫਾਰਮ ਦੀ ਗਲਤ ਵਰਤੋਂ ਨਾ ਕਰੋ, ਤਾਂ ਜੋ ਸਹਾਇਤਾ ਉਹਨਾਂ ਲੋਕਾਂ ਤੱਕ ਪਹੁੰਚ ਸਕੇ ਜਿਨ੍ਹਾਂ ਨੂੰ ਸਭ ਤੋਂ ਜ਼ਿਆਦਾ ਲੋੜ ਹੈ।</span>
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
        <div className="w-full">
          <ReliefFormClient />
        </div>
      </div>
    </main>
  );
}
