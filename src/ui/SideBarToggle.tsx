import React from "react";
import Image from 'next/image'

type SideBarToggleProps = {
    isOpen: boolean;
};
export default function SideBarToggle({ isOpen }: SideBarToggleProps) {

    return (
        <>
            <div className="ml-1">
                {isOpen ? (
                <Image src='/arrow-up.svg' alt="arrow_up" width={10} height={10} />
                ) : (
                <Image src='/arrow-down.svg' alt="arrow_down" width={10} height={10} />
                )}
            </div>
        </>
    );
}