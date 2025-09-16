"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SupportProjectPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="w-full bg-card p-8 sm:p-12 rounded-2xl shadow-xl border mt-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              <span>Support Our Project</span>
              <span className="block text-3xl sm:text-4xl text-muted-foreground mt-1 leading-relaxed">ਸਾਡੇ ਪ੍ਰੋਜੈਕਟ ਦਾ ਸਮਰਥਨ ਕਰੋ</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-left sm:text-center">
              <span>This is a non-profit, volunteer-driven effort. Here’s how you can help.</span>
              <span className="block text-base text-muted-foreground/80 mt-1">ਇਹ ਇੱਕ ਗੈਰ-ਮੁਨਾਫ਼ਾ, ਵਲੰਟੀਅਰ-ਸੰਚਾਲਿਤ ਉਪਰਾਲਾ ਹੈ। ਤੁਸੀਂ ਇਸ ਤਰ੍ਹਾਂ ਮਦਦ ਕਰ ਸਕਦੇ ਹੋ।</span>
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

          <div className="text-center text-muted-foreground pt-12">
                <h3 className="font-bold text-lg text-foreground">Support This Project</h3>
                <p className="mt-2 text-sm">
                    <span>This platform was built as a volunteer initiative to connect flood-affected communities with the help they need. If you’d like to support hosting and future improvements, you can buy me a coffee. Thank you for helping keep this project alive.</span>
                    <span className="block text-muted-foreground/80 mt-1">ਇਹ ਪਲੇਟਫਾਰਮ ਹੜ੍ਹ-ਪ੍ਰਭਾਵਿਤ ਭਾਈਚਾਰਿਆਂ ਨੂੰ ਲੋੜੀਂਦੀ ਮਦਦ ਨਾਲ ਜੋੜਨ ਲਈ ਇੱਕ ਵਲੰਟੀਅਰ ਪਹਿਲਕਦਮੀ ਵਜੋਂ ਬਣਾਇਆ ਗਿਆ ਸੀ। ਜੇਕਰ ਤੁਸੀਂ ਹੋਸਟਿੰਗ ਅਤੇ ਭਵਿੱਖੀ ਸੁਧਾਰਾਂ ਦਾ ਸਮਰਥਨ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ, ਤਾਂ ਤੁਸੀਂ ਮੈਨੂੰ ਇੱਕ ਕੌਫੀ ਖਰੀਦ ਸਕਦੇ ਹੋ। ਇਸ ਪ੍ਰੋਜੈਕਟ ਨੂੰ ਜਿਉਂਦਾ ਰੱਖਣ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਤੁਹਾਡਾ ਧੰਨਵਾਦ।</span>
                </p>
                <div className="mt-6 flex justify-center">
                    <a href="https://www.buymeacoffee.com/sehajtalk" target="_blank" rel="noopener noreferrer">
                        <Image 
                            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
                            alt="Buy Me A Coffee" 
                            width={217}
                            height={60}
                        />
                    </a>
                </div>
            </div>

        </div>
      </div>
    </main>
  );
}
