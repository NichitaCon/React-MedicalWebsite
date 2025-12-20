import { createContext, useContext, useState, useEffect } from "react";
import axios from "@/config/api";

// create Auth context to store auth state
const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvidor = ({ children }) => {
    const [token, setToken] = useState(() => {
        if (localStorage.getItem("token")) {
            return localStorage.getItem("token");
        } else {
            return null;
        }
    });

    const onRegister = async (email, password, first_name, last_name) => {
        console.warn("onRegister Called");

        const options = {
            method: "POST",
            url: "/register",
            data: {
                email,
                password,
                first_name,
                last_name,
            },
        };

        try {
            let response = await axios.request(options);
            console.log("register api response:", response.data);

            localStorage.setItem("token", response.data.token);
            setToken(response.data.token);
            return { success: true, msg: "Account created!" };
        } catch (err) {
            console.error(
                "error creating account in",
                err.response?.data || err.message
            );
            return {
                success: false,
                msg: err.response?.data?.error || "Register failed",
            };
        }
    };

    const onLogin = async (email, password) => {
        console.warn("onLogin Called");

        const options = {
            method: "POST",
            url: "/login",
            data: {
                email,
                password,
            },
        };

        try {
            let response = await axios.request(options);
            console.log("login api response:", response.data);

            localStorage.setItem("token", response.data.token);
            setToken(response.data.token);
            return { success: true, msg: "Login successful!" };
        } catch (err) {
            console.error(
                "error logging in",
                err.response?.data || err.message
            );
            return {
                success: false,
                msg: err.response?.data?.error || "Login failed",
            };
        }
    };

    const onLogOut = () => {
        console.warn("onLogOut Called");
        setToken(null);
        localStorage.removeItem("token");
    };

    const value = {
        token,
        onLogin,
        onRegister,
        onLogOut,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
