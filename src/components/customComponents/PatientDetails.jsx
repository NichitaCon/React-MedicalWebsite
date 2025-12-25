import { useEffect, useState } from "react";
import axios from "@/config/api";
import { format } from "date-fns";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import dayjs from "dayjs";

export default function PatientDetails({ patient, setShowPatientDetails }) {
    const { token } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [diagnosis, setDiagnosis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [appointmentsRes, prescriptionsRes, diagnosisRes] =
                    await Promise.all([
                        axios.get(`/patients/${patient.id}/appointments`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),

                        axios.get(`/prescriptions`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                        axios.get(`/diagnoses`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                    ]);

                const filteredPrescriptions = prescriptionsRes.data.filter(
                    (prescription) => prescription.patient_id == patient.id
                );

                const filteredDiagnoses = diagnosisRes.data.filter(
                    (diagnosis) => diagnosis.patient_id == patient.id
                );

                setPrescriptions(filteredPrescriptions);
                setDiagnosis(filteredDiagnoses);
                console.log(
                    "diagnosis and prescriptions",
                    filteredDiagnoses,
                    filteredPrescriptions
                );
                setAppointments(appointmentsRes.data);
            } catch (err) {
                console.error("error:", err);
                setAppointments([]);
            }
            setLoading(false);
        };
        if (patient?.id) fetchAll();
    }, [patient]);

    return (
        <Card className="w-full max-w-md px-4 py-2 shadow-lg border border-accent bg-card gap-2">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
                <CardTitle className="text-lg font-semibold">
                    {patient.first_name} {patient.last_name}
                </CardTitle>
                <button
                    className="transition-all cursor-pointer hover:bg-gray-100 p-1 rounded-sm ml-2"
                    onClick={() => setShowPatientDetails(null)}
                    aria-label="Close details"
                >
                    <X />
                </button>
            </div>
            <CardContent className="space-y-3 pb-4 px-1">
                <div className="flex flex-row justify-between items-center">
                    <p className="font-medium mr-2">Email:</p>
                    <p>{patient.email}</p>
                </div>
                <div className="flex flex-row justify-between items-center">
                    <p className="font-medium mr-2">Phone:</p>
                    <p>{patient.phone}</p>
                </div>
                <div className="flex flex-row justify-between items-center">
                    <p className="font-medium mr-2">Date of Birth:</p>
                    <p>
                        {dayjs
                            .unix(patient.date_of_birth)
                            .format("MMMM D, YYYY")}
                    </p>
                </div>
                <div className="flex flex-row justify-between items-center">
                    <p className="font-medium mr-2">Address:</p>
                    <p>{patient.address}</p>
                </div>
                <div className="flex flex-row justify-between items-center">
                    <p className="font-medium mr-2">Created At:</p>
                    <p>
                        {dayjs(patient.createdAt).format(
                            "MMMM D, YYYY hh:mm a"
                        )}
                    </p>
                </div>
                <div className="flex flex-row justify-between items-center">
                    <p className="font-medium mr-2">Last Updated:</p>
                    <p>
                        {dayjs(patient.updatedAt).format(
                            "MMMM D, YYYY hh:mm a"
                        )}
                    </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                    <div>
                        <p className="font-medium ">Appointments:</p>
                        {loading ? (
                            <p>Loading...</p>
                        ) : appointments.length === 0 ? (
                            <p className="text-gray-500">
                                No appointments scheduled.
                            </p>
                        ) : (
                            <ul className="list-disc ml-4">
                                {appointments.map((appt) => (
                                    <li key={appt.id}>
                                        {dayjs
                                            .unix(appt.appointment_date)
                                            .format("MMMM D, YYYY hh:mm a")}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <p className="font-medium ">Diagnosis:</p>
                        {loading ? (
                            <p>Loading...</p>
                        ) : diagnosis.length === 0 ? (
                            <p className="text-gray-500">
                                This person is healthy. :)
                            </p>
                        ) : (
                            <ul className="list-disc ml-4">
                                {diagnosis.map((diagnosis) => (
                                    <li key={diagnosis.id}>
                                        <p className="flex justify-between">
                                            {diagnosis.condition}
                                            {diagnosis.createdAt && (
                                                <span className="text-gray-500 ml-2">
                                                    {dayjs(
                                                        diagnosis.createdAt
                                                    ).format(
                                                        "MMMM D, YYYY hh:mm a"
                                                    )}
                                                </span>
                                            )}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <p className="font-medium ">Prescriptions:</p>
                        {loading ? (
                            <p>Loading...</p>
                        ) : prescriptions.length === 0 ? (
                            <p className="text-gray-500">
                                No prescriptions found.
                            </p>
                        ) : (
                            <ul className="list-disc ml-4">
                                {prescriptions.map((prescription) => (
                                    <li key={prescription.id}>
                                        <p className="flex justify-between">
                                            {prescription.medication}
                                            {prescription.createdAt && (
                                                <span className="text-gray-500 ml-2">
                                                    {dayjs(
                                                        prescription.createdAt
                                                    ).format(
                                                        "MMMM D, YYYY hh:mm a"
                                                    )}
                                                </span>
                                            )}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
