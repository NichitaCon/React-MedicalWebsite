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
import TableLoadingSkeleton from "@/components/customComponents/TableLoadingSkeleton";
import CreateButton from "@/components/customComponents/CreateButton";

export default function PrescriptionsIndex() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
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
                const hydratedPrescriptions = prescriptionsRes.data
                    .map((prescription) => {
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
                            status:
                                prescription.end_date * 1000 >= Date.now()
                                    ? "Active"
                                    : "Expired",
                        };
                    })
                    .sort(
                        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
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
            status:
                newPrescription.end_date * 1000 >= Date.now()
                    ? "Active"
                    : "Expired",
        };

        setPrescriptions((prev) =>
            [...prev, enrichedPrescription].sort(
                (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            )
        );
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
            status:
                updatedPrescription.end_date * 1000 >= Date.now()
                    ? "Active"
                    : "Expired",
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

    const q = (searchQuery || "").trim().toLowerCase();
    const filteredPrescriptions = prescriptions.filter((prescription) => {
        if (!q) return true;
        const prescriptionId = prescription.id ? String(prescription.id) : "";
        const start = prescription.start_date
            ? dayjs.unix(prescription.start_date).format("D/MM/YYYY")
            : "";
        const end = prescription.end_date
            ? dayjs.unix(prescription.end_date).format("D/MM/YYYY")
            : "";
        return (
            prescriptionId.includes(q) ||
            (prescription.patient_name || "").toLowerCase().includes(q) ||
            (prescription.doctor_name || "").toLowerCase().includes(q) ||
            (prescription.diagnosis_condition || "")
                .toLowerCase()
                .includes(q) ||
            (prescription.medication || "").toLowerCase().includes(q) ||
            (prescription.dosage || "").toLowerCase().includes(q) ||
            (prescription.status || "").toLowerCase().includes(q) ||
            start.toLowerCase().includes(q) ||
            end.toLowerCase().includes(q)
        );
    });

    return (
        <div>
            <div className="mb-4 mr-auto block">
                <div className="flex items-center gap-2">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search prescriptions (patient, doctor, med, status, date...)"
                        className="border px-3 py-2 rounded-md w-72"
                    />
                    <CreateButton
                        resourceName="Prescription"
                        onShowForm={() => setShowCreatePrescriptionForm(true)}
                    />
                </div>
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
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                {loading ? (
                    <TableLoadingSkeleton columnSpan={9} />
                ) : (
                    <TableBody>
                        {filteredPrescriptions.map((prescription) => (
                            <TableRow key={prescription.id}>
                                <TableCell>
                                    {prescription.patient_name}
                                </TableCell>
                                <TableCell>
                                    {prescription.doctor_name}
                                </TableCell>
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
                                    {prescription.status === "Active" ? (
                                        <span className="font-medium px-2 py-1.5 rounded-full bg-status-active">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="font-medium px-2 py-1.5 rounded-full bg-status-expired">
                                            Expired
                                        </span>
                                    )}
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
                )}
            </Table>
        </div>
    );
}
