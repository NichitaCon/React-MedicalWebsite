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

export default function AppointmentsIndex() {
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointments = async () => {
            const options = {
                method: "GET",
                url: "/appointments",
            };
            try {
                let response = await axios.request(options);
                console.log(response.data);
                setAppointments(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchAppointments();
    }, []);

    const deleteAppointment = async (id) => {
        const options = {
            method: "GET",
            url: "/appointments",
        };
        try {
            let response = await axios.request(options);
            console.log(response.data);
            setAppointments(appointments.filter((appointment) => appointment.id !== id));
            toast.success("Appointment deleted successfully");
        } catch (error) {
            console.log(error);
            toast.error("Issue deleting appointment");
        }
    };

    const onDeleteCallBack = (id) => {
        console.log("On Delete Callback called with id:", id);
        setAppointments(appointments.filter((appointment) => appointment.id !== id));
    };

    console.log("Viewing appointments Index")

    return (
        <div>
            <Button asChild variant="outline" className={"mb-4 mr-auto block"}>
                <Link size="sm" to={`/appointments/create`}>
                    Create New Appointment
                </Link>
            </Button>
            <Table>
                {/* <TableCaption>A list of appointments</TableCaption> */}
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
                    {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                            <TableCell>
                                Dr {appointment.first_name} {appointment.last_name}
                            </TableCell>
                            <TableCell>{appointment.specialisation}</TableCell>
                            <TableCell>{appointment.email}</TableCell>
                            <TableCell>{appointment.phone}</TableCell>
                            <TableCell>
                                <div className="flex gap-2 text-right justify-end">
                                    <Button
                                        className="cursor-pointer hover:border-blue-500"
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            navigate(`/appointments/${appointment.id}`, {
                                                state: { appointment },
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
                                            navigate(
                                                `/appointments/${appointment.id}/edit`,
                                                { state: { appointment } }
                                            )
                                        }
                                    >
                                        <Pencil />
                                    </Button>
                                    <DeleteBtn
                                        onDeleteCallBack={onDeleteCallBack}
                                        resource="appointments"
                                        id={appointment.id}
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
