import { useEffect, useState } from "react";
import axios from "@/config/api";
import { useNavigate } from "react-router";
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
import { useAuth } from "@/hooks/useAuth";

export default function PatientsIndex() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreatePatientForm, setShowCreatePatientForm] = useState(false);
    const [showEditPatientForm, setShowEditPatientForm] = useState(null);
    const [showPatientDetails, setShowPatientDetails] = useState(null);
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            try {
                const res = await axios.get("/patients", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPatients(res.data);
            } catch (error) {
                setPatients([]);
            }
            setLoading(false);
        };
        fetchPatients();
    }, [token]);

    // const onCreateCallback = (newPatient) => {
    //     setPatients([...patients, newPatient]);
    //     setShowCreatePatientForm(false);
    // };

    // const onUpdateCallback = (updatedPatient) => {
    //     setPatients((prev) =>
    //         prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    //     );
    //     setShowEditPatientForm(null);
    // };

    const onDeleteCallback = (id) => {
        setPatients(patients.filter((p) => p.id !== id));
    };

    if (loading) return <h1>Loading</h1>;

    return (
        <div>
            <div className="mb-4 mr-auto block">
                <Button
                    variant="outline"
                    onClick={() => setShowCreatePatientForm(true)}
                >
                    Create New Patient
                </Button>
            </div>
            {showCreatePatientForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowCreatePatientForm(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="animate-in zoom-in-95 duration-200"
                    >
                        <h1>work on this later too!</h1>
                    </div>
                </div>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {patients.map((patient) => (
                        <TableRow key={patient.id}>
                            <TableCell>{patient.first_name}</TableCell>
                            <TableCell>{patient.last_name}</TableCell>
                            <TableCell>{patient.email}</TableCell>
                            <TableCell>{patient.phone}</TableCell>
                            <TableCell>{patient.date_of_birth}</TableCell>
                            <TableCell>{patient.address}</TableCell>
                            <TableCell>
                                <div className="flex gap-2 text-right justify-end">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            setShowPatientDetails(patient.id)
                                        }
                                    >
                                        <Eye />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            setShowEditPatientForm(patient.id)
                                        }
                                    >
                                        <Pencil />
                                    </Button>
                                    <DeleteBtn
                                        resource="patients"
                                        id={patient.id}
                                        onDeleteCallBack={onDeleteCallback}
                                    />
                                </div>
                                {showEditPatientForm === patient.id && (
                                    <div
                                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                                        onClick={() =>
                                            setShowEditPatientForm(null)
                                        }
                                    >
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            className="animate-in zoom-in-95 duration-200"
                                        >
                                            <h1>Work on this later</h1>
                                        </div>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
