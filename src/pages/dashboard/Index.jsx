import DashboardCard from "@/components/customComponents/DashboardCard";
import { User } from "lucide-react";
import AppointmentsIndex from "../appointments/Index";
import { ChartLineDefault } from "@/components/ui/chart-line-default";
import axios from "@/config/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardIndex() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        const fetchAll = async () => {
            console.log("fetching appointments...");
            try {
                setLoading(true);
                const [doctorRes, appointmentsRes, patientsRes, prescriptionsRes] =
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
                        axios.get(`/prescriptions`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                    ]);

                // Map appointments to include patient + doctor's name
                const appointmentsWithPatientsAndDoctors = appointmentsRes.data
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
                                appt.appointment_date * 1000 < Date.now()
                                    ? "Completed"
                                    : "Upcoming",
                        };
                    })
                    .sort((a, b) => b.appointment_date - a.appointment_date);

                console.log(
                    "appointmentsWithPatientsAndDoctors:",
                    appointmentsWithPatientsAndDoctors
                );

                // Map prescriptions to include status
                const prescriptionsWithStatus = prescriptionsRes.data.map(
                    (prescription) => ({
                        ...prescription,
                        status:
                            prescription.end_date * 1000 >= Date.now()
                                ? "Active"
                                : "Expired",
                    })
                );

                setDoctors(doctorRes.data);
                setPatients(patientsRes.data);
                setAppointments(appointmentsWithPatientsAndDoctors);
                setPrescriptions(prescriptionsWithStatus);
                setLoading(false);
            } catch (error) {
                console.log("error fetchingALL", error);
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const upComingAppointments = appointments.filter(
        (upcomingAppointment) => upcomingAppointment.status === "Upcoming"
    );

    // Calculate resources created in the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const patientsCreatedThisWeek = patients.filter(
        (patient) => new Date(patient.createdAt) >= oneWeekAgo
    ).length;

    const doctorsCreatedThisWeek = doctors.filter(
        (doctor) => new Date(doctor.createdAt) >= oneWeekAgo
    ).length;

    const appointmentsCreatedThisWeek = appointments.filter(
        (appointment) => new Date(appointment.createdAt) >= oneWeekAgo
    ).length;

    const activePrescriptions = prescriptions.filter(
        (prescription) => prescription.status === "Active"
    );

    // Calculate prescriptions created this week that are still active
    const activePrescriptionsCreatedThisWeek = prescriptions.filter(
        (prescription) => 
            new Date(prescription.createdAt) >= oneWeekAgo && 
            prescription.status === "Active"
    ).length;

    // Calculate prescriptions that expired in the past week
    const prescriptionsExpiredThisWeek = prescriptions.filter(
        (prescription) => {
            const endDate = new Date(prescription.end_date * 1000);
            return endDate >= oneWeekAgo && prescription.status === "Expired";
        }
    ).length;

    // Net change: new active prescriptions minus expired ones
    const activePrescriptionsTrend = activePrescriptionsCreatedThisWeek - prescriptionsExpiredThisWeek;

    console.log("upcomingAppointments:", upComingAppointments);
    return (
        <div>
            <div className="mb-4 flex flex-row gap-4">
                {/* DashboardCards grid */}
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-3">
                        <DashboardCard
                            cardTitle="Total Patients"
                            cardNumber={patients.length}
                            cardWeeklyTrendNumber={patientsCreatedThisWeek}
                            Icon={User}
                        />
                        <DashboardCard
                            cardTitle="Total Doctors"
                            cardNumber={doctors.length}
                            cardWeeklyTrendNumber={doctorsCreatedThisWeek}
                            Icon={User}
                        />
                    </div>
                    <div className="flex flex-row gap-3">
                        <DashboardCard
                            cardTitle="Upcoming Appointments"
                            cardNumber={upComingAppointments.length}
                            cardWeeklyTrendNumber={appointmentsCreatedThisWeek}
                            Icon={User}
                        />
                        <DashboardCard
                            cardTitle="Active Prescriptions"
                            cardNumber={activePrescriptions.length}
                            cardWeeklyTrendNumber={activePrescriptionsTrend >= 0 ? `+${activePrescriptionsTrend}` : activePrescriptionsTrend}
                            Icon={User}
                        />
                    </div>
                </div>
                <div className="flex flex-1">
                    <ChartLineDefault appointments={appointments} />
                </div>
            </div>

            <div className="p-3 border rounded-lg ">
                <AppointmentsIndex appointmentsProp={appointments} />
            </div>
        </div>
    );
}
