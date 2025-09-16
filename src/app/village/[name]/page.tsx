
"use server";

import { getReliefRequestsByVillageName } from "@/app/actions";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import Link from 'next/link';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import VillageDetailClient from "./client-page";


export default async function VillageDetailPage({ params }: { params: { name: string } }) {
  const villageName = decodeURIComponent(params.name);
  const result = await getReliefRequestsByVillageName(villageName);

  if (result.error) {
    return (
        <main className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-lg p-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {result.error}
                  </AlertDescription>
                </Alert>
                <div className="mt-6 flex justify-center gap-4">
                    <Button asChild variant="outline">
                        <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Back to Dashboard
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Home
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    );
  }
  
  if (!result.data || result.data.length === 0) {
      return (
        <main className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-lg p-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Not Found</AlertTitle>
                  <AlertDescription>
                    Could not find relief efforts for the requested village. It may have been deleted or the name is incorrect.
                  </AlertDescription>
                </Alert>
                <div className="mt-6 flex justify-center gap-4">
                    <Button asChild variant="outline">
                        <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Back to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    );
  }

  const villages = result.data;

  return (
    <VillageDetailClient villages={villages} />
  );
}

    