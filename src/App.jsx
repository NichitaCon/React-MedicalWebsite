import { BrowserRouter as Router, Routes, Route } from "react-router";

import { AuthProvidor, useAuth } from "./hooks/useAuth";
import { HeaderProvider } from "@/context/HeaderContext";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { SiteHeader } from "./components/site-header";

// import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import DoctorsIndex from "./pages/doctors/Index";
import DoctorShow from "./pages/doctors/Show";
import DoctorsEdit from "./pages/doctors/Edit";
import ProtectedRoute from "./pages/ProtectedRoute";
import FormExamples from "@/pages/examples/Forms";
import AppointmentsCreate from "./pages/appointments/Create";
import AppointmentsIndex from "./pages/appointments/Index";
import PatientsIndex from "./pages/patients/Index";
import DiagnosesIndex from "./pages/diagnoses/Index";
import PrescriptionsIndex from "./pages/prescriptions/Index";

// Main layout component
function AppLayout() {
    const { token } = useAuth();
    console.log("token in AppLayout:", token);

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": token ? "calc(var(--spacing) * 82)" : "25vw",
                "--header-height": "calc(var(--spacing) * 12)",
            }}
            className="relative bg-sidebar"
        >
            {/* Gradient overlay that fades out when logged in */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-500 pointer-events-none ${
                    token ? "opacity-0" : "opacity-100"
                }`}
            />

            {/* AppSideBar is the boring old sidebar */}
            <AppSidebar
                variant="inset"
                className={`transition-all duration-500 ${
                    token ? "" : "!pr-3"
                }`}
            />

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
                                        {/* Doctors */}
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

                                        {/* Appointments */}

                                        {/* <Route
                                            path="/appointments"
                                            element={<AppointmentsIndex />}
                                        />

                                        <Route
                                            path="/appointments/create"
                                            element={<AppointmentsCreate />}
                                        /> */}
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
                    <div className="flex flex-1 flex-col p-3">
                        <SiteHeader />

                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 md:gap-6 flex-1">
                                <Routes>
                                    {/* <Route path="/" element={<Home />} /> */}
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

                                        {/* Appointments */}

                                        <Route
                                            path="/appointments"
                                            element={<AppointmentsIndex />}
                                        />

                                        <Route
                                            path="/appointments/create"
                                            element={<AppointmentsCreate />}
                                        />

                                        {/* Patients */}
                                        <Route
                                            path="/patients"
                                            element={<PatientsIndex />}
                                        />

                                        {/* Diagnoses */}

                                        <Route
                                            path="/diagnoses"
                                            element={<DiagnosesIndex />}
                                        />

                                        {/* Prescriptions */}
                                        <Route
                                            path="/prescriptions"
                                            element={<PrescriptionsIndex />}
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
                <HeaderProvider>
                    <AppLayout />
                </HeaderProvider>
            </AuthProvidor>
        </Router>
    );
}
