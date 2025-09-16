"use client";

import { useState, useEffect } from "react";
import ReliefForm from "./relief-form";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

// This component is a wrapper to ensure the form is only rendered on the client side.
// This prevents hydration errors that can occur when browser extensions or other scripts
// modify the DOM in a way that mismatches the server-rendered HTML.

const FormSkeleton = () => (
    <Card>
        <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                     <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            </div>
            <div className="flex justify-center pt-4">
                <Skeleton className="h-12 w-48" />
            </div>
        </CardContent>
    </Card>
)


export default function ReliefFormClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <FormSkeleton />;
  }

  return <ReliefForm />;
}
