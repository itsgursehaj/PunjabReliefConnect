import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 md:p-12 lg:p-16">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <div className="flex justify-center">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
