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

export default function DiagnosesIndex() {
    const [diagnoses, setDiagnoses] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
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

    if (loading) return <h1>Loading</h1>;

    return (
        <div>
            <div className="mb-4 mr-auto block">
                <Button
                    variant="outline"
                    onClick={() => setShowCreateDiagnosisForm(true)}
                >
                    Create New Diagnosis
                </Button>
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
                        <TableHead>Patient ID</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Diagnosis Date</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Updated At</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {diagnoses.map((diagnosis) => (
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
                                        showEditDiagnosisForm == diagnosis.id
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
            </Table>
        </div>
    );
}
