import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import LoginSkeleton from "./skeleton"

export const metadata: Metadata = {
    title: "Login - Kerpino",
    description: "Login to your Kerpino account",
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="">
            <Suspense fallback={<LoginSkeleton />}>{children}</Suspense>
        </div>
    )
}
