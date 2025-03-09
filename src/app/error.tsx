"use client"
import { useEffect } from "react"

export default function Error({
    error,
    reset
}: {
    error: Error & { digest?: string },
    reset: () => void
}) {

    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="bg-black text-xl text-white p-4 h-screen flex flex-col gap-4 items-center justify-center">
            <h1 className="text-3xl">Error</h1>
            <h2>Something went wrong!</h2>
            <p>Details: {error.message}</p>
            <button onClick={reset}>
                Try again
            </button>
        </div>
    );
}