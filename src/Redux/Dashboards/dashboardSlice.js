import { createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    stats: null,
    myTasks: [],
    graphData: null,
    graphYear: null,
    loading: false,
};

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        setDashboardData: (state, action) => {
            Object.keys(action.payload).forEach((key) => {
                // Only set state[key] if payload[key] is NOT undefined
                if (action.payload[key] !== undefined) {
                    state[key] = action.payload[key];
                }
            });
        },
    },
});

export const { setDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;

// Thunks
export const fetchDashboardStats = () => async (dispatch) => {
    try {
        dispatch(setDashboardData({ loading: true }));
        const res = await axiosInstance.get("/w-dashboard/summary");
        if (res.status === 200) {
            dispatch(setDashboardData({ stats: res.data, loading: false }));
        }
    } catch (err) {
        toast.error("Failed to fetch stats");
        dispatch(setDashboardData({ loading: false }));
    }
};

export const fetchDashboardTasks = () => async (dispatch) => {
    try {
        const res = await axiosInstance.get("/w-dashboard/mytasks");
        if (res.status === 200) {
            dispatch(setDashboardData({ myTasks: res.data.data }));
        }
    } catch (err) {
        toast.error("Failed to fetch tasks");
    }
};

// Fetch Monthly Graph Data
// export const fetchDashboardGraphData = (selectedYear, callback = () => { }) => {
//     return async (dispatch) => {
//         try {

//             const response = await axiosInstance.post("/nee-dashboard/monthly-graph", { year: selectedYear });
//             if (response.status === 200) {
//                 const dashboardData = response.data;
//                 callback(true, dashboardData)
//             }
//         } catch (error) {
//             callback(false)
//             toast.error(error?.response?.data?.message)
//         } finally {
//             console.log("fina")
//         }
//     };
// };