import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between space-y-2 pt-6">
                <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
            </div>
            <div className="flex items-center space-x-2">
                <Link href="/order">
                    <Button>
                        New Order
                    </Button>
                </Link>
            </div>
        </div>
    );
}