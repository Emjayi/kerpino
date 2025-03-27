import { Settings } from "@/app/ui/settings";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions";

export default function Page() {
    return (
        <div>
            <div className="flex items-center justify-between space-y-2 pt-6">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

            </div>
            <div className="mt-16">
                <Settings />
            </div>
            <div className="w-full px-6 flex justify-end">
                <Button onClick={signOut} variant={"destructive"}>Sign Out</Button>
            </div>
        </div>
    );
}