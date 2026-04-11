import { Skeleton } from '../ui/Skeleton'

export default function ProductSkeleton({ count = 10 }: { count?: number }) {
    return (
        <div className="products-grid w-full">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col glass rounded-[var(--radius)] overflow-hidden gap-2 pb-4 border border-[var(--border)]">
                    <Skeleton className="w-full aspect-square rounded-none mb-2" />
                    <div className="px-3 lg:px-4 flex flex-col gap-3">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <div className="flex justify-between items-center mt-2">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-2 w-10" />
                            </div>
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
