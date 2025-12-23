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
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

export default function CreateEditDiagnosisForm({
    diagnosis,
    onCreateCallback,
    onUpdateCallback,
    setShowDiagnosisForm,
}) {
    const { token } = useAuth();
    const [patients, setPatients] = useState([]);
    const [patientOpen, setPatientOpen] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await axios.get("/patients", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPatients(res.data);
            } catch (error) {
                toast.error("Failed to load patients");
            }
        };
        fetchPatients();
    }, [token]);

    const formSchema = z.object({
        patient_id: z.string().min(1, "Please select a patient."),
        condition: z.string().min(1, "Please enter a condition."),
        diagnosis_date: z.date({
            error: "Please select a date",
        }),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: diagnosis
            ? {
                  patient_id: diagnosis.patient_id.toString(),
                  condition: diagnosis.condition,
                  diagnosis_date: new Date(diagnosis.diagnosis_date * 1000),
              }
            : {
                  patient_id: "",
                  condition: "",
                  diagnosis_date: new Date(),
              },
        mode: "onSubmit",
    });

    const createDiagnosis = async (formData) => {
        const payload = {
            patient_id: parseInt(formData.patient_id),
            condition: formData.condition,
            diagnosis_date: formData.diagnosis_date.toISOString(),
        };
        try {
            const res = await axios.post("/diagnoses", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Diagnosis created successfully");
            console.log("diagnosis created with response:", res.data);
            if (onCreateCallback) onCreateCallback(res.data);
        } catch (err) {
            console.error("error creating diagnosis:", err);
            toast.error(
                err.response?.data?.message || "Failed to create diagnosis"
            );
        }
    };

    const updateDiagnosis = async (formData) => {
        const payload = {
            patient_id: parseInt(formData.patient_id),
            condition: formData.condition,
            diagnosis_date: formData.diagnosis_date.toISOString(),
        };
        try {
            const res = await axios.patch(
                `/diagnoses/${diagnosis.id}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            toast.success("Diagnosis updated successfully");
            if (onUpdateCallback) onUpdateCallback(res.data);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to update diagnosis"
            );
        }
    };

    const submitForm = (data) => {
        if (diagnosis) {
            updateDiagnosis(data);
        } else {
            createDiagnosis(data);
        }
    };

    return (
        <Card className="w-full max-w-md mt-4">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>
                        {diagnosis ? "Edit" : "Create New"} Diagnosis
                    </CardTitle>
                    <button
                        className="transition-all hover:bg-gray-100 p-1 rounded-sm"
                        onClick={() => setShowDiagnosisForm(false)}
                    >
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
                        {/* Patient Selection */}
                        <Controller
                            name="patient_id"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>Patient</FieldLabel>
                                    <Popover
                                        open={patientOpen}
                                        onOpenChange={setPatientOpen}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={patientOpen}
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? patients.find(
                                                          (patient) =>
                                                              patient.id.toString() ===
                                                              field.value
                                                      )?.first_name +
                                                      " " +
                                                      patients.find(
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
                                                    <CommandEmpty>
                                                        No patient found.
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {patients.map(
                                                            (patient) => (
                                                                <CommandItem
                                                                    key={
                                                                        patient.id
                                                                    }
                                                                    value={`${patient.first_name} ${patient.last_name}`}
                                                                    onSelect={() => {
                                                                        field.onChange(
                                                                            patient.id.toString()
                                                                        );
                                                                        setPatientOpen(
                                                                            false
                                                                        );
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            field.value ===
                                                                                patient.id.toString()
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {
                                                                        patient.first_name
                                                                    }{" "}
                                                                    {
                                                                        patient.last_name
                                                                    }
                                                                </CommandItem>
                                                            )
                                                        )}
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
                        {/* Condition Input */}
                        <Controller
                            name="condition"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>Condition</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Enter condition"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        {/* Diagnosis Date */}
                        <Controller
                            name="diagnosis_date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>Diagnosis Date</FieldLabel>
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
                                                    format(field.value, "PPP")
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
                                                    field.onChange(
                                                        new Date(date)
                                                    );
                                                }}
                                                disabled={(date) =>
                                                    date > new Date()
                                                }
                                                initialFocus
                                            />
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
                    {diagnosis ? "Edit" : "Create"} Diagnosis
                </Button>
            </CardFooter>
        </Card>
    );
}
