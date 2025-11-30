import { useState, useEffect } from "react";
import axios from "@/config/api";

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
import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
    const [form, setForm] = useState({});
    const { onLogin } = useAuth();

    const handleForm = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const submitForm = (event) => {
        event.preventDefault();
        console.log("submitted form! with data:", form);
        onLogin(form.email, form.password);
    };

    return (
        <div>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login an account</CardTitle>
                    <CardDescription>
                        Enter an email and password below to Login!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    onChange={handleForm}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    onChange={handleForm}
                                />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button
                        type="submit"
                        className="w-full text-black"
                        onClick={submitForm}
                    >
                        Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
