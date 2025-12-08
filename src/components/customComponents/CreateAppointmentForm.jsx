import { useEffect, useState } from "react";
import axios from "@/config/api";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, CheckIcon, ChevronsUpDownIcon, X } from "lucide-react";

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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "../ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";

export default function AppointmentCreateForm({ doctor, onCreateCallback, setShowAppointmentForm }) {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [patientOpen, setPatientOpen] = useState(false);
    const [doctorOpen, setDoctorOpen] = useState(false);
    const location = useLocation();
    console.log("Location in appointmentForm", location);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [doctorsRes, patientsRes] = await Promise.all([
                    axios.get("/doctors", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("/patients", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                setDoctors(doctorsRes.data);
                setPatients(patientsRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
                toast.error("Failed to load doctors or patients");
            }
        };
        fetchData();
    }, []);

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
        doctor_id: z.string().min(1, "Please select a doctor."),
        patient_id: z.string().min(1, "Please select a patient."),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            doctor_id: doctor ? doctor.id.toString() : "",
            patient_id: "",
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
                    <CardTitle>Create New Appointment</CardTitle>
                    <button className="transition-all hover:bg-gray-100 p-1 rounded-sm" onClick={() => setShowAppointmentForm(false)}>
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
                        {/* Doctor Selection */}
                        {location.pathname.includes("/doctors") ? (
                            <div className="">
                                <p>Doctor:</p>
                                <h2 className="text-xl">
                                    {doctor.first_name} {doctor.last_name} -{" "}
                                    {doctor.specialisation}
                                </h2>
                            </div>
                        ) : (
                            <Controller
                                name="doctor_id"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field className="flex flex-col">
                                        <FieldLabel>Doctor</FieldLabel>
                                        <Popover open={doctorOpen} onOpenChange={setDoctorOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={doctorOpen}
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? doctors.find((d) => d.id.toString() === field.value)
                                                            ? `Dr. ${doctors.find((d) => d.id.toString() === field.value).first_name} ${doctors.find((d) => d.id.toString() === field.value).last_name}`
                                                            : "Select a doctor"
                                                        : "Select a doctor"}
                                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search doctor..." />
                                                    <CommandList>
                                                        <CommandEmpty>No doctor found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {doctors.map((doctor) => (
                                                                <CommandItem
                                                                    key={doctor.id}
                                                                    value={`${doctor.first_name} ${doctor.last_name} ${doctor.specialisation}`}
                                                                    onSelect={() => {
                                                                        field.onChange(doctor.id.toString());
                                                                        setDoctorOpen(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            field.value === doctor.id.toString()
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialisation}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
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
                        )}

                        {/* Patient Selection */}
                        <Controller
                            name="patient_id"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>Patient</FieldLabel>
                                    <Popover open={patientOpen} onOpenChange={setPatientOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={patientOpen}
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? patients.find(
                                                          (patient) =>
                                                              patient.id.toString() ===
                                                              field.value
                                                      )?.first_name + " " + patients.find(
                                                          (patient) =>
                                                              patient.id.toString() ===
                                                              field.value
                                                      )?.last_name
                                                    : "Select a patient"}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search patient..." />
                                                <CommandList>
                                                    <CommandEmpty>No patient found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {patients.map((patient) => (
                                                            <CommandItem
                                                                key={patient.id}
                                                                value={`${patient.first_name} ${patient.last_name}`}
                                                                onSelect={() => {
                                                                    field.onChange(patient.id.toString());
                                                                    setPatientOpen(false);
                                                                }}
                                                            >
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        field.value === patient.id.toString()
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {patient.first_name} {patient.last_name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
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
                    Create Appointment
                </Button>
            </CardFooter>
        </Card>
    );
}
