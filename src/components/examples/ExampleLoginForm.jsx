import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

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
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";

export default function LoginForm() {
    const { onLogin } = useAuth();

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
                description: response.success ? "You're now logged in" : "Please try again",
                duration: 3000,
            });
        }
    };

    return (
        <Card className="w-full max-w-md">
            <Toaster />
            <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="login-form-example"
                    onSubmit={form.handleSubmit(submitForm)}
                >
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel htmlFor="form-example-email">
                                            email
                                        </FieldLabel>
                                        <Input
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
                        </div>
                        <div className="grid gap-2">
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel htmlFor="form-example-password">
                                            password
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
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button
                    variant="outline"
                    form="login-form-example"
                    type="submit"
                    className="w-full"
                >
                    Login
                </Button>
            </CardFooter>
        </Card>
    );
}
