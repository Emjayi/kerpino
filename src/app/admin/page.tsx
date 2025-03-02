"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { use, useEffect } from "react";

export default function Page() {
    const pathname = usePathname();
    const { replace } = useRouter();
    const handleClick = (term: string) => { replace(`${pathname}?query=${term}`) }
    const searchParams = useSearchParams().toString();

    return (
        <div className="h-screen flex flex-col gap-2 justify-center items-center">
            <h1>{pathname.slice(1)}</h1>
            <input type="search" onChange={(e) => handleClick(e.target.value.toString())} />
            <p>{searchParams}</p>
        </div>
    );
}