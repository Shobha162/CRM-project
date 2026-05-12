import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/axiosInstance";
import toast from "react-hot-toast";

// Thunks
export const fetchEmployees = createAsyncThunk(
    "employeeMaster/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get("/w-auth/employee/all");
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch");
        }
    }
);

export const addEmployee = createAsyncThunk(
    "employeeMaster/add",
    async (employeeData, { rejectWithValue }) => {
        try {
            const { data } = await API.post("/w-auth/employee/create", employeeData);
            toast.success(data.message);
            return data;
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to add employee");
            return rejectWithValue(err.response?.data?.message || "Failed to add");
        }
    }
);


export const updateEmployee = createAsyncThunk(
    "employeeMaster/update",
    async (employeeData, { rejectWithValue }) => {
        try {
            const id = employeeData.id || employeeData._id;
            const { id: _omit1, _id: _omit2, ...rest } = employeeData;
            const { data } = await API.post(`/w-auth/employee/update/${id}`, rest);
            toast.success(data.message); // ✅ show backend message
            return data;
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to update employee");
            return rejectWithValue(err.response?.data?.error || "Failed to update");
        }
    }
);

export const deleteEmployee = createAsyncThunk(
    "employeeMaster/delete",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await API.post(`/w-auth/employee/delete/${id}`);
            toast.success(data.message); // ✅ backend message
            return id;
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to delete employee");
            return rejectWithValue(err.response?.data?.error || "Failed to delete");
        }
    }
);

export const changePassword = createAsyncThunk(
    "employeeMaster/changePassword",
    async ({ id, newPassword }, { rejectWithValue }) => {
        try {
            const { data } = await API.post(`/w-auth/changepassword/${id}`, {
                newPassword,
            });
            toast.success(data.message); // ✅ backend message
            return data;
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to update password");
            return rejectWithValue(err.response?.data?.error || "Password update failed");
        }
    }
);

const initialState = {
    employees: [],
    loading: false,
    error: null,
};

const employeeSlice = createSlice({
    name: "employeeMaster",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployees.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.employees = payload.data;
            })
            .addCase(fetchEmployees.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })

            .addCase(addEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addEmployee.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.employees.push(payload);
            })
            .addCase(addEmployee.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })

            .addCase(updateEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEmployee.fulfilled, (state, { payload }) => {
                state.loading = false;
                const index = state.employees.findIndex((e) => e.id === payload.id);
                if (index !== -1) state.employees[index] = payload;
            })
            .addCase(updateEmployee.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })

            .addCase(deleteEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteEmployee.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.employees = state.employees.filter((e) => e._id !== payload); // ✅ fixed
            })
            .addCase(deleteEmployee.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })

            .addCase(changePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(changePassword.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            });
    },
});

export default employeeSlice.reducer;
