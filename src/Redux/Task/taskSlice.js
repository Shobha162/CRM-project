import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

// ============================
// ✅ ASYNC THUNKS
// ============================

// 1. Get all tasks
export const fetchAllTasks = createAsyncThunk(
  "taskMaster/fetchAllTasks",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/w-task/getall");
      return {
        tasks: res.data?.data || [],
        todayReminders: res.data?.todayReminders || [],
      };
    } catch (err) {
      toast.error("Failed to fetch tasks");
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// 2. Create task
export const createTask = createAsyncThunk(
  "taskMaster/createTask",
  async (task, { rejectWithValue }) => {
    try {
      const res = await API.post("/w-task/", task);
      toast.success(res.data?.message || "Task added successfully!");
      return res.data?.data || res.data;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Failed to add task";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 3. Update task
export const updateTaskById = createAsyncThunk(
  "taskMaster/updateTaskById",
  async (task, { rejectWithValue }) => {
    try {
      const res = await API.post(`/w-task/update/${task.id}`, task);
      toast.success(res.data?.message || "Task updated successfully!");
      return { id: task.id, updatedTask: res.data?.data || res.data };
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Failed to update task";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 4. Get task by ID
export const fetchTaskById = createAsyncThunk(
  "taskMaster/fetchTaskById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`/w-task/getID/${id}`);
      return res.data?.data || res.data;
    } catch (err) {
      toast.error("Failed to fetch task");
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// 5. Delete task by ID
export const deleteTaskById = createAsyncThunk(
  "taskMaster/deleteTaskById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.post(`/w-task/delete/${id}`);
      toast.success(res.data?.message || "Task deleted");
      return id;
    } catch (err) {
      toast.error("Failed to delete task");
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// 6. Get task reminders
// ✅ FIX: 404 aane par silently fail — toast spam nahi hoga (background polling hai)
// Backend pe route ready hoga tab automatically kaam karega
export const fetchTaskReminders = createAsyncThunk(
  "taskMaster/fetchTaskReminders",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const isTokenValid = decoded && decoded.exp * 1000 > Date.now();

    if (!isTokenValid) {
      return rejectWithValue("Invalid token");
    }

    try {
      const res = await API.get("/w-task/reminders");
      return res.data?.data || [];
    } catch (err) {
      const status = err?.response?.status;
      // ✅ 404 = route abhi backend pe nahi — silently ignore
      if (status === 404) {
        return rejectWithValue("reminders_route_not_found");
      }
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// 7. Update status
export const updateStatus = createAsyncThunk(
  "taskMaster/updateStatus",
  async ({ id, status, type }, { rejectWithValue }) => {
    try {
      const res = await API.post(`/w-task/updateStatus/${id}`, {
        status,
        type,
      });
      toast.success(res.data?.message || "Status updated successfully!");
      return { id, newStatus: res.data?.data?.status || status };
    } catch (err) {
      toast.error(err?.response?.data?.error || "Status update failed");
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// ============================
// ✅ INITIAL STATE
// ============================

const initialState = {
  tasks: [],
  todayReminders: [],
  selectedTask: null,
  reminders: [],
  loading: false,
  error: null,
};

// ============================
// ✅ SLICE
// ============================

const taskSlice = createSlice({
  name: "taskMaster",
  initialState,
  reducers: {
    setTaskData: (state, action) => {
      Object.keys(action.payload).forEach((key) => {
        if (action.payload[key] !== undefined) {
          state[key] = action.payload[key];
        }
      });
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
  },
  extraReducers: (builder) => {
    // ─── fetchAllTasks ───────────────────────────────────────
    builder
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.todayReminders = action.payload.todayReminders;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ─── createTask ──────────────────────────────────────────
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ─── updateTaskById ──────────────────────────────────────
    builder
      .addCase(updateTaskById.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTaskById.fulfilled, (state, action) => {
        state.loading = false;
        const { id, updatedTask } = action.payload;
        state.tasks = state.tasks.map((t) => (t._id === id ? updatedTask : t));
      })
      .addCase(updateTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ─── fetchTaskById ───────────────────────────────────────
    builder
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ─── deleteTaskById ──────────────────────────────────────
    builder
      .addCase(deleteTaskById.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      })
      .addCase(deleteTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ─── fetchTaskReminders ──────────────────────────────────
    // ✅ loading state nahi badla — background polling mein UI flicker hoga
    builder
      .addCase(fetchTaskReminders.fulfilled, (state, action) => {
        state.reminders = action.payload;
      })
      .addCase(fetchTaskReminders.rejected, (state, action) => {
        // ✅ 404 pe error state mein mat daalo — silently ignore
        if (action.payload !== "reminders_route_not_found") {
          state.error = action.payload;
        }
      });

    // ─── updateStatus ────────────────────────────────────────
    builder
      .addCase(updateStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, newStatus } = action.payload;
        state.tasks = state.tasks.map((task) =>
          task._id === id ? { ...task, status: newStatus } : task
        );
        state.todayReminders = state.todayReminders.map((reminder) =>
          reminder._id === id ? { ...reminder, status: newStatus } : reminder
        );
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setTaskData, clearSelectedTask } = taskSlice.actions;
export default taskSlice.reducer;