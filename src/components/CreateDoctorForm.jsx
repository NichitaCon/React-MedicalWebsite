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

export default function DoctorCreateForm() {
    const [dobWindowOpen, setDobWindowOpen] = useState(false);
    const [performers, setPerformers] = useState([]);

    useEffect(() => {
        const fetchPerformers = async () => {
            const options = {
                method: "POST",
                url: "/doctors",
            };
            try {
                let response = await axios.request(options);
                console.log("performers data:", response.data);
                setPerformers(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchPerformers();
    }, []);

    const formSchema = z.object({
        email: z.email(),
        first_name: z.string(),
        last_name: z.string(),
        phone: z.number(),

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

        let formattedData = {
            ...data,
            dob: data.dob.toISOString().split("T")[0],
            performer_id: data.performer,
        };
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
                                    <FieldLabel>
                                        Specialisation (Enums)
                                    </FieldLabel>
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
