import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "@/config/api";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

import DoctorCreateForm from "@/components/CreateDoctorForm";

export default function DoctorsCreate() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        city: "",
        start_date: "",
        end_date: "",
    });

    const navigate = useNavigate();

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };

    const createFestival = async () => {
        const { token } = useAuth();
        const options = {
            method: "POST",
            url: `/doctors`,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data: form,
        };

        try {
            let response = await axios.request(options);
            console.log("Single doctor create api response:", response.data);
            navigate("/doctors", {
                state: {
                    type: "success",
                    message: `Doctor "${response.data.title}" created`,
                },
            });
        } catch (err) {
            console.error("error creating doctor:", err);
            console.error("error response data:", err.response?.data);
            console.error("error response status:", err.response?.status);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("handleSubmit engaged in doctorsCreate");
        console.log(form);
        createFestival();
    };

    return (
        <>
            <h1>Create a new Doctor</h1>
            <DoctorCreateForm/>
            {/* <form onSubmit={handleSubmit} action="">
                <Input
                    className="mt-2"
                    type="text"
                    placeholder="Title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                />
                <Input
                    className="mt-2"
                    type="text"
                    placeholder="Description"
                    name="description"
                    value={form.description || ""}
                    onChange={handleChange}
                />
                <Input
                    className="mt-2"
                    type="text"
                    placeholder="City"
                    name="city"
                    value={form.city || ""}
                    onChange={handleChange}
                />
                <Input
                    className="mt-2"
                    type="date"
                    placeholder="Start Date"
                    name="start_date"
                    value={form.start_date || ""}
                    onChange={handleChange}
                />
                <Input
                    className="mt-2"
                    type="date"
                    placeholder="End Date"
                    name="end_date"
                    value={form.end_date || ""}
                    onChange={handleChange}
                />
                <Button
                    className="mt-2 cursor-pointer"
                    variant="outline"
                    type="submit"
                >
                    Submit
                </Button>
            </form> */}
        </>
    );
}
