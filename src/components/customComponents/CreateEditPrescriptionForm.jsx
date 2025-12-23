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

export default function CreateEditPrescriptionForm({
    prescription,
    onCreateCallback,
    onUpdateCallback,
    setShowPrescriptionForm,
}) {
    const { token } = useAuth();
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [patientOpen, setPatientOpen] = useState(false);
    const [doctorOpen, setDoctorOpen] = useState(false);
    const [diagnosisOpen, setDiagnosisOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsRes, doctorsRes, diagnosesRes] =
                    await Promise.all([
                        axios.get("/patients", {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                        axios.get("/doctors", {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                        axios.get("/diagnoses", {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                    ]);
                setPatients(patientsRes.data);
                setDoctors(doctorsRes.data);
                setDiagnoses(diagnosesRes.data);
            } catch (error) {
                toast.error("Failed to load form data");
            }
        };
        fetchData();
    }, [token]);

    const formSchema = z.object({
        patient_id: z.string().min(1, "Please select a patient."),
        doctor_id: z.string().min(1, "Please select a doctor."),
        diagnosis: z.string().min(1, "Please provide a diagnosis."),
        medication: z.string().min(1, "Please enter medication."),

        dosage: z.string().min(1, "Please enter dosage."),
        start_date: z.date({ error: "Please select a start date" }),
        end_date: z.date({ error: "Please select an end date" }),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: prescription
            ? {
                  patient_id: prescription.patient_id.toString(),
                  doctor_id: prescription.doctor_id.toString(),
                  diagnosis: prescription.diagnosis_condition,
                  medication: prescription.medication,
                  dosage: prescription.dosage,
                  start_date: new Date(prescription.start_date * 1000),
                  end_date: new Date(prescription.end_date * 1000),
              }
            : {
                  patient_id: "",
                  doctor_id: "",
                  diagnosis_id: "",
                  medication: "",
                  dosage: "",
                  start_date: new Date(),
                  end_date: new Date(),
              },
        mode: "onSubmit",
    });

    const createDiagnosis = async (formData) => {
        console.log("createDiagnosis initiated with:", formData);

        const payload = {
            patient_id: parseInt(formData.patient_id),
            condition: formData.diagnosis,
            diagnosis_date: new Date(),
        };
        console.log("payload in createDiagnosis:", payload);
        try {
            const res = await axios.post("/diagnoses", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(
                "Diagnosis Created, moving onto creating prescription",
                res.data
            );

            return res.data;

            toast.success("Diagnosis created successfully");
        } catch (err) {
            console.error("error creating diagnosis:", err);
            toast.error(
                err.response?.data?.message || "Failed to create diagnosis"
            );
        }
    };

    const createPrescription = async (formData) => {
        console.log(
            "createPrescription initiated, calling createDiagnosis for diagnosis_id"
        );
        const diagnosis = await createDiagnosis(formData);
        const diagnosis_id = diagnosis.id;

        const payload = {
            patient_id: parseInt(formData.patient_id),
            doctor_id: parseInt(formData.doctor_id),
            diagnosis_id: parseInt(diagnosis_id),
            medication: formData.medication,
            dosage: formData.dosage,
            start_date: formData.start_date.toISOString(),
            end_date: formData.end_date.toISOString(),
        };
        try {
            console.log("Creating prescription with data:", payload);

            const res = await axios.post("/prescriptions", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Prescription created:", res.data);

            toast.success("Prescription created successfully");

            const onCreateCallbackData = { ...res.data, diagnosis };
            // console.log("onCreateCallbackData in form:", onCreateCallbackData);
            if (onCreateCallback) onCreateCallback(onCreateCallbackData);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to create prescription"
            );
        }
    };

    const updateDiagnosis = async (formData) => {
        console.log("formData provided in updateDiagnosis:", formData);
        const payload = {
            patient_id: parseInt(formData.patient_id),
            condition: formData.diagnosis,
            diagnosis_date: new Date(),
        };
        console.log("updating diagnosis with payload:", payload);
        try {
            const res = await axios.patch(
                `/diagnoses/${prescription.diagnosis_id}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            return res.data;
            // console.log("updated diagnosis response:", res.data);
            // toast.success("Diagnosis updated successfully");
            // if (onUpdateCallback) onUpdateCallback(res.data);
        } catch (err) {
            console.error("error in updating Diagnosis", err);
            toast.error(
                err.response?.data?.message || "Failed to update diagnosis"
            );
        }
    };

    const updatePrescription = async (formData) => {
        // Checking to see if diagnosis was updated in any form
        // If the patient changes, or diagnosis condition changes, then update the diagnosis before proceeding with updating the prescription

        let diagnosis;
        if (
            prescription.diagnosis_condition !== formData.diagnosis ||
            prescription.patient_id !== formData.patient_id
        ) {
            console.warn(
                "Diagnosis has been changed in CreateEditPrescriptionForm, updating diagnosis before proceeding"
            );
            diagnosis = await updateDiagnosis(formData);
        } else {
            console.log(
                "no update in diagnosis, skipping updateDiagnosis api call..."
            );
        }

        const payload = {
            patient_id: parseInt(formData.patient_id),
            doctor_id: parseInt(formData.doctor_id),
            diagnosis_id: parseInt(prescription.diagnosis_id),
            medication: formData.medication,
            dosage: formData.dosage,
            start_date: formData.start_date.toISOString(),
            end_date: formData.end_date.toISOString(),
        };
        try {
            const res = await axios.patch(
                `/prescriptions/${prescription.id}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            toast.success("Prescription updated successfully");
            let onUpdateCallbackData;
            if (diagnosis) {
                onUpdateCallbackData = { ...res.data, diagnosis };
            } else {
                onUpdateCallbackData = res.data;
            }
            console.log("onupdateCallbackData:", onUpdateCallbackData);

            if (onUpdateCallback) onUpdateCallback(onUpdateCallbackData);
        } catch (err) {
            console.error("error updating prescription:", err);
            toast.error(
                err.response?.data?.message || "Failed to update prescription"
            );
        }
    };

    const submitForm = (data) => {
        console.log("submitForm clicked in createeditprescriptionform");
        if (prescription) {
            updatePrescription(data);
        } else {
            createPrescription(data);
        }
    };

    return (
        <Card className="w-full max-w-md mt-4">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>
                        {prescription ? "Edit" : "Create New"} Prescription
                    </CardTitle>
                    <button
                        className="transition-all hover:bg-gray-100 p-1 rounded-sm"
                        onClick={() => setShowPrescriptionForm(false)}
                    >
                        <X />
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                <form
                    id="create-prescription-form"
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
                        {/* Doctor Selection */}
                        <Controller
                            name="doctor_id"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>Doctor</FieldLabel>
                                    <Popover
                                        open={doctorOpen}
                                        onOpenChange={setDoctorOpen}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={doctorOpen}
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? doctors.find(
                                                          (doctor) =>
                                                              doctor.id.toString() ===
                                                              field.value
                                                      )?.first_name +
                                                      " " +
                                                      doctors.find(
                                                          (doctor) =>
                                                              doctor.id.toString() ===
                                                              field.value
                                                      )?.last_name
                                                    : "Select a doctor"}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search doctor..." />
                                                <CommandList>
                                                    <CommandEmpty>
                                                        No doctor found.
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {doctors.map(
                                                            (doctor) => (
                                                                <CommandItem
                                                                    key={
                                                                        doctor.id
                                                                    }
                                                                    value={`${doctor.first_name} ${doctor.last_name}`}
                                                                    onSelect={() => {
                                                                        field.onChange(
                                                                            doctor.id.toString()
                                                                        );
                                                                        setDoctorOpen(
                                                                            false
                                                                        );
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            field.value ===
                                                                                doctor.id.toString()
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {
                                                                        doctor.first_name
                                                                    }{" "}
                                                                    {
                                                                        doctor.last_name
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
                        {/* OLD Diagnosis Selection */}
                        {/* <Controller
                            name="diagnosis_id"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>Diagnosis</FieldLabel>
                                    <Popover
                                        open={diagnosisOpen}
                                        onOpenChange={setDiagnosisOpen}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={diagnosisOpen}
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? diagnoses.find(
                                                          (diagnosis) =>
                                                              diagnosis.id.toString() ===
                                                              field.value
                                                      )?.condition
                                                    : "Select a diagnosis"}
                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search diagnosis..." />
                                                <CommandList>
                                                    <CommandEmpty>
                                                        No diagnosis found.
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {diagnoses.map(
                                                            (diagnosis) => (
                                                                <CommandItem
                                                                    key={
                                                                        diagnosis.id
                                                                    }
                                                                    value={
                                                                        diagnosis.condition
                                                                    }
                                                                    onSelect={() => {
                                                                        field.onChange(
                                                                            diagnosis.id.toString()
                                                                        );
                                                                        setDiagnosisOpen(
                                                                            false
                                                                        );
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            field.value ===
                                                                                diagnosis.id.toString()
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {
                                                                        diagnosis.condition
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
                        /> */}

                        {/* NEW Diagnosis Input */}
                        {/* <Controller
                            name="diagnosis_id"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>Diagnosis</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Enter diagnosis"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        /> */}

                        {/* Diagnosis Input */}
                        <Controller
                            name="diagnosis"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>Diagnosis</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Enter diagnosis"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Medication Input */}
                        <Controller
                            name="medication"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>Medication</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Enter medication"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        {/* Dosage Input */}
                        <Controller
                            name="dosage"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>Dosage</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Enter dosage"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        {/* Start Date */}
                        <Controller
                            name="start_date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>Start Date</FieldLabel>
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
                        {/* End Date */}
                        <Controller
                            name="end_date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="flex flex-col">
                                    <FieldLabel>End Date</FieldLabel>
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
                <Button type="submit" form="create-prescription-form">
                    {prescription ? "Edit" : "Create"} Prescription
                </Button>
            </CardFooter>
        </Card>
    );
}
