export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <section className="bg-muted">
            {children}
        </section>
    );
}