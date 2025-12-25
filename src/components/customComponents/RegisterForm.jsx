import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";

import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Field,
    FieldDescription,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

export default function RegisterForm({setIsLoggingIn}) {
    const { onRegister } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const formSchema = z
        .object({
            email: z.email("Invalid email address"),
            first_name: z.string().min(1, "First name is required"),
            last_name: z.string().min(1, "Last name is required"),
            password: z
                .string()
                .min(8, "Password needs to be minimum 8 characters")
                .max(30, "maximum characters is 30"),
            confirmPassword: z
                .string()
                .min(8, "Password needs to be minimum 8 characters")
                .max(30, "maximum characters is 30"),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: "Passwords don't match",
            path: ["confirmPassword"],
        });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            first_name: "",
            last_name: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onChange",
    });

    const submitForm = async (data) => {
        console.log("submitform data:", data);
        setLoading(true);
        try {
            let response = await onRegister(data.email, data.password, data.first_name, data.last_name);
            if (response?.msg) {
                toast(response.msg, {
                    description: response.success
                        ? "Account created successfully"
                        : "Registration failed. Please try again",
                    duration: 3000,
                });

                // Redirect to appointments page on successful registration
                if (response.success) {
                    navigate("/dashboard");
                    // Reset back to login screen for when the user logs out
                    setIsLoggingIn(true);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="">
            <Toaster />

            {/* Content Section */}
            <div className="">
                <form
                    id="register-form-example"
                    onSubmit={form.handleSubmit(submitForm)}
                >
                    <div className="flex flex-col gap-2">
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="gap-1">
                                    <FieldLabel
                                        htmlFor="form-example-email"
                                        className="text-md font-normal text-gray-900"
                                    >
                                        Email
                                    </FieldLabel>
                                    <Input
                                        className="py-5 px-3 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        id="form-example-email"
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
                        <div className="flex gap-2">
                            <Controller
                                name="first_name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field className="gap-1 flex-1">
                                        <FieldLabel
                                            htmlFor="form-example-first-name"
                                            className="text-md font-normal text-gray-900"
                                        >
                                            First Name
                                        </FieldLabel>
                                        <Input
                                            className="py-5 px-3 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                            id="form-example-first-name"
                                            {...field}
                                            placeholder=""
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
                                    <Field className="gap-1 flex-1">
                                        <FieldLabel
                                            htmlFor="form-example-last-name"
                                            className="text-md font-normal text-gray-900"
                                        >
                                            Last Name
                                        </FieldLabel>
                                        <Input
                                            className="py-5 px-3 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                            id="form-example-last-name"
                                            {...field}
                                            placeholder=""
                                            autoComplete="family-name"
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
                        </div>
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="gap-1">
                                    <FieldLabel
                                        htmlFor="form-example-password"
                                        className="text-md font-normal text-gray-900"
                                    >
                                        Password
                                    </FieldLabel>
                                    <Input
                                        className="py-5 px-3 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        id="form-example-password"
                                        type="password"
                                        {...field}
                                        autoComplete="current-password"
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
                            name="confirmPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="gap-1">
                                    <FieldLabel
                                        htmlFor="form-example-confirm-password"
                                        className="text-md font-normal text-gray-900"
                                    >
                                        Confirm password
                                    </FieldLabel>
                                    <Input
                                        className="py-5 px-3 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        id="form-example-confirm-password"
                                        type="password"
                                        {...field}
                                        autoComplete="current-password"
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
                        <div className="flex gap-2">
                            <p className="text-gray-700">Already have an account?</p>
                            <button type="button" className="text-blue-600 cursor-pointer hover:text-blue-700 font-medium" onClick={() => {setIsLoggingIn(true)}}>
                                Sign in
                            </button>
                        </div>
                        {/* Footer Section */}

                        {/* TODO: add spinner while signing up */}
                        <button
                            form="register-form-example"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Spinner className="w-6 h-6 text-white" />
                            ) : (
                                "Register"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
