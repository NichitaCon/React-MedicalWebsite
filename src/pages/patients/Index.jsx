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
import CreateEditPatientForm from "@/components/customComponents/CreateEditPatientForm";
import dayjs from "dayjs";
import PatientDetails from "@/components/customComponents/PatientDetails";
import CreateButton from "@/components/customComponents/CreateButton";

export default function PatientsIndex() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
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
                // Neat debugging trick i found from tiktok, makes a table out of the data for easy vis
                // console.table("patients in patientsIndex:");
                // console.table(res.data);
                console.log("patients:", res.data);
                setPatients(res.data);
            } catch (error) {
                console.error("error fetching patients:", error);
                setPatients([]);
            }
            setLoading(false);
        };
        fetchPatients();
    }, [token]);

    const onCreateCallback = (newPatient) => {
        setPatients([...patients, newPatient]);
        setShowCreatePatientForm(false);
    };

    const onUpdateCallback = (updatedPatient) => {
        setPatients((prev) =>
            prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
        );
        setShowEditPatientForm(null);
    };

    const onDeleteCallback = (id) => {
        setPatients(patients.filter((p) => p.id !== id));
    };

    if (loading) return <h1>Loading</h1>;

    const q = (searchQuery || "").trim().toLowerCase();
    const filteredPatients = patients.filter((patient) => {
        if (!q) return true;
        const patientId = patient.id ? String(patient.id) : "";
        const fullName = `${(patient.first_name || "").toLowerCase()} ${(
            patient.last_name || ""
        ).toLowerCase()}`.trim();
        const dob = patient.date_of_birth
            ? dayjs.unix(patient.date_of_birth).format("D/MM/YYYY")
            : "";
        return (
            patientId.includes(q) ||
            fullName.includes(q) ||
            (patient.email || "").toLowerCase().includes(q) ||
            (patient.phone || "").toLowerCase().includes(q) ||
            (patient.address || "").toLowerCase().includes(q) ||
            dob.toLowerCase().includes(q)
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
                        placeholder="Search patients (name, email, phone, dob, address...)"
                        className="border px-3 py-2 rounded-md w-72"
                    />
                    <CreateButton
                        resourceName="Patient"
                        onShowForm={() => setShowCreatePatientForm(true)}
                    />
                </div>
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
                        <CreateEditPatientForm
                            onCreateCallback={onCreateCallback}
                            setShowPatientForm={setShowCreatePatientForm}
                        />
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
                    {filteredPatients.map((patient) => (
                        <TableRow key={patient.id}>
                            <TableCell>{patient.first_name}</TableCell>
                            <TableCell>{patient.last_name}</TableCell>
                            <TableCell>{patient.email}</TableCell>
                            <TableCell>{patient.phone}</TableCell>
                            <TableCell>
                                {dayjs
                                    .unix(patient.date_of_birth)
                                    .format("D/MM/YYYY")}
                            </TableCell>
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
                                            <CreateEditPatientForm
                                                patient={patient}
                                                onUpdateCallback={
                                                    onUpdateCallback
                                                }
                                                setShowPatientForm={
                                                    setShowEditPatientForm
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                                {showPatientDetails === patient.id && (
                                    <div
                                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                                        onClick={() =>
                                            setShowPatientDetails(null)
                                        }
                                    >
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            className="animate-in zoom-in-95 duration-200"
                                        >
                                            <PatientDetails
                                                setShowPatientDetails={
                                                    setShowPatientDetails
                                                }
                                                patient={patient}
                                            />
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
