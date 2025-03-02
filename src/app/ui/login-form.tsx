'use client'


// export default function LoginForm() {


//     return (
//         <form action={formAction} className="space-y-3">
//             <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
//                 <h1 className={`${lusitana.className} mb-3 text-2xl`}>
//                     Please log in to continue.
//                 </h1>
//                 <div className="w-full">
//                     <div>
//                         <label
//                             className="mb-3 mt-5 block text-xs font-medium text-gray-900"
//                             htmlFor="email"
//                         >
//                             Email
//                         </label>
//                         <div className="relative">
//                             <input
//                                 className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
//                                 id="email"
//                                 type="email"
//                                 name="email"
//                                 placeholder="Enter your email address"
//                                 required
//                             />
//                             <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
//                         </div>
//                     </div>
//                     <div className="mt-4">
//                         <label
//                             className="mb-3 mt-5 block text-xs font-medium text-gray-900"
//                             htmlFor="password"
//                         >
//                             Password
//                         </label>
//                         <div className="relative">
//                             <input
//                                 className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
//                                 id="password"
//                                 type="password"
//                                 name="password"
//                                 placeholder="Enter password"
//                                 required
//                                 minLength={6}
//                             />
//                             <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
//                         </div>
//                     </div>
//                 </div>
//                 <input type="hidden" name="redirectTo" value={callbackUrl} />
//                 <Button className="mt-4 w-full" aria-disabled={isPending}>
//                     Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
//                 </Button>
//                 <div
//                     className="flex h-8 items-end space-x-1"
//                     aria-live="polite"
//                     aria-atomic="true"
//                 >
//                     {errorMessage && (
//                         <>
//                             <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
//                             <p className="text-sm text-red-500">{errorMessage}</p>
//                         </>
//                     )}
//                 </div>
//             </div>
//         </form>
//     );
// }



import { useActionState } from 'react';
import { authenticate } from '@/lib/actions';
import { useSearchParams } from 'next/navigation';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link';
import Image from 'next/image';
import { BackButton } from './buttons';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined,
    );
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <BackButton />
            <Card className="overflow-hidden">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form action={formAction} className="p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">Welcome back</h1>
                                <p className="text-balance text-muted-foreground">Login to your Kerpino account</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="m@example.com" required />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
                                        Forgot your password?
                                    </Link>
                                </div>
                                <Input id="password" type="password" required />
                            </div>
                            <input type="hidden" name="redirectTo" value={callbackUrl} />
                            <Button aria-disabled={isPending} className="w-full">
                                Login
                            </Button>
                            <div
                                className="flex h-8 items-end space-x-1"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                {errorMessage && (
                                    <>
                                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                                        <p className="text-sm text-red-500">{errorMessage}</p>
                                    </>
                                )}
                            </div>
                            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with Google</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">

                                <Button variant="outline" className="w-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path
                                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    <span className="sr-only">Login with Google</span>
                                </Button>

                            </div>
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <Link href="#" className="underline underline-offset-4">
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </form>
                    <div className="relative hidden bg-muted md:block">
                        <Image
                            src="/1.jpg"
                            fill
                            objectFit='cover'
                            alt="Image"
                            className="absolute inset-0 dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}

