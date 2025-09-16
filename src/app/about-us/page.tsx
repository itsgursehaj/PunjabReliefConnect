
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AboutUsPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="w-full bg-card p-8 sm:p-12 rounded-2xl shadow-xl border mt-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              <span>About Us</span>
              <span className="block text-3xl sm:text-4xl text-muted-foreground mt-1">ਸਾਡੇ ਬਾਰੇ</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-left sm:text-center">
              <span>Our Mission to Connect and Rebuild</span>
              <span className="block text-base text-muted-foreground/80 mt-1">ਸਾਡਾ ਮਕਸਦ: ਜੋੜਨਾ ਅਤੇ ਮੁੜ ਵਸਾਉਣਾ</span>
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

          <div className="prose prose-lg max-w-none text-foreground dark:prose-invert mx-auto text-left space-y-8">
            <div>
              <h2 className="font-bold text-xl mb-2">Our Origin / ਸਾਡੀ ਸ਼ੁਰੂਆਤ</h2>
              <p>
                Punjab Flood Relief Connect was born from a desire to help during the devastating floods that have affected countless lives across Punjab. We are a community-driven platform dedicated to bridging the gap between flood-affected villages and the volunteers who are ready to provide aid.
                <br />
                <span className="text-muted-foreground">ਪੰਜਾਬ ਫਲੱਡ ਰਿਲੀਫ਼ ਕਨੈਕਟ, ਪੰਜਾਬ ਵਿੱਚ ਆਏ ਭਿਆਨਕ ਹੜ੍ਹਾਂ ਦੌਰਾਨ ਮਦਦ ਕਰਨ ਦੀ ਇੱਕ ਕੋਸ਼ਿਸ਼ ਹੈ, ਜਿਸ ਨੇ ਅਣਗਿਣਤ ਜ਼ਿੰਦਗੀਆਂ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕੀਤਾ ਹੈ। ਇਹ ਇੱਕ ਜਨਤਕ ਪਲੇਟਫਾਰਮ ਹੈ ਜੋ ਹੜ੍ਹ ਪ੍ਰਭਾਵਿਤ ਪਿੰਡਾਂ ਅਤੇ ਮਦਦ ਲਈ ਤਿਆਰ ਵਲੰਟੀਅਰਾਂ ਵਿਚਕਾਰ ਇੱਕ ਪੁਲ ਦਾ ਕੰਮ ਕਰਨ ਲਈ ਸਮਰਪਿਤ ਹੈ।</span>
              </p>
            </div>
            <div>
              <h2 className="font-bold text-xl mb-2">Our Goal / ਸਾਡਾ ਟੀਚਾ</h2>
              <p>
                Our primary goal is to create a transparent and efficient system where villages can report their urgent needs, and volunteers can easily find where their help is most required. By providing a centralized map and a list of needs, we aim to streamline the relief process, ensuring that aid reaches those who need it most, as quickly as possible.
                <br />
                <span className="text-muted-foreground">ਸਾਡਾ ਮੁੱਖ ਟੀਚਾ ਇੱਕ ਪਾਰਦਰਸ਼ੀ ਅਤੇ ਪ੍ਰਭਾਵਸ਼ਾਲੀ ਪ੍ਰਣਾਲੀ ਬਣਾਉਣਾ ਹੈ, ਜਿੱਥੇ ਪਿੰਡ ਆਪਣੀਆਂ ਜ਼ਰੂਰੀ ਲੋੜਾਂ ਦੱਸ ਸਕਣ ਅਤੇ ਵਲੰਟੀਅਰ ਆਸਾਨੀ ਨਾਲ ਦੇਖ ਸਕਣ ਕਿ ਉਨ੍ਹਾਂ ਦੀ ਮਦਦ ਦੀ ਸਭ ਤੋਂ ਵੱਧ ਕਿੱਥੇ ਲੋੜ ਹੈ। ਇੱਕ ਕੇਂਦਰੀ ਨਕਸ਼ਾ ਅਤੇ ਲੋੜਾਂ ਦੀ ਸੂਚੀ ਪ੍ਰਦਾਨ ਕਰਕੇ, ਅਸੀਂ ਰਾਹਤ ਪ੍ਰਕਿਰਿਆ ਨੂੰ ਸੁਚਾਰੂ ਬਣਾਉਣਾ ਚਾਹੁੰਦੇ ਹਾਂ, ਤਾਂ ਜੋ ਮਦਦ ਲੋੜਵੰਦਾਂ ਤੱਕ ਜਲਦੀ ਤੋਂ ਜਲਦੀ ਪਹੁੰਚ ਸਕੇ।</span>
              </p>
            </div>
            <div>
               <h2 className="font-bold text-xl mb-2">Our Belief / ਸਾਡਾ ਵਿਸ਼ਵਾਸ</h2>
              <p>
                This platform is an open-source, non-profit initiative built by a team of dedicated individuals. We believe in the power of community and technology to make a difference in times of crisis.
                <br />
                <span className="text-muted-foreground">ਇਹ ਪਲੇਟਫਾਰਮ ਇੱਕ ਓਪਨ-ਸੋਰਸ ਅਤੇ ਗੈਰ-ਮੁਨਾਫ਼ਾ ਉਪਰਾਲਾ ਹੈ, ਜਿਸ ਨੂੰ ਕੁਝ ਸਮਰਪਿਤ ਵਿਅਕਤੀਆਂ ਦੀ ਟੀਮ ਨੇ ਬਣਾਇਆ ਹੈ। ਅਸੀਂ ਸੰਕਟ ਦੇ ਸਮੇਂ ਵਿੱਚ ਭਾਈਚਾਰੇ ਅਤੇ ਤਕਨਾਲੋਜੀ ਦੀ ਤਾਕਤ ਵਿੱਚ ਵਿਸ਼ਵਾਸ ਰੱਖਦੇ ਹਾਂ।</span>
              </p>
            </div>
            <div>
              <h2 className="font-bold text-xl mb-2">Thank You / ਤੁਹਾਡਾ ਧੰਨਵਾਦ</h2>
              <p>
                Thank you for being a part of this effort. Whether you are a volunteer, a community leader, or someone spreading the word, your contribution is invaluable.
                <br />
                <span className="text-muted-foreground">ਇਸ ਉਪਰਾਲੇ ਦਾ ਹਿੱਸਾ ਬਣਨ ਲਈ ਤੁਹਾਡਾ ਧੰਨਵਾਦ। ਭਾਵੇਂ ਤੁਸੀਂ ਇੱਕ ਵਲੰਟੀਅਰ ਹੋ, ਇੱਕ ਭਾਈਚਾਰਕ ਆਗੂ ਹੋ, ਜਾਂ ਇਸ ਸੁਨੇਹੇ ਨੂੰ ਅੱਗੇ ਵਧਾਉਣ ਵਾਲੇ ਹੋ, ਤੁਹਾਡਾ ਯੋਗਦਾਨ ਅਨਮੋਲ ਹੈ।</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
