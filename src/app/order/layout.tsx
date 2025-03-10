import { ModeToggle } from "../ui/mode-toggle";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <section className="bg-muted min-h-screen">
            <div className="fixed top-2 right-2">
                <ModeToggle />
            </div>
            {children}
        </section>
    );
}