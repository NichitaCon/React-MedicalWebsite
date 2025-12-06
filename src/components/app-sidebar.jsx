import * as React from "react";
import {
    IconConfetti,
    IconTheater,
    IconDashboard,
    IconMicrophone2,
    IconInnerShadowTop,
    IconMusic,
    IconListCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useLocation } from "react-router";
import { useEffect } from "react";

import { NavMain } from "@/components/nav-main";
import { NavExamples } from "@/components/nav-examples";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import LoginForm from "./LoginForm";

import { useAuth } from "@/hooks/useAuth";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Appointments",
            url: "/appointments",
            icon: IconDashboard,
        },
        {
            title: "Doctors",
            url: "/doctors",
            icon: IconConfetti,
        },
        {
            title: "Patients",
            url: "/patients",
            icon: IconTheater,
        },
        // {
        //     title: "Performers",
        //     url: "#",
        //     icon: IconMicrophone2,
        // },
        // {
        //     title: "Shows",
        //     url: "#",
        //     icon: IconMusic,
        // },
    ],
    // examples: [
    //     {
    //         name: "Forms & Validation",
    //         url: "/forms",
    //         icon: IconListCheck,
    //     },
    // ],
};

export function AppSidebar({ ...props }) {
    const location = useLocation();
    const { token } = useAuth();
    console.log("token in AppSidebar() is:", token);

    console.log(location);

    let message = location.state?.message;
    let type = location.state?.type;

    useEffect(() => {
        if (message) {
            if (type === "error") {
                toast.error(message);
            } else if (type === "success") {
                toast.success(message);
            } else {
                toast(message);
            }
        }
    }, [message]);

    return (
        <>
            <Toaster position="top-center" richColors />
            <Sidebar collapsible="offcanvas" {...props}>
                {/* here i might be able to swap out this content for login form */}
                {token ? (
                    <>
                        <SidebarHeader>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        className="data-[slot=sidebar-menu-button]:!p-1.5"
                                    >
                                        <a href="#">
                                            <IconInnerShadowTop className="!size-5" />
                                            <span className="text-base font-semibold">
                                                Acme Inc.
                                            </span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarHeader>

                        <SidebarContent>
                            <NavMain items={data.navMain} />
                            {/* <NavExamples items={data.examples} /> */}
                        </SidebarContent>
                        <SidebarFooter>
                            <NavUser user={data.user} />
                        </SidebarFooter>
                    </>
                ) : (
                    <div className="p-4 flex flex-col justify-between h-full">
                        <div>
                            <h1 className="text-5xl font-semibold mb-2">
                                Welcome to MedApi
                            </h1>
                            <p>
                                MedApi is a simple React app used for managing
                                doctor appointments, patients and prescriptions,
                                MedApi also serves as a demonstration of
                                understanding the process of building complex
                                websites with React.
                            </p>
                        </div>
                        {/* TODO: add loading state for login button (open the loginform component)*/}
                        <LoginForm />
                    </div>
                )}
            </Sidebar>
        </>
    );
}