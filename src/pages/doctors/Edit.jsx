import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "@/config/api";

import { useParams } from "react-router";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import DoctorUpdateForm from "@/components/customComponents/UpdateDoctorForm";

export default function DoctorsEdit() {

    const { token } = useAuth();

    useEffect(() => {
        // const fetchFestivals = async () => {
        //     const options = {
        //         method: "GET",
        //         url: `/festivals/${id}`,
        //         headers: {
        //             Authorization: `Bearer ${token}`,
        //         },
        //     };

        //     try {
        //         let response = await axios.request(options);
        //         console.log("Single festival api response:", response.data);
        //         let festival = response.data;
        //         setForm({
        //             title: festival.title || "",
        //             description: festival.description || "",
        //             city: festival.city || "",
        //             start_date: festival.start_date || "",
        //             end_date: festival.end_date || "",
        //         });
        //     } catch (err) {
        //         console.error(err);
        //     }
        // };
        // fetchFestivals();
        // console.log("async test");
    }, []);

    // const handleSubmit = (event) => {
    //     event.preventDefault();
    //     console.log("handleSubmit engaged in FestivalsCreate");
    //     console.log(form);
    //     updateFestival();
    // };

    return (
        <>
            <h1>Update a Doctor</h1>
            <DoctorUpdateForm />
        </>
    );
}
