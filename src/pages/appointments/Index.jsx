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
import dayjs from "dayjs";
import CreateEditAppointmentForm from "@/components/customComponents/CreateEditAppointmentForm";
import AppointmentDetails from "@/components/customComponents/AppointmentDetails";
import CreateButton from "@/components/customComponents/CreateButton";

// import {
//   Card,
//   CardAction,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

export default function AppointmentsIndex({
    appointmentsProp,
    onCreateCallbackProp,
}) {
    const [appointments, setAppointments] = useState(
        appointmentsProp ? appointmentsProp : []
    );
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [showCreateAppointmentForm, setShowCreateAppointmentsForm] =
        useState(false);
    const [showEditAppointmentForm, setShowEditAppointmentForm] =
        useState(null);
    const [showAppointmentDetails, setShowAppointmentDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token } = useAuth();

    // Sync appointments state when prop changes
    useEffect(() => {
        if (appointmentsProp) {
            const appointmentsWithStatus = appointmentsProp.map((appt) => ({
                ...appt,
                status:
                    appt.appointment_date * 1000 < Date.now()
                        ? "Completed"
                        : "Upcoming",
            }));
            setAppointments(appointmentsWithStatus);
        }
    }, [appointmentsProp]);

    useEffect(() => {
        const fetchAll = async () => {
            console.log("fetching appointments...");
            try {
                setLoading(true);

                // Always fetch doctors and patients for create/update operations
                const [doctorRes, patientsRes] = await Promise.all([
                    axios.get(`/doctors`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`/patients`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setDoctors(doctorRes.data);
                setPatients(patientsRes.data);

                // Only fetch appointments if not provided as prop
                if (!appointmentsProp) {
                    const appointmentsRes = await axios.get(`/appointments`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    // Map appointments to include patient + doctor's name
                    const appointmentsWithPatientsAndDoctors =
                        appointmentsRes.data
                            .map((appt) => {
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
                                    status:
                                        appt.appointment_date * 1000 <
                                        Date.now()
                                            ? "Completed"
                                            : "Upcoming",
                                };
                            })
                            .sort(
                                (a, b) =>
                                    b.appointment_date - a.appointment_date
                            );

                    console.log(
                        "appointmentsWithPatientsAndDoctors:",
                        appointmentsWithPatientsAndDoctors
                    );

                    setAppointments(appointmentsWithPatientsAndDoctors);
                } else {
                    console.log(
                        "AppointmentsProp passed into appointmentsIndex, skipping appointments API call!"
                    );
                }

                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const onCreateCallback = (newAppointment) => {
        if (onCreateCallbackProp) {
            onCreateCallbackProp(newAppointment);
        }
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
            status:
                newAppointment.appointment_date * 1000 < Date.now()
                    ? "Completed"
                    : "Upcoming",
        };
        const sortedAppointments = [...appointments, enrichedAppointment].sort(
            (a, b) => b.appointment_date - a.appointment_date
        );
        console.log(enrichedAppointment);
        setAppointments(sortedAppointments);
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
            status:
                editedAppointment.appointment_date * 1000 < Date.now()
                    ? "Completed"
                    : "Upcoming",
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

    const q = (searchQuery || "").trim().toLowerCase();
    const filteredAppointments = appointments.filter((appointment) => {
        if (!q) return true;
        const appointmentId = appointment.id ? String(appointment.id) : "";
        const apptDate = appointment.appointment_date
            ? dayjs
                  .unix(appointment.appointment_date)
                  .format("M/D/YYYY, h:mm:ss A")
            : "";
        return (
            appointmentId.includes(q) ||
            (appointment.patient_name || "").toLowerCase().includes(q) ||
            (appointment.doctor_name || "").toLowerCase().includes(q) ||
            (appointment.status || "").toLowerCase().includes(q) ||
            apptDate.toLowerCase().includes(q)
        );
    });

    return (
        <div>
            <div className="mb-4 mr-auto flex flex-row justify-between items-center">
                {!!onCreateCallbackProp && (
                    <h2 className="text-2xl font-medium">Appointments</h2>
                )}
                <div className="flex items-center gap-2">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search appointments (patient, doctor, status, date...)"
                        className="border px-3 py-2 rounded-md w-72"
                    />
                    <CreateButton
                        resourceName="Appointment"
                        onShowForm={() => setShowCreateAppointmentsForm(true)}
                    />
                </div>
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
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                            <TableCell>
                                {appointment.appointment_date
                                    ? dayjs
                                          .unix(appointment.appointment_date)
                                          .format("M/D/YYYY, h:mm:ss A")
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                {appointment.patient_name || "-"}
                            </TableCell>
                            <TableCell>
                                {appointment.doctor_name || "-"}
                            </TableCell>
                            <TableCell>
                                {appointment.status === "Completed" ? (
                                    <span className=" font-medium px-2 py-1.5 rounded-full bg-green-200">
                                        Completed
                                    </span>
                                ) : (
                                    <span className="font-medium px-2 py-1.5 rounded-full bg-blue-200">
                                        Upcoming
                                    </span>
                                )}
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
