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
import DeleteBtn from "@/components/DeleteBtn";
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

export default function Index() {
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

    const onDeleteCallBack = (id) => {
        console.log("On Delete Callback called");
        toast.success("Festival deletes successfully");
        setDoctors(doctors.filter((doctor) => doctor.id !== id));
    };


    return (
        <div>
            <Button asChild variant="outline" className={"mb-4 mr-auto block"}>
                <Link size="sm" to={`/doctors/create`}>
                    Create New Festival
                </Link>
            </Button>
            <Table>
                <TableCaption>A list of doctors</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {doctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                            <TableCell>{doctor.title}</TableCell>
                            <TableCell>{doctor.city}</TableCell>
                            <TableCell>{doctor.start_date}</TableCell>
                            <TableCell>{doctor.end_date}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        className="cursor-pointer hover:border-blue-500"
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            navigate(
                                                `/doctors/${doctor.id}`
                                            )
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
                                                `/doctors/${doctor.id}/edit`
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
