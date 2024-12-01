import axios from "axios";

const API = axios.create({
    baseURL: 'http://54.82.11.196:5001', // Ensure this matches your Flask API base URL
    withCredentials: true, // Enable cookies for session management
    headers: {
        "Content-Type": "application/json", // Specify JSON format for requests
    },
});

// Add a request interceptor to modify headers if needed
API.interceptors.request.use(
    (config) => {
        // Add custom headers or handle configurations (if necessary)
        console.log("Making request to:", config.url); // Log the request URL for debugging
        return config;
    },
    (error) => {
        console.error("Request error:", error); // Log request errors
        return Promise.reject(error);
    }
);

// Add a response interceptor for error handling
API.interceptors.response.use(
    (response) => {
        console.log("Response received from:", response.config.url); // Log response URL
        return response;
    },
    (error) => {
        if (error.response) {
            // Handle specific HTTP errors
            console.error(`Error ${error.response.status}:`, error.response.data.message || "Unknown error");
        } else {
            console.error("Network or server error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default API;
