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
import { Toaster } from "../components/ui/sonner";
import { toast } from "sonner";

export default function LoginForm() {
    const { onLogin } = useAuth();
    const navigate = useNavigate();

    const formSchema = z.object({
        email: z.email(),
        password: z
            .string()
            .min(8, "Password needs to be minimum 8 characters :P")
            .max(30, "maximum characters is 30"),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onChange",
    });

    const submitForm = async (data) => {
        console.log("submitform data:", data);

        let response = await onLogin(data.email, data.password);
        if (response?.msg) {
            toast(response.msg, {
                description: response.success
                    ? "You're now logged in"
                    : "Please try again",
                duration: 3000,
            });
            
            // Redirect to appointments page on successful login
            if (response.success) {
                navigate("/appointments");
            }
        }
    };

    return (
        <div className="">
            <Toaster />

            {/* Content Section */}
            <div className="">
                <form
                    id="login-form-example"
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
                                        className="text-md font-normal"
                                    >
                                        Email
                                    </FieldLabel>
                                    <Input
                                        className="py-5 px-3"
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
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field className="gap-1">
                                    <FieldLabel
                                        htmlFor="form-example-password"
                                        className="text-md font-normal"
                                    >
                                        Password
                                    </FieldLabel>
                                    <Input
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
                        <div className="flex gap-2">
                            <p>New to MedApi?</p>
                            <p className="text-blue-600">Create an account</p>
                        </div>
                        {/* Footer Section */}

                        {/* TODO: add spinner while signing in */}
                        <button
                            form="login-form-example"
                            type="submit"
                            className="w-full bg-blue-500! text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600! active:bg-blue-700! transition-colors duration-200"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
