
import { ProfileForm } from "@/app/ui/profile"

export default async function ProfilePage() {

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h1>
                <p className="text-muted-foreground mb-8 text-center">
                    Please complete your profile to continue using our services.
                </p>
                <ProfileForm />
            </div>
        </div>
    )
} 