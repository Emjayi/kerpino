'use client'
import { usePathname } from "next/navigation";
import { Navbar } from "../ui/navbar";


export default function Layout({ children }: { children: React.ReactNode }) {
    const path = usePathname()
    const page = path.split("/")[1]
    return (
        <>
            <Navbar />
            <div className='h-12 '>
            </div>
            {children}
        </>

    );
}