import { format } from "date-fns";
import { X } from "lucide-react";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function AppointmentDetails({
    appointment,
    setShowAppointmentDetails,
}) {
    // Format Unix timestamp (seconds) to readable date
    const formattedDate = appointment.appointment_date
        ? format(new Date(appointment.appointment_date * 1000), "PPP p")
        : "-";
    const createdAt = appointment.createdAt
        ? format(new Date(appointment.createdAt), "PPP p")
        : "-";
    const updatedAt = appointment.updatedAt
        ? format(new Date(appointment.updatedAt), "PPP p")
        : "-";

    return (
        <Card className="w-full max-w-md px-4 py-2 shadow-lg border border-gray-200 bg-white gap-2">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
                <CardTitle className="text-lg font-semibold">
                    {appointment.patient_name}'s Appointment
                </CardTitle>
                <button
                    className="transition-all cursor-pointer hover:bg-gray-100 p-1 rounded-sm ml-2"
                    onClick={() => setShowAppointmentDetails(null)}
                    aria-label="Close details"
                >
                    <X />
                </button>
            </div>
            <CardContent className="space-y-3 pb-4 px-1">
                <div className="flex flex-row justify-between items-center">
                    <p className="font-medium">Patient:</p>
                    <p>{appointment.patient_name}</p>
                </div>
                <div className="flex flex-row justify-between items-center">
                    <p className="font-medium">Doctor:</p>
                    <p>{appointment.doctor_name}</p>
                </div>
                <div className="flex flex-row justify-between items-center ">
                    <p className="font-medium mr-4">Appointment Date:</p>
                    <p>{formattedDate}</p>
                </div>
                <div className="flex flex-row justify-between items-center">
                    <p className="font-medium">Created At:</p>
                    <p>{createdAt}</p>
                </div>
                <div className="flex flex-row justify-between items-center">
                    <p className="font-medium">Last Updated:</p>
                    <p>{updatedAt}</p>
                </div>
            </CardContent>
        </Card>
    );
}
