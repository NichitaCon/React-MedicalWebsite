import { useEffect } from "react";
import axios from "@/config/api";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { X } from "lucide-react";

const patientSchema = z.object({
    first_name: z
        .string()
        .min(2, "First name must have more than 2 characters")
        .max(30, "First name must have less than 30 characters"),
    last_name: z
        .string()
        .min(2, "Last name must have more than 2 characters")
        .max(30, "Last name must have less than 30 characters"),
    email: z.email(),
    phone: z.string().length(10, "Phone number must be 10 digits long"),
    date_of_birth: z.string(),
    address: z.string().min(1, "Address is required"),
});

export default function CreateEditPatientForm({
    patient,
    onCreateCallback,
    onUpdateCallback,
    setShowPatientForm,
}) {
    const { token } = useAuth();
    const form = useForm({
        resolver: zodResolver(patientSchema),
        defaultValues: patient
            ? { ...patient }
            : {
                  first_name: "",
                  last_name: "",
                  email: "",
                  phone: "",
                  date_of_birth: "",
                  address: "",
              },
        mode: "onSubmit",
    });

    useEffect(() => {
        if (patient) form.reset(patient);
    }, [patient]);

    const createPatient = async (formData) => {
        try {
            console.log("creating patient with payload:", formData)
            const response = await axios.post("/patients", formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("response from creating patient:", patient);
            toast.success("Patient created successfully");
            if (onCreateCallback) onCreateCallback(response.data);
        } catch (err) {
            console.error("error creating patient:", err);

            if (
                err.response?.data?.message ===
                "SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: patients.email"
            ) {
                // AI
                form.setError("email", {
                    type: "manual",
                    message: "Email address already in use",
                });
                // AI
                toast.error(
                    "This Email address is already in use by another patient"
                );

                return;
            } else if (
                err.response?.data?.message ===
                "SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: patients.phone"
            ) {
                // AI
                form.setError("phone", {
                    type: "manual",
                    message: "Phone number already in use",
                });
                // AI
                toast.error(
                    "This phone number is already in use by another patient"
                );

                return;
            }

            toast.error(
                err.response?.data?.message || "Failed to create patient"
            );
        }
    };

    const updatePatient = async (formData) => {
        try {
            const response = await axios.patch(
                `/patients/${patient.id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            toast.success("Patient updated successfully");
            if (onUpdateCallback) onUpdateCallback(response.data);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to update patient"
            );
        }
    };

    const submitForm = (data) => {
        console.log(data.date_of_birth);
        if (patient) {
            updatePatient(data);
        } else {
            createPatient(data);
        }
    };

    return (
        <Card className="w-full max-w-md min-w-sm mt-4">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>
                        {patient ? "Edit" : "Create New"} Patient
                    </CardTitle>
                    {setShowPatientForm && (
                        <button
                            className="transition-all hover:bg-gray-100 p-1 rounded-sm"
                            onClick={() => setShowPatientForm(false)}
                        >
                            <X />
                        </button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <form
                    id="create-patient-form"
                    onSubmit={form.handleSubmit(submitForm)}
                >
                    <div className="flex flex-col gap-6">
                        <Controller
                            name="first_name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>First Name</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="First Name"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="last_name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Last Name</FieldLabel>
                                    <Input {...field} placeholder="Last Name" />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Email</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Email"
                                        type="email"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="phone"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Phone</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Phone"
                                        type="tel"
                                        maxLength={10}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="date_of_birth"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Date of Birth</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Date of Birth"
                                        type="date"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="address"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Address</FieldLabel>
                                    <Input {...field} placeholder="Address" />
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
            <CardFooter className="flex justify-between! gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                >
                    Reset
                </Button>
                <Button type="submit" form="create-patient-form">
                    {patient ? "Edit" : "Create"} Patient
                </Button>
            </CardFooter>
        </Card>
    );
}
