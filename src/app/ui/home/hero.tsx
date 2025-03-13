// import { Button } from "@/components/ui/button";
// import Link from "next/link";

// export default function Hero() {
//     return (
//         <div className="h-screen w-screen bg-cover bg-center text-white " style={{ backgroundImage: `url("/back.png")` }}>
//             <div className="h-screen backdrop-blur-sm grid grid-cols-1 md:grid-cols-3 gap-2 md:grid-rows-1">
//                 <div className="flex flex-col gap-2 p-8 justify-end items-start text-sm">
//                     <p>- Lorem ipsum odor amet, consectetuer adipiscing elit.</p>
//                     <p>- Lorem ipsum odor amet, consectetuer adipiscing elit. Lacus ut nisl maecenas aptent platea litora leo lacinia. Nec suscipit facilisi gravida ridiculus vehicula lacinia dapibus cubilia rutrum.</p>
//                     <p>- Lorem ipsum odor amet, consectetuer adipiscing elit. Sed quam pharetra aliquam interdum venenatis luctus adipiscing. Magna faucibus dapibus dis; ultricies lorem conubia.</p>
//                 </div>
//                 <div className="flex flex-col text-center gap-4 p-2 justify-center items-center">
//                     <h1 className=" drop-shadow-lg font-bold">Immersive Unreal Pixel Streaming Platform: A Cutting-Edge Virtual Showroom for Interactive Interior Design Experiences</h1>
//                     <div className="flex gap-4">
//                         <Link href="/order">
//                             <Button className="">Order</Button>
//                         </Link>
//                         <Link href={`/login?callbackUrl=${encodeURIComponent("/dashboard")}`}>
//                             <Button className="">Login</Button>
//                         </Link>
//                         <Link href={`/signup?callbackUrl=${encodeURIComponent("/dashboard")}`}>
//                             <Button className="">Signup</Button>
//                         </Link>
//                         <Link href={`/dashboard`}>
//                             <Button className="">Dashboard</Button>
//                         </Link>
//                     </div>
//                 </div>
//                 <div className="flex p-8 justify-start items-center"></div>
//             </div>
//         </div>
//     );
// }
'use client'
import React from "react";
import { Spotlight } from "@/app/ui/home/spotlight";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
    return (
        <div className="h-screen w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
            <Spotlight />
            <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
                <h1 className="text-4xl md:text-7xl font-bold text-center pb-2 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
                    Kerpo MVP
                </h1>
                <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
                    Immersive Unreal Pixel Streaming Platform: A Cutting-Edge Virtual Showroom for Interactive Interior Design Experiences
                </p>
                <div className="flex flex-col text-center gap-4 p-2 justify-center items-center">
                    <div className="flex gap-4">
                        <Link href="/order">
                            <Button className="">Order</Button>
                        </Link>
                        <Link href={`/login?callbackUrl=${encodeURIComponent("/dashboard")}`}>
                            <Button className="">Login</Button>
                        </Link>
                        <Link href={`/signup?callbackUrl=${encodeURIComponent("/dashboard")}`}>
                            <Button className="">Signup</Button>
                        </Link>
                        <Link href={`/dashboard`}>
                            <Button className="">Dashboard</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
