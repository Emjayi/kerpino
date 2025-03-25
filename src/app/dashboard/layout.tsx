"use client";
import React, { useState } from "react";
import "./styles.css"
import { Sidebar, SidebarBody, SidebarLink } from "@/app/ui/dashboard/sidebar";
import {
    IconArrowLeft,
    IconArrowLeftToArc,
    IconBrandTabler,
    IconSettings,
    IconUserBolt,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../ui/mode-toggle";
import { ProfileButton } from "../ui/dashboard/profile-button";
import { Logo, LogoIcon } from "../ui/kerpino-logo";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
    const links = [
        {
            label: "Overview",
            href: "/dashboard",
            icon: (
                <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Orders",
            href: "/dashboard/orders",
            icon: (
                <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Settings",
            href: "/dashboard/settings",
            icon: (
                <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        }
    ];
    const [open, setOpen] = useState(false);
    return (
        <div
            className={cn(
                "max-w-screen flex flex-col md:flex-row bg-gray-100 dark:bg-cyan-950/20 flex-1 py-4",
                "min-h-screen"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex text-black dark:text-white flex-col flex-1 overflow-y-auto overflow-x-hidden sticky top-0">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col shrink-0 rounded-full">
                        <Button className="fixed ml-6 bottom-16"><Link href="/" className={open ? "w-36 duration-300" : "w-4 duration-300"}>{open ? <div className="flex gap-2 items-center justify-between overflow-hidden"><IconArrowLeft /> <p className=" text-[15px]">back to home</p> </div> : <IconArrowLeft />}</Link></Button>
                    </div>
                </SidebarBody>
            </Sidebar>
            <div className="flex flex-1">
                <div className="p-2 mr-4 md:p-10 rounded-2xl border border-neutral-200 dark:border-cyan-950/20 bg-white dark:bg-cyan-950/10 flex flex-col gap-2 flex-1 w-full h-full">
                    {children}
                </div>
            </div>
            <div className="fixed  hidden md:flex gap-2 scrollbar-gutter-stable top-6 right-6 py-1 px-2 justify-center items-center z-20 dark:bg-cyan-950/40 rounded-full bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-10 border border-netural-200 dark:border-cyan-950/60 dark:bg-neutral-800">
                <ModeToggle />
                <div className="bg-white duration-300 dark:bg-neutral-900 dark:bg-cyan-950/20 hover:bg-neutral-300 rounded-full p-1">
                    <ProfileButton />
                </div>
            </div>
        </div>
    );
}


