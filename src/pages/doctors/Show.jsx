import { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "@/config/api";
import { useAuth } from "@/hooks/useAuth";

import { useLocation } from "react-router";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DoctorShow() {
    const { id } = useParams();
    const { token } = useAuth();
    console.log("params in ShowFestivalSingle", id);

    const location = useLocation();
    const doctor = location.state?.doctor;

    console.table("doctor in individual show:", doctor);
    return (
        <div className="min-h-screen">
            <h1>
                Dr {doctor.first_name} {doctor.last_name}
            </h1>
            <h2>{doctor.specialisation}</h2>
            <Tabs defaultValue="account" className="w-full">
                <TabsList className="flex!">
                    <TabsTrigger
                        value="account"
                        className="data-[state=active]:bg-blue-300!"
                    >
                        Appointments
                    </TabsTrigger>
                    <TabsTrigger value="password">Prescriptions</TabsTrigger>
                </TabsList>
                <div className="bg-red-400 w-full h-full rounded-md">
                    <p>slut</p>
                    <TabsContent value="account">
                        Make changes to your account here.
                    </TabsContent>
                    <TabsContent value="password">
                        Change your password here.
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
