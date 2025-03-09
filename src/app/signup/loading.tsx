import LoginSkeleton from "../ui/skeletons";

export default function Loading() {
    return (
        <div className="h-screen flex items-center justify-center">
            <LoginSkeleton />
        </div>
    );
}