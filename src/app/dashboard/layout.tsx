"use client";
import React, { useState } from "react";
import "./styles.css"
import { Sidebar, SidebarBody, SidebarLink } from "@/app/ui/dashboard/sidebar";
import {
    IconArrowLeft,
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
                "max-w-screen flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 flex-1 py-4",
                "min-h-screen"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden sticky top-0">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    {/* <div className="flex flex-col gap-2 shrink-0 rounded-full">
                        <button onClick={signOut} className="bg-transparent">Logout</button>
                    </div> */}
                </SidebarBody>
            </Sidebar>
            <div className="flex flex-1">
                <div className="p-2 mr-4 md:p-10 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
                    {children}
                </div>
            </div>
            <div className="fixed  hidden md:flex gap-2 scrollbar-gutter-stable top-6 right-6 py-1 px-2 justify-center items-center z-20 bg-gray-600 rounded-full bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-10 border border-netural-200 dark:border-neutral-700 dark:bg-neutral-800">
                <ModeToggle />
                <div className="bg-white duration-300 dark:bg-neutral-900 hover:dark:bg-neutral-700 hover:bg-neutral-300 rounded-full p-1">
                    <ProfileButton />
                </div>
            </div>
        </div>
    );
}


