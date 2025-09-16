
"use client";

import { Button } from "@/components/ui/button";
import { HeartHandshake, FilePlus2, MapPin, Users, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";
import HomeMap from "@/components/home-map";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import AuthNav from "@/components/auth-nav";

interface VillageGroup {
  villageName: string;
  district: string;
  lat: number | null;
  lng: number | null;
  combinedNeeds: string;
}

interface HomeClientProps {
    villageGroups: VillageGroup[];
    totalRequests: number;
    totalVolunteers: number;
}


export default function HomeClient({ villageGroups, totalRequests, totalVolunteers }: HomeClientProps) {
  const { user, loading, signOut } = useAuth();
  
  return (
    <main className="flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-5xl">
        <header className="text-center py-12">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 font-headline tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
            Punjab Flood Relief Connect
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            <span>A community-driven platform to connect flood-affected villages in Punjab with volunteers and aid providers.</span>
            <span className="block text-base text-muted-foreground/80 mt-1">ਪੰਜਾਬ ਦੇ ਹੜ੍ਹ ਪ੍ਰਭਾਵਿਤ ਪਿੰਡਾਂ ਨੂੰ ਵਲੰਟੀਅਰਾਂ ਨਾਲ ਜੋੜਨ ਲਈ ਇੱਕ ਭਾਈਚਾਰਾ-ਸੰਚਾਲਿਤ ਪਲੇਟਫਾਰਮ।</span>
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            {loading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <AuthNav />
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          <Card className="flex flex-col justify-center">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-6">
                  <FileText className="h-10 w-10 text-primary" />
                  <div>
                      <CardTitle className="text-3xl font-bold">{totalRequests}</CardTitle>
                      <CardDescription className="text-base">
                        <span>Relief Requests</span>
                        <span className="block text-sm">ਰਾਹਤ ਬੇਨਤੀਆਂ</span>
                      </CardDescription>
                  </div>
              </CardHeader>
          </Card>
           <Card className="flex flex-col justify-center">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-6">
                  <Users className="h-10 w-10 text-primary" />
                   <div>
                      <CardTitle className="text-3xl font-bold">{totalVolunteers}</CardTitle>
                      <CardDescription className="text-base">
                        <span>Working Volunteers</span>
                        <span className="block text-sm">ਕੰਮ ਕਰ ਰਹੇ ਵਲੰਟੀਅਰ</span>
                      </CardDescription>
                  </div>
              </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          <Link href="/request-relief" passHref className="h-full">
            <Card className="h-full text-center hover:bg-accent transition-colors flex flex-col justify-between p-6">
                <div className="flex-grow flex flex-col items-center justify-center">
                    <FilePlus2 className="mb-4 h-12 w-12 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">Submit a Request</h3>
                    <p className="text-muted-foreground text-sm">
                      <span>Need help for your village? Let volunteers know what you need.</span>
                      <span className="block text-xs mt-1">ਕੀ ਤੁਹਾਡੇ ਪਿੰਡ ਨੂੰ ਮਦਦ ਦੀ ਲੋੜ ਹੈ? ਵਲੰਟੀਅਰਾਂ ਨੂੰ ਦੱਸੋ।</span>
                    </p>
                </div>
                <Button size="lg" className="w-full mt-6">
                    <span>Submit Relief Request</span>
                </Button>
            </Card>
          </Link>
           <Link href="/dashboard" passHref className="h-full">
            <Card className="h-full text-center hover:bg-accent transition-colors flex flex-col justify-between p-6">
                <div className="flex-grow flex flex-col items-center justify-center">
                    <HeartHandshake className="mb-4 h-12 w-12 text-green-600" />
                    <h3 className="text-xl font-semibold mb-2">Become a Volunteer</h3>
                    <p className="text-muted-foreground text-sm">
                      <span>View active requests and join a relief effort to help a community in need.</span>
                       <span className="block text-xs mt-1">ਬੇਨਤੀਆਂ ਵੇਖੋ ਅਤੇ ਲੋੜਵੰਦ ਭਾਈਚਾਰੇ ਦੀ ਮਦਦ ਕਰੋ।</span>
                    </p>
                </div>
                 <Button size="lg" className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white">
                    <span>View Relief Efforts</span>
                </Button>
            </Card>
          </Link>
        </div>


         <Card className="w-full my-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5"/>
                <span>
                  Active Requests Map
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="relative w-full h-[50vh] rounded-xl border shadow-inner">
                <HomeMap villageGroups={villageGroups} />
              </div>
            </CardContent>
          </Card>

        <Card className="w-full mt-12">
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
               <p>
                  This website is a non-profit, community-driven platform created only to connect affected villages with volunteers, NGOs, and support organizations. We do not represent the government, nor do we collect or distribute funds directly. All information provided is for public benefit.
               </p>
               <p className="text-xs">
                  ਇਹ ਵੈਬਸਾਈਟ ਸਿਰਫ਼ ਪ੍ਰਭਾਵਿਤ ਪਿੰਡਾਂ ਨੂੰ ਸੇਵਾਦਾਰਾਂ, ਐਨਜੀਓਜ਼ ਅਤੇ ਸਹਾਇਤਾ ਸੰਸਥਾਵਾਂ ਨਾਲ ਜੋੜਨ ਲਈ ਬਣਾਈ ਗਈ ਇੱਕ ਗੈਰ-ਮੁਨਾਫ਼ਾ, ਸੇਵਾ-ਮੁੱਖ ਮੰਚ ਹੈ। ਅਸੀਂ ਸਰਕਾਰ ਦਾ ਪ੍ਰਤੀਨਿਧਿਤਵ ਨਹੀਂ ਕਰਦੇ ਅਤੇ ਨਾ ਹੀ ਸਿੱਧਾ ਫੰਡ ਇਕੱਠੇ ਜਾਂ ਵੰਡਦੇ ਹਾਂ। ਇੱਥੇ ਦਿੱਤੀ ਜਾਣਕਾਰੀ ਸਿਰਫ਼ ਜਨ-ਹਿੱਤ ਲਈ ਸਾਂਝੀ ਕੀਤੀ ਗਈ ਹੈ।
               </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
