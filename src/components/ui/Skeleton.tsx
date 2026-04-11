export function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-[var(--glass-hover)] rounded-md ${className}`}></div>
    )
}
