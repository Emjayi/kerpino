'use client';
import { Card, CardContent } from '@/components/ui/card';

export default function LoginSkeleton({ className, ...props }: any) {

    return (
        <div className={`flex flex-col gap-6 ${className}`} {...props}>
            <Card>
                <CardContent className="grid p-0 md:grid-cols-2 animate-pulse">
                    <form className="p-6 md:p-8 flex flex-col gap-4">
                        <div className="h-6 bg-gray-300 rounded w-24" />
                        <div className="h-10 bg-gray-300 rounded" />
                        <div className="h-6 bg-gray-300 rounded w-24" />
                        <div className="h-10 bg-gray-300 rounded" />
                        <input type="hidden" />
                        <div className="h-10 bg-gray-300 rounded" />
                        <div className="h-10 bg-gray-300 rounded" />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}