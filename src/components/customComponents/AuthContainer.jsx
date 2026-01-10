import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthContainer() {
    const [isLoggingIn, setIsLoggingIn] = useState(true);

    return (
        <div className="p-4 flex flex-col justify-between h-full bg-white rounded-2xl">
            <div>
                <h1 className="text-5xl font-semibold mb-2 text-black">
                    Welcome to MedApi
                </h1>
                <p className="text-gray-600">
                    MedApi is a simple React app used for managing
                    doctor appointments, patients and prescriptions,
                    MedApi also serves as a demonstration of
                    understanding the process of building complex
                    websites with React.
                </p>
            </div>
            {isLoggingIn ? (
                <LoginForm setIsLoggingIn={setIsLoggingIn} />
            ) : (
                <RegisterForm setIsLoggingIn={setIsLoggingIn} />
            )}
        </div>
    );
}
