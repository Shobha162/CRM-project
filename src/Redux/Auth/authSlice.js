import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

// Utility: Check if token is expired
export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

// Initial auth state
const initialState = {
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),
    role: localStorage.getItem("role") || null,
    name: localStorage.getItem("name") || null,
    email: localStorage.getItem("email") || null,
    phone: localStorage.getItem("phone") || null,
    ability: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Login or token set from decoded info
        setToken: (state, action) => {
            const { token, role, ability, name, email, phone } = action.payload;
            state.token = token;
            state.isAuthenticated = true;
            state.role = role;
            state.ability = ability || null;
            state.name = name || null;
            state.email = email || null;
            state.phone = phone || null;

            // Save all to localStorage for persistence
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("name", name);
            localStorage.setItem("email", email);
            localStorage.setItem("phone", phone);
        },

        // Logout
        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.role = null;
            state.name = null;
            state.email = null;
            state.phone = null;
            state.ability = null;

            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("name");
            localStorage.removeItem("email");
            localStorage.removeItem("phone");
        },

        // Set user from stored token
        setUserFromToken: (state) => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    state.token = token;
                    state.isAuthenticated = true;
                    state.role = decoded.role || localStorage.getItem("role");
                    state.name = decoded.name || localStorage.getItem("name");
                    state.email = decoded.email || localStorage.getItem("email");
                    state.phone = decoded.phone || localStorage.getItem("phone");
                    state.ability = decoded.ability || null;
                } else {
                    // Token expired
                    localStorage.clear();
                }
            } catch (err) {
                console.error("Invalid token:", err);
                localStorage.clear();
            }
        },
    },
});

export const { setToken, logout, setUserFromToken } = authSlice.actions;
export default authSlice.reducer;
