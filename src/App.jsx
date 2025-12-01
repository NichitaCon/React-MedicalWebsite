import { BrowserRouter as Router, Routes, Route } from "react-router";

import { AuthProvidor, useAuth } from "./hooks/useAuth";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { SiteHeader } from "./components/site-header";

// import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Appointments from "@/pages/Appointments";
import DoctorsIndex from "./pages/doctors/Index";
import DoctorShow from "./pages/doctors/Show";
import DoctorsEdit from "./pages/doctors/Edit";
import DoctorsCreate from "./pages/doctors/Create";
import ProtectedRoute from "./pages/ProtectedRoute";
import FormExamples from "@/pages/examples/Forms";

// Main layout component
function AppLayout() {
    const { token } = useAuth();
    console.log("token in AppLayout:", token);

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": token ? "calc(var(--spacing) * 82)" : "30vw",
                "--header-height": "calc(var(--spacing) * 12)",
            }}
        >
            {/* AppSideBar is the boring old sidebar */}
            <AppSidebar variant="inset" />

            {!token ? (
                // NO TOKEN: Show background image, NO SiteHeader
                <SidebarInset
                    style={{
                        backgroundImage:
                            'url("/src/assets/images/poppyField.png")',
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route
                                        path="/"
                                        element={<ProtectedRoute />}
                                    >
                                        <Route
                                            path="/doctors"
                                            element={<DoctorsIndex />}
                                        />
                                        <Route
                                            path="/doctors/:id"
                                            element={<DoctorShow />}
                                        />
                                        <Route
                                            path="/doctors/:id/edit"
                                            element={<DoctorsEdit />}
                                        />
                                        <Route
                                            path="/doctors/create"
                                            element={<DoctorsCreate />}
                                        />
                                    </Route>
                                    <Route
                                        path="/forms"
                                        element={<FormExamples />}
                                    />
                                </Routes>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            ) : (
                // HAS TOKEN: Normal layout WITH SiteHeader
                <SidebarInset>
                    <SiteHeader />

                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                <Routes>
                                    {/* <Route path="/" element={<Home />} /> */}
                                    <Route
                                        path="/appointments"
                                        element={<Appointments />}
                                    />
                                    <Route
                                        path="/"
                                        element={<ProtectedRoute />}
                                    >
                                        <Route
                                            path="/doctors"
                                            element={<DoctorsIndex />}
                                        />
                                        <Route
                                            path="/doctors/:id"
                                            element={<DoctorShow />}
                                        />
                                        <Route
                                            path="/doctors/:id/edit"
                                            element={<DoctorsEdit />}
                                        />
                                        <Route
                                            path="/doctors/create"
                                            element={<DoctorsCreate />}
                                        />
                                    </Route>
                                    <Route
                                        path="/forms"
                                        element={<FormExamples />}
                                    />
                                </Routes>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            )}
        </SidebarProvider>
    );
}

// Root App component - wraps everything with providers
export default function App() {
    return (
        <Router>
            <AuthProvidor>
                <AppLayout />
            </AuthProvidor>
        </Router>
    );
}
