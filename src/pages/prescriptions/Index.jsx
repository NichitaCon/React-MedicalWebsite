import { useEffect, useState } from "react";
import axios from "@/config/api";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Eye, Pencil } from "lucide-react";
import DeleteBtn from "@/components/customComponents/DeleteBtn";
import dayjs from "dayjs";
import { useAuth } from "@/hooks/useAuth";
import Modal from "@/components/customComponents/Modal";
import CreateEditPrescriptionForm from "@/components/customComponents/CreateEditPrescriptionForm";

export default function PrescriptionsIndex() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();
    const [showCreatePrescriptionForm, setShowCreatePrescriptionForm] =
        useState(false);
    const [showEditPrescriptionForm, setShowEditPrescriptionForm] =
        useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [
                    prescriptionsRes,
                    patientsRes,
                    doctorsRes,
                    diagnosesRes,
                ] = await Promise.all([
                    axios.get("/prescriptions", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("/patients", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("/doctors", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("/diagnoses", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                const hydratedPrescriptions = prescriptionsRes.data.map(
                    (prescription) => {
                        const patient = patientsRes.data.find(
                            (patient) => patient.id === prescription.patient_id
                        );
                        const doctor = doctorsRes.data.find(
                            (doctor) => doctor.id === prescription.doctor_id
                        );
                        const diagnosis = diagnosesRes.data.find(
                            (diagnosis) =>
                                diagnosis.id === prescription.diagnosis_id
                        );
                        return {
                            ...prescription,
                            patient_name: patient
                                ? `${patient.first_name} ${patient.last_name}`
                                : "Unknown",
                            doctor_name: doctor
                                ? `${doctor.first_name} ${doctor.last_name}`
                                : "Unknown",
                            diagnosis_condition: diagnosis
                                ? diagnosis.condition
                                : "Unknown",
                        };
                    }
                );

                console.log(
                    "prescription api response:",
                    prescriptionsRes.data
                );
                console.log("hydratedPrescriptions:", hydratedPrescriptions);
                setPrescriptions(hydratedPrescriptions);
                setPatients(patientsRes.data);
                setDoctors(doctorsRes.data);
                setDiagnoses(diagnosesRes.data);
            } catch (error) {
                console.error("error in prescriptionsIndex:", error);
                setPrescriptions([]);
                setPatients([]);
                setDoctors([]);
                setDiagnoses([]);
            }
            setLoading(false);
        };
        fetchAll();
    }, [token]);

    const onCreateCallback = (newPrescription) => {
        console.log("Data submitted in oncreateCallback:", newPrescription);
        const patient = patients.find(
            (p) => p.id === newPrescription.patient_id
        );
        const doctor = doctors.find((d) => d.id === newPrescription.doctor_id);
        const diagnosis = diagnoses.find(
            (dx) => dx.id === newPrescription.diagnosis_id
        );
        const enrichedPrescription = {
            ...newPrescription,
            patient_name: patient
                ? `${patient.first_name} ${patient.last_name}`
                : "Unknown",
            doctor_name: doctor
                ? `${doctor.first_name} ${doctor.last_name}`
                : "Unknown",
            diagnosis_condition: newPrescription.diagnosis
                ? newPrescription.diagnosis.condition
                : "Unknown",
        };
        // setDiagnoses([...diagnoses]);
        setPrescriptions([...prescriptions, enrichedPrescription]);
        setShowCreatePrescriptionForm(false);
    };

    const onUpdateCallback = (updatedPrescription) => {
        const patient = patients.find(
            (p) => p.id === updatedPrescription.patient_id
        );
        const doctor = doctors.find(
            (d) => d.id === updatedPrescription.doctor_id
        );
        const diagnosis = diagnoses.find(
            (dx) => dx.id === updatedPrescription.diagnosis_id
        );
        const enrichedPrescription = {
            ...updatedPrescription,
            patient_name: patient
                ? `${patient.first_name} ${patient.last_name}`
                : "Unknown",
            doctor_name: doctor
                ? `${doctor.first_name} ${doctor.last_name}`
                : "Unknown",
            diagnosis_condition: updatedPrescription.diagnosis
                ? updatedPrescription.diagnosis.condition
                : "Unknown",
        };
        setPrescriptions((prev) =>
            prev.map((p) =>
                p.id === enrichedPrescription.id ? enrichedPrescription : p
            )
        );
        setShowEditPrescriptionForm(null);
    };

    const onDeleteCallback = (id) => {
        setPrescriptions(prescriptions.filter((p) => p.id !== id));
    };

    if (loading) return <h1>Loading</h1>;

    return (
        <div>
            <div className="mb-4 mr-auto block">
                <Button
                    variant="outline"
                    onClick={() => setShowCreatePrescriptionForm(true)}
                >
                    Create New Prescription
                </Button>
            </div>

            {/* Create Prescription Modal */}
            <Modal
                renderCondition={showCreatePrescriptionForm}
                onClose={() => setShowCreatePrescriptionForm(false)}
            >
                <CreateEditPrescriptionForm
                    setShowPrescriptionForm={setShowCreatePrescriptionForm}
                    onCreateCallback={onCreateCallback}
                />
            </Modal>

            {/* Edit Prescription Modal */}
            <Modal
                renderCondition={!!showEditPrescriptionForm}
                onClose={() => setShowEditPrescriptionForm(null)}
            >
                <CreateEditPrescriptionForm
                    prescription={prescriptions.find(
                        (p) => p.id === showEditPrescriptionForm
                    )}
                    setShowPrescriptionForm={setShowEditPrescriptionForm}
                    onUpdateCallback={onUpdateCallback}
                />
            </Modal>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Diagnosis</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {prescriptions.map((prescription) => (
                        <TableRow key={prescription.id}>
                            <TableCell>{prescription.patient_name}</TableCell>
                            <TableCell>{prescription.doctor_name}</TableCell>
                            <TableCell>
                                {prescription.diagnosis_condition}
                            </TableCell>
                            <TableCell>{prescription.medication}</TableCell>
                            <TableCell>{prescription.dosage}</TableCell>
                            <TableCell>
                                {prescription.start_date
                                    ? dayjs
                                          .unix(prescription.start_date)
                                          .format("D/MM/YYYY")
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                {prescription.end_date
                                    ? dayjs
                                          .unix(prescription.end_date)
                                          .format("D/MM/YYYY")
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2 text-right justify-end">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            setShowEditPrescriptionForm(
                                                prescription.id
                                            )
                                        }
                                    >
                                        <Pencil />
                                    </Button>
                                    <DeleteBtn
                                        resource="prescriptions"
                                        id={prescription.id}
                                        onDeleteCallBack={onDeleteCallback}
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
