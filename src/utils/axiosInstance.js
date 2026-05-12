import axios from "axios";

const API = axios.create({
    baseURL: "https://vrd.konceptsoftwaresolutions.com/crystalion",
});

// Automatically attach Bearer token to all requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // ✅ adjust if you store it under a different key
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
