import { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router";
import axios from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { HeaderContext } from "@/context/HeaderContext";
import HeaderText from "@/components/customComponents/HeaderText";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, PencilIcon, Trash } from "lucide-react";
import { Pencil } from "lucide-react";
import DeleteBtn from "@/components/customComponents/DeleteBtn";
import { toast } from "sonner";
import EditAppointmentDateCard from "@/components/customComponents/EditAppointmentDateCard";
import CreateAppointmentForm from "@/components/customComponents/CreateEditAppointmentForm";
import CreateEditPrescriptionForm from "@/components/customComponents/CreateEditPrescriptionForm";
import Modal from "@/components/customComponents/Modal";
import CreateEditDiagnosisForm from "@/components/customComponents/CreateEditDiagnosisForm";
import TableLoadingSkeleton from "@/components/customComponents/TableLoadingSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DoctorShow() {
    const { id } = useParams();
    const { token } = useAuth();
    const { setHeaderContent } = useContext(HeaderContext);
    const [doctor, setDoctor] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("appointments");
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
    const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
    const [showEditPrescriptionForm, setShowEditPrescriptionForm] =
        useState(null); // holds prescription id or null
    const [showEditDiagnosisForm, setShowEditDiagnosisForm] = useState(null); // holds diagnosis id or null

    const [editingAppointmentId, setEditingAppointmentId] = useState(null);

    useEffect(() => {
        console.warn("No doctor in navigation state, calling API...");

        const fetchAll = async () => {
            try {
                setLoading(true);
                const [
                    doctorRes,
                    appointmentsRes,
                    prescriptionsRes,
                    patientsRes,
                    diagnosisRes,
                ] = await Promise.all([
                    axios.get(`/doctors/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`/appointments`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`/prescriptions`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`/patients`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`/diagnoses`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const filteredAppointments = appointmentsRes.data.filter(
                    (appt) => appt.doctor_id == id
                );

                const filteredPrescriptions = prescriptionsRes.data.filter(
                    (prescription) => prescription.doctor_id == id
                );

                const diagnosisIdsFromPrescriptions = filteredPrescriptions.map(
                    (prescription) => prescription.diagnosis_id
                );
                // console.log("diagnosisIdsFromPrescriptions:", diagnosisIdsFromPrescriptions)

                const filteredDiagnoses = diagnosisRes.data.filter(
                    (diagnosis) =>
                        diagnosisIdsFromPrescriptions.includes(diagnosis.id)
                );

                console.log("filteredDiagnosis:", filteredDiagnoses);

                // Map appointments to include patient name
                const appointmentsWithPatients = filteredAppointments.map(
                    (appt) => {
                        const patient = patientsRes.data.find(
                            (p) => p.id === appt.patient_id
                        );
                        return {
                            ...appt,
                            patient_name: patient
                                ? `${patient.first_name} ${patient.last_name}`
                                : "Unknown",
                        };
                    }
                );

                // const prescriptionsWithPatients = filteredPrescriptions.map(
                //     (prescription) => {
                //         const patient = patientsRes.data.find(
                //             (p) => p.id === prescription.patient_id
                //         );
                //         return {
                //             ...prescription,
                //             patient_name: patient
                //                 ? `${patient.first_name} ${patient.last_name}`
                //                 : "Unknown",
                //         };
                //     }
                // );

                const diagnosesWithPatients = filteredDiagnoses.map(
                    (diagnosis) => {
                        const patient = patientsRes.data.find(
                            (patient) => patient.id === diagnosis.patient_id
                        );
                        return {
                            ...diagnosis,
                            patient_name: patient
                                ? `${patient.first_name} ${patient.last_name}`
                                : "Unknown",
                        };
                    }
                );
                const hydratedPrescriptions = filteredPrescriptions.map(
                    (prescription) => {
                        const patient = patientsRes.data.find(
                            (patient) => patient.id === prescription.patient_id
                        );

                        const diagnosis = filteredDiagnoses.find(
                            (diagnosis) =>
                                diagnosis.id === prescription.diagnosis_id
                        );
                        return {
                            ...prescription,
                            patient_name: patient
                                ? `${patient.first_name} ${patient.last_name}`
                                : "Unknown",

                            diagnosis_condition: diagnosis
                                ? diagnosis.condition
                                : "Unknown",
                        };
                    }
                );

                console.log("filteredDiagnosisnames:", diagnosesWithPatients);

                setDoctor({
                    ...doctorRes.data,
                    appointments: appointmentsWithPatients,
                    prescriptions: hydratedPrescriptions,
                    diagnoses: diagnosesWithPatients,
                });
                setPatients(patientsRes.data);
            } catch (error) {
                console.log(error);
            }
            setLoading(false);
        };

        fetchAll();
    }, []);

    // Set custom header content for this page
    useEffect(() => {
        if (!loading && doctor) {
            setHeaderContent(
                <div className="flex flex-col justify-center h-full">
                    <HeaderText>
                        Dr {doctor.first_name} {doctor.last_name}
                    </HeaderText>
                    <h2 className="text-2xl text-gray-500">
                        {doctor.specialisation}
                    </h2>
                </div>
            );
        } else {
            setHeaderContent(
                <div className="flex flex-col gap-2">
                    <Skeleton className="w-[200px] h-[36px]" />
                    <Skeleton className="w-[150px] h-[28px]" />
                </div>
            );
        }
        return () => setHeaderContent(null);
    }, [doctor, loading]);

    const onCreateCallback = (newAppointment) => {
        console.log("OnCreateCallback Pinged in doctors", newAppointment);

        const patient = patients.find(
            (p) => p.id === newAppointment.patient_id
        );
        const patientName = patient
            ? `${patient.first_name} ${patient.last_name}`
            : "Unknown";

        setDoctor({
            ...doctor,
            appointments: [
                ...doctor.appointments,
                {
                    ...newAppointment,
                    patient_name: patientName,
                },
            ],
        });

        setShowAppointmentForm(false);
    };

    const onUpdateCallBack = (updatedAppointment) => {
        console.log(
            "onUpdateCallBack called with payload:",
            updatedAppointment
        );

        // console.log(
        //     "math logic in onUpdateCallback:",
        //     Math.floor(
        //         new Date(updatedAppointment.payload.appointment_date).getTime() / 1000
        //     )
        // );

        setDoctor({
            ...doctor,
            appointments: doctor.appointments.map((appt) =>
                appt.id === editingAppointmentId
                    ? {
                          ...appt,
                          appointment_date: Math.floor(
                              new Date(
                                  updatedAppointment.payload.appointment_date
                              ).getTime() / 1000
                          ),
                      }
                    : appt
            ),
        });
    };

    const onDiagnosisCreateCallback = (newDiagnosis) => {
        // toast("Diagnosis has no direct relationship to doctor in the backend", "Diagnosi's can only be tied to doctors via prescriptions")
        toast("Diagnosis created without relationship", {
            description:
                "Diagnoses can only be tied to doctors via prescriptions. (Backend Limitation)",
        });
        setShowDiagnosisForm(false);
    };

    // Callback for diagnosis update
    const onDiagnosisUpdateCallback = (updatedDiagnosis) => {
        const patient = patients.find(
            (p) => p.id === updatedDiagnosis.patient_id
        );
        const patientName = patient
            ? `${patient.first_name} ${patient.last_name}`
            : "Unknown";

        setDoctor((prev) => ({
            ...prev,
            diagnoses: (prev.diagnoses || []).map((diagnosis) =>
                diagnosis.id === updatedDiagnosis.id
                    ? { ...updatedDiagnosis, patient_name: patientName }
                    : diagnosis
            ),
        }));
        setShowEditDiagnosisForm(null);
    };

    // Callback for prescription creation
    const onPrescriptionCreateCallback = (newPrescription) => {
        const patient = patients.find(
            (p) => p.id === newPrescription.patient_id
        );
        const patientName = patient
            ? `${patient.first_name} ${patient.last_name}`
            : "Unknown";

        setDoctor((prev) => ({
            ...prev,
            prescriptions: [
                ...(prev.prescriptions || []),
                {
                    ...newPrescription,
                    patient_name: patientName,
                },
            ],
            diagnoses: [
                ...(prev.diagnoses || []),
                { ...newPrescription.diagnosis, patient_name: patientName },
            ],
        }));
        setShowPrescriptionForm(false);
    };

    // Callback for prescription update
    const onPrescriptionUpdateCallback = (updatedPrescription) => {
        const patient = patients.find(
            (p) => p.id === updatedPrescription.patient_id
        );
        const patientName = patient
            ? `${patient.first_name} ${patient.last_name}`
            : "Unknown";

        setDoctor((prev) => ({
            ...prev,
            prescriptions: (prev.prescriptions || []).map((prescription) =>
                prescription.id === updatedPrescription.id
                    ? { ...updatedPrescription, patient_name: patientName }
                    : prescription
            ),
            diagnoses: [
                // Spreading out the old diagnosis, and filtering out the old one (pre update)
                ...(prev.diagnoses || []).filter(
                    (diagnosis) =>
                        diagnosis.id !== updatedPrescription.diagnosis.id
                ),
                // adding in the updated diagnosis to replace the removed one (avoiding duplicates)
                {
                    ...updatedPrescription.diagnosis,
                    patient_name: patientName,
                },
            ],
        }));
        setShowEditPrescriptionForm(null);
    };

    const onDeleteCallBack = (id) => {
        console.log("On Delete Callback called with id:", id);
        setDoctor({
            ...doctor,
            appointments: doctor.appointments.filter(
                (appointment) => appointment.id !== id
            ),
        });
    };

    const onPrescriptionDeleteCallBack = (id) => {
        console.log("On Prescription Delete Callback called with id:", id);
        setDoctor({
            ...doctor,
            prescriptions: doctor.prescriptions.filter(
                (prescription) => prescription.id !== id
            ),
        });
    };

    const onDiagnosisDeleteCallBack = (id) => {
        console.log("On Prescription Delete Callback called with id:", id);
        setDoctor({
            ...doctor,
            diagnoses: doctor.diagnoses.filter(
                (diagnosis) => diagnosis.id !== id
            ),
        });
    };

    console.table("doctor in individual show:", doctor);
    return (
        <div className="flex flex-col h-full gap-4">
            <Tabs
                defaultValue="appointments"
                className="flex-1"
                onValueChange={setActiveTab}
            >
                <div className="flex justify-between items-center">
                    <TabsList className="flex!">
                        <TabsTrigger
                            value="appointments"
                            // className="data-[state=active]:bg-blue-300!"
                        >
                            Appointments
                        </TabsTrigger>
                        <TabsTrigger value="prescriptions">
                            Prescriptions
                        </TabsTrigger>
                        <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
                    </TabsList>
                    {activeTab === "appointments" && (
                        <button
                            onClick={() => setShowAppointmentForm(true)}
                            className="p-2 px-3 border rounded-md cursor-pointer hover:bg-gray-50 active:scale-95 active:text-gray-600 transition-all "
                        >
                            <p className="font-medium">New Appointment</p>
                        </button>
                    )}
                    {activeTab === "prescriptions" && (
                        <button
                            onClick={() => setShowPrescriptionForm(true)}
                            className="p-2 px-3 border rounded-md cursor-pointer hover:bg-gray-50 active:scale-95 active:text-gray-600 transition-all "
                        >
                            <p className="font-medium">New Prescription</p>
                        </button>
                    )}
                    {activeTab === "diagnoses" && (
                        <button
                            onClick={() => setShowDiagnosisForm(true)}
                            className="p-2 px-3 border rounded-md cursor-pointer hover:bg-gray-50 active:scale-95 active:text-gray-600 transition-all "
                        >
                            <p className="font-medium">New Diagnosis</p>
                        </button>
                    )}
                </div>
                <div className="h-full bg-secondary rounded-lg">
                    {loading || !doctor ? (
                        <TableLoadingSkeleton columnSpan={5} />
                    ) : (
                        <>
                            {/* APPOINTMENTS */}

                            <TabsContent
                                value="appointments"
                                className=" h-full"
                            >
                                <Table className="border-separate border-spacing-y-2 p-2 -mt-1">
                                    {/* <TableHeader>
                                <TableRow>
                                    <TableHead>Appointment ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Patient ID</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader> */}
                                    <TableBody>
                                        {doctor.appointments?.map(
                                            (appointment) => (
                                                <TableRow key={appointment.id}>
                                                    <TableCell className="bg-background rounded-l-sm">
                                                        <div>
                                                            <p className="text-sm text-gray-500">
                                                                Patient:
                                                            </p>
                                                            <p className="text-xl font-medium">
                                                                {
                                                                    appointment.patient_name
                                                                }
                                                            </p>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="bg-background rounded-r-sm text-right">
                                                        <div className="flex gap-2 justify-end items-center">
                                                            <div className="flex flex-col text-right">
                                                                <p className="text-blue-500 font-medium">
                                                                    {new Date(
                                                                        appointment.appointment_date *
                                                                            1000
                                                                    ).toLocaleTimeString(
                                                                        [],
                                                                        {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        }
                                                                    )}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {new Date(
                                                                        appointment.appointment_date *
                                                                            1000
                                                                    ).toLocaleDateString()}
                                                                </p>
                                                            </div>

                                                            <div className="relative">
                                                                <Button
                                                                    className="cursor-pointer hover:border-blue-500"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        setEditingAppointmentId(
                                                                            editingAppointmentId ===
                                                                                appointment.id
                                                                                ? null
                                                                                : appointment.id
                                                                        )
                                                                    }
                                                                >
                                                                    <PencilIcon />
                                                                </Button>

                                                                {editingAppointmentId ===
                                                                    appointment.id && (
                                                                    <div className="absolute top-full right-0 z-50 mt-2 w-auto min-w-[300px]">
                                                                        <EditAppointmentDateCard
                                                                            appointment={
                                                                                appointment
                                                                            }
                                                                            setEditingAppointmentId={
                                                                                setEditingAppointmentId
                                                                            }
                                                                            onUpdateCallBack={
                                                                                onUpdateCallBack
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <DeleteBtn
                                                                resource="appointments"
                                                                id={
                                                                    appointment.id
                                                                }
                                                                onDeleteCallBack={
                                                                    onDeleteCallBack
                                                                }
                                                            />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            {/* PRESCRIPTIONS */}

                            <TabsContent
                                value="prescriptions"
                                className="h-full"
                            >
                                <Table className="border-separate border-spacing-y-2 p-2 -mt-1">
                                    <TableBody>
                                        {doctor.prescriptions?.map(
                                            (prescription) => (
                                                <TableRow key={prescription.id}>
                                                    <TableCell className="bg-background rounded-l-sm">
                                                        <div>
                                                            <p className="text-sm text-gray-500">
                                                                Patient:
                                                            </p>
                                                            <p className="text-xl font-medium">
                                                                {
                                                                    prescription.patient_name
                                                                }
                                                            </p>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="bg-background">
                                                        <div>
                                                            <p className="text-sm text-gray-500">
                                                                Medication:
                                                            </p>
                                                            <p className="text-lg font-medium">
                                                                {
                                                                    prescription.medication
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {
                                                                    prescription.dosage
                                                                }
                                                            </p>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="bg-background rounded-r-sm text-right">
                                                        <div className="flex gap-2 justify-end items-center">
                                                            <div className="flex flex-col text-right">
                                                                <p className="text-sm text-gray-500">
                                                                    Start Date:
                                                                </p>
                                                                <p className="text-sm font-medium">
                                                                    {new Date(
                                                                        prescription.start_date *
                                                                            1000
                                                                    ).toLocaleDateString()}
                                                                </p>
                                                                <p className="text-sm text-gray-500 mt-2">
                                                                    End Date:
                                                                </p>
                                                                <p className="text-sm font-medium">
                                                                    {new Date(
                                                                        prescription.end_date *
                                                                            1000
                                                                    ).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                className="cursor-pointer hover:border-blue-500"
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
                                                            {/* <Button
                                                                className="cursor-pointer hover:border-blue-500"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/prescriptions/${prescription.id}`
                                                                    )
                                                                }
                                                            >
                                                                <Eye />
                                                            </Button> */}
                                                            <DeleteBtn
                                                                resource="prescriptions"
                                                                id={
                                                                    prescription.id
                                                                }
                                                                onDeleteCallBack={
                                                                    onPrescriptionDeleteCallBack
                                                                }
                                                            />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            {/* DIAGNOSES */}

                            <TabsContent value="diagnoses" className=" h-full">
                                <Table className="border-separate border-spacing-y-2 p-2 -mt-1">
                                    {/* <TableHeader>
                                <TableRow>
                                    <TableHead>Appointment ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Patient ID</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader> */}
                                    <TableBody>
                                        {doctor.diagnoses?.map((diagnosis) => (
                                            <TableRow key={diagnosis.id}>
                                                <TableCell className="bg-background rounded-l-sm">
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            Patient:
                                                        </p>
                                                        <p className="text-xl font-medium">
                                                            {
                                                                diagnosis.patient_name
                                                            }
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="bg-background rounded-l-sm">
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            Condition:
                                                        </p>
                                                        <p className="text-xl font-medium">
                                                            {
                                                                diagnosis.condition
                                                            }
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="bg-background rounded-r-sm text-right">
                                                    <div className="flex gap-2 justify-end items-center">
                                                        <div className="flex flex-col text-right">
                                                            <p className="text-blue-500 font-medium">
                                                                {new Date(
                                                                    diagnosis.diagnosis_date *
                                                                        1000
                                                                ).toLocaleTimeString(
                                                                    [],
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    }
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {new Date(
                                                                    diagnosis.diagnosis_date *
                                                                        1000
                                                                ).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="relative">
                                                            <Button
                                                                className="cursor-pointer hover:border-blue-500"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() =>
                                                                    setShowEditDiagnosisForm(
                                                                        diagnosis.id
                                                                    )
                                                                }
                                                            >
                                                                <PencilIcon />
                                                            </Button>
                                                        </div>
                                                        <DeleteBtn
                                                            resource="diagnoses"
                                                            id={diagnosis.id}
                                                            onDeleteCallBack={
                                                                onDiagnosisDeleteCallBack
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        </>
                    )}
                </div>
            </Tabs>

            {!loading && (
                <>
                    {/* CreateAppointment modal */}
                    <Modal
                        renderCondition={showAppointmentForm}
                        onClose={() => setShowAppointmentForm(false)}
                    >
                        <CreateAppointmentForm
                            doctor={doctor}
                            patients={patients}
                            onCreateCallback={onCreateCallback}
                            setShowAppointmentForm={setShowAppointmentForm}
                        />
                    </Modal>
                    {/* Create Prescription Modal*/}
                    <Modal
                        renderCondition={showPrescriptionForm}
                        onClose={() => setShowPrescriptionForm(false)}
                    >
                        <CreateEditPrescriptionForm
                            doctor={doctor}
                            onCreateCallback={onPrescriptionCreateCallback}
                            setShowPrescriptionForm={setShowPrescriptionForm}
                        />
                    </Modal>

                    {/* Edit Prescription Modal */}
                    <Modal
                        renderCondition={!!showEditPrescriptionForm}
                        onClose={() => setShowEditPrescriptionForm(null)}
                    >
                        <CreateEditPrescriptionForm
                            prescription={doctor?.prescriptions?.find(
                                (p) => p.id === showEditPrescriptionForm
                            )}
                            doctor={doctor}
                            onUpdateCallback={onPrescriptionUpdateCallback}
                            setShowPrescriptionForm={
                                setShowEditPrescriptionForm
                            }
                        />
                    </Modal>

                    {/* Create Diagnosis Modal */}
                    <Modal
                        renderCondition={showDiagnosisForm}
                        onClose={() => setShowDiagnosisForm(false)}
                    >
                        <CreateEditDiagnosisForm
                            doctor={doctor}
                            patients={patients}
                            onCreateCallback={onDiagnosisCreateCallback}
                            setShowDiagnosisForm={setShowDiagnosisForm}
                        />
                    </Modal>

                    {/* Edit Diagnosis Modal */}
                    <Modal
                        renderCondition={!!showEditDiagnosisForm}
                        onClose={() => setShowEditDiagnosisForm(null)}
                    >
                        <CreateEditDiagnosisForm
                            diagnosis={doctor?.diagnoses?.find(
                                (d) => d.id === showEditDiagnosisForm
                            )}
                            doctor={doctor}
                            patients={patients}
                            onUpdateCallback={onDiagnosisUpdateCallback}
                            setShowDiagnosisForm={setShowEditDiagnosisForm}
                        />
                    </Modal>
                </>
            )}
        </div>
    );
}
