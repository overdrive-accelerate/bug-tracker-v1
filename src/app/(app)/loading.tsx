import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Skeleton className="h-8 w-32 rounded-md" />
                    <Skeleton className="h-4 w-48 mt-2 rounded-md" />
                </div>
                <Skeleton className="h-9 w-28 rounded-md" />
            </div>
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
            </div>
        </div>
    );
}
