import { useEffect, useState } from "react";
import axios from "@/config/api";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "../ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export default function EditAppointmentDateCard({
    appointment_date,
    setEditingAppointmentId,
    onCreateCallback,
    setShowAppointmentForm,
}) {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const location = useLocation();
    console.log("Location in appointmentForm", location);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const [doctorsRes, patientsRes] = await Promise.all([
    //                 axios.get("/doctors", {
    //                     headers: { Authorization: `Bearer ${token}` },
    //                 }),
    //                 axios.get("/patients", {
    //                     headers: { Authorization: `Bearer ${token}` },
    //                 }),
    //             ]);
    //             setDoctors(doctorsRes.data);
    //             setPatients(patientsRes.data);
    //         } catch (error) {
    //             console.error("Failed to fetch data", error);
    //             toast.error("Failed to load doctors or patients");
    //         }
    //     };
    //     fetchData();
    // }, []);

    const createAppointment = async (formData) => {
        // Convert string IDs to numbers and date to ISO string
        const payload = {
            appointment_date: formData.appointment_date.toISOString(),
            doctor_id: parseInt(formData.doctor_id),
            patient_id: parseInt(formData.patient_id),
        };

        console.log("Creating appointment with payload:", payload);

        const options = {
            method: "POST",
            url: `/appointments`,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data: payload,
        };

        try {
            let response = await axios.request(options);
            console.log("Appointment created:", response.data);
            toast.success("Appointment created successfully");

            // Call the callback with the new appointment data if provided
            if (onCreateCallback) {
                onCreateCallback(payload);
            }
        } catch (err) {
            console.error("error creating appointment:", err);
            toast.error(
                err.response?.data?.message || "Failed to create appointment"
            );
        }
    };

    const formSchema = z.object({
        appointment_date: z.date({
            error: "Please select a date",
        }),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            appointment_date: appointment_date
        },
        mode: "onSubmit",
    });

    const submitForm = (data) => {
        createAppointment(data);
    };

    return (
        <Card className="w-full max-w-md mt-4">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Edit Date</CardTitle>
                    <button
                        className="transition-all hover:bg-gray-100 p-1 rounded-sm"
                        onClick={() => setEditingAppointmentId(null)}
                    >
                        <X />
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                <form
                    id="create-appointment-form"
                    onSubmit={form.handleSubmit(submitForm)}
                >
                    <div className="flex flex-col gap-6">
                        {/* Date Selection */}
                        <Controller
                            name="appointment_date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>
                                        Appointment Date & Time
                                    </FieldLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value &&
                                                        "text-muted-foreground",
                                                    fieldState.invalid &&
                                                        "border-destructive"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP p")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(date) => {
                                                    if (!date) return;
                                                    const newDate = new Date(
                                                        date
                                                    );
                                                    // Preserve time if already set
                                                    if (field.value) {
                                                        newDate.setHours(
                                                            field.value.getHours()
                                                        );
                                                        newDate.setMinutes(
                                                            field.value.getMinutes()
                                                        );
                                                    }
                                                    field.onChange(newDate);
                                                }}
                                                disabled={(date) =>
                                                    date <
                                                    new Date().setHours(
                                                        0,
                                                        0,
                                                        0,
                                                        0
                                                    )
                                                }
                                                initialFocus
                                            />
                                            <div className="p-3 border-t border-border">
                                                <p className="mb-1">Time:</p>
                                                <Input
                                                    type="time"
                                                    value={
                                                        field.value
                                                            ? format(
                                                                  field.value,
                                                                  "HH:mm"
                                                              )
                                                            : ""
                                                    }
                                                    onChange={(e) => {
                                                        const [hours, minutes] =
                                                            e.target.value.split(
                                                                ":"
                                                            );
                                                        const newDate =
                                                            new Date(
                                                                field.value ||
                                                                    new Date()
                                                            );
                                                        newDate.setHours(
                                                            parseInt(hours)
                                                        );
                                                        newDate.setMinutes(
                                                            parseInt(minutes)
                                                        );
                                                        field.onChange(newDate);
                                                    }}
                                                />
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                >
                    Reset
                </Button>
                <Button type="submit" form="create-appointment-form">
                    Save
                </Button>
            </CardFooter>
        </Card>
    );
}
