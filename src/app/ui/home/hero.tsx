'use client'
import React from "react";
import { motion } from "framer-motion";
import { Spotlight } from "@/app/ui/home/spotlight";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "../home-navbar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Hero() {
    const [isLoading, setIsLoading] = React.useState(false);
    const handleStart = () => {
        setIsLoading(!isLoading);
    }
    const isMobile = useIsMobile();
    return (
        <motion.div
            initial={{ backgroundSize: "105%" }}
            animate={{ backgroundSize: isLoading ? "100%" : "105%" }}
            transition={{ duration: 1.4 }}
            className="h-screen w-full flex items-center bg-top justify-center antialiased bg-black object-cover bg-cover relative overflow-hidden" style={{ backgroundImage: `${isMobile ? `url("/1.jpg")` : `url("/back.png")`}` }}>
            <div className="absolute top-0 left-0 w-full z-20">
                <Navbar isLoading={isLoading} />
            </div>
            <motion.div
                className="absolute top-0 w-screen h-screen duration-300"
                initial={{ background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.9)75%, rgba(0, 0, 0, 1))", className: "blur-lg", opacity: 1, backgroundSize: 1.2 }}
                animate={{ background: isLoading ? "linear-gradient(to bottom, rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 1))" : "linear-gradient(to bottom, rgba(0, 0, 0, 0.9)75%, rgba(0, 0, 0, 1))", backgroundSize: isLoading ? 1 : 1.2 }}
                transition={{ duration: 0.8 }}
            ><motion.div
                initial={{ opacity: 1 }}
                animate={isLoading ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 1.2 }}
            >
                    <Spotlight />
                </motion.div>
            </motion.div>

            <div className="p-4 flex flex-col justify-center items-center gap-5 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
                <motion.h1
                    initial={{ y: "0%", opacity: 1 }}
                    animate={isLoading ? { y: "-20%", opacity: 0 } : { y: "0%", opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="text-4xl md:text-7xl font-bold text-center pb-2 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
                    Kerpo MVP
                </motion.h1>
                <motion.p
                    initial={{ y: "0%", opacity: 1 }}
                    animate={isLoading ? { y: "20%", opacity: 0 } : { y: "0%", opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 font-normal text-base text-neutral-300 pb-2 max-w-lg text-center mx-auto">
                    Immersive Unreal Pixel Streaming Platform: A Cutting-Edge Virtual Showroom for Interactive Interior Design Experiences
                </motion.p>
                <motion.div
                    initial={{ y: "0%" }}
                    animate={{ y: isLoading ? "400%" : "0%" }}
                    transition={{ duration: .8 }}
                >
                    <Button variant={isLoading ? "default" : "outline"} onClick={handleStart}>{isLoading ? "Back" : "Start"}</Button>
                </motion.div>
            </div>
        </motion.div >
    );
}