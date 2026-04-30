import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <Skeleton className="h-10 w-64 rounded-md mb-8" />
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-6 w-full rounded-md" />
                ))}
            </div>
        </div>
    );
}
