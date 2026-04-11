'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <h2 className="text-2xl font-bold mb-4 text-red-500">حدث خطأ غير متوقع</h2>
            <button onClick={() => reset()} className="px-6 py-3 bg-[var(--neon)] text-white rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center font-bold hover:opacity-90 transition-opacity cursor-pointer">
                حاول مرة أخرى
            </button>
        </div>
    )
}
