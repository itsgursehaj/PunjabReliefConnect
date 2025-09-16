
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  
  return (
    <main className="flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="w-full bg-card p-8 sm:p-12 rounded-2xl shadow-xl border mt-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              <span>Privacy Policy</span>
              <span className="block text-3xl sm:text-4xl text-muted-foreground mt-1">ਗੋਪਨੀਯਤਾ ਨੀਤੀ</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Last Updated / ਆਖਰੀ ਵਾਰ ਅੱਪਡੇਟ: {new Date().toLocaleDateString()}
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
              <h2 className="font-bold text-xl mb-2">Welcome / ਜੀ ਆਇਆਂ ਨੂੰ</h2>
              <p>
                Welcome to Punjab Flood Relief Connect. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our platform.
                <br />
                <span className="text-muted-foreground">ਪੰਜਾਬ ਫਲੱਡ ਰਿਲੀਫ਼ ਕਨੈਕਟ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਅਸੀਂ ਤੁਹਾਡੀ ਗੋਪਨੀਯਤਾ ਦੀ ਰੱਖਿਆ ਲਈ ਵਚਨਬੱਧ ਹਾਂ। ਇਹ ਨੀਤੀ ਦੱਸਦੀ ਹੈ ਕਿ ਜਦੋਂ ਤੁਸੀਂ ਸਾਡੇ ਪਲੇਟਫਾਰਮ ਦੀ ਵਰਤੋਂ ਕਰਦੇ ਹੋ ਤਾਂ ਅਸੀਂ ਤੁਹਾਡੇ ਬਾਰੇ ਜਾਣਕਾਰੀ ਕਿਵੇਂ ਇਕੱਠੀ, ਵਰਤੋਂ ਅਤੇ ਸਾਂਝੀ ਕਰਦੇ ਹਾਂ।</span>
              </p>
            </div>

            <div>
              <h2 className="font-bold text-xl mb-2">Information We Collect / ਸਾਡੇ ਦੁਆਰਾ ਇਕੱਠੀ ਕੀਤੀ ਜਾਣਕਾਰੀ</h2>
              <p>
                We collect information you provide directly to us when you submit a relief request, such as your name, contact number, village name, district, and specific needs. For volunteers accessing the dashboard, we use Google Authentication and collect your email address to verify your identity.
                <br />
                <span className="text-muted-foreground">ਜਦੋਂ ਤੁਸੀਂ ਰਾਹਤ ਬੇਨਤੀ ਦਰਜ ਕਰਦੇ ਹੋ ਤਾਂ ਅਸੀਂ ਤੁਹਾਡੇ ਵੱਲੋਂ ਦਿੱਤੀ ਗਈ ਜਾਣਕਾਰੀ, ਜਿਵੇਂ ਕਿ ਤੁਹਾਡਾ ਨਾਮ, ਸੰਪਰਕ ਨੰਬਰ, ਪਿੰਡ ਦਾ ਨਾਮ, ਜ਼ਿਲ੍ਹਾ, ਅਤੇ ਖਾਸ ਲੋੜਾਂ, ਨੂੰ ਇਕੱਠਾ ਕਰਦੇ ਹਾਂ। ਡੈਸ਼ਬੋਰਡ ਦੀ ਵਰਤੋਂ ਕਰਨ ਵਾਲੇ ਵਲੰਟੀਅਰਾਂ ਲਈ, ਅਸੀਂ Google ਰਾਹੀਂ ਪਛਾਣ ਦੀ ਪੁਸ਼ਟੀ ਕਰਦੇ ਹਾਂ ਅਤੇ ਤੁਹਾਡਾ ਈਮੇਲ ਪਤਾ ਇਕੱਠਾ ਕਰਦੇ ਹਾਂ।</span>
              </p>
            </div>

            <div>
              <h2 className="font-bold text-xl mb-2">How We Use Your Information / ਅਸੀਂ ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕਰਦੇ ਹਾਂ</h2>
              <p>
                The information you provide is used solely for the purpose of connecting affected villages with verified volunteers. Contact information and reported needs are displayed on our dashboard, which is accessible only to signed-in users, to facilitate relief efforts.
                <br />
                <span className="text-muted-foreground">ਤੁਹਾਡੇ ਵੱਲੋਂ ਦਿੱਤੀ ਗਈ ਜਾਣਕਾਰੀ ਦੀ ਵਰਤੋਂ ਸਿਰਫ਼ ਪ੍ਰਭਾਵਿਤ ਪਿੰਡਾਂ ਨੂੰ ਪ੍ਰਮਾਣਿਤ ਵਲੰਟੀਅਰਾਂ ਨਾਲ ਜੋੜਨ ਲਈ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। ਸੰਪਰਕ ਜਾਣਕਾਰੀ ਅਤੇ ਲੋੜਾਂ ਸਾਡੇ ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਦਿਖਾਈਆਂ ਜਾਂਦੀਆਂ ਹਨ, ਜੋ ਰਾਹਤ ਕਾਰਜਾਂ ਵਿੱਚ ਮਦਦ ਲਈ ਸਿਰਫ਼ ਸਾਈਨ-ਇਨ ਕੀਤੇ ਉਪਭੋਗਤਾਵਾਂ ਲਈ ਉਪਲਬਧ ਹੈ।</span>
              </p>
            </div>
            
            <div>
              <h2 className="font-bold text-xl mb-2">Sharing of Information / ਜਾਣਕਾਰੀ ਦੀ ਸਾਂਝ</h2>
              <p>
                We do not sell or rent your personal information to third parties. The information submitted through the relief forms is shared with registered volunteers to coordinate aid. We may share aggregated, non-personally identifiable information for analytical purposes.
                <br />
                <span className="text-muted-foreground">ਅਸੀਂ ਤੁਹਾਡੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਨੂੰ ਕਿਸੇ ਤੀਜੀ ਧਿਰ ਨੂੰ ਵੇਚਦੇ ਜਾਂ ਕਿਰਾਏ 'ਤੇ ਨਹੀਂ ਦਿੰਦੇ ਹਾਂ। ਰਾਹਤ ਫਾਰਮਾਂ ਰਾਹੀਂ ਦਿੱਤੀ ਗਈ ਜਾਣਕਾਰੀ ਸਹਾਇਤਾ ਦੇ ਤਾਲਮੇਲ ਲਈ ਰਜਿਸਟਰਡ ਵਲੰਟੀਅਰਾਂ ਨਾਲ ਸਾਂਝੀ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। ਅਸੀਂ ਵਿਸ਼ਲੇਸ਼ਣ ਦੇ ਉਦੇਸ਼ਾਂ ਲਈ ਸਮੂਹਿਕ, ਗੈਰ-ਪਛਾਣਯੋਗ ਜਾਣਕਾਰੀ ਸਾਂਝੀ ਕਰ ਸਕਦੇ ਹਾਂ।</span>
              </p>
            </div>

            <div>
              <h2 className="font-bold text-xl mb-2">Data Security / ਡਾਟਾ ਸੁਰੱਖਿਆ</h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. The dashboard is protected by Google Authentication to ensure only verified users can view sensitive information.
                <br />
                <span className="text-muted-foreground">ਅਸੀਂ ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਨੂੰ ਨੁਕਸਾਨ, ਚੋਰੀ, ਦੁਰਵਰਤੋਂ, ਅਤੇ ਅਣਅਧਿਕਾਰਤ ਪਹੁੰਚ ਤੋਂ ਬਚਾਉਣ ਲਈ ਵਾਜਬ ਕਦਮ ਚੁੱਕਦੇ ਹਾਂ। ਡੈਸ਼ਬੋਰਡ Google ਪ੍ਰਮਾਣਿਕਤਾ ਦੁਆਰਾ ਸੁਰੱਖਿਅਤ ਹੈ ਤਾਂ ਜੋ ਇਹ ਯਕੀਨੀ ਬਣਾਇਆ ਜਾ ਸਕੇ ਕਿ ਸਿਰਫ਼ ਪ੍ਰਮਾਣਿਤ ਉਪਭੋਗਤਾ ਹੀ ਸੰਵੇਦਨਸ਼ੀਲ ਜਾਣਕਾਰੀ ਦੇਖ ਸਕਣ।</span>
              </p>
            </div>

            <div>
              <h2 className="font-bold text-xl mb-2">Your Choices / ਤੁਹਾਡੀ ਚੋਣ</h2>
              <p>
                If you have submitted a relief request and wish to have your information removed from our platform, please contact us through our{" "}
                <Link href="/contact-us" className="text-primary underline hover:text-primary/80">Contact Us page</Link>.
                <br />
                <span className="text-muted-foreground">
                  ਜੇ ਤੁਸੀਂ ਰਾਹਤ ਬੇਨਤੀ ਦਰਜ ਕੀਤੀ ਹੈ ਅਤੇ ਸਾਡੇ ਪਲੇਟਫਾਰਮ ਤੋਂ ਆਪਣੀ ਜਾਣਕਾਰੀ ਹਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ ਸਾਡੇ{" "}
                  <Link href="/contact-us" className="text-primary underline hover:text-primary/80">'ਸੰਪਰਕ' ਪੰਨੇ</Link> ਰਾਹੀਂ ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।
                </span>
              </p>
            </div>

            <div>
              <h2 className="font-bold text-xl mb-2">Changes to This Policy / ਇਸ ਨੀਤੀ ਵਿੱਚ ਬਦਲਾਅ</h2>
              <p>
                We may update this privacy policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy.
                <br />
                <span className="text-muted-foreground">ਅਸੀਂ ਸਮੇਂ-ਸਮੇਂ 'ਤੇ ਇਸ ਗੋਪਨੀਯਤਾ ਨੀਤੀ ਨੂੰ ਅਪਡੇਟ ਕਰ ਸਕਦੇ ਹਾਂ। ਜੇਕਰ ਅਸੀਂ ਕੋਈ ਬਦਲਾਅ ਕਰਦੇ ਹਾਂ, ਤਾਂ ਅਸੀਂ ਨੀਤੀ ਦੇ ਸਿਖਰ 'ਤੇ ਮਿਤੀ ਨੂੰ ਸੋਧ ਕੇ ਤੁਹਾਨੂੰ ਸੂਚਿਤ ਕਰਾਂਗੇ।</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
