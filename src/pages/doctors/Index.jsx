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
import Modal from "@/components/customComponents/Modal";
import DoctorCreateForm from "@/components/customComponents/CreateDoctorForm";
import DoctorUpdateForm from "@/components/customComponents/UpdateDoctorForm";

// import {
//   Card,
//   CardAction,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

export default function DoctorsIndex() {
    const [doctors, setDoctors] = useState([]);
    const [createDoctorModal, setCreateDoctorModal] = useState(false);
    const [editDoctorModal, setEditDoctorModal] = useState(null); // holds doctor object or null
    const navigate = useNavigate();

    const onCreateCallback = (newDoctor) => {
        setDoctors((prev) => [...prev, newDoctor]);
        setCreateDoctorModal(false);
    };

    const onUpdateCallback = (updatedDoctor) => {
        setDoctors((prev) =>
            prev.map((doc) =>
                doc.id === updatedDoctor.id ? updatedDoctor : doc
            )
        );
        setEditDoctorModal(null);
    };

    useEffect(() => {
        const fetchDoctors = async () => {
            const options = {
                method: "GET",
                url: "/doctors",
            };
            try {
                let response = await axios.request(options);
                console.log(response.data);
                setDoctors(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchDoctors();
    }, []);

    const onDeleteCallBack = (id) => {
        console.log("On Delete Callback called with id:", id);
        setDoctors(doctors.filter((doctor) => doctor.id !== id));
    };

    return (
        <div>
            <div className="mb-4 mr-auto block">
                <Button
                    variant="outline"
                    onClick={() => setCreateDoctorModal(true)}
                >
                    Create New Doctor
                </Button>
            </div>
            <Modal
                renderCondition={createDoctorModal}
                onClose={() => setCreateDoctorModal(false)}
            >
                <DoctorCreateForm onCreateCallback={onCreateCallback} />
            </Modal>

            <Table>
                {/* <TableCaption>A list of doctors</TableCaption> */}
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Specialisation</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {doctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                            <TableCell>
                                Dr {doctor.first_name} {doctor.last_name}
                            </TableCell>
                            <TableCell>{doctor.specialisation}</TableCell>
                            <TableCell>{doctor.email}</TableCell>
                            <TableCell>{doctor.phone}</TableCell>
                            <TableCell>
                                <div className="flex gap-2 text-right justify-end">
                                    <Button
                                        className="cursor-pointer hover:border-blue-500"
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            navigate(`/doctors/${doctor.id}`, {
                                                state: { doctor },
                                            })
                                        }
                                    >
                                        <Eye />
                                    </Button>
                                    <Button
                                        className="cursor-pointer hover:border-blue-500"
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            setEditDoctorModal(doctor.id)
                                        }
                                    >
                                        <Pencil />
                                    </Button>
                                    <DeleteBtn
                                        onDeleteCallBack={onDeleteCallBack}
                                        resource="doctors"
                                        id={doctor.id}
                                    />
                                </div>
                            </TableCell>
                            {/* Edit Doctor Modal */}
                            <Modal
                                renderCondition={editDoctorModal === doctor.id}
                                onClose={() => setEditDoctorModal(null)}
                            >
                                <DoctorUpdateForm
                                    doctor={doctor}
                                    onUpdateCallback={onUpdateCallback}
                                />
                            </Modal>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
