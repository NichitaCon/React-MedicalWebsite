import { useEffect, useState } from "react";
import axios from "@/config/api";

import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
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

import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function DoctorCreateForm() {
    const { token } = useAuth();
    const navigate = useNavigate();

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
            navigate("/doctors", {
                state: {
                    type: "success",
                    message: `Doctor "${response.data.first_name}" created`,
                },
            });
        } catch (err) {
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
        first_name: z.string(),
        last_name: z.string(),
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
            email: "nichita@test.com",
            first_name: "nichita",
            last_name: "premadetest",
            phone: "043111111",
            specialisation: "Podiatrist",
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
                <CardTitle>Various Form Examples</CardTitle>
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
                                        placeholder="nichita@example.com"
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
                                        placeholder="nichita@example.com"
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
                                        placeholder="nichita@example.com"
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
                                        placeholder="nichita@example.com"
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
