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
    const navigate = useNavigate();

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

    const deleteDoctor = async (id) => {
        const options = {
            method: "GET",
            url: "/doctors",
        };
        try {
            let response = await axios.request(options);
            console.log(response.data);
            setDoctors(doctors.filter((doctor) => doctor.id !== id));
            toast.success("Doctor deleted successfully");
        } catch (error) {
            console.log(error);
            toast.error("Issue deleting doctor");
        }
    };

    const onDeleteCallBack = (id) => {
        console.log("On Delete Callback called with id:", id);
        setDoctors(doctors.filter((doctor) => doctor.id !== id));
    };

    return (
        <div>
            <Button asChild variant="outline" className={"mb-4 mr-auto block"}>
                <Link size="sm" to={`/doctors/create`}>
                    Create New Doctor
                </Link>
            </Button>
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
                                <div className="flex gap-2">
                                    <Button
                                        className="cursor-pointer hover:border-blue-500"
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            navigate(`/doctors/${doctor.id}`)
                                        }
                                    >
                                        <Eye />
                                    </Button>
                                    <Button
                                        className="cursor-pointer hover:border-blue-500"
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            navigate(
                                                `/doctors/${doctor.id}/edit`,
                                                { state: { doctor } }
                                            )
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
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
