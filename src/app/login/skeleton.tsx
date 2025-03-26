import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginSkeleton() {
    return (
        <div className="flex flex-col gap-6 ">
            <Skeleton className="h-8 w-20" />
            <Card className="overflow-hidden w-min-[400px] md:w-[600px] lg:w-[700px] xl:w-[800px] mx-auto">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <Skeleton className="h-8 w-48 mb-2" />
                                <Skeleton className="h-4 w-64" />
                            </div>

                            <div className="grid gap-2">
                                <Skeleton className="h-4 w-16 mb-1" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-10 w-full" />
                            </div>

                            <Skeleton className="h-10 w-full" />

                            <div className="relative text-center">
                                <Skeleton className="h-4 w-48 mx-auto" />
                            </div>

                            <Skeleton className="h-10 w-full" />

                            <div className="text-center">
                                <Skeleton className="h-4 w-48 mx-auto" />
                            </div>
                        </div>
                    </div>
                    <div className="relative hidden bg-muted md:block">
                        <Skeleton className="h-full w-full" />
                    </div>
                </CardContent>
            </Card>
            <Skeleton className="h-4 w-full max-w-lg mx-auto" />
        </div>
    )
}

