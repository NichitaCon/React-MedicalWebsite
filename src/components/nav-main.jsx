import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react";
import { useLocation } from "react-router";
import { NavLink } from "react-router";
import { Button } from "@/components/ui/button";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({ items }) {
    let location = useLocation();

    const checkActive = (url) => {
        if (location.pathname === "/" && url === "/") {
            console.log("youre in the dashboard");
            return true;
        } else if (url !== "/" && location.pathname.includes(url)) {
            return true;
        }

        return false;
    };

    console.log("location in nav-main:", location.pathname);

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2">
                        <NavLink to={"/dashboard"} className="flex-1">
                            <SidebarMenuButton
                                tooltip="Quick Create"
                                isActive={checkActive("/dashboard")}
                                className=" text-primary hover:bg-primary/10 hover:text-primary active:bg-primary/20 active:text-primary min-w-8 transition-all duration-100 ease-linear"
                            >
                                <IconCirclePlusFilled />
                                <span>DashBoard</span>
                            </SidebarMenuButton>
                        </NavLink>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={checkActive(item.url)}
                            >
                                <NavLink to={item.url}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </NavLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
