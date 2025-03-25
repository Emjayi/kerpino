import { ModeToggle } from "../../ui/mode-toggle";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <section className=" min-h-screen">
            {children}
        </section>
    );
}