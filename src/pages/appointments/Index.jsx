import { useEffect, useState } from "react";
import axios from "@/config/api";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import { Pencil } from "lucide-react";
import DeleteBtn from "@/components/customComponents/DeleteBtn";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import CreateEditAppointmentForm from "@/components/customComponents/CreateEditAppointmentForm";
import AppointmentDetails from "@/components/customComponents/AppointmentDetails";

// import {
//   Card,
//   CardAction,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

export default function AppointmentsIndex() {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);

    const [showCreateAppointmentForm, setShowCreateAppointmentsForm] =
        useState(false);
    const [showEditAppointmentForm, setShowEditAppointmentForm] =
        useState(null);
    const [showAppointmentDetails, setShowAppointmentDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        const fetchAll = async () => {
            console.log("fetching appointments...");
            try {
                setLoading(true);
                const [doctorRes, appointmentsRes, patientsRes] =
                    await Promise.all([
                        axios.get(`/doctors`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                        axios.get(`/appointments`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),

                        axios.get(`/patients`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                    ]);

                // Map appointments to include patient + doctor's name
                const appointmentsWithPatientsAndDoctors =
                    appointmentsRes.data.map((appt) => {
                        const patient = patientsRes.data.find(
                            (p) => p.id === appt.patient_id
                        );

                        const doctor = doctorRes.data.find(
                            (d) => d.id === appt.doctor_id
                        );
                        return {
                            ...appt,
                            patient_name: patient
                                ? `${patient.first_name} ${patient.last_name}`
                                : "Unknown",
                            doctor_name: doctor
                                ? `${doctor.first_name} ${doctor.last_name}`
                                : "Unknown",
                        };
                    });

                console.log(
                    "appointmentsWithPatientsAndDoctors:",
                    appointmentsWithPatientsAndDoctors
                );

                setDoctors(doctorRes.data);
                setPatients(patientsRes.data);
                setAppointments(appointmentsWithPatientsAndDoctors);
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const onCreateCallback = (newAppointment) => {
        console.log("OnCreateCallback called with:", newAppointment);
        const patient = patients.find(
            (p) => p.id === newAppointment.patient_id
        );
        const doctor = doctors.find((d) => d.id === newAppointment.doctor_id);

        const enrichedAppointment = {
            ...newAppointment,
            patient_name: patient
                ? `${patient.first_name} ${patient.last_name}`
                : "Unknown",
            doctor_name: doctor
                ? `${doctor.first_name} ${doctor.last_name}`
                : "Unknown",
        };
        console.log(enrichedAppointment);
        setAppointments([...appointments, enrichedAppointment]);
        setShowCreateAppointmentsForm(false);
    };

    const onUpdateCallBack = (editedAppointment) => {
        console.log("onUpdateCallBack called with:", editedAppointment);
        const patient = patients.find(
            (p) => p.id === editedAppointment.patient_id
        );
        const doctor = doctors.find(
            (d) => d.id === editedAppointment.doctor_id
        );

        const enrichedAppointment = {
            ...editedAppointment,
            patient_name: patient
                ? `${patient.first_name} ${patient.last_name}`
                : "Unknown",
            doctor_name: doctor
                ? `${doctor.first_name} ${doctor.last_name}`
                : "Unknown",
        };

        // Update the appointments array in state:
        // - Use the previous appointments array (prev)
        // - For each appointment (appt), check if its id matches the updated appointment's id
        // - If it matches, replace it with the enriched (updated) appointment
        // - If not, keep the original appointment
        setAppointments((prev) =>
            prev.map((appt) =>
                appt.id === enrichedAppointment.id ? enrichedAppointment : appt
            )
        );
        setShowEditAppointmentForm(null);
    };

    const onDeleteCallBack = (id) => {
        console.log("On Delete Callback called with id:", id);
        setAppointments(
            appointments.filter((appointment) => appointment.id !== id)
        );
    };

    console.log("Viewing appointments Index");

    if (loading) {
        return (
            <>
                <h1>Loading</h1>
            </>
        );
    }

    return (
        <div>
            <div className={"mb-4 mr-auto block"}>
                <Button
                    variant="outline"
                    onClick={() => setShowCreateAppointmentsForm(true)}
                >
                    Create New Appointment
                </Button>
            </div>
            {showCreateAppointmentForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowCreateAppointmentsForm(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="animate-in zoom-in-95 duration-200"
                    >
                        <CreateEditAppointmentForm
                            setShowAppointmentForm={
                                setShowCreateAppointmentsForm
                            }
                            onCreateCallback={onCreateCallback}
                        />
                    </div>
                </div>
            )}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Appointment Date</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Doctor Name</TableHead>

                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                            <TableCell>
                                {appointment.appointment_date
                                    ? new Date(
                                          appointment.appointment_date * 1000
                                      ).toLocaleString()
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                {appointment.patient_name || "-"}
                            </TableCell>
                            <TableCell>
                                {appointment.doctor_name || "-"}
                            </TableCell>

                            <TableCell>
                                <div className="flex gap-2 text-right justify-end">
                                    <Button
                                        className={`${
                                            showAppointmentDetails ===
                                            appointment.id
                                                ? "cursor-default"
                                                : "cursor-pointer hover:border-blue-500"
                                        }`}
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            setShowAppointmentDetails(
                                                appointment.id
                                            )
                                        }
                                    >
                                        <Eye />
                                    </Button>
                                    <Button
                                        className="cursor-pointer hover:border-blue-500"
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            setShowEditAppointmentForm(
                                                appointment.id
                                            )
                                        }
                                    >
                                        <Pencil />

                                        {/* EDITAPPOINTMENT */}
                                        {/* DONT GET CONFUSED here is where im using the form in the edit config */}
                                    </Button>
                                    <DeleteBtn
                                        onDeleteCallBack={onDeleteCallBack}
                                        resource="appointments"
                                        id={appointment.id}
                                    />
                                </div>
                            </TableCell>
                            {showAppointmentDetails === appointment.id && (
                                <div
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                                    onClick={() => {
                                        console.log(
                                            "outside has been clicked",
                                            showAppointmentDetails
                                        );
                                        setShowAppointmentDetails(null);
                                    }}
                                >
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="animate-in zoom-in-95 duration-200"
                                    >
                                        <AppointmentDetails
                                            appointment={appointment}
                                            setShowAppointmentDetails={
                                                setShowAppointmentDetails
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                            {showEditAppointmentForm === appointment.id && (
                                <div
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                                    onClick={() =>
                                        setShowEditAppointmentForm(null)
                                    }
                                >
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="animate-in zoom-in-95 duration-200"
                                    >
                                        <CreateEditAppointmentForm
                                            appointment={appointment}
                                            setShowAppointmentForm={
                                                setShowEditAppointmentForm
                                            }
                                            onCreateCallback={onCreateCallback}
                                            onUpdateCallback={onUpdateCallBack}
                                        />
                                    </div>
                                </div>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
