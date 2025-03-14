// Client-side auth state management
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AuthStep = "login" | "signup" | "otp-verification" | "profile-completion"

interface AuthState {
    email: string
    step: AuthStep
    otpSent: boolean
    otpVerified: boolean
    userId: string | null
    next: string | null
    setEmail: (email: string) => void
    setStep: (step: AuthStep) => void
    setOtpSent: (sent: boolean) => void
    setOtpVerified: (verified: boolean) => void
    setUserId: (userId: string | null) => void
    setNext: (next: string | null) => void
    reset: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            email: "",
            step: "login",
            otpSent: false,
            otpVerified: false,
            userId: null,
            next: null,
            setEmail: (email) => set({ email }),
            setStep: (step) => set({ step }),
            setOtpSent: (sent) => set({ otpSent: sent }),
            setOtpVerified: (verified) => set({ otpVerified: verified }),
            setUserId: (userId) => set({ userId }),
            setNext: (next) => set({ next }),
            reset: () =>
                set({
                    email: "",
                    step: "login",
                    otpSent: false,
                    otpVerified: false,
                    userId: null,
                    next: null,
                }),
        }),
        {
            name: "auth-storage",
        },
    ),
)

