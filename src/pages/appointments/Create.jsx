import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "@/config/api";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

import DoctorCreateForm from "@/components/customComponents/CreateDoctorForm";
import AppointmentCreateForm from "@/components/customComponents/CreateAppointmentForm";

export default function AppointmentsCreate() {
    return (
        <>
            <h1>Create a Appointment</h1>
            <AppointmentCreateForm/>
           
        </>
    );
}
