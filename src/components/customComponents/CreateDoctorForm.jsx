import { useEffect, useState } from "react";
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
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function DoctorCreateForm({ onCreateCallback }) {
    const { token } = useAuth();

    const createDoctor = async (formData) => {
        console.log("data in createDoctor:", formData);
        const options = {
            method: "POST",
            url: `/doctors`,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data: formData,
        };

        try {
            let response = await axios.request(options);
            console.log("Single doctor create api response:", response.data);
            toast.success("Doctor created successfully");

            if (onCreateCallback) {
                onCreateCallback(response.data);
            }
        } catch (err) {
            if (
                err.response?.data?.message ===
                "SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: doctors.email"
            ) {
                form.setError("email", {
                    type: "manual",
                    message: "Email address already in use",
                });
                toast.error(
                    "This Email address is already in use by another doctor"
                );

                return;
            } else if (
                err.response?.data?.message ===
                "SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: doctors.phone"
            ) {
                form.setError("phone", {
                    type: "manual",
                    message: "Phone number already in use",
                });
                toast.error(
                    "This phone number is already in use by another doctor"
                );

                return;
            }
            console.error("error creating doctor:", err);
            console.error("error response data:", err.response?.data);
            console.error("error response status:", err.response?.status);
            toast.error(
                err.response?.data?.message,
                "Error",
                err.response?.status ||
                    "Failed to create doctor. Please try again."
            );
        }
    };

    const formSchema = z.object({
        email: z.string().email(),
        first_name: z.string().min(1, "First name is required."),
        last_name: z.string().min(1, "Last name is required."),
        phone: z
            .string()
            .min(10, "Phone number must be at least 10 digits")
            .max(10, "Phone number must be at most 10 digits")
            .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number format"),
        specialisation: z.enum([
            "Podiatrist",
            "Dermatologist",
            "Pediatrician",
            "Psychiatrist",
            "General Practitioner",
        ]),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            first_name: "",
            last_name: "",
            phone: "",
            specialisation: "",
        },
        mode: "onChange",
    });

    const submitForm = (data) => {
        console.log("Form submitted:", data);
        createDoctor(data);
    };

    return (
        <Card className="w-full max-w-md mt-4">
            <CardHeader>
                <CardTitle>Create a doctor</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="form-demo-2" onSubmit={form.handleSubmit(submitForm)}>
                    <div className="flex flex-col gap-6">
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel htmlFor="doctor-form-email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        id="doctor-form-email"
                                        {...field}
                                        placeholder="Email"
                                        autoComplete="email"
                                        aria-invalid={fieldState.invalid}
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
                            name="first_name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel htmlFor="doctor-form-first-name">
                                        First name
                                    </FieldLabel>
                                    <Input
                                        id="doctor-form-first-name"
                                        {...field}
                                        placeholder="First name"
                                        autoComplete="given-name"
                                        aria-invalid={fieldState.invalid}
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
                                    <FieldLabel htmlFor="doctor-form-last-name">
                                        Last Name
                                    </FieldLabel>
                                    <Input
                                        id="doctor-form-last-name"
                                        {...field}
                                        placeholder="Last Name"
                                        autoComplete="email"
                                        aria-invalid={fieldState.invalid}
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
                                    <FieldLabel htmlFor="doctor-form-phone">
                                        Phone
                                    </FieldLabel>
                                    <Input
                                        id="doctor-form-phone"
                                        {...field}
                                        placeholder="Phone"
                                        autoComplete="phone"
                                        aria-invalid={fieldState.invalid}
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
                            name="specialisation"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Specialisation</FieldLabel>
                                    <Select
                                        name={field.name}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <SelectValue placeholder="Choose specialisation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Podiatrist">
                                                Podiatrist
                                            </SelectItem>
                                            <SelectItem value="Dermatologist">
                                                Dermatologist
                                            </SelectItem>
                                            <SelectItem value="Pediatrician">
                                                Pediatrician
                                            </SelectItem>
                                            <SelectItem value="Psychiatrist">
                                                Psychiatrist
                                            </SelectItem>
                                            <SelectItem value="General Practitioner">
                                                General Practitioner
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldDescription>
                                        Select your department or area of work.
                                    </FieldDescription>
                                </Field>
                            )}
                        />
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Field orientation="horizontal">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            form.reset();
                        }}
                    >
                        Reset
                    </Button>
                    <Button type="submit" form="form-demo-2">
                        Submit
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    );
}
