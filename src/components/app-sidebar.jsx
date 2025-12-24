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
import {
    CalendarDays,
    User,
    HeartPulse,
    Pill,
    NotepadText,
    Smile,
    Tablets,
    ClipboardMinus,
} from "lucide-react";
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
import LoginForm from "./customComponents/LoginForm";
import RegisterForm from "./customComponents/RegisterForm";

import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export function AppSidebar({ ...props }) {
    const location = useLocation();
    const { token, userData } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(true);
    console.log("token in AppSidebar() is:", token);

    console.log(location);

    const data = {
        user: {
            name: userData.first_name + " " + userData.last_name,
            email: userData.email,
            avatar: "/avatars/shadcn.jpg",
        },
        navMain: [
            {
                title: "Doctors",
                url: "/doctors",
                icon: HeartPulse,
            },
            {
                title: "Patients",
                url: "/patients",
                icon: User,
            },
            {
                title: "Appointments",
                url: "/appointments",
                icon: CalendarDays,
            },
            {
                title: "Prescriptions",
                url: "/prescriptions",
                icon: Tablets,
            },
            {
                title: "Diagnoses",
                url: "/diagnoses",
                icon: ClipboardMinus,
            },
        ],
        // examples: [
        //     {
        //         name: "Forms & Validation",
        //         url: "/forms",
        //         icon: IconListCheck,
        //     },
        // ],
    };

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
                        <SidebarHeader className="pb-0!">
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <div className="flex flex-row items-center">
                                        {/* <Smile className="size-5!" /> */}
                                        <span className="text-3xl font-semibold ml-1">
                                            MedApi
                                        </span>
                                    </div>
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
                        {isLoggingIn ? (
                            <LoginForm setIsLoggingIn={setIsLoggingIn} />
                        ) : (
                            <RegisterForm setIsLoggingIn={setIsLoggingIn} />
                        )}
                    </div>
                )}
            </Sidebar>
        </>
    );
}
