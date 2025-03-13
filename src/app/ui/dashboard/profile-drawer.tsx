"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { ProfileForm } from "../profile"
import { PenLine } from "lucide-react"

interface ProfileDrawerProps {
    children?: React.ReactNode
    triggerClassName?: string
}

export function ProfileDrawer({ children, triggerClassName }: ProfileDrawerProps) {
    const [open, setOpen] = useState(false)

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {children || (
                    <Button variant="outline" className={triggerClassName}>
                        <PenLine className="mr-2 h-4 w-4" />
                        Update Profile
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh]">
                <div className="h-full overflow-y-auto">
                    <DrawerHeader className=" flex justify-between">
                        <div className="text-left">
                            <DrawerTitle>Update Your Profile</DrawerTitle>
                            <DrawerDescription>
                                Make changes to your profile information here. Click save when you&aposre done.
                            </DrawerDescription>
                        </div>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerHeader>
                    <div className="px-4 py-2">
                        <ProfileForm onComplete={() => setOpen(false)} isDrawer={true} />
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

