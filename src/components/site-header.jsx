import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation } from "react-router";
import { useContext } from "react";
import { HeaderContext } from "@/context/HeaderContext";
import HeaderText from "./customComponents/HeaderText";

export function SiteHeader() {
    let location = useLocation();
    const { headerContent } = useContext(HeaderContext);

    const getPageTitle = () => {
        const path =
            location.pathname.split("/").filter(Boolean).pop() || "dashboard";
        return path.charAt(0).toUpperCase() + path.slice(1);
    };

    return (
        <header className="flex shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) h-fit">
            <div className="flex w-full items-center gap-2 lg:gap-2 mb-2">

                {/* Find somewhere to use the SidebarTrigger later, it hides the sidebar */}
                {/* <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                /> */}
                {headerContent ? (
                    headerContent
                ) : (
                    <HeaderText>{getPageTitle()}</HeaderText>
                )}
            </div>
        </header>
    );
}
