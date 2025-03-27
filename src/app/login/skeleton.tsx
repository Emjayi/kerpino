import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginSkeleton() {
    return (
        <div className="flex flex-col gap-6 ">
            <Card className="overflow-hidden w-[150px] md:w-[150px] lg:w-[200px] xl:w-[500px] mx-auto">
                <CardContent className="p-0">
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
                </CardContent>
            </Card>
            <Skeleton className="h-4 w-full max-w-lg mx-auto" />
        </div>
    )
}

