import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

// ============================
// ✅ ASYNC THUNKS
// ============================

// 1. Fetch dashboard stats (with filters)
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchDashboardStats",
  async (filters = { period: "today" }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/w-dashboard/summary", {
        params: filters,
      });
      return res.data;
    } catch (err) {
      toast.error("Failed to fetch stats");
      return rejectWithValue(err.message);
    }
  }
);

// 2. Fetch dashboard tasks
// ✅ FIX: Saare possible backend response structures handle kiye hain
export const fetchDashboardTasks = createAsyncThunk(
  "dashboard/fetchDashboardTasks",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/w-dashboard/mytasks");

      // ✅ DEBUG: Yeh console.log lagao aur network response dekho
      // Jab issue resolve ho jaye tab hata dena
      console.log("📦 Dashboard Tasks Raw Response:", res.data);

      // ✅ Saare possible backend response structures handle karo:
      //
      // Case 1: { data: { todayTasks: [], upcomingTasks: [] } }  ← expected
      // Case 2: { todayTasks: [], upcomingTasks: [] }            ← data wrapper nahi
      // Case 3: { data: [...] }                                  ← direct array in data
      // Case 4: [...]                                            ← direct array at root

      const raw = res.data;

      // Case 4: Root level direct array
      if (Array.isArray(raw)) {
        return raw;
      }

      // Case 3: res.data.data direct array hai
      if (Array.isArray(raw?.data)) {
        return raw.data;
      }

      // Case 1 & 2: todayTasks / upcomingTasks structure
      const nested = raw?.data || raw || {};
      const todayTasks = Array.isArray(nested?.todayTasks)
        ? nested.todayTasks
        : [];
      const upcomingTasks = Array.isArray(nested?.upcomingTasks)
        ? nested.upcomingTasks
        : [];

      const merged = [...todayTasks, ...upcomingTasks];

      console.log(
        `✅ Dashboard Tasks — Today: ${todayTasks.length}, Upcoming: ${upcomingTasks.length}, Total: ${merged.length}`
      );

      return merged;
    } catch (err) {
      toast.error("Failed to fetch tasks");
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// ============================
// ✅ INITIAL STATE
// ============================

const initialState = {
  stats: null,
  myTasks: [],
  graphData: null,
  graphYear: null,
  loading: false,
  taskLoading: false, // ✅ FIX: tasks ke liye alag loading state
  error: null,
};

// ============================
// ✅ SLICE
// ============================

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {

    // ─── fetchDashboardStats ─────────────────────────────────
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ─── fetchDashboardTasks ─────────────────────────────────
    // ✅ FIX: pending case add kiya — pehle ye missing tha
    builder
      .addCase(fetchDashboardTasks.pending, (state) => {
        state.taskLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardTasks.fulfilled, (state, action) => {
        state.taskLoading = false;
        // ✅ FIX: Always array assign karo, kabhi undefined nahi
        state.myTasks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchDashboardTasks.rejected, (state, action) => {
        state.taskLoading = false;
        state.myTasks = []; // ✅ FIX: Error pe bhi empty array rakho, undefined nahi
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;