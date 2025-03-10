import LoginForm from '@/app/ui/login-form';
import { Suspense } from 'react';
import { ModeToggle } from '../ui/mode-toggle';

export default function LoginPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <div className="fixed top-2 right-2">
                    <ModeToggle />
                </div>
                <Suspense>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}