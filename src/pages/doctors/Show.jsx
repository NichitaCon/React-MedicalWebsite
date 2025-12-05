import { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router";
import axios from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { HeaderContext } from "@/context/HeaderContext";
import HeaderText from "@/components/customComponents/HeaderText";

export default function DoctorShow() {
    const { id } = useParams();
    const { token } = useAuth();
    const { setHeaderContent } = useContext(HeaderContext);
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        console.warn("No doctor in navigation state, calling API...");

        const fetchAll = async () => {
            try {
                setLoading(true);
                const [doctorRes, appointmentsRes, prescriptionsRes] =
                    await Promise.all([
                        axios.get(`/doctors/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                        axios.get(`/appointments`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                        axios.get(`/prescriptions`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                    ]);

                const filteredAppointments = appointmentsRes.data.filter(
                    (appt) => appt.doctor_id == id
                );

                const filteredPrescriptions = prescriptionsRes.data.filter(
                    (prescription) => prescription.doctor_id == id
                );

                setDoctor({
                    ...doctorRes.data,
                    appointments: filteredAppointments,
                    prescriptions: filteredPrescriptions,
                });
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    // Set custom header content for this page
    useEffect(() => {
        if (!loading && doctor) {
            setHeaderContent(
                <div className="flex flex-col justify-center h-full">
                    <HeaderText>
                        Dr {doctor.first_name} {doctor.last_name}
                    </HeaderText>
                    <h2 className="text-2xl text-gray-500">
                        {doctor.specialisation}
                    </h2>
                </div>
            );
        } else {
            setHeaderContent(<></>);
        }
        return () => setHeaderContent(null);
    }, [doctor, loading]);

    if (loading || !doctor) {
        return <h1>LOADING</h1>;
    }

    console.table("doctor in individual show:", doctor);
    return (
        <div className="flex flex-col h-full gap-4">
            <Tabs defaultValue="account" className="flex-1">
                <TabsList className="flex!">
                    <TabsTrigger
                        value="account"
                        className="data-[state=active]:bg-blue-300!"
                    >
                        Appointments
                    </TabsTrigger>
                    <TabsTrigger value="password">Prescriptions</TabsTrigger>
                </TabsList>
                <div className="h-full bg-gray-100">
                    <TabsContent value="account" className=" h-full rounded-md">
                        Make changes to your account here.
                    </TabsContent>
                    <TabsContent value="password" className="h-full rounded-md">
                        Change your password here.
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
