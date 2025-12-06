import { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router";
import axios from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { HeaderContext } from "@/context/HeaderContext";
import HeaderText from "@/components/customComponents/HeaderText";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Pencil } from "lucide-react";
import DeleteBtn from "@/components/customComponents/DeleteBtn";
import AppointmentCreateForm from "@/components/customComponents/CreateAppointmentForm";
import { toast } from "sonner";


export default function DoctorShow() {
    const { id } = useParams();
    const { token } = useAuth();
    const { setHeaderContent } = useContext(HeaderContext);
    const [doctor, setDoctor] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("appointments");
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);

    useEffect(() => {
        console.warn("No doctor in navigation state, calling API...");

        const fetchAll = async () => {
            try {
                setLoading(true);
                const [
                    doctorRes,
                    appointmentsRes,
                    prescriptionsRes,
                    patientsRes,
                ] = await Promise.all([
                    axios.get(`/doctors/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`/appointments`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`/prescriptions`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`/patients`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const filteredAppointments = appointmentsRes.data.filter(
                    (appt) => appt.doctor_id == id
                );

                const filteredPrescriptions = prescriptionsRes.data.filter(
                    (prescription) => prescription.doctor_id == id
                );

                // Map appointments to include patient name
                const appointmentsWithPatients = filteredAppointments.map(
                    (appt) => {
                        const patient = patientsRes.data.find(
                            (p) => p.id === appt.patient_id
                        );
                        return {
                            ...appt,
                            patient_name: patient
                                ? `${patient.first_name} ${patient.last_name}`
                                : "Unknown",
                        };
                    }
                );

                const prescriptionsWithPatients = filteredPrescriptions.map(
                    (prescription) => {
                        const patient = patientsRes.data.find(
                            (p) => p.id === prescription.patient_id
                        );
                        return {
                            ...prescription,
                            patient_name: patient
                                ? `${patient.first_name} ${patient.last_name}`
                                : "Unknown",
                        };
                    }
                );

                setDoctor({
                    ...doctorRes.data,
                    appointments: appointmentsWithPatients,
                    prescriptions: prescriptionsWithPatients,
                });
                setPatients(patientsRes.data);
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

    const onCreateCallback = (newAppointment) => {
        console.log("OnCreateCallback Pinged in doctors", newAppointment);

        const patient = patients.find(
            (p) => p.id === newAppointment.patient_id
        );
        const patientName = patient
            ? `${patient.first_name} ${patient.last_name}`
            : "Unknown";

        setDoctor({
            ...doctor,
            appointments: [
                ...doctor.appointments,
                {
                    ...newAppointment,
                    patient_name: patientName,
                    appointment_date: Math.floor(
                        new Date(newAppointment.appointment_date).getTime() /
                            1000
                    ),
                },
            ],
        });

        setShowAppointmentForm(false);
    };

    console.table("doctor in individual show:", doctor);
    return (
        <div className="flex flex-col h-full gap-4">
            <Tabs
                defaultValue="appointments"
                className="flex-1"
                onValueChange={setActiveTab}
            >
                <div className="flex justify-between items-center">
                    <TabsList className="flex!">
                        <TabsTrigger
                            value="appointments"
                            className="data-[state=active]:bg-blue-300!"
                        >
                            Appointments
                        </TabsTrigger>
                        <TabsTrigger value="prescriptions">
                            Prescriptions
                        </TabsTrigger>
                    </TabsList>
                    {activeTab === "appointments" && (
                        <button
                            onClick={() => setShowAppointmentForm(true)}
                            className="p-2 px-3 border rounded-md cursor-pointer hover:bg-gray-50 active:scale-95 active:text-gray-600 transition-all "
                        >
                            <p className="font-medium">New Appointment</p>
                        </button>
                    )}
                    {activeTab === "prescriptions" && (
                        <h1>Add new Prescription</h1>
                    )}
                </div>
                <div className="h-full bg-gray-100 rounded-lg">
                    <TabsContent value="appointments" className=" h-full">
                        <Table className="border-separate border-spacing-y-2 p-2 -mt-1">
                            {/* <TableHeader>
                                <TableRow>
                                    <TableHead>Appointment ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Patient ID</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader> */}
                            <TableBody>
                                {doctor.appointments?.map((appointment) => (
                                    <TableRow key={appointment.id}>
                                        <TableCell className="bg-white rounded-l-sm">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Patient:
                                                </p>
                                                <p className="text-xl font-medium">
                                                    {appointment.patient_name}
                                                </p>
                                            </div>
                                        </TableCell>

                                        <TableCell className="bg-white rounded-r-sm text-right">
                                            <div className="flex gap-2 justify-end items-center">
                                                <div className="flex flex-col text-right">
                                                    <p className="text-blue-600 font-medium">
                                                        {new Date(
                                                            appointment.appointment_date *
                                                                1000
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(
                                                            appointment.appointment_date *
                                                                1000
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    className="cursor-pointer hover:border-blue-500"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        navigate(
                                                            `/appointments/${appointment.id}`
                                                        )
                                                    }
                                                >
                                                    <Eye />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="prescriptions" className="h-full">
                        <Table className="border-separate border-spacing-y-2 p-2 -mt-1">
                            <TableBody>
                                {doctor.prescriptions?.map((prescription) => (
                                    <TableRow key={prescription.id}>
                                        <TableCell className="bg-white rounded-l-sm">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Patient:
                                                </p>
                                                <p className="text-xl font-medium">
                                                    {prescription.patient_name}
                                                </p>
                                            </div>
                                        </TableCell>

                                        <TableCell className="bg-white">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Medication:
                                                </p>
                                                <p className="text-lg font-medium">
                                                    {prescription.medication}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {prescription.dosage}
                                                </p>
                                            </div>
                                        </TableCell>

                                        <TableCell className="bg-white rounded-r-sm text-right">
                                            <div className="flex gap-2 justify-end items-center">
                                                <div className="flex flex-col text-right">
                                                    <p className="text-sm text-gray-500">
                                                        Start Date:
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        {new Date(
                                                            prescription.start_date *
                                                                1000
                                                        ).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        End Date:
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        {new Date(
                                                            prescription.end_date *
                                                                1000
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    className="cursor-pointer hover:border-blue-500"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        navigate(
                                                            `/prescriptions/${prescription.id}`
                                                        )
                                                    }
                                                >
                                                    <Eye />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </div>
            </Tabs>

            {showAppointmentForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowAppointmentForm(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="animate-in zoom-in-95 duration-200"
                    >
                        <AppointmentCreateForm
                            doctor={doctor}
                            patients={patients}
                            onCreateCallback={onCreateCallback}
                            setShowAppointmentForm={setShowAppointmentForm}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
