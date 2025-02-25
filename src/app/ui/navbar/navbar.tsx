import { NavigationMenuDemo } from "./links";

export default function Navbar() {
    return (
        <nav className="top-0 w-screen absolute flex justify-center items-center p-4">
            <div className="flex-1 flex justify-end">
                {/* Right section */}
            </div>

            <div className="flex items-center">
                <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            </div>

            <div className="flex-1">
                <NavigationMenuDemo />
            </div>
        </nav>
    );
}