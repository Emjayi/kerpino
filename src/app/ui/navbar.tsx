"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import KerpinoLogo from "./kerpino-logo"
import { motion } from "framer-motion"
import { ModeToggle } from "./mode-toggle"
import { ProfileButton } from "./dashboard/profile-button"

interface NavItem {
    title: string
    href: string
}

const leftNavItems: NavItem[] = [
    { title: "Home", href: "/" },
    { title: "Order", href: "/order" },
    { title: "Login", href: "/login" },
]

const rightNavItems: NavItem[] = [
    { title: "Blog", href: "/blog" },
    { title: "FAQ", href: "/faq" },
]

export const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 100
            if (scrolled !== isScrolled) {
                setScrolled(isScrolled)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [scrolled])
    return (
        <header className=" top-0 z-50">
            <motion.div
                className={cn(
                    "w-full z-50 transition-all text-zinc-800 dark:text-white ease-in-out duration-1000 fixed  backdrop-blur ",
                    scrolled
                        ? "duration-1000 fixed dark:bg-black/55 bg-zinc-200/55 backdrop-blur supports-[backdrop-filter]:bg-zinc-200/60 dark:supports-[backdrop-filter]:bg-black/60 shadow-sm"
                        : "duration-500 fixed bg-transparent",
                )}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={scrolled ? { opacity: 1, transition: { delay: 1 } } : { opacity: 0 }}
                    transition={{ duration: .2 }}
                    className="fixed z-50 gap-6 top-4 right-0 flex items-center justify-between px-4 md:px-8 lg:px-12">
                    <ModeToggle />
                    <Button className="">
                        Order Now
                    </Button>
                </motion.div>
                <motion.div
                    className="flex h-16 items-center justify-center">
                    <motion.div
                        initial={{ x: "10%" }}
                        animate={scrolled ? { x: "-10%" } : { x: "-5%" }}
                        transition={{ duration: 1.4 }}
                        className="hidden md:flex md:w-1/3 md:justify-end">
                        <nav className="flex items-center justify-end space-x-6">
                            {leftNavItems.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="text-sm font-medium transition-colors hover:dark:text-cyan-200 hover:text-cyan-700"
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </motion.div>
                    {/* Mobile Menu Button */}
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon" className="mr-2">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="pr-0">
                            <MobileNav leftItems={leftNavItems} rightItems={rightNavItems} setIsOpen={setIsMobileMenuOpen} />
                        </SheetContent>
                    </Sheet>

                    {/* Logo - Centered on mobile, centered in middle section on desktop */}
                    <div className={cn("flex flex-1 items-center justify-center", "md:w-[10%] md:flex-none md:justify-center")}>

                        <KerpinoLogo />

                    </div>

                    <motion.div
                        initial={{ x: "-10%" }}
                        animate={scrolled ? { x: "10%" } : { x: "5%" }}
                        transition={{ duration: 1.4 }}
                        className="hidden md:flex md:w-1/3 ">
                        <nav className="flex items-center justify-start space-x-6">
                            {rightNavItems.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="text-sm font-medium transition-colors hover:dark:text-cyan-200 hover:text-cyan-700"
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </motion.div>
                </motion.div>
            </motion.div>
        </header >
    )
}

function MobileNav({
    leftItems,
    rightItems,
    setIsOpen,
}: {
    leftItems: NavItem[]
    rightItems: NavItem[]
    setIsOpen: (open: boolean) => void
}) {
    return (
        <div className="grid gap-6 px-2 py-6 text-lg">
            <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                    <Image src="/placeholder.svg?height=32&width=32" alt="Logo" width={32} height={32} className="h-8 w-8" />
                    <span className="font-bold">Brand</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                </Button>
            </div>
            <nav className="grid gap-4">
                {[...leftItems, ...rightItems].map((item) => (
                    <Link
                        key={item.title}
                        href={item.href}
                        className="flex w-full items-center py-2 text-sm font-medium transition-colors hover:text-primary"
                        onClick={() => setIsOpen(false)}
                    >
                        {item.title}
                    </Link>
                ))}
            </nav>
        </div>
    )
}

