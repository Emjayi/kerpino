import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";

export default function KerpinoLogo() {
    return (<div>
        <LogoIcon />
    </div>)
}

export const Logo = () => {
    return (
        <Link
            href="/"
            className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
        >
            <Image src={"/logo.png"} width={50} height={50} alt="logo" className="" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium whitespace-pre"
            >
                Kerpino MVP
            </motion.span>
        </Link>
    );
};
export const LogoIcon = () => {
    return (
        <Link
            href="/"
            className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
        >
            <Image src={"/logo.png"} width={50} height={50} alt="logo" className="" />
        </Link>
    );
};