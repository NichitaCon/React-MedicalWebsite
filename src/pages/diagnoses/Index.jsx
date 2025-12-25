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
import { Pencil } from "lucide-react";
import DeleteBtn from "@/components/customComponents/DeleteBtn";

import dayjs from "dayjs";
import { useAuth } from "@/hooks/useAuth";
import Modal from "@/components/customComponents/Modal";
import CreateEditDiagnosisForm from "@/components/customComponents/CreateEditDiagnosisForm";
import CreateButton from "@/components/customComponents/CreateButton";
import TableLoadingSkeleton from "@/components/customComponents/TableLoadingSkeleton";

export default function DiagnosesIndex() {
    const [diagnoses, setDiagnoses] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { token } = useAuth();
    const [showCreateDiagnosisForm, setShowCreateDiagnosisForm] =
        useState(false);
    const [showEditDiagnosisForm, setShowEditDiagnosisForm] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [diagnosesRes, patientsRes] = await Promise.all([
                    axios.get("/diagnoses", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("/patients", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                const diagnosesWithPatients = diagnosesRes.data.map((diag) => {
                    const patient = patientsRes.data.find(
                        (p) => p.id === diag.patient_id
                    );
                    return {
                        ...diag,
                        patient_name: patient
                            ? `${patient.first_name} ${patient.last_name}`
                            : "Unknown",
                    };
                });
                console.log("Diagnoses:", diagnosesWithPatients);
                setDiagnoses(diagnosesWithPatients);
                setPatients(patientsRes.data);
            } catch (error) {
                setDiagnoses([]);
                setPatients([]);
            }
            setLoading(false);
        };
        fetchAll();
    }, [token]);

    const onCreateCallback = (newDiagnosis) => {
        console.log("newDiagnosis object in createcallback:", newDiagnosis);
        const patient = patients.find((p) => p.id === newDiagnosis.patient_id);

        const enrichedDiagnosis = {
            ...newDiagnosis,
            patient_name: patient
                ? `${patient.first_name} ${patient.last_name}`
                : "Unknown",
        };
        console.log("enrichedDiagnosis", enrichedDiagnosis);
        setDiagnoses([...diagnoses, enrichedDiagnosis]);
        setShowCreateDiagnosisForm(false);
    };

    const onUpdateCallback = (updatedDiagnosis) => {
        const patient = patients.find(
            (p) => p.id === updatedDiagnosis.patient_id
        );
        const enrichedDiagnosis = {
            ...updatedDiagnosis,
            patient_name: patient
                ? `${patient.first_name} ${patient.last_name}`
                : "Unknown",
        };
        setDiagnoses((prev) =>
            prev.map((d) =>
                d.id === updatedDiagnosis.id ? enrichedDiagnosis : d
            )
        );
        setShowEditDiagnosisForm(null);
    };

    const onDeleteCallback = (id) => {
        setDiagnoses(diagnoses.filter((d) => d.id !== id));
    };

    const q = (searchQuery || "").trim().toLowerCase();
    const filteredDiagnoses = diagnoses.filter((diagnosis) => {
        if (!q) return true;
        const diagId = diagnosis.id ? String(diagnosis.id) : "";
        const patientName = (diagnosis.patient_name || "").toLowerCase();
        const condition = (diagnosis.condition || "").toLowerCase();
        const diagDate = diagnosis.diagnosis_date
            ? dayjs.unix(diagnosis.diagnosis_date).format("D/MM/YYYY")
            : "";
        const created = diagnosis.createdAt
            ? dayjs(diagnosis.createdAt).format("D/MM/YYYY hh:mm a")
            : "";
        const updated = diagnosis.updatedAt
            ? dayjs(diagnosis.updatedAt).format("D/MM/YYYY hh:mm a")
            : "";
        return (
            diagId.includes(q) ||
            patientName.includes(q) ||
            condition.includes(q) ||
            diagDate.toLowerCase().includes(q) ||
            created.toLowerCase().includes(q) ||
            updated.toLowerCase().includes(q)
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
                        placeholder="Search diagnoses (patient, condition, date...)"
                        className="border px-3 py-2 rounded-md w-72"
                    />
                    <CreateButton
                        resourceName="Diagnosis"
                        onShowForm={() => setShowCreateDiagnosisForm(true)}
                    />
                </div>
            </div>

            {/* Create Diagnosis Modal */}
            <Modal
                renderCondition={showCreateDiagnosisForm}
                onClose={() => setShowCreateDiagnosisForm(false)}
            >
                <CreateEditDiagnosisForm
                    setShowDiagnosisForm={setShowCreateDiagnosisForm}
                    onCreateCallback={onCreateCallback}
                />
            </Modal>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Diagnosis Date</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Updated At</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>

                {loading ? (
                    <TableLoadingSkeleton columnSpan={6}/>
                ) : (
                    <TableBody>
                        {filteredDiagnoses.map((diagnosis) => (
                            <TableRow key={diagnosis.id}>
                                <TableCell>{diagnosis.patient_name}</TableCell>
                                <TableCell>{diagnosis.condition}</TableCell>
                                <TableCell>
                                    {diagnosis.diagnosis_date
                                        ? dayjs
                                              .unix(diagnosis.diagnosis_date)
                                              .format("D/MM/YYYY")
                                        : "-"}
                                </TableCell>
                                <TableCell>
                                    {diagnosis.createdAt
                                        ? dayjs(diagnosis.createdAt).format(
                                              "D/MM/YYYY hh:mm a"
                                          )
                                        : "-"}
                                </TableCell>
                                <TableCell>
                                    {diagnosis.updatedAt
                                        ? dayjs(diagnosis.updatedAt).format(
                                              "D/MM/YYYY hh:mm a"
                                          )
                                        : "-"}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2 text-right justify-end">
                                        {/* SingleView Not needed since All available diagnosis data is already shown in the table */}
                                        {/* <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            setShowDiagnosisDetails(
                                                diagnosis.id
                                            )
                                        }
                                    >
                                        <Eye />
                                    </Button> */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                setShowEditDiagnosisForm(
                                                    diagnosis.id
                                                )
                                            }
                                        >
                                            <Pencil />
                                        </Button>
                                        <DeleteBtn
                                            resource="diagnoses"
                                            id={diagnosis.id}
                                            onDeleteCallBack={onDeleteCallback}
                                        />
                                    </div>
                                    {/* Edit Diagnosis Modal */}
                                    <Modal
                                        renderCondition={
                                            showEditDiagnosisForm ==
                                            diagnosis.id
                                        }
                                        onClose={() =>
                                            setShowEditDiagnosisForm(null)
                                        }
                                    >
                                        <CreateEditDiagnosisForm
                                            diagnosis={diagnosis}
                                            setShowDiagnosisForm={
                                                setShowEditDiagnosisForm
                                            }
                                            onUpdateCallback={onUpdateCallback}
                                        />
                                    </Modal>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                )}
            </Table>
        </div>
    );
}
