import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "@/config/api";

import { useParams } from "react-router";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function FestivalsEdit() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        city: "",
        start_date: "",
        end_date: "",
    });

    const { token } = useAuth();

    useEffect(() => {
        const fetchFestivals = async () => {
            const options = {
                method: "GET",
                url: `/festivals/${id}`,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            try {
                let response = await axios.request(options);
                console.log("Single festival api response:", response.data);
                let festival = response.data;
                setForm({
                    title: festival.title || "",
                    description: festival.description || "",
                    city: festival.city || "",
                    start_date: festival.start_date || "",
                    end_date: festival.end_date || "",
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchFestivals();
        console.log("async test");
    }, []);

    const { id } = useParams();
    const navigate = useNavigate();

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };

    const updateFestival = async () => {
        const options = {
            method: "PATCH",
            url: `/festivals/${id}`,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data: form,
        };

        try {
            let response = await axios.request(options);
            console.log("Single festival create api response:", response.data);
            navigate("/festivals");
        } catch (err) {
            console.error("error creating festival:", err);
            console.error("error response data:", err.response?.data);
            console.error("error response status:", err.response?.status);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("handleSubmit engaged in FestivalsCreate");
        console.log(form);
        updateFestival();
    };

    return (
        <>
            <h1>Update a festival</h1>
            <form onSubmit={handleSubmit} action="">
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
            </form>
        </>
    );
}
