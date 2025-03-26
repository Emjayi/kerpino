import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import LoginSkeleton from "./skeleton"
import { WavyBackground } from "../ui/wavy-background"

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
        <WavyBackground className="">
            <Suspense fallback={<LoginSkeleton />}>
                {children}
            </Suspense>
        </WavyBackground>
    )
}
