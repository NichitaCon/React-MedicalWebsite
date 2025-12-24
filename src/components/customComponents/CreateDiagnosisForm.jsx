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

export default function CreateDiagnosisForm({ doctor, onCreateCallback, setShowDiagnosisForm }) {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [patientOpen, setPatientOpen] = useState(false);
    const location = useLocation();
    console.log("Location in DiagnosisForm", location);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const patientsRes = await axios.get("/patients", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPatients(patientsRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
                toast.error("Failed to load doctors or patients");
            }
        };
        fetchData();
    }, []);

    const createDiagnosis = async (formData) => {
        // Convert patient id to number and date to ISO string
        const payload = {
            patient_id: parseInt(formData.patient_id),
            condition: formData.condition,
            diagnosis_date: formData.diagnosis_date.toISOString(),
        };

        console.log("Creating diagnosis with payload:", payload);

        const options = {
            method: "POST",
            url: `/diagnoses`,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data: payload,
        };

        try {
            let response = await axios.request(options);
            console.log("Diagnosis created:", response.data);
            // toast.success("Diagnosis created successfully");

            // Call the callback with the new diagnosis data if provided
            if (onCreateCallback) {
                onCreateCallback(response.data || payload);
            }
        } catch (err) {
            console.error("error creating diagnosis:", err);
            toast.error(
                err.response?.data?.message || "Failed to create diagnosis"
            );
        }
    };

    const formSchema = z.object({
        diagnosis_date: z.date({
            required_error: "Please select a date",
        }),
        patient_id: z.string().min(1, "Please select a patient."),
        condition: z.string().min(1, "Please enter a condition."),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            patient_id: "",
            condition: "",
            diagnosis_date: undefined,
        },
        mode: "onSubmit",
    });

    const submitForm = (data) => {
        createDiagnosis(data);
    };

    return (
        <Card className="w-full max-w-md mt-4">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Create New Diagnosis</CardTitle>
                    <button className="transition-all hover:bg-gray-100 p-1 rounded-sm" onClick={() => setShowDiagnosisForm(false)}>
                        <X />
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                <form
                    id="create-diagnosis-form"
                    onSubmit={form.handleSubmit(submitForm)}
                >
                    <div className="flex flex-col gap-6">
                        {/* Condition */}
                        <Controller
                            name="condition"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>Condition</FieldLabel>
                                    <Input
                                        placeholder="Enter condition"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

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
                            name="diagnosis_date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>
                                        Diagnosis Date & Time
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
                <Button type="submit" form="create-diagnosis-form">
                    Create Diagnosis
                </Button>
            </CardFooter>
        </Card>
    );
}
